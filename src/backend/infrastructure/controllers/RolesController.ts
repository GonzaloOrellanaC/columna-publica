import { Request, Response } from 'express';
import { RoleModel } from '../../models/RoleModel';

export async function getRoles(req: Request, res: Response) {
	const roles = await RoleModel.find();
	res.json(roles);
}
