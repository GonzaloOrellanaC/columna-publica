import { Publication } from '../domain/entities/Publication';
import { PublicationRepository } from '../domain/repositories/PublicationRepository';

export class GetPublications {
  constructor(private publicationRepository: PublicationRepository) {}

  async execute(): Promise<Publication[]> {
    return this.publicationRepository.findAll();
  }
}
