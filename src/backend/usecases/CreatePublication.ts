import { Publication } from '../domain/entities/Publication';
import { PublicationRepository } from '../domain/repositories/PublicationRepository';

export class CreatePublication {
  constructor(private publicationRepository: PublicationRepository) {}

  async execute(data: Omit<Publication, 'createdAt'>): Promise<Publication> {
    const publication: Publication = {
      ...data,
      createdAt: new Date(),
    };
    return this.publicationRepository.save(publication);
  }
}
