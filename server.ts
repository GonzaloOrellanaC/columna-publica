import express from 'express';
import { createServer as createViteServer } from 'vite';
import publicationRoutes from './src/backend/infrastructure/routes/publicationRoutes';

/*
// --- Descomentar para conectar a MongoDB ---
import { connectDB } from './src/backend/infrastructure/database/db';
*/

async function startServer() {
  const app = express();
  const PORT = 3000;

  /*
  // --- Descomentar para conectar a MongoDB ---
  await connectDB();
  */

  app.use(express.json());

  // API Routes
  app.use('/api/publications', publicationRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
