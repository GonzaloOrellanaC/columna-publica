
import { Request, Response } from 'express';
import { UserModel } from '../../models/UserModel';
import { sendWelcomeEmail } from '../../services/userEmailService';
import jwt from 'jsonwebtoken';

export async function createUser(req: Request, res: Response) {
  try {
    const { email, nombres, apellidos, descripcion, resena, roles } = req.body;
    console.log('Creating user with data:', { email, nombres, apellidos, descripcion, resena, roles });
    if (!email || !nombres || !apellidos || !roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }
    // Por defecto, la contraseña es el rut o email (debe cambiarse luego)
    const password = 'changeme';
    const user = await UserModel.create({ email, nombres, apellidos, descripcion, resena, roles, password });
    try {
      // Generar token para cambio de contraseña
      const JWT_SECRET = process.env.JWT_SECRET || 'columna-publica-secret';
      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
      await sendWelcomeEmail(email, nombres, token);
      return res.status(201).json(user);
    } catch (emailErr) {
      console.error('Error enviando correo de bienvenida:', emailErr);
      await user.deleteOne(); // Eliminar el usuario si no se pudo enviar el correo
      return res.status(500).json({ message: 'Error enviando correo de bienvenida, usuario no creado' });
    }
    
  } catch (err: any) {
    console.error('Error creating user:', err);
    res.status(400).json({ message: err.message });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { nombres, apellidos, descripcion, resena, roles } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      id,
      { nombres, apellidos, descripcion, resena, roles },
      { new: true, runValidators: true }
    ).populate('roles');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getUsers(req: Request, res: Response) {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    UserModel.find({}, '-password')
      .populate('roles')
      .skip(skip)
      .limit(limit),
    UserModel.countDocuments()
  ]);

  res.json({
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  });
}

export async function getUserById(id: string) {
  const user = await UserModel.findById(id, '-password').populate('roles');
  console.log('User in getUserById:', user);
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  return user;
}