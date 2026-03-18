import { UserModel } from "../models/UserModel";

export const findUserByFullName = async (fullName: string) => {
    const [nombres, apellidos] = fullName.split(' ');
    const user = await UserModel.findOne({ nombres, apellidos }).exec();
    return user;
}