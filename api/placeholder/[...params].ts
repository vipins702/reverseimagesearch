import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { width = '300', height = '200', text = 'Placeholder' } = req.query;
  
  // Set headers for SVG response
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  
  // Create a simple SVG placeholder
  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f3f4f6"/>
  <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)" fill="none" stroke="#d1d5db" stroke-width="2" stroke-dasharray="5,5"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#6b7280" text-anchor="middle" dominant-baseline="central">
    ${text} (${width}×${height})
  </text>
  <circle cx="50%" cy="40%" r="20" fill="#e5e7eb"/>
  <path d="M${Number(width)/2 - 10},${Number(height)*0.4 - 5} L${Number(width)/2},${Number(height)*0.4 - 15} L${Number(width)/2 + 10},${Number(height)*0.4 - 5} Z" fill="#9ca3af"/>
</svg>`.trim();

  res.status(200).send(svg);
}