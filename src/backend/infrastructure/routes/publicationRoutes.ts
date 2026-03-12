
import { Router } from 'express';
import { getPublicationById, getPublications, getPublicationsByAuthor, postPublication } from '../controllers/publicationController';


const router = Router();


router.post('/', postPublication);
router.get('/', getPublications);
router.get('/:id', getPublicationById);
router.get('/author/:author', getPublicationsByAuthor);

export default router;
