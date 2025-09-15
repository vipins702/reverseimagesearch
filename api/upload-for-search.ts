import type { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Configure multer for memory storage (Vercel doesn't support disk storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Use multer with promise wrapper
    await new Promise<void>((resolve, reject) => {
      upload.single('image')(req as any, res as any, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Generate unique filename
    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    
    // For Vercel, we'll need to use a different approach since we can't save files
    // We'll convert the file to base64 and return it as a data URL
    const base64Data = file.buffer.toString('base64');
    const mimeType = file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // In a real deployment, you'd upload to a cloud storage service like AWS S3, Cloudinary, etc.
    // For now, we'll return the data URL which can be used immediately
    const publicUrl = dataUrl;

    res.status(200).json({
      success: true,
      filename: filename,
      publicUrl: publicUrl,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}