
import { Request, Response } from 'express';
import { UserModel } from '../../models/UserModel';
import { sendWelcomeEmail } from '../../services/userEmailService';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { findUserByFullName } from '../../services/userService';

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

export async function uploadAvatar(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: 'Falta archivo' });
    const avatarPath = `/public/uploads/avatars/${req.file.filename}`;
    const fullAvatarPath = path.join(process.cwd(), avatarPath);
    if (!fs.existsSync(fullAvatarPath)) {
      res.status(500).json({ message: 'Archivo subido no encontrado en el servidor' });
    } else {
      const user = await UserModel.findByIdAndUpdate(id, { avatarUrl: avatarPath }, { new: true }).populate('roles');
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
      res.json(user);
    }
  } catch (err: any) {
    console.error('Error uploading avatar:', err);
    res.status(500).json({ message: err.message });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // If user has an avatar file stored under /public/uploads/avatars, try to remove it
    if (user.avatarUrl && typeof user.avatarUrl === 'string' && user.avatarUrl.includes('/public/uploads/avatars/')) {
      try {
        const filename = path.basename(user.avatarUrl);
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'avatars', filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (fsErr) {
        console.warn('No se pudo eliminar el archivo de avatar:', fsErr);
      }
    }

    await UserModel.findByIdAndDelete(id);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: err.message });
  }
}

export async function getUserByNameHandler(req: Request, res: Response) {
  try {
    const { name } = req.params;
    if (!name) return res.status(400).json({ message: 'Falta nombre' });

    // Buscar por nombres o apellidos (case-insensitive)
    const user = await findUserByFullName(name);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    const responseUser = {
      _id: user._id,
      email: user.email,
      nombres: user.nombres,
      apellidos: user.apellidos,
      descripcion: user.descripcion,
      resena: user.resena,
      roles: user.roles,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    };
    res.json(responseUser);
  } catch (err: any) {
    console.error('Error buscando usuario por nombre:', err);
    res.status(500).json({ message: err.message });
  }
}