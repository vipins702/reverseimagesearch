# Veritas Image Analyzer

A comprehensive AI-powered image authenticity tool built with React, TypeScript, Tailwind CSS, and Vite. Veritas combines AI detection, forensic analysis, and reverse image search to help verify image authenticity.

## Features

### 🔍 **Multi-Method Analysis**
- **AI Detection**: Deep learning models to detect AI-generated images
- **Forensic Analysis**: Error Level Analysis (ELA) and clone detection
- **Reverse Image Search**: Both manual external tools and automated API-based search
- **Metadata Extraction**: EXIF data analysis and provenance checking

### 🎯 **Quick External Search Tools**
- Google Lens integration
- TinEye reverse search
- Bing Visual Search
- Yandex image search

### 🤖 **API Integration Support**
- TinEye API for automated reverse search
- Bing Visual Search API (Azure Cognitive Services)
- Hugging Face model integration
- Custom PyTorch model support
- SynthID and C2PA provenance checking

### 📱 **Mobile-First Design**
- Responsive breakpoints (mobile ≤640px, tablet 641-1024px, desktop ≥1025px)
- Touch-friendly interface (44×44px minimum touch targets)
- Accessible design with WCAG AA compliance
- Dark mode support

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Quick Start

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd veritas-image-analyzer
npm install
```

2. **Start development servers:**
```bash
# Start frontend (Vite dev server)
npm run dev

# Start backend server (in separate terminal)
npm run server
```

3. **Open application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# TinEye API (for automated reverse search)
TINEYE_API_KEY=your_tineye_api_key
TINEYE_PRIVATE_KEY=your_tineye_private_key

# Bing Visual Search API (Azure Cognitive Services)
BING_VISUAL_SEARCH_KEY=your_bing_api_key
BING_VISUAL_SEARCH_ENDPOINT=https://api.bing.microsoft.com/v7.0/images/visualsearch

# Hugging Face (for AI detection models)
HUGGINGFACE_API_KEY=your_huggingface_token
HUGGINGFACE_MODEL_URL=https://api-inference.huggingface.co/models/your-model-name

# Custom PyTorch Model (optional)
PYTORCH_MODEL_ENDPOINT=http://localhost:8000/predict

# Frontend API base URL (optional)
VITE_API_BASE_URL=http://localhost:3001
```

### Setting Up API Keys

