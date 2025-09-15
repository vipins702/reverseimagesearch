// src/types/index.d.ts

declare module "{APP_NAME}" {
  export interface ImageUploadResponse {
    success: boolean;
    message: string;
    data?: {
      imageUrl: string;
      confidenceScore: number;
      metadata: Record<string, any>;
    };
  }

  export interface DetectionResult {
    reverseSearch: {
      results: Array<{
        source: string;
        url: string;
        confidence: number;
      }>;
    };
    forensics: {
      cloneDetected: boolean;
      metadata: Record<string, any>;
    };
    aiDetection: {
      score: number;
      verdict: string;
    };
  }

  export interface ApiError {
    status: number;
    message: string;
  }
}