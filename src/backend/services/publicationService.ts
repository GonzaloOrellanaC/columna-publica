import { PublicationDocument, PublicationModel } from "../models/PublicationModel";
import { sendEditorNotificationToEditors } from './userEmailService';
import { UserModel } from '../models/UserModel';
import fs from 'fs';
import path from 'path';
import { PublicationStatus } from "@/src/interfaces";
import { slugifyTitleServer } from '../utils/slugify';

export const findPublicationsByStatus = async (status: string) => {
    const publications = await PublicationModel.find({ status, enabled: true }).sort({ createdAt: -1 }).exec();
    return publications;
}

export const createPublication = async (publication: PublicationDocument, file?: Express.Multer.File) => {
    let imageUrl = '';
    if (file) {
        try {
            const ext = path.extname(file.originalname) || '';
            const destDir = path.join(process.cwd(), 'public', 'uploads', 'publications');
            fs.mkdirSync(destDir, { recursive: true });

            const filename = `${Date.now()}${ext}`;
            const destPath = path.join(destDir, filename);

            const anyFile: any = file as any;
            if (anyFile.path && fs.existsSync(anyFile.path)) {
                try {
                    fs.renameSync(anyFile.path, destPath);
                } catch (e) {
                    fs.copyFileSync(anyFile.path, destPath);
                    try { fs.unlinkSync(anyFile.path); } catch {}
                }
            } else if (anyFile.buffer) {
                fs.writeFileSync(destPath, anyFile.buffer);
            }

            imageUrl = `/public/uploads/publications/${filename}`;
        } catch (e) {
            console.error('Error saving publication image in service:', e);
            imageUrl = '';
        }
    }
    const publishDate = publication.publishDate || new Date();
    // create slug and ensure uniqueness
    let baseSlug = slugifyTitleServer(publication.title || '');
    if (!baseSlug) baseSlug = String(Date.now());
    // if slug exists, append short suffix
    const exists = await PublicationModel.findOne({ slug: baseSlug }).exec();
    let finalSlug = baseSlug;
    if (exists) {
        finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }
    const newPublication = new PublicationModel({ ...publication, publishDate, ...(imageUrl ? { imageUrl } : {}), slug: finalSlug });
    await newPublication.save();

    // After saving, notify editors asynchronously
    (async () => {
        try {
            let authorName = '';
            try {
                const authorId = typeof newPublication.author === 'string' ? newPublication.author : (newPublication.author as any).toString();
                const user = await UserModel.findById(authorId).exec();
                if (user) authorName = `${user.nombres} ${user.apellidos}`;
            } catch (e) {
                authorName = String(newPublication.author || '');
            }
            const publishDate = (newPublication.publishDate || (newPublication as any).createdAt || new Date()).toISOString();
            await sendEditorNotificationToEditors(authorName, publishDate, newPublication.title, newPublication._id.toString());
        } catch (err) {
            console.error('Error notifying editors:', err);
        }
    })();

    return newPublication;
};

export const getAllPublications = async (author: string, skip: number, limit: number) => {
    if (author && typeof author === 'string' && author.length > 0) {
        // fullname es "nombres apellidos", pero en la base de datos están separados, así que buscamos por coincidencia con regex (case-insensitive) y tomamos el _id para buscar publicaciones
        const fullName = author.trim();
        const regex = new RegExp(fullName.replace(/\s+/g, '\\s+'), 'i'); // permite cualquier cantidad de espacios entre nombres y apellidos
        const authorId = await UserModel.find({ $expr: { $regexMatch: { input: { $concat: ['$nombres', ' ', '$apellidos'] }, regex } } }).select('_id').exec();
        console.log('Author search result:', authorId);
        if (authorId && authorId.length > 0) {
            const publications = await PublicationModel.find({ author: { $in: authorId.map(a => a._id) }, enabled: true, status: 'PUBLICADA' }).populate('author', 'nombres apellidos avatarUrl descripcion').skip(skip).sort({ createdAt: -1 }).limit(limit).exec();
            return publications;
        } else {
            return [];
        }
    } else {
        const publications = await PublicationModel.find({enabled: true, status: 'PUBLICADA'}).populate('author', 'nombres apellidos avatarUrl descripcion').skip(skip).sort({ createdAt: -1 }).limit(limit).exec()
        return publications
    }
};

export const getAllPublicationsToEditor = async (author: string, skip: number, limit: number, status: PublicationStatus[]) => {
    if (author && typeof author === 'string' && author.length > 0) {
        // fullname es "nombres apellidos", pero en la base de datos están separados, así que buscamos por coincidencia con regex (case-insensitive) y tomamos el _id para buscar publicaciones
        const fullName = author.trim();
        const regex = new RegExp(fullName.replace(/\s+/g, '\\s+'), 'i'); // permite cualquier cantidad de espacios entre nombres y apellidos
        const authorId = await UserModel.find({ $expr: { $regexMatch: { input: { $concat: ['$nombres', ' ', '$apellidos'] }, regex } } }).select('_id').exec();
        console.log('Author search result:', authorId);
        if (authorId && authorId.length > 0) {
            const publications = await PublicationModel.find({ author: { $in: authorId.map(a => a._id) }, enabled: true, status: { $in: status } }).populate('author', 'nombres apellidos avatarUrl descripcion').skip(skip).sort({ createdAt: -1 }).limit(limit).exec();
            return publications;
        } else {
            return [];
        }
    } else {
        const publications = await PublicationModel.find({enabled: true, status: { $in: status }}).populate('author', 'nombres apellidos avatarUrl descripcion').skip(skip).sort({ createdAt: -1 }).limit(limit).exec()
        return publications
    }
};
export const findPublicationById = async (id: string) => {
    // el id puede ser el _id de la publicación o el título con guiones (slug), así que intentamos ambos
    try {
        const pub = await PublicationModel.findById(id).populate('author', 'nombres apellidos avatarUrl descripcion').exec();
        if (pub) return pub;
    } catch (e) {
        return null; // no es un id válido, intentamos buscar por slug
        // no es un id válido, intentamos buscar por slug
    }
}

export const findPublicationBySlug = async (slug: string) => {
    if (!slug) return null;
    const decoded = decodeURIComponent(slug);
    // try direct slug field match first
    let pub = await PublicationModel.findOne({ slug: slug }).populate('author', 'nombres apellidos avatarUrl descripcion').exec();
    if (pub) return pub;
    pub = await PublicationModel.findOne({ slug: decoded }).populate('author', 'nombres apellidos avatarUrl descripcion').exec();
    if (pub) return pub;
    // fallback: normalize titles and compare
    const slugNorm = String(decoded).toLowerCase();
    const pubs = await PublicationModel.find({ enabled: true }).populate('author', 'nombres apellidos avatarUrl descripcion').exec();
    for (const p of pubs) {
        try {
            const title = (p.title || '').toString();
            const norm = title
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^\p{L}\p{N}\s]/gu, '')
                .trim()
                .replace(/\s+/g, '-').toLowerCase();
            if (encodeURIComponent(norm) === encodeURIComponent(slugNorm) || norm === slugNorm) {
                return p;
            }
        } catch (e) {
            continue;
        }
    }
    return null;
}

export const findPublicationsByAuthor = async (userId: string) => {
    const publications = await PublicationModel.find({ author: userId, enabled: true }).populate('author', 'nombres apellidos avatarUrl descripcion')
        .exec();
    return publications;
}