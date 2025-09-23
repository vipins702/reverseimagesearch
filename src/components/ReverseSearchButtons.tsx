// src/components/ReverseSearchButtons.tsx
import { useState, useEffect } from 'react';
import { ExternalLink, Copy, Search, Download, X, AlertTriangle, Sparkles, Zap, Tag } from 'lucide-react';
import ManualFallback from './fallback/ManualFallback';
import { extractImageKeywords, getSearchOptimizationTips, type SearchKeywords } from '../utils/keywordExtraction';

interface ReverseSearchButtonsProps {
  imageUrl: string;
  onApiSearch?: () => void;
  isApiAvailable?: boolean;
}

const searchProviders = [
  {
    name: 'Google Enhanced',
    key: 'google_enhanced', 
    icon: '🎯',
    color: 'bg-indigo-500 hover:bg-indigo-600',
    description: 'Advanced Google search with full results'
  },
  {
    name: 'Google Lens',
    key: 'google_lens',
    icon: '📷',
    color: 'bg-green-500 hover:bg-green-600',
    description: 'AI-powered visual recognition'
  },
  {
    name: 'TinEye',
    key: 'tineye',
    icon: '🔎',
    color: 'bg-purple-500 hover:bg-purple-600',
    description: 'Reverse image search specialist'
  },
  {
    name: 'Bing Visual',
    key: 'bing',
    icon: '🌐',
    color: 'bg-orange-500 hover:bg-orange-600',
    description: 'Microsoft visual search'
  },
  {
    name: 'Yandex',
    key: 'yandex',
    icon: '🗺️',
    color: 'bg-red-500 hover:bg-red-600',
    description: 'Russian search engine'
  }
];

