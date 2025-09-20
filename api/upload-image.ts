import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import sharp from 'sharp';
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
      return res.status(400).json({ 
        success: false,
        error: 'No image data provided',
        debug: 'Request body must contain imageData field'
      });
    }

    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Convert base64 to buffer
    let imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Get image type from data URL
    const mimeMatch = imageData.match(/^data:image\/([a-z]+);base64,/);
    const originalType = mimeMatch ? mimeMatch[1] : 'jpg';
    
    console.log('Original image info:', {
      originalType,
      originalSize: imageBuffer.length,
      sizeKB: Math.round(imageBuffer.length / 1024)
    });

    // CRITICAL: Process image with Sharp - auto-orient, resize, compress
    // Note: Sharp does not include EXIF unless withMetadata() is used, so metadata is stripped by default.
    try {
      const processedImage = await sharp(imageBuffer)
        .rotate() // auto-orient based on EXIF then strip metadata by default
        .resize(1600, 1600, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 80,
          progressive: true,
          mozjpeg: true
        })
        .toBuffer();

      // Normalize to a standard Node Buffer type for TS compatibility
      imageBuffer = Buffer.from(processedImage);

      console.log('Image processed:', {
        newSize: imageBuffer.length,
        newSizeKB: Math.round(imageBuffer.length / 1024),
        compressionRatio: Math.round((1 - imageBuffer.length / Buffer.from(base64Data, 'base64').length) * 100)
      });
    } catch (sharpError) {
      // Do not fail the request—fall back to original buffer so the flow keeps working
      console.error('Image processing failed, continuing with original buffer:', sharpError);
    }
    
    // CRITICAL: Use unique sanitized filename (timestamp + hash + extension)
    const timestamp = Date.now();
    const uniqueHash = uuidv4().substring(0, 8);
    const finalFilename = `img_${timestamp}_${uniqueHash}.jpg`; // Always JPEG after processing

    console.log('Preparing upload:', {
      finalFilename,
      bufferSize: imageBuffer.length,
      contentType: 'image/jpeg'
    });

    // Upload to Vercel Blob storage (this provides real public URLs)
    console.log('Calling Vercel Blob put() function...');
    
    // Check if we have the required environment variable
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN environment variable is not set');
      
      // REAL APPROACH: Save to server filesystem like PHP move_uploaded_file
      console.log('Saving to server filesystem (like PHP approach)');
      
      // On Vercel, we need to use /tmp directory for temporary files
      const fs = require('fs');
      const path = require('path');
      
      // Create the file in /tmp (only place writable on Vercel)
      const tempDir = '/tmp';
      const filePath = path.join(tempDir, finalFilename);
      
      try {
        // Write the processed image buffer to file
        fs.writeFileSync(filePath, imageBuffer);
        console.log('File saved to:', filePath);
        
        // Return error - we need proper storage for production
        return res.status(500).json({
          success: false,
          error: 'Storage not configured',
          message: 'BLOB_READ_WRITE_TOKEN required for production deployment. Files cannot be served from Vercel /tmp directory.',
          solution: 'Please set BLOB_READ_WRITE_TOKEN in Vercel environment variables',
          debug: {
            savedToTemp: filePath,
            note: 'File saved but not publicly accessible'
          }
        });
      } catch (error) {
        console.error('Failed to save file:', error);
        return res.status(500).json({
          success: false,
          error: 'File save failed',
          message: 'Could not save uploaded file'
        });
      }
    }
    
    // Upload to Vercel Blob with proper headers
    const blob = await put(finalFilename, imageBuffer, {
      access: 'public',
      contentType: 'image/jpeg',
      cacheControlMaxAge: 3600, // 1 hour cache
    });
    
    console.log('Blob upload completed:', {
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      size: imageBuffer.length
    });

    // The blob.url is a real public URL that external services can access
  const publicUrl = blob.url;

    console.log('Image uploaded successfully to Vercel Blob:', {
      filename: finalFilename,
      size: imageBuffer.length,
      publicUrl: publicUrl
    });

    // Return the public URL (like your PHP session storage)
    return res.status(200).json({
      success: true,
      publicUrl: publicUrl,
      imageUrl: publicUrl,
      downloadUrl: blob.downloadUrl,
      filename: finalFilename,
      message: 'Image uploaded and processed successfully',
      debug: {
        originalSize: Buffer.from(base64Data, 'base64').length,
        processedSize: imageBuffer.length,
        compressionRatio: Math.round((1 - imageBuffer.length / Buffer.from(base64Data, 'base64').length) * 100)
      }
    });

  } catch (error) {
    console.error('Upload error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to upload image',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      debug: {
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        timestamp: new Date().toISOString()
      }
    });
  }
}