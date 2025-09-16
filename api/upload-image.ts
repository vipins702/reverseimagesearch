import type { VercelRequest, VercelResponse } from '@vercel/node';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageData, filename } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Get image type from data URL
    const mimeMatch = imageData.match(/^data:image\/([a-z]+);base64,/);
    const imageType = mimeMatch ? mimeMatch[1] : 'jpg';
    
    // Generate unique filename similar to your PHP approach
    const originalName = filename || 'uploaded-image';
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const uniqueId = uuidv4().substring(0, 8);
    const finalFilename = `${nameWithoutExt}-${uniqueId}.${imageType}`;

    // Create uploads directory if it doesn't exist (similar to PHP target_dir)
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // Convert base64 to buffer and save file
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const filePath = join(uploadsDir, finalFilename);
    
    // Write file to filesystem (equivalent to move_uploaded_file in PHP)
    writeFileSync(filePath, imageBuffer);

    // Generate public URL (similar to your PHP $id variable)
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : req.headers.host?.includes('localhost') 
        ? `http://${req.headers.host}` 
        : `https://${req.headers.host}`;
    
    const publicUrl = `${baseUrl}/api/uploads/${finalFilename}`;

    console.log('Image uploaded successfully:', {
      filename: finalFilename,
      size: imageBuffer.length,
      publicUrl: publicUrl
    });

    // Return the public URL (like your PHP session storage)
    return res.status(200).json({
      success: true,
      publicUrl: publicUrl,
      filename: finalFilename,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to upload image',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Set reasonable file size limit
    },
  },
};