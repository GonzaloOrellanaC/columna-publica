export function getRoleLabel(role: string): string {
  switch (role) {
    case 'superadmin':
      return 'Super Administrador';
    case 'admin':
      return 'Administrador';
    case 'editor':
      return 'Editor';
    case 'columnista':
      return 'Columnista';
    default:
      return role;
  }
}
