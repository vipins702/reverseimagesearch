// src/pages/Editor.tsx
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, X, AlertCircle, CheckCircle, Loader, Shield } from 'lucide-react';

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

type AnalysisState = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

export default function Editor() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a JPG, PNG, or WebP image');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }

    setError(null);
    setAnalysisState('uploading');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setAnalysisState('idle');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const startAnalysis = async () => {
    if (!uploadedImage) return;
    
    setAnalysisState('analyzing');
    setError(null);
    
    try {
      // Mock analysis with deterministic results
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult: AnalysisResult = {
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
          elaImageUrl: '/api/placeholder/300/200',
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
      
      setResult(mockResult);
      setAnalysisState('complete');
    } catch (err) {
      setError('Analysis failed. Please try again.');
      setAnalysisState('error');
    }
  };

  const reset = () => {
    setUploadedImage(null);
    setResult(null);
    setError(null);
    setAnalysisState('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-primary-600';
    if (confidence >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Likely authentic';
    if (confidence >= 50) return 'Needs review';
    return 'Suspicious - investigation recommended';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Veritas
              </h1>
            </div>
            <nav className="hidden sm:flex gap-6">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-primary-600 font-medium"
              >
                Home
              </Link>
              <Link 
                to="/analyze" 
                className="text-primary-600 font-medium"
              >
                Analyze
              </Link>
              <Link 
                to="/reverse-search" 
                className="text-gray-600 hover:text-primary-600 font-medium"
              >
                Reverse Search
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Image Authenticity Analyzer
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Upload an image to analyze its authenticity using AI detection and forensic analysis
          </p>
        </div>

        {/* Upload Area */}
        {!uploadedImage && (
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragOver 
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Upload image file"
            />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="w-16 h-16 text-gray-400" />
              </div>
              
              <div>
                <p className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  {dragOver ? 'Drop image to analyze' : 'Drop your image here or click to upload'}
                </p>
                <p className="text-gray-500">
                  Supports JPG, PNG, WebP up to 10MB
                </p>
              </div>
              
              <button
                type="button"
                className="btn-primary inline-flex items-center gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-5 h-5" />
                Choose File
              </button>
            </div>

            {analysisState === 'uploading' && (
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center rounded-xl">
                <div className="flex items-center gap-3">
                  <Loader className="w-6 h-6 animate-spin text-primary-600" />
                  <span className="font-medium">Uploading image...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Image Preview & Analysis */}
        {uploadedImage && (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Uploaded Image
                </h3>
                <button
                  onClick={reset}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex justify-center">
                <img
                  src={uploadedImage}
                  alt="Uploaded for analysis"
                  className="max-w-full max-h-96 object-contain rounded-lg"
                />
              </div>
            </div>

            {/* Analysis Controls */}
            {analysisState === 'idle' && (
              <div className="text-center">
                <button
                  onClick={startAnalysis}
                  className="btn-primary inline-flex items-center gap-3 px-8 py-4 text-lg"
                >
                  <CheckCircle className="w-6 h-6" />
                  Start Authenticity Check
                </button>
                <p className="text-sm text-gray-500 mt-3">
                  This will run AI detection, forensic analysis, and reverse image search
                </p>
              </div>
            )}

            {/* Analysis Progress */}
            {analysisState === 'analyzing' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm text-center">
                <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Running Authenticity Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  This may take up to 30 seconds...
                </p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                    <span>Running forensic checks...</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Analyzing with AI detection model...</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    <span>Searching for similar images...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {analysisState === 'complete' && result && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Analysis Results
                </h3>
                
                {/* Confidence Score */}
                <div className="text-center mb-8">
                  <div className="confidence-ring">
                    <svg className="w-32 h-32" viewBox="0 0 100 100">
                      <circle
                        className="bg-circle"
                        cx="50"
                        cy="50"
                        r="45"
                      />
                      <circle
                        className="progress-circle"
                        cx="50"
                        cy="50"
                        r="45"
                        style={{
                          strokeDashoffset: 283 - (283 * result.confidence) / 100
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getConfidenceColor(result.confidence)}`}>
                          {result.confidence}%
                        </div>
                        <div className="text-sm text-gray-500">confidence</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className={`text-lg font-semibold ${getConfidenceColor(result.confidence)}`}>
                      {getConfidenceLabel(result.confidence)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Advisory only — not definitive proof of authenticity
                    </p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round(result.modelScore * 100)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">AI Detection</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {result.forensic.clones.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Clone Regions</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {result.reverseMatches.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Similar Images</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button className="btn-secondary">
                    View Detailed Report
                  </button>
                  <button className="btn-secondary">
                    Save Analysis
                  </button>
                  <button 
                    onClick={reset}
                    className="btn-primary"
                  >
                    Analyze Another Image
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:hidden">
        <div className="grid grid-cols-4 gap-1">
          <Link
            to="/"
            className="flex flex-col items-center py-3 px-2 text-gray-500 hover:text-gray-700"
          >
            <Shield className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            to="/analyze"
            className="flex flex-col items-center py-3 px-2 text-primary-600 bg-primary-50 dark:bg-primary-900/20"
          >
            <Upload className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Analyze</span>
          </Link>
          <Link
            to="/reverse-search"
            className="flex flex-col items-center py-3 px-2 text-gray-500 hover:text-gray-700"
          >
            <CheckCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Search</span>
          </Link>
          <Link
            to="/history"
            className="flex flex-col items-center py-3 px-2 text-gray-500 hover:text-gray-700"
          >
            <AlertCircle className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">History</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}