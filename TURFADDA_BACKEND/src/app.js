import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

import authRoutes from './features/auth/auth.routes.js';
import turfRoutes from './features/turf/turf.route.js';
import dashboardRoutes from './features/common/dashboard.route.js';

const app = express();

const createUploadFolders = () => {
  const baseDir = path.join(process.cwd(), 'uploads');
  const folders = [
    path.join(baseDir, 'users', 'profiles'),
    path.join(baseDir, 'turfs', 'images'),
    path.join(baseDir, 'turfs', 'videos'),
    path.join(baseDir, 'turfs', 'covers'),
  ];

  folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  });
};

createUploadFolders();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/turf', turfRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Turfadda Backend!',
    status: 'running',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);

  const status = err.status || 500;
  const message = err.message || 'Something went wrong on the server';

  res.status(status).json({
    success: false,
    message,
  });
});

export default app;