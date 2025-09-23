import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Search, Shield, ExternalLink, Copy, AlertCircle, CheckCircle } from 'lucide-react';
import ReverseSearchButtons from '../components/ReverseSearchButtons';

export default function ReverseSearch() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [publicImageUrl, setPublicImageUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SEO: Set page title dynamically
  React.useEffect(() => {
    document.title = "Free Reverse Image Search - Upload & Find Similar Images | Image Lookup Tool";
    
    // Add meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Upload any image to find similar pictures, discover sources, and check duplicates across Google, Bing, Yandex, and TinEye. Free reverse image search tool.');
    }
  }, []);

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
      // Convert file to base64 for upload (similar to PHP file handling)
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedImage(dataUrl); // For preview
        
        // Upload to server to get public URL (like your PHP upload.php)
        try {
          console.log('🔄 Starting upload to /api/upload-image...');
          console.log('📝 Request payload:', {
            imageDataLength: dataUrl.length,
            filename: file.name,
            fileSize: file.size,
            fileType: file.type
          });

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

          console.log('📡 Upload response status:', response.status);
          const result = await response.json();
          console.log('📋 Upload response data:', result);
          
          if (result.success) {
            // Store the public URL (equivalent to $_SESSION['id'] in your PHP)
            setPublicImageUrl(result.publicUrl);
            console.log('✅ Image uploaded successfully!');
            console.log('🔗 Public URL created:', result.publicUrl);
            console.log('🧪 URL validation:', {
              isHttps: result.publicUrl.startsWith('https:'),
              isBlob: result.publicUrl.includes('.vercel-storage.com'),
              urlLength: result.publicUrl.length
            });
          } else {
            console.error('❌ Upload failed:', result);
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
      // Simulate API search with mock results
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
        },
        {
          source: 'Bing',
          url: 'https://example.com/blog-post',
          score: 0.82,
          title: 'Blog Article',
          publishedDate: '2024-01-18'
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
                className="text-gray-600 hover:text-primary-600 font-medium"
              >
                Analyze
              </Link>
              <Link 
                to="/reverse-search" 
                className="text-primary-600 font-medium"
              >
                Reverse Search
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Reverse Image Search
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Search for similar or identical images across the web using multiple search engines
          </p>
        </div>

        {/* Upload Area */}
        {!uploadedImage && (
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors mb-8 ${
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
                  {dragOver ? 'Drop image to search' : 'Upload image for reverse search'}
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
                Choose Image
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Image Preview & Search Options */}
        {uploadedImage && (
          <div className="space-y-8">
            {/* Image Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Uploaded Image
                </h3>
                <button
                  onClick={reset}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Remove image and start over"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex justify-center mb-4">
                <img
                  src={uploadedImage}
                  alt="Uploaded for reverse search"
                  className="max-w-full max-h-96 object-contain rounded-lg"
                />
              </div>

              {/* Debug Panel for Public URL */}
              {publicImageUrl && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">
                    ✅ Public URL Created Successfully
                  </h4>
                  <div className="text-xs text-green-800 dark:text-green-300 space-y-1">
                    <p><strong>URL:</strong> <a href={publicImageUrl} target="_blank" rel="noopener noreferrer" className="underline break-all">{publicImageUrl}</a></p>
                    <p><strong>Type:</strong> {publicImageUrl.includes('.vercel-storage.com') ? 'Vercel Blob Storage' : 'Other'}</p>
                    <p><strong>HTTPS:</strong> {publicImageUrl.startsWith('https:') ? 'Yes' : 'No'}</p>
                    <p><strong>Length:</strong> {publicImageUrl.length} characters</p>
                  </div>
                </div>
              )}
              
              {!publicImageUrl && !isUploading && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                    ⏳ Waiting for Public URL
                  </h4>
                  <p className="text-xs text-yellow-800 dark:text-yellow-300">
                    Image uploaded but public URL not received yet. Check browser console for details.
                  </p>
                </div>
              )}
            </div>

            {/* Search Options */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              {isUploading ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Uploading image...
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
                <div className="text-center py-8">
                  <p className="text-gray-500">Upload processing...</p>
                </div>
              )}
            </div>

            {/* API Search Results */}
            {(isSearching || searchResults.length > 0) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  {isSearching ? 'Searching...' : 'Search Results'}
                </h3>

                {isSearching ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center gap-3">
                      <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Searching across multiple providers...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.length === 0 ? (
                      <div className="text-center py-8">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No similar images found
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Found {searchResults.length} similar images
                          </span>
                        </div>
                        
                        <div className="grid gap-4">
                          {searchResults.map((result, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {result.source}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {Math.round(result.score * 100)}% match
                                  </span>
                                </div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                  {result.title}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  Published: {new Date(result.publishedDate).toLocaleDateString()}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => navigator.clipboard.writeText(result.url)}
                                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                                  title="Copy URL"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <a
                                  href={result.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="w-4 h-4" />
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

        {/* Info Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">
            How Reverse Image Search Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-800 dark:text-blue-300">
            <div>
              <h4 className="font-medium mb-2">External Search Tools</h4>
              <ul className="space-y-1">
                <li>• Google Lens - Most comprehensive database</li>
                <li>• TinEye - Oldest and most reliable</li>
                <li>• Bing Visual - Microsoft's search engine</li>
                <li>• Yandex - Strong for Russian content</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">What Results Mean</h4>
              <ul className="space-y-1">
                <li>• Multiple matches may indicate wide distribution</li>
                <li>• Earlier dates suggest original source</li>
                <li>• No matches don't guarantee authenticity</li>
                <li>• Check source credibility and context</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:hidden">
        <div className="grid grid-cols-3 gap-1">
          <Link
            to="/"
            className="flex flex-col items-center py-3 px-2 text-gray-500 hover:text-gray-700"
          >
            <Shield className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link
            to="/analyze"
            className="flex flex-col items-center py-3 px-2 text-gray-500 hover:text-gray-700"
          >
            <Upload className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Analyze</span>
          </Link>
          <Link
            to="/reverse-search"
            className="flex flex-col items-center py-3 px-2 text-primary-600 bg-primary-50 dark:bg-primary-900/20"
          >
            <Search className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Search</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}