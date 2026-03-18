import { Router } from 'express';
import path from 'path';
import multer from 'multer';
import { getUsers, getUserById, createUser, updateUser, uploadAvatar, deleteUser, getUserByNameHandler } from '../controllers/UserController';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'public', 'uploads', 'avatars')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const id = req.params.id || Date.now().toString();
    cb(null, `${Date.now()}-${id}${ext}`);
  }
});
console.log('Avatar upload path:', path.join(process.cwd(), 'public', 'uploads', 'avatars'));
const upload = multer({ storage });

router.get('/', getUsers);
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await getUserById(id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ message: 'Usuario no encontrado' });
  }
});
router.post('/', createUser);
router.put('/:id', updateUser);
// Delete user
router.delete('/:id', deleteUser);

// Upload avatar (multipart/form-data field `avatar`)
router.post('/:id/avatar', upload.single('avatar'), uploadAvatar);
// Get user by name (nombres or apellidos)
router.get('/by-name/:name', getUserByNameHandler);

export default router;
