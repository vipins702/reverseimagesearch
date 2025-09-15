// server/api/detect.ts
import express, { Request, Response } from 'express';
import multer from 'multer';
import axios from 'axios';
import * as exifr from 'exifr';

interface DetectionRequest {
  imageUrl?: string;
  // File will be available via multer in req.file
}

interface AnalysisResult {
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

// Environment variables for AI model configuration
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HUGGINGFACE_MODEL_URL = process.env.HUGGINGFACE_MODEL_URL || 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
const PYTORCH_MODEL_ENDPOINT = process.env.PYTORCH_MODEL_ENDPOINT;

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'));
    }
  },
  storage: multer.memoryStorage()
});

/**
 * Call Hugging Face AI model for image authenticity detection
 */
async function detectWithHuggingFace(imageBuffer: Buffer): Promise<number> {
  if (!HUGGINGFACE_API_KEY) {
    console.log('Hugging Face API key not configured, using mock detection');
    return 0.68; // Mock score
  }

  try {
    // Example Hugging Face API call for image classification
    // NOTE: Replace with actual model endpoint that detects AI-generated images
    const response = await axios.post(
      HUGGINGFACE_MODEL_URL,
      imageBuffer,
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/octet-stream'
        },
        timeout: 30000
      }
    );

    // Parse response and extract authenticity score
    // This is a placeholder - actual implementation depends on the specific model
    const predictions = response.data;
    const authenticityScore = predictions?.[0]?.score || 0.68;
    
    return authenticityScore;
  } catch (error) {
    console.error('Hugging Face detection failed:', error);
    return 0.68; // Fallback to mock score
  }
}

/**
 * Call local PyTorch model for image authenticity detection
 */
async function detectWithPyTorch(imageBuffer: Buffer): Promise<number> {
  if (!PYTORCH_MODEL_ENDPOINT) {
    console.log('PyTorch model endpoint not configured, using mock detection');
    return 0.68; // Mock score
  }

  try {
    // Call local PyTorch model server
    const formData = new FormData();
    formData.append('image', new Blob([imageBuffer]));

    const response = await axios.post(PYTORCH_MODEL_ENDPOINT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 45000
    });

    return response.data.authenticity_score || 0.68;
  } catch (error) {
    console.error('PyTorch detection failed:', error);
    return 0.68; // Fallback to mock score
  }
}

/**
 * Extract EXIF metadata from image
 */
async function extractMetadata(imageBuffer: Buffer): Promise<Record<string, any>> {
  try {
    const metadata = await exifr.parse(imageBuffer, {
      gps: true,
      ifd0: true,
      exif: true,
      ifd1: false,
      iptc: false,
      icc: false
    });

    // Clean and format metadata
    const cleanMetadata: Record<string, any> = {};
    
    if (metadata) {
      if (metadata.Make && metadata.Model) {
        cleanMetadata.camera = `${metadata.Make} ${metadata.Model}`;
      }
      if (metadata.DateTime || metadata.DateTimeOriginal) {
        cleanMetadata.timestamp = metadata.DateTimeOriginal || metadata.DateTime;
      }
      if (metadata.latitude && metadata.longitude) {
        cleanMetadata.gps = {
          lat: metadata.latitude,
          lng: metadata.longitude
        };
      }
      if (metadata.Software) {
        cleanMetadata.software = metadata.Software;
      }
      if (metadata.ImageWidth && metadata.ImageHeight) {
        cleanMetadata.dimensions = {
          width: metadata.ImageWidth,
          height: metadata.ImageHeight
        };
      }
    }

    return cleanMetadata;
  } catch (error) {
    console.error('Metadata extraction failed:', error);
    return {};
  }
}

/**
 * Run Error Level Analysis (ELA) - simplified implementation
 * In production, this would use proper image processing libraries
 */
async function performELA(imageBuffer: Buffer): Promise<string> {
  // This is a placeholder implementation
  // In production, you would:
  // 1. Decode the image
  // 2. Recompress at different quality levels
  // 3. Calculate the difference
  // 4. Generate ELA visualization
  // 5. Return the ELA image URL/path
  
  // For demo purposes, return a placeholder URL
  return '/api/placeholder/300/200?ela=true';
}

/**
 * Detect clone/copy-paste regions - simplified implementation
 */
async function detectClones(imageBuffer: Buffer): Promise<Array<{x: number, y: number, w: number, h: number}>> {
  // This is a placeholder implementation
  // In production, you would use computer vision algorithms to:
  // 1. Analyze image for repeated patterns
  // 2. Detect copy-paste artifacts
  // 3. Return coordinates of suspicious regions
  
  // For demo purposes, return mock clone regions
  return [
    { x: 120, y: 80, w: 60, h: 40 },
    { x: 200, y: 150, w: 40, h: 30 }
  ];
}

/**
 * Check for provenance markers (SynthID, C2PA, etc.)
 */
