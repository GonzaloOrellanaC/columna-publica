import { Publication } from '../../domain/entities/Publication';
import { PublicationRepository } from '../../domain/repositories/PublicationRepository';

export class InMemoryPublicationRepository implements PublicationRepository {
  private publications: Publication[] = [
    {
      id: '1',
      title: 'El Futuro de la Democracia en la Era Digital',
      content: 'La digitalización ha transformado radicalmente la forma en que interactuamos con las instituciones públicas. Sin embargo, este avance tecnológico plantea serios desafíos para la democracia representativa tradicional. Las redes sociales, diseñadas para captar la atención mediante algoritmos de polarización, están fragmentando el espacio público y dificultando el consenso ciudadano. Es imperativo desarrollar nuevos mecanismos de participación digital que prioricen la deliberación informada sobre la reacción emocional.',
      author: 'Elena Martínez',
      createdAt: new Date('2023-10-01T10:00:00Z'),
      status: 'PUBLICADA'
    },
    {
      id: '2',
      title: 'Economía Circular: Más Allá del Reciclaje',
      content: 'Reducir, reutilizar y reciclar ya no es suficiente. La verdadera economía circular exige un rediseño completo de nuestros sistemas de producción y consumo para eliminar el concepto de desperdicio desde su origen. Esto implica repensar los materiales, extender la vida útil de los productos y fomentar modelos de negocio basados en el servicio en lugar de la propiedad. Solo a través de una transformación sistémica podremos desacoplar el crecimiento económico de la degradación ambiental.',
      author: 'Carlos Rivera',
      createdAt: new Date('2023-10-05T14:30:00Z'),
      status: 'PUBLICADA'
    },
    {
      id: '3',
      title: 'Descentralización y Poder Local',
      content: 'El fortalecimiento de los gobiernos locales es fundamental para una gestión pública eficiente. La toma de decisiones debe acercarse a los territorios donde se experimentan las problemáticas reales. Un modelo excesivamente centralizado genera burocracia, ineficiencia y desconexión con las necesidades ciudadanas. Transferir competencias y recursos a los municipios y regiones no solo mejora la calidad de los servicios, sino que también revitaliza la participación democrática a nivel comunitario.',
      author: 'Ana Silva',
      createdAt: new Date('2023-10-10T09:15:00Z'),
      status: 'PUBLICADA'
    },
    {
      id: '4',
      title: 'La Crisis de la Información y las Fake News',
      content: 'En un ecosistema mediático saturado, la desinformación se propaga más rápido que la verdad. Es imperativo desarrollar nuevas herramientas de alfabetización mediática para la ciudadanía. Las plataformas tecnológicas deben asumir su responsabilidad editorial, pero la solución a largo plazo reside en la educación. Los ciudadanos deben estar equipados con el pensamiento crítico necesario para evaluar fuentes, identificar sesgos y resistir la manipulación en el entorno digital.',
      author: 'Jorge Morales',
      createdAt: new Date('2023-10-15T16:45:00Z'),
      status: 'PUBLICADA'
    },
    {
      id: '5',
      title: 'Transición Energética Justa',
      content: 'El abandono de los combustibles fósiles no puede dejar atrás a las comunidades que dependen de estas industrias. Una transición justa requiere políticas de reconversión laboral y desarrollo territorial. No basta con instalar paneles solares y turbinas eólicas; debemos asegurar que los beneficios económicos de las energías renovables se distribuyan equitativamente y que los trabajadores afectados reciban el apoyo y la formación necesarios para integrarse en la nueva economía verde.',
      author: 'Lucía Fernández',
      createdAt: new Date('2023-10-20T11:20:00Z'),
      status: 'PUBLICADA'
    },
    {
      id: '6',
      title: 'Educación Pública en el Siglo XXI',
      content: 'El modelo educativo actual fue diseñado para la era industrial. Necesitamos repensar la educación pública para fomentar el pensamiento crítico, la creatividad y la adaptabilidad frente a un mundo en constante cambio. La memorización de datos ha perdido relevancia en la era de la información ubicua; en su lugar, debemos cultivar habilidades socioemocionales, la resolución de problemas complejos y la capacidad de aprender a aprender a lo largo de toda la vida.',
      author: 'Roberto Gómez',
      createdAt: new Date('2023-10-25T08:00:00Z'),
      status: 'PUBLICADA'
    }
  ];

  async save(publication: Publication): Promise<Publication> {
    const newPub = { ...publication, id: Math.random().toString(36).substring(7) };
    this.publications.push(newPub);
    return newPub;
  }

  async findAll(): Promise<Publication[]> {
    return this.publications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(id: string): Promise<Publication | null> {
    const publication = this.publications.find(p => p.id === id);
    return publication || null;
  }

  async findByAuthor(author: string): Promise<Publication[]> {
    return this.publications
      .filter(p => p.author === author)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
