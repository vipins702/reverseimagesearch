export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
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
    const { imageData, provider } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    console.log('Received upload request for provider:', provider);

    // For now, return the appropriate Google URLs for manual upload
    // This is a fallback since direct upload to Google is complex due to CORS and auth
    
    const googleImagesUrl = 'https://images.google.com/searchbyimage?image_url=';
    const googleLensUrl = 'https://lens.google.com/uploadbyurl/search?img_url=';
    
    if (provider === 'google_lens') {
      return res.status(200).json({
        success: true,
        searchUrl: googleLensUrl,
        requiresManualUpload: true,
        message: 'Please use the manual upload process for Google Lens'
      });
    } else {
      return res.status(200).json({
        success: true,
        searchUrl: googleImagesUrl,
        requiresManualUpload: true,
        message: 'Please use the manual upload process for Google Images'
      });
    }

  } catch (error) {
    console.error('Google upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process upload request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}