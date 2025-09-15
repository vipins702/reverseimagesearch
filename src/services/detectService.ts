// src/services/detectService.ts
import axios, { AxiosResponse } from 'axios';

export interface AnalysisResult {
  confidence: number;
  modelScore: number;
  reverseMatches: Array<{
    source: string;
    url: string;
    score: number;
  }>;
  forensic: {
    elaImageUrl: string;
    clones: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
    }>;
    metadata: Record<string, any>;
  };
  provenance: {
    synthIdDetected: boolean;
    provenanceDetails?: string;
  };
}

export interface ReverseSearchResult {
  success: boolean;
  matches: Array<{
    source: string;
    url: string;
    score: number;
    imageUrl?: string;
    title?: string;
    publishedDate?: string;
  }>;
  totalMatches: number;
  searchDuration: number;
  message?: string;
}

class DetectService {
  private readonly baseUrl: string;

  constructor() {
    // Use environment variable or default to current origin for API calls
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  }

  /**
   * Upload and analyze an image for authenticity
   * Supports both File objects and image URLs
   */
  async detectImage(imageInput: File | string): Promise<AnalysisResult> {
    try {
      let response: AxiosResponse<AnalysisResult>;

      if (typeof imageInput === 'string') {
        // Handle image URL
        response = await axios.post(`${this.baseUrl}/api/detect`, {
          imageUrl: imageInput
        }, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        });
      } else {
        // Handle file upload
        const formData = new FormData();
        formData.append('image', imageInput);

        response = await axios.post(`${this.baseUrl}/api/detect`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 30000, // 30 second timeout
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`Upload progress: ${percentCompleted}%`);
            }
          }
        });
      }

      return response.data;
    } catch (error) {
      console.error('Image detection failed:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 413) {
          throw new Error('Image file too large. Please use an image under 10MB.');
        }
        if (error.response?.status === 415) {
          throw new Error('Unsupported file type. Please use JPG, PNG, or WebP.');
        }
        if (error.response?.status === 429) {
          throw new Error('Too many requests. Please wait before trying again.');
        }
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. The analysis is taking too long.');
        }
      }
      
      throw new Error('Analysis service unavailable. Please try again later.');
    }
  }

  /**
   * Run reverse image search using configured API providers
   */
  async reverseSearch(imageUrl: string): Promise<ReverseSearchResult> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/reverse-search`, {
        imageUrl
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 45000 // 45 second timeout for reverse search
      });

      return response.data;
    } catch (error) {
      console.error('Reverse search failed:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('API keys not configured. Please configure reverse search API keys in settings.');
        }
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before trying again.');
        }
      }
      
      throw new Error('Reverse search service unavailable. Please try again later.');
    }
  }

  /**
   * Generate external search URLs for manual reverse search
   */
  generateExternalSearchUrls(imageUrl: string) {
    const encodedUrl = encodeURIComponent(imageUrl);
    
    return {
      googleLens: `https://lens.google.com/uploadbyurl?url=${encodedUrl}`,
      tineye: `https://tineye.com/search?url=${encodedUrl}`,
      bingVisual: `https://www.bing.com/visualsearch?q=imgurl:${encodedUrl}`,
      yandex: `https://yandex.com/images/search?rpt=imageview&url=${encodedUrl}`
    };
  }

  /**
   * Check if the provided image input is valid
   */
  validateImageInput(imageInput: File | string): { valid: boolean; error?: string } {
    if (typeof imageInput === 'string') {
      // Validate URL
      try {
        new URL(imageInput);
        return { valid: true };
      } catch {
        return { 
          valid: false, 
          error: 'Invalid image URL provided' 
        };
      }
    } else {
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(imageInput.type)) {
        return { 
          valid: false, 
          error: 'Please upload a JPG, PNG, or WebP image' 
        };
      }

      if (imageInput.size > maxSize) {
        return { 
          valid: false, 
          error: 'Image must be under 10MB' 
        };
      }

      return { valid: true };
    }
  }

  /**
   * Get upload progress for file uploads
   * This is a placeholder for implementing upload progress tracking
   */
  getUploadProgress(): number {
    // Implementation would depend on your upload progress tracking mechanism
    return 0;
  }
}

// Export singleton instance
export const detectService = new DetectService();

// Export helper functions
export const createImageUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export default detectService;