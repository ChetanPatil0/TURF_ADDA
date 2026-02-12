
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './features/auth/auth.routes.js'; 
const app = express();


app.use(helmet());                 
app.use(cors({ origin: '*' }));     
app.use(express.json());            
app.use(morgan('dev'));          

app.use('/api/auth', authRoutes);  

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