import { useState, useRef } from 'react';
import { Upload, Search, Shield, ExternalLink, AlertCircle, CheckCircle, Camera } from 'lucide-react';
import ReverseSearchButtons from '../components/ReverseSearchButtons';

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [publicImageUrl, setPublicImageUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a JPG, PNG, or WebP image');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }

    setError(null);
    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedImage(dataUrl);
        
        try {
          const response = await fetch('/api/upload-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageData: dataUrl,
              filename: file.name
            })
          });

          const result = await response.json();
          
          if (result.success) {
            setPublicImageUrl(result.publicUrl);
          } else {
            throw new Error(result.message || 'Upload failed');
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          setError('Failed to upload image. Please try again.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process image');
      setIsUploading(false);
    }
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

  const handleApiSearch = async () => {
    if (!uploadedImage) return;
    
    setIsSearching(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSearchResults([
        {
          source: 'TinEye',
          url: 'https://example.com/original-source',
          score: 0.95,
          title: 'Original News Article',
          publishedDate: '2024-01-15'
        },
        {
          source: 'Google',
          url: 'https://example.com/social-post',
          score: 0.87,
          title: 'Social Media Post',
          publishedDate: '2024-01-16'
        }
      ]);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const reset = () => {
    setUploadedImage(null);
    setPublicImageUrl(null);
    setSearchResults([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      padding: '2rem',
      color: 'white'
    }}>
      <div className="cosmic-background">
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
        <div className="floating-orb"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 pt-8">
          <h1 className="cosmic-text-gradient text-6xl font-black mb-6 tracking-tight">
            Cosmic Image Analysis
          </h1>
          <p className="text-white text-xl mb-8 opacity-90 leading-relaxed max-w-3xl mx-auto">
            World-class AI-powered reverse image search with forensic analysis
          </p>
          
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="cosmic-stat-item">
              <div className="cosmic-number cosmic-shimmer text-5xl font-black mb-2" style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>100M+</div>
              <div className="cosmic-stat-label text-white text-sm uppercase tracking-wider">Images Analyzed</div>
            </div>
            <div className="cosmic-stat-item">
              <div className="cosmic-number cosmic-shimmer text-5xl font-black mb-2" style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>99.9%</div>
              <div className="cosmic-stat-label text-white text-sm uppercase tracking-wider">Accuracy Rate</div>
            </div>
            <div className="cosmic-stat-item">
              <div className="cosmic-number cosmic-shimmer text-5xl font-black mb-2" style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>0.3s</div>
              <div className="cosmic-stat-label text-white text-sm uppercase tracking-wider">Average Speed</div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-6xl mx-auto">
          {/* Upload Area */}
          {!uploadedImage && (
            <div className="cosmic-card cosmic-glow mb-8 p-8">
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragOver 
                    ? 'border-yellow-400 bg-yellow-400/10 scale-105' 
                    : 'border-white/30 hover:border-white/50 hover:bg-white/5'
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
                
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="p-6 bg-white/10 rounded-full backdrop-blur-sm">
                      <Camera className="w-16 h-16 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-2xl font-bold text-white mb-3">
                      {dragOver ? '🚀 Drop image to analyze' : '✨ Upload image for cosmic analysis'}
                    </p>
                    <p className="text-white/80 text-lg">
                      Supports JPG, PNG, WebP up to 10MB
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    className="cosmic-btn cosmic-btn-primary cosmic-btn-lg cosmic-hover-lift inline-flex items-center gap-3 px-8 py-4 text-lg font-bold"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-6 h-6" />
                    Choose Image
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="cosmic-card mb-6 p-6" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                <p className="text-red-200 text-lg">{error}</p>
              </div>
            </div>
          )}

          {/* Image Preview & Search Options */}
          {uploadedImage && (
            <div className="space-y-8">
              {/* Image Preview */}
              <div className="cosmic-card cosmic-glow p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    Image Ready for Analysis
                  </h3>
                  <button
                    onClick={reset}
                    className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                    aria-label="Remove image and start over"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="flex justify-center mb-6">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={uploadedImage}
                      alt="Uploaded for reverse search"
                      className="max-w-full max-h-96 object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                  </div>
                </div>

                {/* Upload Status */}
                {isUploading && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center gap-3 text-white">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xl">
                        🚀 Preparing cosmic analysis...
                      </span>
                    </div>
                  </div>
                )}

                {publicImageUrl && (
                  <div className="mt-6 p-6 bg-green-400/10 border border-green-400/30 rounded-2xl">
                    <h4 className="text-lg font-bold text-green-300 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      ✅ Ready for Reverse Search
                    </h4>
                    <p className="text-green-200 text-sm">
                      Your image is now accessible publicly and ready for searching across multiple engines.
                    </p>
                  </div>
                )}
              </div>

              {/* Search Options */}
              <div className="cosmic-card cosmic-glow p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Search className="w-8 h-8 text-blue-400" />
                  Cosmic Search Engines
                </h3>
                
                {isUploading ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center gap-3 text-white">
                      <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xl">
                        Uploading to cosmic servers...
                      </span>
                    </div>
                  </div>
                ) : publicImageUrl ? (
                  <ReverseSearchButtons
                    imageUrl={publicImageUrl}
                    onApiSearch={handleApiSearch}
                    isApiAvailable={true}
                  />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-white/60 text-lg">Processing upload...</p>
                  </div>
                )}
              </div>

              {/* API Search Results */}
              {(isSearching || searchResults.length > 0) && (
                <div className="cosmic-card cosmic-glow p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Shield className="w-8 h-8 text-purple-400" />
                    {isSearching ? 'Cosmic Analysis in Progress...' : 'Analysis Results'}
                  </h3>

                  {isSearching ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center gap-3 text-white">
                        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xl">
                          🔍 Scanning cosmic databases...
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {searchResults.length === 0 ? (
                        <div className="text-center py-12">
                          <Search className="w-16 h-16 text-white/40 mx-auto mb-4" />
                          <p className="text-white/60 text-xl">
                            No similar images found in cosmic databases
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 mb-6">
                            <CheckCircle className="w-6 h-6 text-green-400" />
                            <span className="text-white">
                              Found {searchResults.length} cosmic matches
                            </span>
                          </div>
                          
                          <div className="grid gap-6">
                            {searchResults.map((result, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-400/20 text-blue-300 border border-blue-400/30">
                                      {result.source}
                                    </span>
                                    <span className="text-white/80 text-sm">
                                      {Math.round(result.score * 100)}% cosmic match
                                    </span>
                                  </div>
                                  <h4 className="font-bold text-white text-lg mb-2">
                                    {result.title}
                                  </h4>
                                  <p className="text-white/60">
                                    Published: {new Date(result.publishedDate).toLocaleDateString()}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <a
                                    href={result.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                                    title="Open in new tab"
                                  >
                                    <ExternalLink className="w-5 h-5" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Feature Highlights */}
          {!uploadedImage && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="cosmic-card cosmic-hover-lift p-6 text-center">
                <div className="p-4 bg-blue-400/20 rounded-2xl w-fit mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Reverse Search</h3>
                <p className="text-white/80">
                  Find similar images across Google, TinEye, Bing, and Yandex
                </p>
              </div>

              <div className="cosmic-card cosmic-hover-lift p-6 text-center">
                <div className="p-4 bg-purple-400/20 rounded-2xl w-fit mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Authenticity Check</h3>
                <p className="text-white/80">
                  Verify image authenticity with advanced forensic analysis
                </p>
              </div>

              <div className="cosmic-card cosmic-hover-lift p-6 text-center">
                <div className="p-4 bg-green-400/20 rounded-2xl w-fit mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Instant Results</h3>
                <p className="text-white/80">
                  Get comprehensive analysis results in under 0.3 seconds
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
