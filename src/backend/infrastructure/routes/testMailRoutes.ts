import { Router } from 'express';
import { testSendMail } from '../controllers/TestMailController';

const router = Router();

// GET /api/test-mail?to=correo@ejemplo.com
router.get('/', testSendMail);

export default router;
