import { Router } from 'express';
import { PublicationController } from '../controllers/PublicationController';
import { CreatePublication } from '../../usecases/CreatePublication';
import { GetPublications } from '../../usecases/GetPublications';
import { GetPublicationById } from '../../usecases/GetPublicationById';
import { GetPublicationsByAuthor } from '../../usecases/GetPublicationsByAuthor';
import { InMemoryPublicationRepository } from '../database/InMemoryPublicationRepository';
// import { MongoPublicationRepository } from '../database/MongoPublicationRepository';

const router = Router();

// Dependency Injection
// Se utiliza InMemory para asegurar el funcionamiento en este entorno.
const repository = new InMemoryPublicationRepository();

/*
// --- Descomentar para usar MongoDB ---
// const repository = new MongoPublicationRepository();
*/

const createUseCase = new CreatePublication(repository);
const getUseCase = new GetPublications(repository);
const getByIdUseCase = new GetPublicationById(repository);
const getByAuthorUseCase = new GetPublicationsByAuthor(repository);
const controller = new PublicationController(createUseCase, getUseCase, getByIdUseCase, getByAuthorUseCase);

router.post('/', (req, res) => controller.create(req, res));
router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.get('/author/:author', (req, res) => controller.getByAuthor(req, res));

export default router;
