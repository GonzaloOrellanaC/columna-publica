import { PublicationDocument, PublicationModel } from "../models/PublicationModel";

export const createPublication = async (publication: PublicationDocument) => {
    const newPublication = new PublicationModel(publication);
    await newPublication.save();
    return newPublication;
};

export const getAllPublications = async () => {
    const publications = await PublicationModel.find({enabled: true}).sort({ createdAt: -1 }).exec();
    return publications
};

export const findPublicationById = async (id: string) => {
    const publication = await PublicationModel.findById(id).exec();
    return publication;
}

export const findPublicationsByAuthor = async (author: string) => {
    const publications = await PublicationModel.find({ author, enabled: true }).sort({ createdAt: -1 }).exec();
    return publications;
}