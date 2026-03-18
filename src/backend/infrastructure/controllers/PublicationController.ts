import { Request, Response } from 'express';
import { createPublication, findPublicationById, findPublicationsByAuthor, getAllPublications, findPublicationsByStatus, getAllPublicationsToEditor } from '../../services/publicationService';
import { PublicationDocument, PublicationModel } from '../../models/PublicationModel';
import { findUserByFullName } from '../../services/userService';
import fs from 'fs';
import path from 'path';
import { PublicationStatus } from '@/src/interfaces';

export const postPublication = async (req: Request, res: Response) => {
    console.log('Received request to create publication with body:', req.body, 'and file:', req.files);
    const publication: any = req.body;
    // parse tags if provided as JSON or comma-separated string
    if (publication.tags && typeof publication.tags === 'string') {
        try {
            publication.tags = JSON.parse(publication.tags);
        } catch (e) {
            publication.tags = publication.tags.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        }
    }
    const file = req.file; // Assuming you're using multer for file uploads
    if (!publication.title || !publication.content || !publication.author) {
      res.status(400).json({ error: 'Missing required fields' });
    } else {
        console.log('Received publication data:', publication);
        console.log('Received file:', file);
        const response = await createPublication(publication, file);
        res.status(201).json(response);
    }
};

export const getPublications = async (req: Request, res: Response) => {
    console.log('Received request to get publications with query:', req.query);
    const author = typeof req.query.author === 'string' ? req.query.author : '';
    const skip = req.query.skip ? parseInt(String(req.query.skip), 10) : 0;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const publications = await getAllPublications(author, isNaN(skip) ? 0 : skip, isNaN(limit) ? 20 : limit);
    console.log(`Returning ${publications.length} publications for author "${author}" with skip=${skip} and limit=${limit}`);
    res.status(200).json(publications);
}

export const getPublicationsToEditor = async (req: Request, res: Response) => {
    console.log('Received request to get publications with query:', req.query);
    const author = typeof req.query.author === 'string' ? req.query.author : '';
    const skip = req.query.skip ? parseInt(String(req.query.skip), 10) : 0;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
    const status : PublicationStatus[] = req.query.status ? (Array.isArray(req.query.status) ? req.query.status : [req.query.status]) as PublicationStatus[] : ['EN_REVISION', 'ITERANDO', 'APROBADO', 'PUBLICADA'];
    const publications = await getAllPublicationsToEditor(author, isNaN(skip) ? 0 : skip, isNaN(limit) ? 20 : limit, status);
    console.log(`Returning ${publications.length} publications for author "${author}" with skip=${skip} and limit=${limit}`);
    res.status(200).json(publications);
}

export const getPublicationById = async (req: Request, res: Response) => {
    const { id } = req.params;
    let response = await findPublicationById(id);
    if (!response) {
        // try find by slug (title-based)
        try {
            const { findPublicationBySlug } = await import('../../services/publicationService');
            response = await findPublicationBySlug(id);
        } catch (e) {
            // ignore
        }
    }
    if (!response) {
        return res.status(404).json({ error: 'Publication not found' });
    }
    res.status(200).json(response);
}

export const getPublicationsByAuthor = async (req: Request, res: Response) => {
    const { author } = req.params;
    const user = await findUserByFullName(author);
    if (!user) {
        res.status(404).json({ error: 'Author not found' });
    } else {
        const publications = await findPublicationsByAuthor(user._id.toString());
        res.status(200).json(publications);
    }
}

export const getPublicationsByAuthorId = async (req: Request, res: Response) => {
    const { authorId } = req.params;
    const publications = await findPublicationsByAuthor(authorId);
    res.status(200).json(publications);
}

export const getPublicationsByStatus = async (req: Request, res: Response) => {
    const { status } = req.params;
    const publications = await findPublicationsByStatus(status);
    res.status(200).json(publications);
}

export const approvePublication = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const publication = req.body;
        const pub = await PublicationModel.findByIdAndUpdate(id, publication, { new: true }).exec();
        if (!pub) return res.status(404).json({ message: 'Publicación no encontrada' });
        res.json(pub);
    } catch (err: any) {
        console.error('Error approving publication:', err);
        res.status(500).json({ message: err.message });
    }
}

export const rejectPublication = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const publication = req.body || {};
        const pub = await PublicationModel.findByIdAndUpdate(id, publication, { new: true }).exec();
        if (!pub) return res.status(404).json({ message: 'Publicación no encontrada' });
        res.json(pub);
    } catch (err: any) {
        console.error('Error rejecting publication:', err);
        res.status(500).json({ message: err.message });
    }
}

export const uploadPublicationImage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.file) return res.status(400).json({ message: 'Falta archivo' });
        const imagePath = `/public/uploads/publications/${req.file.filename}`;
        const pub = await PublicationModel.findByIdAndUpdate(id, { imageUrl: imagePath }, { new: true }).exec();
        if (!pub) return res.status(404).json({ message: 'Publicación no encontrada' });
        res.json(pub);
    } catch (err: any) {
        console.error('Error uploading publication image:', err);
        res.status(500).json({ message: err.message });
    }
}

export const updatePublication = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const body = req.body || {};
        const update: any = {};
        // parse tags when sent as JSON string
        if (body.tags && typeof body.tags === 'string') {
            try {
                update.tags = JSON.parse(body.tags);
            } catch (e) {
                update.tags = body.tags.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
            }
        }
        if (body.title) update.title = body.title;
        if (body.content) update.content = body.content;
        if (body.status) update.status = body.status;
        if (body.title) {
            try {
                const { slugifyTitleServer } = await import('../../utils/slugify');
                let baseSlug = slugifyTitleServer(body.title || '');
                if (!baseSlug) baseSlug = String(Date.now());
                const exists = await PublicationModel.findOne({ slug: baseSlug }).exec();
                update.slug = exists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
            } catch (e) {
                // ignore slug generation errors
            }
        }

        // handle image if provided (memoryStorage)
        if (req.file) {
            const ext = path.extname(req.file.originalname) || '.jpg';
            const destDir = path.join(process.cwd(), 'public', 'uploads', 'publications');
            fs.mkdirSync(destDir, { recursive: true });
            const filename = `${id}${ext}`;
            const destPath = path.join(destDir, filename);
            const anyFile: any = req.file as any;
            if (anyFile.buffer) {
                fs.writeFileSync(destPath, anyFile.buffer);
            }
            update.imageUrl = `/public/uploads/publications/${filename}`;
        }

        const pub = await PublicationModel.findByIdAndUpdate(id, update, { new: true }).exec();
        if (!pub) return res.status(404).json({ message: 'Publicación no encontrada' });
        res.json(pub);
    } catch (err: any) {
        console.error('Error updating publication:', err);
        res.status(500).json({ message: err.message });
    }
}