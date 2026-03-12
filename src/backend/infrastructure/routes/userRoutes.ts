import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser } from '../controllers/UserController';

const router = Router();

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

export default router;
