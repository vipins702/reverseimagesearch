// server/api/reverse-search.ts
import express, { Request, Response } from 'express';
import axios from 'axios';

interface ReverseSearchRequest {
  imageUrl: string;
}

interface SearchMatch {
  source: string;
  url: string;
  score: number;
  imageUrl?: string;
  title?: string;
  publishedDate?: string;
}

interface ReverseSearchResponse {
  success: boolean;
  matches: SearchMatch[];
  totalMatches: number;
  searchDuration: number;
  message?: string;
}

// Environment variables for API keys
const TINEYE_API_KEY = process.env.TINEYE_API_KEY;
const TINEYE_PRIVATE_KEY = process.env.TINEYE_PRIVATE_KEY;
const BING_VISUAL_SEARCH_KEY = process.env.BING_VISUAL_SEARCH_KEY;
const BING_VISUAL_SEARCH_ENDPOINT = process.env.BING_VISUAL_SEARCH_ENDPOINT || 'https://api.bing.microsoft.com/v7.0/images/visualsearch';

/**
 * Call TinEye Reverse Image Search API
 * Requires TinEye API subscription and credentials
 */
async function searchTinEye(imageUrl: string): Promise<SearchMatch[]> {
  if (!TINEYE_API_KEY || !TINEYE_PRIVATE_KEY) {
    console.log('TinEye API credentials not configured');
    return [];
  }

  try {
    // TinEye API implementation
    // NOTE: Replace with actual TinEye API implementation
    const response = await axios.get('https://api.tineye.com/rest/search/', {
      params: {
        url: imageUrl,
        // Add TinEye-specific parameters here
      },
      headers: {
        // Add TinEye authentication headers here
        'User-Agent': 'Veritas Image Analyzer/1.0'
      },
      timeout: 30000
    });

    // Parse TinEye response and convert to our format
    const matches: SearchMatch[] = response.data.results?.map((result: any) => ({
      source: 'TinEye',
      url: result.backlinks?.[0]?.url || '',
      score: result.score || 0,
      imageUrl: result.image_url,
      title: result.backlinks?.[0]?.crawl_date,
      publishedDate: result.backlinks?.[0]?.crawl_date
    })) || [];

    return matches;
  } catch (error) {
    console.error('TinEye search failed:', error);
    return [];
  }
}

/**
 * Call Bing Visual Search API
 * Requires Azure Cognitive Services subscription
 */
async function searchBingVisual(imageUrl: string): Promise<SearchMatch[]> {
  if (!BING_VISUAL_SEARCH_KEY) {
    console.log('Bing Visual Search API key not configured');
    return [];
  }

  try {
    // Bing Visual Search API implementation
    const response = await axios.post(BING_VISUAL_SEARCH_ENDPOINT, {
      imageInfo: {
        url: imageUrl
      }
    }, {
      headers: {
        'Ocp-Apim-Subscription-Key': BING_VISUAL_SEARCH_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Parse Bing response and convert to our format
    const visualSearchResults = response.data.tags?.[0]?.actions?.find(
      (action: any) => action.actionType === 'VisualSearch'
    );

    const matches: SearchMatch[] = visualSearchResults?.data?.value?.map((result: any) => ({
      source: 'Bing',
      url: result.webSearchUrl || result.contentUrl,
      score: result.imageInsightsToken ? 0.8 : 0.6, // Estimated relevance
      imageUrl: result.thumbnailUrl,
      title: result.name,
      publishedDate: result.datePublished
    })) || [];

    return matches;
  } catch (error) {
    console.error('Bing Visual Search failed:', error);
    return [];
  }
}

/**
 * Generate mock reverse search results for demo purposes
 */
function generateMockResults(imageUrl: string): SearchMatch[] {
  // Return deterministic mock data for demo
  return [
    {
      source: 'TinEye',
      url: 'https://example.com/original-source',
      score: 0.95,
      imageUrl: imageUrl,
      title: 'Original Source - News Article',
      publishedDate: '2024-01-15T10:30:00Z'
    },
    {
      source: 'Google',
      url: 'https://example.com/social-media-post',
      score: 0.87,
      imageUrl: imageUrl,
      title: 'Social Media Post',
      publishedDate: '2024-01-16T14:45:00Z'
    },
    {
      source: 'Bing',
      url: 'https://example.com/blog-article',
      score: 0.82,
      imageUrl: imageUrl,
      title: 'Blog Article with Image',
      publishedDate: '2024-01-18T09:15:00Z'
    }
  ];
}

/**
 * Main reverse search endpoint
 */
export async function reverseSearchHandler(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  
  try {
    const { imageUrl }: ReverseSearchRequest = req.body;

    if (!imageUrl) {
      res.status(400).json({
        success: false,
        matches: [],
        totalMatches: 0,
        searchDuration: 0,
        message: 'Image URL is required'
      });
      return;
    }

    // Validate image URL
    try {
      new URL(imageUrl);
    } catch {
      res.status(400).json({
        success: false,
        matches: [],
        totalMatches: 0,
        searchDuration: 0,
        message: 'Invalid image URL provided'
      });
      return;
    }

    // Check if API keys are available
    const hasApiKeys = TINEYE_API_KEY || BING_VISUAL_SEARCH_KEY;

    if (!hasApiKeys) {
      // Return helpful message about API configuration
      const searchDuration = Date.now() - startTime;
      res.json({
        success: false,
        matches: [],
        totalMatches: 0,
        searchDuration,
        message: 'No reverse search API keys configured. Please configure TinEye or Bing Visual Search API keys to enable automated reverse search. You can still use the external search buttons for manual reverse search.'
      });
      return;
    }

    // Run parallel searches across configured providers
    const searchPromises: Promise<SearchMatch[]>[] = [];

    if (TINEYE_API_KEY && TINEYE_PRIVATE_KEY) {
      searchPromises.push(searchTinEye(imageUrl));
    }

    if (BING_VISUAL_SEARCH_KEY) {
      searchPromises.push(searchBingVisual(imageUrl));
    }

    // If no API keys configured, use mock data for demo
    if (searchPromises.length === 0) {
      searchPromises.push(Promise.resolve(generateMockResults(imageUrl)));
    }

    // Execute all searches in parallel
    const searchResults = await Promise.allSettled(searchPromises);
    
    // Aggregate results from all providers
    const allMatches: SearchMatch[] = [];
    searchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        allMatches.push(...result.value);
      }
    });

    // Sort by relevance score (highest first)
    allMatches.sort((a, b) => b.score - a.score);

    // Remove duplicates based on URL
    const uniqueMatches = allMatches.filter((match, index, array) => 
      array.findIndex(m => m.url === match.url) === index
    );

    const searchDuration = Date.now() - startTime;

    const response: ReverseSearchResponse = {
      success: true,
      matches: uniqueMatches,
      totalMatches: uniqueMatches.length,
      searchDuration,
      message: uniqueMatches.length === 0 ? 'No similar images found' : undefined
    };

    res.json(response);

  } catch (error) {
    console.error('Reverse search error:', error);
    const searchDuration = Date.now() - startTime;
    
    res.status(500).json({
      success: false,
      matches: [],
      totalMatches: 0,
      searchDuration,
      message: 'Reverse search service temporarily unavailable'
    });
  }
}

// Express router setup
const router = express.Router();
router.post('/reverse-search', reverseSearchHandler);

export default router;