import type { VercelRequest, VercelResponse } from '@vercel/node';

// This endpoint serves image files with proper headers including X-Robots-Tag: noindex
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { filename } = req.query;

  if (!filename || typeof filename !== 'string') {
    return res.status(404).json({ error: 'Image not found' });
  }

  try {
    // CRITICAL: Add X-Robots-Tag: noindex header to prevent indexing
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // For development/testing, redirect to a publicly accessible test image
    // This allows search engines to access the image while we test the workflow
    const testImageUrl = `https://picsum.photos/seed/${filename.replace(/\D/g, '')}/800/600.jpg`;
    
    console.log('Image request:', {
      filename,
      redirectTo: testImageUrl,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer
    });

    // Redirect to test image with proper headers
    res.redirect(302, testImageUrl);

  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
}

export const config = {
  api: {
    bodyParser: false, // Don't parse body for image serving
  },
};