import { Request, Response } from 'express';
import { VisitModel } from '../../models/VisitModel';

export const postVisit = async (req: Request, res: Response) => {
  try {
    const { path, publicationId, userId, referrer } = req.body || {};
    const ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.get('user-agent') || '';
    // prevent duplicate rapid visits: if a visit for same publication/path from same userId or IP
    // exists within the last N seconds (configurable via VISIT_DEDUPE_SECONDS), skip saving
    const now = new Date();
    const dedupeSeconds = parseInt(String(process.env.VISIT_DEDUPE_SECONDS || '30'), 10) || 30;
    const timeAgo = new Date(now.getTime() - dedupeSeconds * 1000);
    const targetPath = path || req.path;

    const recentMatch: any = { createdAt: { $gte: timeAgo } };
    // match by publicationId if provided, otherwise by path
    if (publicationId) recentMatch.publicationId = publicationId;
    else recentMatch.path = targetPath;

    // require same userId OR same ip to consider duplicate
    if (userId) recentMatch.$or = [{ userId }, { ip: String(ip) }];
    else recentMatch.ip = String(ip);

    const existing = await VisitModel.findOne(recentMatch).exec();
    if (existing) {
      // skip storing duplicate rapid visit
      return res.status(200).json({ ok: true, skipped: true });
    }

    const visit = new VisitModel({ path: targetPath, publicationId, userId, ip: String(ip), referrer, userAgent });
    await visit.save();
    res.status(201).json({ ok: true });
  } catch (err: any) {
    console.error('Error saving visit:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET /stats?publicationId=...&days=30
export const getStats = async (req: Request, res: Response) => {
  try {
    const publicationId = req.query.publicationId as string | undefined;
    const days = parseInt(String(req.query.days || '30'), 10) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const match: any = { createdAt: { $gte: since } };
    if (publicationId) match.publicationId = publicationId;

    const total = await VisitModel.countDocuments(match).exec();

    const byDay = await VisitModel.aggregate([
      { $match: match },
      { $project: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } },
      { $group: { _id: '$day', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).exec();

    res.json({ total, byDay });
  } catch (err: any) {
    console.error('Error getting visit stats:', err);
    res.status(500).json({ message: err.message });
  }
};

export default { postVisit, getStats };
