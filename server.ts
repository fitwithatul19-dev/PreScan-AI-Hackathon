import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/auth.routes';
import onboardingRoutes from './server/routes/onboarding.routes';
import userRoutes from './server/routes/user.routes';
import workspaceRoutes from './server/routes/workspace.routes';
import invitationRoutes from './server/routes/invitation.routes';
import scanRoutes from './server/routes/scan.routes';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // API Routes FIRST
  app.use('/api/auth', authRoutes);
  app.use('/api/onboarding', onboardingRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/workspaces', workspaceRoutes);
  app.use('/api/invitations', invitationRoutes);
  app.use('/api/scans', scanRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'PreScan Core API',
      timestamp: new Date().toISOString(),
    });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PreScan Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start PreScan server:', err);
  process.exit(1);
});
