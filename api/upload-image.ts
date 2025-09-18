import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
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
    console.log('Upload API called with method:', req.method);
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Environment check - BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);
    
    const { imageData, filename } = req.body;

    if (!imageData) {
      console.log('No image data provided in request body');
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

    console.log('Preparing upload:', {
      originalName,
      finalFilename,
      imageType,
      bufferSize: imageBuffer.length
    });

    // Upload to Vercel Blob storage (this provides real public URLs)
    console.log('Calling Vercel Blob put() function...');
    
    // Check if we have the required environment variable
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN environment variable is not set');
      
      // For local development, create a mock public URL for testing
      if (process.env.NODE_ENV === 'development' || req.headers.host?.includes('localhost')) {
        console.log('Development mode: Creating mock public URL for testing');
        const mockUrl = `https://veritas-image-analyzer.vercel.app/api/test-urls?filename=${finalFilename}`;
        
        return res.status(200).json({
          success: true,
          publicUrl: mockUrl,
          downloadUrl: mockUrl,
          filename: finalFilename,
          message: 'Development mode: Mock URL created. Configure BLOB_READ_WRITE_TOKEN for production.',
          isDevelopment: true
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Blob storage not configured',
        message: 'BLOB_READ_WRITE_TOKEN environment variable is required. Please configure it in Vercel dashboard under Environment Variables.'
      });
    }
    
    const blob = await put(finalFilename, imageBuffer, {
      access: 'public',
      contentType: `image/${imageType}`,
    });
    console.log('Blob upload completed:', blob);

    // The blob.url is a real public URL that external services can access
    const publicUrl = blob.url;

    console.log('Image uploaded successfully to Vercel Blob:', {
      filename: finalFilename,
      size: imageBuffer.length,
      publicUrl: publicUrl,
      downloadUrl: blob.downloadUrl
    });

    // Return the public URL (like your PHP session storage)
    return res.status(200).json({
      success: true,
      publicUrl: publicUrl,
      downloadUrl: blob.downloadUrl,
      filename: finalFilename,
      message: 'Image uploaded successfully to cloud storage'
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