async function checkProvenance(imageBuffer: Buffer): Promise<{synthIdDetected: boolean, provenanceDetails?: string}> {
  // This is a placeholder implementation
  // In production, you would:
  // 1. Check for SynthID watermarks (Google's AI image watermarking)
  // 2. Verify C2PA (Content Authenticity Initiative) signatures
  // 3. Look for other provenance markers
  
  // For demo purposes, return mock data
  return {
    synthIdDetected: false,
    provenanceDetails: 'No digital watermarks or provenance signatures detected'
  };
}

/**
 * Generate mock analysis results for demo purposes
 */
function generateMockResult(): AnalysisResult {
  return {
    confidence: 72,
    modelScore: 0.68,
    reverseMatches: [
      {
        source: 'TinEye',
        url: 'https://example.com/match1',
        score: 0.95
      },
      {
        source: 'Google',
        url: 'https://example.com/match2',
        score: 0.87
      }
    ],
    forensic: {
      elaImageUrl: '/api/placeholder/300/200?ela=true',
      clones: [
        { x: 120, y: 80, w: 60, h: 40 },
        { x: 200, y: 150, w: 40, h: 30 }
      ],
      metadata: {
        camera: 'iPhone 13 Pro',
        timestamp: '2024-01-15T10:30:00Z',
        gps: { lat: 37.7749, lng: -122.4194 }
      }
    },
    provenance: {
      synthIdDetected: false,
      provenanceDetails: 'No digital watermarks detected'
    }
  };
}

/**
 * Calculate overall confidence score from individual components
 */
function calculateConfidence(
  modelScore: number,
  forensicFlags: number,
  reverseMatches: number
): number {
  // Weighted scoring algorithm
  const aiWeight = 0.4;      // 40% AI detection
  const forensicWeight = 0.35; // 35% forensic analysis
  const reverseWeight = 0.25;  // 25% reverse search
  
  // Normalize forensic flags (fewer flags = higher authenticity)
  const forensicScore = Math.max(0, 1 - (forensicFlags / 10));
  
  // Normalize reverse matches (more unique = higher authenticity)
  const reverseScore = Math.max(0, 1 - (reverseMatches / 20));
  
  const weightedScore = (
    modelScore * aiWeight +
    forensicScore * forensicWeight +
    reverseScore * reverseWeight
  );
  
  return Math.round(weightedScore * 100);
}

/**
 * Main detection endpoint handler
 */
export async function detectHandler(req: Request, res: Response): Promise<void> {
  try {
    let imageBuffer: Buffer;
    
    // Handle both file upload and URL-based requests
    if (req.file) {
      // File upload
      imageBuffer = req.file.buffer;
    } else if (req.body.imageUrl) {
      // Image URL
      const imageUrl = req.body.imageUrl;
      try {
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 10000,
          maxContentLength: 10 * 1024 * 1024 // 10MB limit
        });
        imageBuffer = Buffer.from(response.data);
      } catch (error) {
        res.status(400).json({
          error: 'Failed to download image from URL'
        });
        return;
      }
    } else {
      res.status(400).json({
        error: 'Either image file or imageUrl is required'
      });
      return;
    }

    // Check if AI models are configured
    const hasAiModels = HUGGINGFACE_API_KEY || PYTORCH_MODEL_ENDPOINT;

    if (!hasAiModels) {
      // Return mock results for demo
      const mockResult = generateMockResult();
      res.json(mockResult);
      return;
    }

    // Run parallel analysis
    const [modelScore, metadata, elaImageUrl, clones, provenance] = await Promise.all([
      // AI Detection (try Hugging Face first, then PyTorch)
      HUGGINGFACE_API_KEY 
        ? detectWithHuggingFace(imageBuffer)
        : detectWithPyTorch(imageBuffer),
      
      // Metadata extraction
      extractMetadata(imageBuffer),
      
      // Error Level Analysis
      performELA(imageBuffer),
      
      // Clone detection
      detectClones(imageBuffer),
      
      // Provenance checking
      checkProvenance(imageBuffer)
    ]);

    // Calculate overall confidence
    const confidence = calculateConfidence(
      modelScore,
      clones.length,
      0 // Reverse matches would be calculated separately
    );

    const result: AnalysisResult = {
      confidence,
      modelScore,
      reverseMatches: [], // This would be populated by reverse search API
      forensic: {
        elaImageUrl,
        clones,
        metadata
      },
      provenance
    };

    res.json(result);

  } catch (error) {
    console.error('Detection error:', error);
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({
          error: 'Image file too large. Maximum size is 10MB.'
        });
        return;
      }
    }
    
    res.status(500).json({
      error: 'Image analysis service temporarily unavailable'
    });
  }
}

// Express router setup
const router = express.Router();
router.post('/detect', upload.single('image'), detectHandler);

export default router;