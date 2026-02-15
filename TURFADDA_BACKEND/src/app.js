
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './features/auth/auth.routes.js'; 
import turfRoutes from './features/turf/turf.route.js';
const app = express();


app.use(helmet());                 
app.use(cors({ origin: '*' }));     
app.use(express.json());            
app.use(morgan('dev'));          

app.use('/api/auth', authRoutes);  
app.use('/api/turf', turfRoutes); 

// Test check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Turfadda Backend!',
    status: 'running',
  });
});

// Catch-all 404 route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler (last middleware)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
  });
});

export default app;