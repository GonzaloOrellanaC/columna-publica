import { Request, Response } from 'express';
import { CreatePublication } from '../../usecases/CreatePublication';
import { GetPublications } from '../../usecases/GetPublications';
import { GetPublicationById } from '../../usecases/GetPublicationById';
import { GetPublicationsByAuthor } from '../../usecases/GetPublicationsByAuthor';

export class PublicationController {
  constructor(
    private createPublication: CreatePublication,
    private getPublications: GetPublications,
    private getPublicationById: GetPublicationById,
    private getPublicationsByAuthor: GetPublicationsByAuthor
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { title, content, author } = req.body;
      if (!title || !content || !author) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      const publication = await this.createPublication.execute({ title, content, author });
      res.status(201).json(publication);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const publications = await this.getPublications.execute();
      res.status(200).json(publications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const publication = await this.getPublicationById.execute(id);
      if (!publication) {
        res.status(404).json({ error: 'Publication not found' });
        return;
      }
      res.status(200).json(publication);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getByAuthor(req: Request, res: Response): Promise<void> {
    try {
      const { author } = req.params;
      const publications = await this.getPublicationsByAuthor.execute(author);
      res.status(200).json(publications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
