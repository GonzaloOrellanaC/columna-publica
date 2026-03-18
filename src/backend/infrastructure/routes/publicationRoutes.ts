

import { Router } from 'express';
import { getPublicationById, getPublications, getPublicationsByAuthor, getPublicationsByAuthorId, postPublication, getPublicationsByStatus, uploadPublicationImage, approvePublication, rejectPublication, updatePublication, getPublicationsToEditor } from '../controllers/PublicationController';
import multer from 'multer';
import path from 'path';

const router = Router();

// Accept multipart/form-data on creation (field `image`) so frontend can send FormData with image
const createStorage = multer.memoryStorage();
const createUpload = multer({ storage: createStorage });

router.post('/', createUpload.single('image'), postPublication);
router.get('/', getPublications);
router.get('/editor', getPublicationsToEditor);
// Get by status (e.g. EN_REVISION)
router.get('/status/:status', getPublicationsByStatus);
router.get('/author/:author', getPublicationsByAuthor);
router.get('/author-id/:authorId', getPublicationsByAuthorId);
router.get('/:id', getPublicationById);

// Approve / reject endpoints for editors
router.post('/:id/approve', approvePublication);
router.post('/:id/reject', rejectPublication);

// update publication (fields + optional image)
router.put('/:id', createUpload.single('image'), updatePublication);

// upload publication cover image (multipart field `image`)
const pubStorage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'public', 'uploads', 'publications')),
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname) || '';
		const id = req.params.id || Date.now().toString();
		cb(null, `${id}${ext}`);
	}
});
const pubUpload = multer({ storage: pubStorage });
router.post('/:id/image', pubUpload.single('image'), uploadPublicationImage);

export default router;
