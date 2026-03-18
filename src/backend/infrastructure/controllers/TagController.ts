import { Request, Response } from 'express';
import { TagModel } from '../../models/TagModel';

export const getTags = async (_req: Request, res: Response) => {
  try {
    const tags = await TagModel.find().sort({ name: 1 }).exec();
    res.json(tags);
  } catch (err: any) {
    console.error('Error fetching tags:', err);
    res.status(500).json({ message: err.message });
  }
};

export default { getTags };
