import { Router } from 'express';
import { getRoles } from '../controllers/RolesController';

const router = Router();

router.get('/', getRoles);

export default router;
