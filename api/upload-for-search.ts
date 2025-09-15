import type { VercelRequest, VercelResponse } from '@vercel/node';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Configure multer for memory storage (Vercel doesn't support local disk storage)
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

// Helper function to handle base64 uploads
async function handleBase64Upload(base64Data: string, filename: string) {
  // Extract base64 data (remove data:image/...;base64, prefix)
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 data format');
  }

  const mimeType = matches[1];
  const buffer = Buffer.from(matches[2], 'base64');

  // TODO: In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
  // For now, we'll return instructions for manual search
  return {
    filename,
    mimeType,
    size: buffer.length,
    requiresManualUpload: true,
    buffer: buffer.toString('base64'), // Return for client-side handling
  };
}

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
    const contentType = req.headers['content-type'] || '';

    // Handle base64 JSON uploads
    if (contentType.includes('application/json')) {
      const { imageData, filename } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ error: 'No image data provided' });
      }

      const generatedFilename = filename || `${uuidv4()}.jpg`;
      const result = await handleBase64Upload(imageData, generatedFilename);

      return res.status(200).json({
        success: true,
        filename: result.filename,
        requiresManualUpload: result.requiresManualUpload,
        originalName: generatedFilename,
        size: result.size,
        mimeType: result.mimeType,
        searchInstructions: {
          message: "Image uploaded successfully. Since this is a base64 image, you'll need to use manual search instructions.",
          providers: [
            {
              name: 'Google Images',
              url: 'https://images.google.com',
              instructions: '1. Go to images.google.com\n2. Click the camera icon\n3. Upload the downloaded image file'
            },
            {
              name: 'Google Lens',
              url: 'https://lens.google.com',
              instructions: '1. Go to lens.google.com\n2. Click the upload button\n3. Select your downloaded image'
            },
            {
              name: 'TinEye',
              url: 'https://tineye.com',
              instructions: '1. Go to tineye.com\n2. Click "Upload" tab\n3. Select your downloaded image'
            }
          ]
        }
      });
    }

    // Handle multipart form uploads
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
    
    // TODO: In production, upload to cloud storage and return public URL
    // For demo purposes, we'll indicate that manual upload is required
    res.status(200).json({
      success: true,
      filename: filename,
      requiresManualUpload: true,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      searchInstructions: {
        message: "File uploaded successfully. For external search engines, please download the image and upload manually to each search provider.",
        downloadUrl: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        providers: [
          {
            name: 'Google Images',
            url: 'https://images.google.com',
            instructions: '1. Download the image using the download button\n2. Go to images.google.com\n3. Click the camera icon\n4. Upload the downloaded file'
          },
          {
            name: 'Google Lens',
            url: 'https://lens.google.com',
            instructions: '1. Download the image using the download button\n2. Go to lens.google.com\n3. Click the upload button\n4. Select your downloaded image'
          },
          {
            name: 'TinEye',
            url: 'https://tineye.com',
            instructions: '1. Download the image using the download button\n2. Go to tineye.com\n3. Click "Upload" tab\n4. Select your downloaded image'
          }
        ]
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Configure API route to handle large payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}