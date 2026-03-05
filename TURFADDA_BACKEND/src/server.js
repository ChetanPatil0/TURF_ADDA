import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';
import { generateSlotsForAllTurfs } from './services/autoSlotStartup.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Turfadda Backend running on port ${PORT}`);
    });
     await generateSlotsForAllTurfs(30);

  } catch (error) {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  }
};

startServer();