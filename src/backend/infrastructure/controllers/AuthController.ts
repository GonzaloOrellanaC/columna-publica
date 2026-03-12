import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../models/UserModel';
import { sendResetPasswordEmail } from '../../services/userEmailService';

const JWT_SECRET = process.env.JWT_SECRET || 'columna-publica-secret';


export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Correo electrónico y contraseña requeridos' });
  }
  const user = await UserModel.findOne({ email }).populate('roles');
  console.log('User:', user);
  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }
  const token = jwt.sign({ id: user._id, email: user.email, roles: user.roles }, JWT_SECRET, { expiresIn: '1d' });
  res.json({
    token,
    user: {
      email: user.email,
      nombres: user.nombres,
      apellidos: user.apellidos,
      descripcion: user.descripcion,
      resena: user.resena,
      roles: user.roles
    }
  });
}

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  console.log('forgotPassword request for email:', email);
  if (!email) {
    return res.status(400).json({ message: 'Correo electrónico requerido' });
  }
  try {
    const user = await UserModel.findOne({ email });
    // Do not reveal whether the user exists. Always respond the same way.
    if (user) {
      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
      await sendResetPasswordEmail(user.email, user.nombres || `${user.email}`, token);
    }
    res.json({ message: 'Si el correo existe, recibirás un enlace para restaurar tu contraseña.' });
  } catch (err) {
    console.error('forgotPassword error', err);
    res.status(500).json({ message: 'Error interno' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  console.log('resetPassword request with token:', token, 'newPassword:', newPassword);
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token y nueva contraseña requeridos' });
  }
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded?.id;
    if (!userId) {
      return res.status(400).json({ message: 'Token inválido' });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (err: any) {
    console.error('resetPassword error', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Token expirado' });
    }
    res.status(400).json({ message: 'Token inválido o error al actualizar la contraseña' });
  }
};