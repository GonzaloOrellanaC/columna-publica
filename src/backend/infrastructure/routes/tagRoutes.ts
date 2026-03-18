import { Router } from 'express';
import { getTags } from '../controllers/TagController';

const router = Router();

router.get('/', getTags);

export default router;
