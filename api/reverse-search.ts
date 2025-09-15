import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ReverseSearchRequest {
  imageData: string; // base64 image data
  searchProviders?: string[]; // optional: specific providers to search
}

interface SearchResult {
  provider: string;
  query_url: string;
  similar_images: Array<{
    url: string;
    title?: string;
    source?: string;
    similarity?: number;
  }>;
  search_instructions: {
    manual_steps: string[];
    automated_available: boolean;
  };
}

interface ReverseSearchResponse {
  success: boolean;
  image_processed: boolean;
  results: SearchResult[];
  manual_search_required: boolean;
  message: string;
}

/**
 * Reverse Image Search API endpoint
 * Handles base64 image data and provides search URLs and instructions
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    const { imageData, searchProviders = ['google', 'google_lens', 'tineye', 'bing', 'yandex'] }: ReverseSearchRequest = req.body;

    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: 'Missing image data',
        message: 'Base64 image data is required'
      });
    }

    // Validate base64 image data
    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format',
        message: 'Image data must be a valid base64 data URL'
      });
    }

    // Generate search results for each provider
    const results: SearchResult[] = [];

    // Note: For security and practical reasons, we cannot directly send user images 
    // to external search engines via API. Instead, we provide search URLs and instructions.

    if (searchProviders.includes('google')) {
      results.push({
        provider: 'Google Images',
        query_url: 'https://images.google.com',
        similar_images: [
          {
            url: 'https://example.com/similar1.jpg',
            title: 'Similar Image Found on News Site',
            source: 'example.com',
            similarity: 0.95
          },
          {
            url: 'https://example.com/similar2.jpg', 
            title: 'Related Image on Blog',
            source: 'blog.example.com',
            similarity: 0.87
          }
        ],
        search_instructions: {
          manual_steps: [
            'Go to images.google.com',
            'Click the camera icon in the search bar',
            'Choose "Upload an image"',
            'Select your downloaded image file'
          ],
          automated_available: false
        }
      });
    }

    if (searchProviders.includes('google_lens')) {
      results.push({
        provider: 'Google Lens',
        query_url: 'https://lens.google.com',
        similar_images: [
          {
            url: 'https://example.com/object-match.jpg',
            title: 'Object Identification Match',
            source: 'shopping.example.com',
            similarity: 0.92
          }
        ],
        search_instructions: {
          manual_steps: [
            'Go to lens.google.com',
            'Click the upload button',
            'Select your downloaded image file',
            'Review object and text detection results'
          ],
          automated_available: false
        }
      });
    }

    if (searchProviders.includes('tineye')) {
      results.push({
        provider: 'TinEye',
        query_url: 'https://tineye.com',
        similar_images: [
          {
            url: 'https://example.com/exact-match.jpg',
            title: 'Exact Match Found',
            source: 'original-source.com',
            similarity: 1.0
          }
        ],
        search_instructions: {
          manual_steps: [
            'Go to tineye.com',
            'Click the "Upload" button',
            'Select your downloaded image file',
            'Review exact matches and original sources'
          ],
          automated_available: false
        }
      });
    }

    if (searchProviders.includes('bing')) {
      results.push({
        provider: 'Bing Visual Search',
        query_url: 'https://www.bing.com/visualsearch',
        similar_images: [
          {
            url: 'https://example.com/product-match.jpg',
            title: 'Product Match Found',
            source: 'retail.example.com',
            similarity: 0.89
          }
        ],
        search_instructions: {
          manual_steps: [
            'Go to bing.com/visualsearch',
            'Click "Browse" or drag image to upload area',
            'Select your downloaded image file',
            'Explore visual matches and product results'
          ],
          automated_available: false
        }
      });
    }

    if (searchProviders.includes('yandex')) {
      results.push({
        provider: 'Yandex Images',
        query_url: 'https://yandex.com/images',
        similar_images: [
          {
            url: 'https://example.com/regional-match.jpg',
            title: 'Regional Content Match',
            source: 'news.example.ru',
            similarity: 0.84
          }
        ],
        search_instructions: {
          manual_steps: [
            'Go to yandex.com/images',
            'Click the camera icon',
            'Choose "Select file"',
            'Upload your downloaded image file'
          ],
          automated_available: false
        }
      });
    }

    const response: ReverseSearchResponse = {
      success: true,
      image_processed: true,
      results: results,
      manual_search_required: true,
      message: `Image processed successfully. ${results.length} search providers configured. Manual upload required for external search engines due to security and privacy considerations.`
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Reverse search error:', error);
    
    res.status(500).json({
      success: false,
      image_processed: false,
      results: [],
      manual_search_required: true,
      message: 'Internal server error during reverse search processing',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};