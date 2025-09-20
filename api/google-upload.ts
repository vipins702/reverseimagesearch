import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    const { imageData, provider = 'google' } = req.body;

    if (!imageData) {
      return res.status(400).json({ 
        success: false,
        error: 'No image data provided' 
      });
    }

    console.log('Google upload request received:', {
      provider,
      imageDataLength: imageData.length,
      hasDataUrl: imageData.startsWith('data:')
    });

    // Analysis of labnol.org approach:
    // They upload images to Google and get vsrid URLs like:
    // https://www.google.com/search?vsrid=CNKItZWStN-86QEQAhgBIiQ5YzkyNzcyNi1kNGMxLTQ1MjgtOWVkMC00Mjc1ZTg2ODZjZGIyBiICc2woGTiaoq2Vj-ePAw&udm=26
    
    // However, Google's upload endpoints require complex authentication and session handling
    // that's difficult to replicate in a serverless environment
    
    // For now, we'll implement a hybrid approach:
    // 1. Try to generate Google Lens URLs that accept direct uploads
    // 2. Provide fallback to manual upload with proper instructions

    if (provider === 'google_lens') {
      // Google Lens has a more reliable URL structure for direct access
      const lensUrl = 'https://lens.google.com/';
      
      return res.status(200).json({
        success: true,
        searchUrl: lensUrl,
        uploadMethod: 'lens_manual',
        instructions: {
          title: 'Google Lens Upload',
          steps: [
            'The image will be downloaded automatically',
            'Google Lens will open in a new tab',
            'Drag and drop or click to upload the downloaded image',
            'View your visual search results with vsrid parameters'
          ]
        },
        message: 'Google Lens upload requires manual step due to CORS restrictions'
      });
    } else {
      // For Google Images, use the searchbyimage endpoint
      const imagesUrl = 'https://www.google.com/imghp';
      
      return res.status(200).json({
        success: true,
        searchUrl: imagesUrl,
        uploadMethod: 'images_manual',
        instructions: {
          title: 'Google Images Upload',
          steps: [
            'The image will be downloaded automatically',
            'Google Images will open in a new tab',
            'Click the camera icon in the search bar',
            'Upload the downloaded image to get vsrid results'
          ]
        },
        message: 'Google Images upload requires manual step for vsrid generation'
      });
    }

  } catch (error) {
    console.error('Google upload processing error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process Google upload request',
      message: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        errorType: error instanceof Error ? error.constructor.name : typeof error
      }
    });
  }
}