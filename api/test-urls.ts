import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for cross-origin requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { filename } = req.query;
  
  // For development testing, redirect to a publicly accessible test image
  // This allows testing reverse search functionality without Blob storage
  if (filename) {
    console.log('Test URL accessed for filename:', filename);
    
    // Use a publicly accessible test image from Lorem Picsum
    const testImageUrl = 'https://picsum.photos/seed/veritas/800/600';
    
    // Log for debugging
    console.log('Redirecting to test image:', testImageUrl);
    
    // Redirect to the test image
    res.redirect(302, testImageUrl);
    return;
  }
  
  // If no filename, return debug info
  const testImageUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/test-urls?filename=test-image.jpg`;
  
  return res.status(200).json({
    message: 'URL Testing Endpoint - Use ?filename=your-image.jpg to get a test image',
    host: req.headers.host,
    protocol: req.headers['x-forwarded-proto'] || 'https',
    fullUrl: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`,
    testImageUrl: testImageUrl,
    sampleGoogleUrl: `https://images.google.com/searchbyimage?image_url=${encodeURIComponent(testImageUrl)}`,
    note: 'This endpoint provides fallback test images for development when Blob storage is not configured',
    headers: {
      host: req.headers.host,
      'x-forwarded-proto': req.headers['x-forwarded-proto'],
      'user-agent': req.headers['user-agent']
    }
  });
}