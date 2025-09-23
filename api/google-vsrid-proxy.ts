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

    let imageBuffer: Buffer;

    // Handle both data URLs and public URLs
    if (imageData.startsWith('data:')) {
      // Remove data URL prefix and convert to buffer
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
      console.log('Processing data URL (base64)');
    } else if (imageData.startsWith('http')) {
      // Fetch the image from the public URL
      console.log('Processing public URL:', imageData);
      const imageResponse = await fetch(imageData);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
      }
      const arrayBuffer = await imageResponse.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      console.log('Downloaded image from URL, size:', imageBuffer.length);
    } else {
      throw new Error('Invalid image data format. Expected data URL or public URL.');
    }

    // Create FormData for Google's endpoint with parameters to get full vsrid URL
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
    formData.append('lns_vfs', 'e'); // Changed from 'd' to 'e' to get full URL
    formData.append('vsrp', '1'); // Additional parameter for full results
    formData.append('sbisrc', '1'); // Source indicator

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
      console.log('Got initial redirect URL from Google:', location);
      
      // If we got a tbs=sbi URL, try to get the full vsrid URL
      if (location.includes('tbs=sbi:')) {
        console.log('Got tbs=sbi URL, attempting to get full vsrid URL...');
        
        try {
          // Follow the redirect to get the full vsrid URL
          const followResponse = await fetch(location, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Referer': 'https://www.google.com/',
            },
            redirect: 'manual'
          });
          
          const secondLocation = followResponse.headers.get('location');
          
          if (secondLocation && secondLocation.includes('vsrid=')) {
            console.log('SUCCESS: Got full vsrid URL:', secondLocation);
            return res.status(200).json({ 
              success: true, 
              fullUrl: secondLocation,
              intermediateUrl: location 
            });
          } else if (followResponse.status === 200) {
            // Check if the page contains a redirect URL in the content
            const html = await followResponse.text();
            const vsridMatch = html.match(/(?:url=|href=)"([^"]*vsrid=[^"]*)/);
            
            if (vsridMatch) {
              const vsridUrl = decodeURIComponent(vsridMatch[1]);
              console.log('SUCCESS: Extracted vsrid URL from HTML:', vsridUrl);
              return res.status(200).json({ 
                success: true, 
                fullUrl: vsridUrl,
                extractedFromHtml: true 
              });
            }
          }
        } catch (followError) {
          console.log('Failed to follow redirect, returning original URL:', followError);
        }
      }
      
      // Return the URL we got (either vsrid or tbs=sbi)
      console.log('Returning URL:', location);
      return res.status(200).json({ 
        success: true, 
        fullUrl: location,
        type: location.includes('vsrid=') ? 'vsrid' : location.includes('tbs=sbi:') ? 'tbs_sbi' : 'unknown'
      });
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