export default function ReverseSearchButtons({ 
  imageUrl, 
  onApiSearch, 
  isApiAvailable = false 
}: ReverseSearchButtonsProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<typeof searchProviders[0] | null>(null);
  const [keywords, setKeywords] = useState<SearchKeywords | null>(null);
  const [showKeywords, setShowKeywords] = useState(false);

  // Extract keywords when image changes
  useEffect(() => {
    if (imageUrl && !imageUrl.startsWith('data:')) {
      const filename = imageUrl.split('/').pop() || 'image';
      const extractedKeywords = extractImageKeywords(filename);
      setKeywords(extractedKeywords);
    }
  }, [imageUrl]);

  // EXACT SAME APPROACH AS YOUR PHP TOOL: Upload → Public URL → Direct Search
  const handleSearch = async (provider: typeof searchProviders[0]) => {
    try {
      let publicUrl = imageUrl;
      
      // Step 1: Upload image to get public URL (like PHP move_uploaded_file)
      if (imageUrl.startsWith('data:')) {
        console.log('📤 Uploading image (like PHP move_uploaded_file)...');
        
        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageData: imageUrl,
            filename: `search-${Date.now()}.jpg`
          })
        });
        
        const result = await uploadResponse.json();
        if (!result.success) {
          console.error('Upload failed:', result.message);
          alert(`Upload failed: ${result.message}\n\nSolution: ${result.solution || 'Configure storage'}`);
          return;
        }
        
        publicUrl = result.publicUrl;
        console.log('✅ File uploaded. Public URL:', publicUrl);
      }
      
      // Special handling for Enhanced Google (gets long vsrid URLs like labnol.org)
      if (provider.key === 'google_enhanced') {
        console.log('🎯 Getting enhanced Google URL with vsrid parameters...');
        
        try {
          const vsridResponse = await fetch('/api/google-vsrid-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageData: imageUrl.startsWith('data:') ? imageUrl : publicUrl
            })
          });
          
          const vsridResult = await vsridResponse.json();
          
          if (vsridResult.success && vsridResult.fullUrl) {
            console.log('✅ SUCCESS! Got enhanced Google URL:', vsridResult.fullUrl);
            window.open(vsridResult.fullUrl, '_blank', 'noopener,noreferrer');
            return;
          } else {
            console.warn('⚠️ Enhanced Google failed, using standard method');
          }
        } catch (vsridError) {
          console.error('❌ Enhanced Google failed:', vsridError);
        }
      }
      
      // Step 2: Create search URLs (exactly like your PHP tool)
      const encodedUrl = encodeURIComponent(publicUrl);
      let searchUrl: string;
      
      console.log('🔍 Creating search URL (like PHP urlencode)...');
      console.log('- Public URL:', publicUrl);
      console.log('- Encoded URL:', encodedUrl);
      
      switch (provider.key) {
        case 'google_enhanced':
          // Fallback for enhanced (already tried proxy above)
          searchUrl = `https://www.google.com/searchbyimage?image_url=${encodedUrl}`;
          break;
        case 'google_lens':
          // Google Lens with proper image URL parameter
          searchUrl = `https://lens.google.com/uploadbyurl?url=${encodedUrl}`;
          break;
        case 'bing':
          searchUrl = `https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIVSP&q=imgurl:${encodedUrl}`;
          break;
        case 'yandex':
          // EXACT same format as your PHP
          searchUrl = `https://yandex.com/images/search?rpt=imageview&url=${encodedUrl}`;
          break;
        case 'tineye':
          // TinEye with proper URL format - try both approaches
          searchUrl = `https://www.tineye.com/search?url=${encodedUrl}`;
          console.log('🔍 TinEye may require manual verification due to anti-bot measures');
          break;
        default:
          searchUrl = `https://www.google.com/searchbyimage?image_url=${encodedUrl}`;
      }
      
      console.log('🚀 Opening search URL:', searchUrl);
      
      // Step 3: Open search (like PHP header redirect or link click)
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('Search failed:', error);
      setSelectedProvider(provider);
      setShowInstructions(true);
    }
  };

  const copyImageUrl = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      console.log('Image URL copied to clipboard');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const downloadImage = () => {
    if (imageUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(imageUrl, '_blank');
    }
  };

  const getInstructions = (provider: typeof searchProviders[0]) => {
    switch (provider.key) {
      case 'google':
        return {
          steps: [
            '1. Download the image using the ⬇ button above',
            '2. Go to images.google.com',
            '3. Click the camera icon in the search bar',
            '4. Upload your downloaded image file'
          ],
          directUrl: 'https://images.google.com'
        };
      case 'google_lens':
        return {
          steps: [
            '1. Download the image using the ⬇ button above',
            '2. Go to lens.google.com',
            '3. Click the upload button or camera icon',
            '4. Select your downloaded image file'
          ],
          directUrl: 'https://lens.google.com'
        };
      case 'tineye':
        return {
          steps: [
            '1. Download the image using the ⬇ button above',
            '2. Go to tineye.com',
            '3. Click the upload arrow icon',
            '4. Select your downloaded image file',
            '5. Note: TinEye may require manual verification'
          ],
          directUrl: 'https://tineye.com'
        };
      default:
        return {
          steps: [
            '1. Download the image using the ⬇ button above',
            '2. Visit the search engine website',
            '3. Look for an image upload option',
            '4. Upload your downloaded image file'
          ],
          directUrl: 'https://google.com'
        };
    }
  };  const isValidUrl = imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('https'));
  const isDataUrl = imageUrl && imageUrl.startsWith('data:');

  return (
    <div className="space-y-6">
      {/* Quick External Search */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            External Search Tools
          </h3>
          <div className="flex gap-2">
            {isDataUrl && (
              <button
                onClick={downloadImage}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Download image file"
                aria-label="Download image file"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={copyImageUrl}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy image URL"
              aria-label="Copy image URL to clipboard"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {imageUrl.startsWith('data:') 
            ? 'Upload an image to enable reverse search. Each button uses the exact same method as your PHP tool.'
            : imageUrl.includes('vsrid=')
              ? '🎯 SUCCESS! You have a Google vsrid URL - this contains your reverse search results (just like labnol.org generates)'
              : imageUrl.startsWith('http')
                ? '🔗 Public URL detected: Ready for reverse search (same as your PHP tool method)'
                : 'Click any button below to open the search engine with your image URL'
          }
        </p>

        {(!isValidUrl && !isDataUrl) ? (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Upload an image or provide a public image URL to enable external search tools.
            </p>
          </div>
        ) : imageUrl.includes('vsrid=') ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="text-green-900 dark:text-green-200 font-semibold mb-2">
                🎯 Success! Google vsrid URL Generated
              </h4>
              <p className="text-green-800 dark:text-green-300 text-sm mb-3">
                You now have a Google visual search results URL (just like labnol.org creates). This URL contains your reverse search results.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(imageUrl, '_blank', 'noopener,noreferrer')}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Google Results
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(imageUrl)}
                  className="px-4 py-2 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 border border-green-300 dark:border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30"
                >
                  Copy URL
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-blue-900 dark:text-blue-200 font-semibold mb-2">
                Understanding Your vsrid URL
              </h4>
              <ul className="text-blue-800 dark:text-blue-300 text-sm space-y-1">
                <li>• <strong>vsrid</strong> = Visual Search Result ID (unique to your image)</li>
                <li>• <strong>udm=26</strong> = Universal Data Model for image search</li>
                <li>• This is the same format that labnol.org generates</li>
                <li>• Contains comprehensive reverse search results</li>
              </ul>
            </div>
          </div>
        ) : isDataUrl ? (
          <div className="space-y-6">
            {/* Enhanced Information Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 dark:from-blue-400/5 dark:to-purple-400/5"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                    <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      🚀 Ready for Reverse Search
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      Click any search engine below to find similar images and discover where your photo appears online
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <Zap className="w-4 h-4" />
                    <span>Instant upload & search</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <Search className="w-4 h-4" />
                    <span>Multiple search engines</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Search Buttons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchProviders.map((provider, index) => (
                <button
                  key={provider.name}
                  onClick={() => handleSearch(provider)}
                  className={`
                    group relative overflow-hidden rounded-2xl p-6 text-white font-medium
                    transform transition-all duration-300 ease-out
                    hover:scale-105 hover:shadow-2xl hover:-translate-y-1
                    focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50
                    ${provider.color} shadow-lg
                    animate-fade-in-up
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                  aria-label={`Search with ${provider.name} - ${provider.description}`}
                >
                  {/* Animated Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors duration-300">
                      <span className="text-3xl" role="img" aria-hidden="true">
                        {provider.icon}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-bold block leading-tight">
                        {provider.name}
                      </span>
                      <span className="text-sm opacity-90 block mt-1">
                        {provider.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs opacity-75 group-hover:opacity-100 transition-opacity">
                      <Search className="w-3 h-3" />
                      <span>Search Now</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Enhanced Help Section */}
            <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-700">
              <button
                onClick={() => setShowManualFallback(true)}
                className="group inline-flex items-center gap-3 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 font-medium transition-colors duration-200"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span>Need help? View detailed manual upload guide</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Status Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-green-900 dark:text-green-100">
                    🔗 Ready to Search!
                  </h4>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Your image is uploaded and ready. Choose a search engine to find similar images.
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Search Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchProviders.map((provider, index) => (
                <button
                  key={provider.name}
                  onClick={() => handleSearch(provider)}
                  className={`
                    group relative overflow-hidden rounded-2xl p-6 text-white font-medium
                    transform transition-all duration-300 ease-out
                    hover:scale-105 hover:shadow-2xl hover:-translate-y-1
                    focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50
                    ${provider.color} shadow-lg
                    animate-fade-in-up
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                  aria-label={`Search on ${provider.name} - ${provider.description}`}
                >
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors duration-300">
                      <span className="text-3xl" role="img" aria-hidden="true">
                        {provider.icon}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-bold block leading-tight">
                        {provider.name}
                      </span>
                      <span className="text-sm opacity-90 block mt-1">
                        {provider.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs opacity-75 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-3 h-3" />
                      <span>Direct Search</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Search Keywords & Optimization */}
            {keywords && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                      <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                      🎯 Search Optimization
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowKeywords(!showKeywords)}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 font-medium"
                  >
                    {showKeywords ? 'Hide' : 'Show'} Keywords
                  </button>
                </div>

                {showKeywords && (
                  <div className="space-y-4">
                    {keywords.primary.length > 0 && (
                      <div>
                        <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Primary Keywords</h5>
                        <div className="flex flex-wrap gap-2">
                          {keywords.primary.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {keywords.suggestions.length > 0 && (
                      <div>
                        <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Search Suggestions</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {keywords.suggestions.slice(0, 6).map((suggestion, index) => (
                            <div
                              key={index}
                              className="text-sm text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-3 py-2 rounded-lg"
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-purple-200 dark:border-purple-700">
                      <h5 className="font-medium text-purple-800 dark:text-purple-200 mb-2">💡 Optimization Tips</h5>
                      <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                        {getSearchOptimizationTips().slice(0, 3).map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-purple-500 mt-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">or</span>
        </div>
      </div>

      {/* API-Based Automated Search */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Automated Reverse Search
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Use API integration to automatically search multiple providers and aggregate results
        </p>

        {!isApiAvailable ? (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Search className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  API Keys Required
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Configure TinEye and Bing Visual Search API keys in settings for automated search
                </p>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Configure API Keys →
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={onApiSearch}
            className="w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-3 px-6 py-3"
          >
            <Search className="w-5 h-5" />
            Run Auto Search
            <span className="text-sm opacity-75">(API)</span>
          </button>
        )}
      </div>

      {/* Enhanced Help Text */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg">
        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          How This Works (Same as Your PHP Tool)
        </h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">✅ Process Flow</h5>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• **Upload**: Image stored with public URL (like PHP move_uploaded_file)</li>
              <li>• **Google Enhanced**: Gets long vsrid URLs like labnol.org</li>
              <li>• **Google Lens**: AI-powered visual recognition</li>
              <li>• **Other Engines**: TinEye, Bing, Yandex (exact same URLs as PHP)</li>
              <li>• **URL Encoding**: Uses encodeURIComponent (same as PHP urlencode)</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">⚠️ Important Notes</h5>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• **Privacy**: Images are uploaded to secure Vercel Blob storage</li>
              <li>• **Speed**: Google Enhanced provides fastest results</li>
              <li>• **Accuracy**: Try multiple engines for best coverage</li>
              <li>• **Quality**: Higher resolution images yield better matches</li>
              <li>• **Temporary**: Uploaded images are cached temporarily</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Warning Section */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-2">
              🔒 Privacy & Security
            </h4>
            <div className="text-sm text-amber-800 dark:text-amber-300 space-y-2">
              <p>
                <strong>What we do:</strong> Your images are processed securely and uploaded to Vercel Blob storage with public URLs for search engines to access.
              </p>
              <p>
                <strong>What we don't do:</strong> We don't store, analyze, or share your images beyond the reverse search functionality.
              </p>
              <p>
                <strong>Data retention:</strong> Images are cached temporarily and may be automatically cleaned up after a period of inactivity.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200 rounded text-xs">
                  Secure Upload
                </span>
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200 rounded text-xs">
                  No Personal Data
                </span>
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200 rounded text-xs">
                  Temporary Storage
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📋 {selectedProvider.name} Search Instructions
              </h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                To search for similar images, follow these steps:
              </p>
              
              {(() => {
                const instructions = getInstructions(selectedProvider);
                return (
                  <div className="space-y-4">
                    <ol className="space-y-3">
                      {instructions.steps.map((step: string, index: number) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">{step.replace(/^\d+\.\s*/, '')}</span>
                        </li>
                      ))}
                    </ol>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          window.open(instructions.directUrl, '_blank', 'noopener,noreferrer');
                          setShowInstructions(false);
                        }}
                        className="flex-1 btn-primary inline-flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open {selectedProvider.name}
                      </button>
                      <button
                        onClick={() => setShowInstructions(false)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Manual Fallback Modal */}
      {showManualFallback && (
        <ManualFallback 
          imageUrl={imageUrl}
          onClose={() => setShowManualFallback(false)}
        />
      )}
    </div>
  );
}