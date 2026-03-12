

import bcrypt from 'bcryptjs';
import { UserModel } from '../../models/UserModel';
import { RoleModel } from '../../models/RoleModel';

export async function createSuperAdminFromEnv() {
  const creds = process.env.SUPERADMIN_CREDENTIALS;
  if (!creds) return;
  // Formato esperado: email:password:nombres:apellidos:descripcion:resena
  const [email, password, nombres, apellidos, descripcion, resena] = creds.replace(/['"]+/g, '').split(':');
  if (!email || !password || !nombres || !apellidos) return;

  const existing = await UserModel.findOne({ email });
  if (existing) return;

  // Buscar el _id del rol 'superadmin'
  const superadminRole = await RoleModel.findOne({ name: 'superadmin' });
  if (!superadminRole) {
    console.error('No se encontró el rol superadmin en la base de datos.');
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await UserModel.create({
    email,
    password: hashed,
    nombres,
    apellidos,
    descripcion: descripcion || '',
    resena: resena || '',
    roles: [superadminRole._id!.toString()]
  });
  console.log(`Superadmin creado: ${email}`);
}

/*   const creds = process.env.SUPERADMIN_CREDENTIALS;
  if (!creds) return;
  const [username, password] = creds.replace(/['"]+/g, '').split(':');
  if (!username || !password) return;

  const existing = await UserModel.findOne({ username });
  if (existing) return;

  // Buscar el _id del rol 'superadmin'
  const superadminRole = await RoleModel.findOne({ name: 'superadmin' });
  if (!superadminRole) {
    console.error('No se encontró el rol superadmin en la base de datos.');
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await UserModel.create({ username, password: hashed, roles: [superadminRole._id] });
  console.log(`Superadmin creado: ${username}`);
}
 */