import express from 'express';
import cors from './middleware/cors';
import healthRoutes from './routes/health';
import imageRoutes from './routes/images';
import reportRoutes from './routes/reports';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/reports', reportRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});