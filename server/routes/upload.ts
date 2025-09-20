import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import { fileTypeFromBuffer } from 'file-type';
import rateLimit from 'express-rate-limit';

const router = Router();

// Configure multer for in-memory processing first
const MAX_UPLOAD_SIZE_BYTES = process.env.MAX_UPLOAD_SIZE_BYTES ? Number(process.env.MAX_UPLOAD_SIZE_BYTES) : 10 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE_BYTES }
});

// Basic rate limiter for upload endpoint
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // 60 uploads per IP per window
  standardHeaders: true,
  legacyHeaders: false
});

// Upload image for reverse search
router.post('/upload-for-search', uploadLimiter, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }

    const buffer = req.file.buffer;
    const sniff = await fileTypeFromBuffer(buffer);
    const allowedMimes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    const detectedMime = sniff?.mime || req.file.mimetype || 'application/octet-stream';

    if (!allowedMimes.has(detectedMime)) {
      return res.status(400).json({ success: false, error: 'File type not allowed' });
    }

    // Prepare uploads directory
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Derive extension from sniffed type (fallback to mime-types)
    const extFromSniff = sniff?.ext ? `.${sniff.ext}` : (mime.extension(detectedMime) ? `.${mime.extension(detectedMime)}` : '.jpg');
    const filename = `${Date.now()}-${uuidv4().slice(0, 8)}${extFromSniff}`;
    const filePath = path.join(uploadDir, filename);

    // Write file securely to disk
    fs.writeFileSync(filePath, buffer, { encoding: 'binary', mode: 0o644 });

    // Build public URL
    const protocol = req.protocol;
    const host = req.get('host');
    const publicUrl = `${protocol}://${host}/uploads/${filename}`;

    // Schedule file deletion after 1 hour
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Temporary file deleted: ${filePath}`);
      }
    }, 60 * 60 * 1000);

    res.json({
      success: true,
      publicUrl,
      imageUrl: publicUrl,
      filename,
      size: buffer.length,
      mime: detectedMime,
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload image' });
  }
});

// Serve uploaded files
router.get('/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'uploads', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Set appropriate headers
  const detectedMime = (mime.lookup(filePath) || 'application/octet-stream') as string;
  res.setHeader('Content-Type', detectedMime);
  res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Send file
  res.sendFile(filePath);
});

export default router;