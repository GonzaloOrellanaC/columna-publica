import { Router } from 'express';
import { postVisit, getStats } from '../controllers/VisitController';

const router = Router();

router.post('/', postVisit);
router.get('/stats', getStats);

export default router;
