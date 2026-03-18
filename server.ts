import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

import publicationRoutes from './src/backend/infrastructure/routes/publicationRoutes';
import previewRoute from './src/backend/infrastructure/routes/previewRoutes';
import { connectDB } from './src/backend/infrastructure/database/db';
import { createSuperAdminFromEnv } from './src/backend/infrastructure/database/createSuperAdmin';
import { ensureRolesExist } from './src/backend/infrastructure/database/initRoles';
import authRoute from './src/backend/infrastructure/routes/authRoutes';
import userRoutes from './src/backend/infrastructure/routes/userRoutes';
import rolesRoutes from './src/backend/infrastructure/routes/rolesRoutes';
import testMailRoute from './src/backend/infrastructure/routes/testMailRoutes';
import tagRoutes from './src/backend/infrastructure/routes/tagRoutes';
import visitRoutes from './src/backend/infrastructure/routes/visitRoutes';
import { UserModel } from './src/backend/models/UserModel';
import path from 'path';
import { fileURLToPath } from 'url';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Fix for ESM: __dirname is not defined, compute from import.meta.url
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  console.log(process.env.NODE_ENV === 'production' ? '🚀 Starting in production mode' : '🚧 Starting in development mode');

  await connectDB();
  await UserModel.init();
  await ensureRolesExist();
  await createSuperAdminFromEnv();
  // ensure tags collection is populated from .env if missing
  try {
    const { ensureTagsExist } = await import('./src/backend/infrastructure/database/initTags');
    await ensureTagsExist();
  } catch (e) {
    console.warn('Could not ensure tags exist:', e);
  }

  const allowedOrigins = [
    'http://localhost:5107',
    'http://localhost:5106',
    'https://columnapublica.cl',
    'https://www.columnapublica.cl',
    'https://beta.columnapublica.cl'
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (curl, server-to-server) when origin is undefined
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    optionsSuccessStatus: 204
  }));
  
  
  // Ensure preflight OPTIONS requests return the proper headers
  app.options('*', cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.json());

  // Expose `public/` so assets placed there are reachable at /public/<file>
  app.use('/public', express.static('public'));

  // API Routes

  app.use('/api/publications', publicationRoutes);
  // preview route for social sharing (renders OG meta tags server-side)
  app.use('/', previewRoute);
  app.use('/api/auth', authRoute);
  app.use('/api/users', userRoutes);
  app.use('/api/roles', rolesRoutes);
  app.use('/api/test-mail', testMailRoute);
  app.use('/api/tags', tagRoutes);
  app.use('/api/visits', visitRoutes);

  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
