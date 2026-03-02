import { Publication } from '../domain/entities/Publication';
import { PublicationRepository } from '../domain/repositories/PublicationRepository';

export class GetPublicationsByAuthor {
  constructor(private publicationRepository: PublicationRepository) {}

  async execute(author: string): Promise<Publication[]> {
    return this.publicationRepository.findByAuthor(author);
  }
}