#### 1. TinEye API
1. Sign up at [TinEye API](https://services.tineye.com/)
2. Choose a subscription plan
3. Get your API key and private key from the dashboard
4. Add to `.env` file

#### 2. Bing Visual Search (Azure)
1. Create an Azure account
2. Create a Cognitive Services resource
3. Enable Computer Vision API
4. Copy the API key and endpoint
5. Add to `.env` file

#### 3. Hugging Face
1. Create account at [Hugging Face](https://huggingface.co/)
2. Generate an API token in your profile settings
3. Choose an appropriate model for AI detection (e.g., AI-generated image classifiers)
4. Add token and model URL to `.env` file

#### 4. Custom PyTorch Model (Optional)
If you have a custom PyTorch model:
1. Deploy your model server (Flask/FastAPI recommended)
2. Ensure it accepts POST requests with image data
3. Should return JSON with `authenticity_score` field
4. Add endpoint URL to `.env` file

## Project Structure

```
veritas-image-analyzer/
├── src/                          # Frontend source code
│   ├── components/              # Reusable UI components
│   │   ├── ForensicsViewer.tsx  # ELA and clone detection display
│   │   ├── ReverseSearchButtons.tsx # External search integration
│   │   └── ResultCard.tsx       # Analysis results display
│   ├── pages/                   # Main application pages
│   │   ├── Home.tsx            # Dashboard and recent checks
│   │   └── Editor.tsx          # Upload and analysis interface
│   ├── services/               # API communication
│   │   └── detectService.ts    # Client-side API wrapper
│   └── styles/                 # CSS and styling
│       └── globals.css         # Global styles and design tokens
├── server/                     # Backend API server
│   └── api/                   # API endpoints
│       ├── detect.ts          # Image analysis endpoint
│       └── reverse-search.ts  # Reverse search endpoint
├── design-tokens.json         # Design system tokens
├── ux-copy.md                # UI microcopy and messaging
├── assets-list.md            # Required icons and assets
└── README.md                 # This file
```

## Usage

### Basic Analysis Workflow

1. **Upload Image**: Drag and drop or click to upload JPG/PNG/WebP (max 10MB)
2. **Start Analysis**: Click "Start Authenticity Check"
3. **Review Results**: View confidence score and detailed breakdown
4. **Use External Tools**: Quick links to Google Lens, TinEye, etc.
5. **Save/Share**: Save analysis or share results

### Understanding Results

#### Confidence Score (0-100%)
- **80-100%**: Likely authentic
- **50-79%**: Needs manual review  
- **0-49%**: Suspicious, investigation recommended

#### Score Calculation
- **AI Detection**: 40% weight
- **Forensic Analysis**: 35% weight  
- **Reverse Search**: 25% weight

#### Analysis Components

**AI Detection**: Deep learning model score for detecting AI-generated content

**Forensics**:
- **ELA (Error Level Analysis)**: Highlights areas with different compression levels
- **Clone Detection**: Identifies copy-paste regions
- **Metadata**: EXIF data extraction and analysis

**Reverse Search**:
- **External Tools**: Manual search via Google Lens, TinEye, Bing, Yandex
- **API Search**: Automated search when API keys configured

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start Vite dev server
npm run server       # Start backend API server

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Architecture Decisions

#### Frontend
- **Vite** for fast development and optimized builds
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **Lucide React** for consistent iconography

#### Backend  
- **Express.js** for API server
- **Multer** for file upload handling
- **Axios** for external API calls
- **exifr** for metadata extraction

#### Key Design Patterns
- **Mobile-first responsive design**
- **Progressive enhancement** (works without API keys)
- **Graceful degradation** (fallback to external tools)
- **Accessibility-first** (WCAG AA compliance)

## Replacing Mock Components

### AI Detection Models

To replace the mock AI detection:

1. **Using Hugging Face**:
```typescript
// In server/api/detect.ts, update detectWithHuggingFace()
const response = await axios.post(
  'https://api-inference.huggingface.co/models/your-ai-detector',
  imageBuffer,
  { headers: { 'Authorization': `Bearer ${HUGGINGFACE_API_KEY}` }}
);
```

2. **Using Custom PyTorch Model**:
```python
# Example Flask server for PyTorch model
from flask import Flask, request, jsonify
import torch
from PIL import Image

@app.route('/predict', methods=['POST'])
def predict():
    image = Image.open(request.files['image'])
    # Your model inference here
    authenticity_score = model.predict(image)
    return jsonify({'authenticity_score': float(authenticity_score)})
```

### Forensic Analysis

Replace mock implementations in `server/api/detect.ts`:

```typescript
// ELA implementation using Sharp or Canvas
async function performELA(imageBuffer: Buffer): Promise<string> {
  // 1. Decode original image
  // 2. Recompress at lower quality  
  // 3. Calculate pixel differences
  // 4. Generate heat map visualization
  // 5. Save and return URL
}

// Clone detection using OpenCV or similar
async function detectClones(imageBuffer: Buffer): Promise<CloneRegion[]> {
  // 1. Feature extraction
  // 2. Similarity matching
  // 3. Region identification
  // 4. Return coordinates
}
```

### File Upload Storage

For production, replace the temporary file handling:

```typescript
// Example using AWS S3
import AWS from 'aws-sdk';

const s3 = new AWS.S3();

async function uploadToS3(buffer: Buffer, key: string): Promise<string> {
  const result = await s3.upload({
    Bucket: 'your-bucket',
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg'
  }).promise();
  
  return result.Location;
}
```

## Deployment

### Frontend (Vite)
```bash
npm run build
# Deploy dist/ folder to your static hosting service
```

### Backend (Node.js)
```bash
# Production build
npm run build:server

# Start production server
NODE_ENV=production node dist/server.js
```

### Environment Variables for Production
Ensure all required environment variables are set in your production environment.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Disclaimer

**Important**: This tool provides advisory analysis only and is **not definitive proof** of image authenticity. Results should be considered alongside other verification methods and expert analysis when making important decisions. Always verify critical images through multiple sources and professional analysis.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section below

### Troubleshooting

**Q: External search buttons don't work**
A: Ensure the image is uploaded and accessible via public URL. Local files need to be uploaded to a hosting service first.

**Q: API search returns "No API keys configured"**
A: Add TinEye or Bing Visual Search API keys to your `.env` file and restart the server.

**Q: Analysis always returns mock data**
A: Configure AI model API keys (Hugging Face or PyTorch endpoint) in environment variables.

**Q: File uploads fail**
A: Check file size (max 10MB) and format (JPG/PNG/WebP only).

---

Built with ❤️ for digital media verification and authenticity analysis.