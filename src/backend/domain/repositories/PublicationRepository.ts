import { Publication } from '../entities/Publication';

export interface PublicationRepository {
  save(publication: Publication): Promise<Publication>;
  findAll(): Promise<Publication[]>;
  findById(id: string): Promise<Publication | null>;
  findByAuthor(author: string): Promise<Publication[]>;
}
