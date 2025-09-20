import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
import FormData from 'form-data';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for client-side access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageData } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Remove data URL prefix and convert to buffer
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Create FormData for Google's endpoint
    const formData = new FormData();
    formData.append('encoded_image', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });
    formData.append('hl', 'en');
    formData.append('udm', '26');
    formData.append('lns_mode', 'un');
    formData.append('source', 'lns.web.ukn');
    formData.append('lns_surface', '26');
    formData.append('lns_vfs', 'd');

    console.log('Proxying image upload to Google...');

    // Make the server-to-server request to Google
    const googleResponse = await fetch('https://www.google.com/searchbyimage/upload', {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'manual', // CRITICAL: Do not follow redirect, just get the URL
    });

    // The full URL is in the 'location' header of the 302 redirect response
    const location = googleResponse.headers.get('location');

    if (googleResponse.status >= 300 && googleResponse.status < 400 && location) {
      console.log('SUCCESS: Got full redirect URL from Google:', location);
      // Return the complete URL to the client
      return res.status(200).json({ success: true, fullUrl: location });
    } else {
      console.error('Google proxy failed. Status:', googleResponse.status);
      const text = await googleResponse.text();
      console.error('Google proxy response:', text);
      throw new Error(`Google did not return a valid redirect. Status: ${googleResponse.status}`);
    }
  } catch (error) {
    console.error('Google VSRID proxy error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Google search URL',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
