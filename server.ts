import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

import publicationRoutes from './src/backend/infrastructure/routes/publicationRoutes';
import { connectDB } from './src/backend/infrastructure/database/db';
import { createSuperAdminFromEnv } from './src/backend/infrastructure/database/createSuperAdmin';
import { ensureRolesExist } from './src/backend/infrastructure/database/initRoles';
import authRoute from './src/backend/infrastructure/routes/authRoutes';
import userRoutes from './src/backend/infrastructure/routes/userRoutes';
import rolesRoutes from './src/backend/infrastructure/routes/rolesRoutes';
import { UserModel } from './src/backend/models/UserModel';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;


  await connectDB();
  await UserModel.init();
  await ensureRolesExist();
  await createSuperAdminFromEnv();

  app.use(cors({
    origin: [
      'http://localhost:5107',
      'https://columnapublica.cl'
    ],
    credentials: true
  }));
  app.use(express.json());


  // API Routes

  app.use('/api/publications', publicationRoutes);
  app.use('/api/auth', authRoute);
  app.use('/api/users', userRoutes);
  app.use('/api/roles', rolesRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: 5107 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
