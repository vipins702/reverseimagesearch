import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Test endpoint to check what URLs we're generating
  const testImageUrl = `${req.headers.host}/api/uploads/test-image.jpg`;
  
  return res.status(200).json({
    message: 'URL Testing Endpoint',
    host: req.headers.host,
    protocol: req.headers['x-forwarded-proto'] || 'http',
    fullUrl: `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`,
    testImageUrl: testImageUrl,
    sampleGoogleUrl: `https://images.google.com/searchbyimage?image_url=${encodeURIComponent(testImageUrl)}`,
    headers: {
      host: req.headers.host,
      'x-forwarded-proto': req.headers['x-forwarded-proto'],
      'user-agent': req.headers['user-agent']
    }
  });
}