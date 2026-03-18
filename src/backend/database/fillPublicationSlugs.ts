import { connectDB } from '../infrastructure/database/db';
import { PublicationModel } from '../models/PublicationModel';
import { slugifyTitleServer } from '../utils/slugify';

async function run() {
  await connectDB();
  console.log('Filling missing slugs for publications...');
  const pubs = await PublicationModel.find({}).exec();
  let updated = 0;
  for (const p of pubs) {
    if (!p.slug || p.slug.trim() === '') {
      const base = slugifyTitleServer((p.title || '').toString()) || String(Date.now());
      let slug = base;
      const exists = await PublicationModel.findOne({ slug }).exec();
      if (exists) {
        slug = `${base}-${Date.now().toString().slice(-4)}`;
      }
      p.slug = slug;
      await p.save();
      updated++;
    }
  }
  console.log(`Updated ${updated} publications.`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
