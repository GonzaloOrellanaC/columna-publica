import { TagModel } from '../../models/TagModel';
import { slugifyTitleServer } from '../../utils/slugify';

export async function ensureTagsExist() {
  try {
    const count = await TagModel.estimatedDocumentCount().exec();
    if (count && count > 0) return; // already has tags

    const tagsEnv = process.env.TAGS || '';
    if (!tagsEnv) return;

    const tags = tagsEnv.split(',').map(t => t.trim()).filter(Boolean);
    if (tags.length === 0) return;

    const docs = tags.map(t => ({ name: t, slug: slugifyTitleServer(t) }));
    await TagModel.insertMany(docs);
    console.log(`Initialized ${docs.length} tags from .env`);
  } catch (e) {
    console.error('Error ensuring tags exist:', e);
  }
}
