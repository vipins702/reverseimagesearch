import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import detectRoutes from './api/detect.js';
import reverseSearchRoutes from './api/reverse-search.js';
import uploadRoutes from './routes/upload.js';

const app = express();
const PORT = process.env.PORT || 3001;
const MAX_UPLOAD_SIZE_BYTES = process.env.MAX_UPLOAD_SIZE_BYTES ? Number(process.env.MAX_UPLOAD_SIZE_BYTES) : 10 * 1024 * 1024;

// Middleware
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
// Keep JSON limits in sync with MAX_UPLOAD_SIZE_BYTES (approx)
const jsonLimit = Math.max(1, Math.floor(MAX_UPLOAD_SIZE_BYTES / (1024 * 1024))) + 'mb';
app.use(express.json({ limit: jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: jsonLimit }));

// Serve static files from uploads directory with hardened options
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  dotfiles: 'deny',
  index: false,
  setHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
}));

// API Routes
app.use('/api', detectRoutes);
app.use('/api', reverseSearchRoutes);
app.use('/api', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Veritas Image Analyzer API',
    endpoints: [
      'POST /api/detect - Analyze image authenticity',
      'POST /api/reverse-search - Reverse image search',
      'POST /api/upload-for-search - Upload image for external search',
      'GET /health - Server health check'
    ]
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', error);
  
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ 
      error: 'Request entity too large',
      message: 'Image file size exceeds 10MB limit' 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Veritas Image Analyzer API running at http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app;