import { RoleModel } from "../../models/RoleModel";

export const ROLES = [
  { name: 'superadmin', description: 'Acceso total, puede borrar administradores.' },
  { name: 'admin', description: 'Puede crear usuarios admin, editor y columnista.' },
  { name: 'editor', description: 'Puede editar publicaciones.' },
  { name: 'columnista', description: 'Puede crear publicaciones.' }
];

export async function ensureRolesExist() {
  for (const role of ROLES) {
    await RoleModel.updateOne(
      { name: role.name },
      { $setOnInsert: role },
      { upsert: true }
    );
  }
  const allRoles = await RoleModel.find();
  console.log('Roles en base de datos:', allRoles.map(r => r.name).join(', '));
}
