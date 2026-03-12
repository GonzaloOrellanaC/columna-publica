import { Request, Response } from 'express';
import { createPublication, findPublicationById, findPublicationsByAuthor, getAllPublications } from '../../services/publicationService';
import { PublicationDocument } from '../../models/PublicationModel';

export const postPublication = async (req: Request, res: Response) => {
    const publication: PublicationDocument = req.body;
    if (!publication.title || !publication.content || !publication.author) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const response = await createPublication(publication);
    res.status(201).json(response);
};

export const getPublications = async (req: Request, res: Response) => {
    const publications = await getAllPublications();
    res.status(200).json(publications);
}

export const getPublicationById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const response = await findPublicationById(id);
    if (!response) {
        return res.status(404).json({ error: 'Publication not found' });
    }
    res.status(200).json(response);
}

export const getPublicationsByAuthor = async (req: Request, res: Response) => {
    const { author } = req.params;
    const publications = await findPublicationsByAuthor(author);
    res.status(200).json(publications);
}