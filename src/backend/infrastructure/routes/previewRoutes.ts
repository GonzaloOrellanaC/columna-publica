import { Router } from 'express';
import { renderPublicationPreview } from '../controllers/PreviewController';

const router = Router();

// Serve preview HTML for publication pages so social networks get OG tags
router.get('/publication/:id', renderPublicationPreview);
router.get('/publication/preview/:id', renderPublicationPreview);

export default router;
