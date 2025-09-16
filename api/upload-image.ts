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
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Get image type from data URL
    const mimeMatch = imageData.match(/^data:image\/([a-z]+);base64,/);
    const imageType = mimeMatch ? mimeMatch[1] : 'jpg';
    
    // Generate unique filename similar to your PHP approach
    const originalName = filename || 'uploaded-image';
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const uniqueId = uuidv4().substring(0, 8);
    const finalFilename = `${nameWithoutExt}-${uniqueId}.${imageType}`;

    // For Vercel, we need to save to a location that can be served statically
    // Try saving to public directory which should be accessible
    let uploadsDir;
    let publicUrl;
    
    try {
      // Try to save in public directory for static serving
      uploadsDir = join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Write file to public directory
      const filePath = join(uploadsDir, finalFilename);
      writeFileSync(filePath, imageBuffer);
      
      // Generate URL that should be accessible like static files
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : req.headers.host?.includes('localhost') 
          ? `http://${req.headers.host}` 
          : `https://${req.headers.host}`;
      
      // Try static file serving first
      publicUrl = `${baseUrl}/uploads/${finalFilename}`;
      
    } catch (error) {
      console.error('Error saving to public directory:', error);
      throw error;
    }

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