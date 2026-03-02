import { Publication } from '../domain/entities/Publication';
import { PublicationRepository } from '../domain/repositories/PublicationRepository';

export class GetPublicationById {
  constructor(private publicationRepository: PublicationRepository) {}

  async execute(id: string): Promise<Publication | null> {
    return this.publicationRepository.findById(id);
  }
}
