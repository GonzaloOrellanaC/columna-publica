import { UserModel } from "../models/UserModel";

export const findUserByFullName = async (fullName: string) => {
    // Accept variants like "Eduardo-Canales-Orellana" or "Eduardo Canales Orellana".
    // Convert hyphens to spaces and collapse multiple spaces, then build a regex
    // that matches the concatenation of `nombres + ' ' + apellidos` in the DB.
    if (!fullName) return null;
    const normalized = String(fullName).replace(/-/g, ' ').trim().replace(/\s+/g, '\\s+');
    const regex = new RegExp(`^${normalized}$`, 'i');
    const user = await UserModel.findOne({ $expr: { $regexMatch: { input: { $concat: ['$nombres', ' ', '$apellidos'] }, regex } } }).exec();
    return user;
}