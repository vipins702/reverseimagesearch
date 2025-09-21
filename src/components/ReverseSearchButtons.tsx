// src/components/ReverseSearchButtons.tsx
import { useState } from 'react';
import { ExternalLink, Copy, Search, Download, X, AlertTriangle } from 'lucide-react';
import ManualFallback from './fallback/ManualFallback';

interface ReverseSearchButtonsProps {
  imageUrl: string;
  onApiSearch?: () => void;
  isApiAvailable?: boolean;
}

const searchProviders = [
  {
    name: 'Google Images',
    key: 'google',
    icon: '🔍',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    name: 'Google Lens',
    key: 'google_lens', 
    icon: '📷',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    name: 'TinEye',
    key: 'tineye',
    icon: '🔎',
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    name: 'Bing Visual',
    key: 'bing',
    icon: '🌐',
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    name: 'Yandex',
    key: 'yandex',
    icon: '🗺️',
    color: 'bg-red-500 hover:bg-red-600'
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

  // SIMPLE PHP-STYLE APPROACH: Upload → Public URL → Direct Redirect
  const handleSearch = async (provider: typeof searchProviders[0]) => {
    try {
      let publicUrl = imageUrl;
      
      // If it's a data URL, upload to get public URL (like PHP move_uploaded_file)
      if (imageUrl.startsWith('data:')) {
        console.log('Uploading image to get public URL...');
        
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
          // Show error message to user about BLOB_READ_WRITE_TOKEN
          alert(`Upload failed: ${result.message}\n\nSolution: ${result.solution || 'Configure storage'}`);
          return;
        }
        
        publicUrl = result.publicUrl;
        console.log('Got public URL:', publicUrl);
      }
      
      // Direct redirect to search engines (like PHP header("Location: ..."))
      const encodedUrl = encodeURIComponent(publicUrl);
      let searchUrl: string;
      
      console.log('🔍 Search Debug Info:');
      console.log('- Original Public URL:', publicUrl);
      console.log('- URL Length:', publicUrl.length);
      console.log('- URL starts with https:', publicUrl.startsWith('https:'));
      console.log('- Is Blob URL:', publicUrl.includes('.vercel-storage.com'));
      console.log('- Encoded URL:', encodedUrl);
      console.log('- Provider:', provider.key);
      
      switch (provider.key) {
        case 'google':
          // Use Google Images upload page - more reliable for external URLs
          searchUrl = `https://images.google.com/searchbyimage?image_url=${encodedUrl}`;
          break;
        case 'google_lens':
          // Use Google Lens - often works better with external blob URLs
          searchUrl = `https://lens.google.com/uploadbyurl?url=${encodedUrl}`;
          break;
        case 'bing':
          searchUrl = `https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIVSP&q=imgurl:${encodedUrl}`;
          break;
        case 'yandex':
          searchUrl = `https://yandex.com/images/search?rpt=imageview&url=${encodedUrl}`;
          break;
        case 'tineye':
          searchUrl = `https://tineye.com/search?url=${encodedUrl}`;
          break;
        default:
          searchUrl = `https://images.google.com/searchbyimage?image_url=${encodedUrl}`;
      }
      
      console.log('Opening search URL:', searchUrl);
      
      // Test if the blob URL is accessible before redirecting
      if (publicUrl.includes('.vercel-storage.com')) {
        console.log('🧪 Testing blob URL accessibility...');
        
        try {
          const testResponse = await fetch(publicUrl, { method: 'HEAD' });
          console.log('✅ Blob URL test result:', {
            status: testResponse.status,
            headers: Object.fromEntries(testResponse.headers.entries()),
            accessible: testResponse.ok
          });
          
          if (!testResponse.ok) {
            console.warn('⚠️ Blob URL not accessible, this may cause Google redirect issues');
          }
        } catch (error) {
          console.error('❌ Blob URL test failed:', error);
        }
      }
      
      // Special handling for Google to avoid imghp?sbi=1 redirect
      if (provider.key === 'google' || provider.key === 'google_lens') {
        console.log('🔍 Using Google-specific approach...');
        
        // Try the modern approach first
        try {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = 'https://www.google.com/searchbyimage/upload';
          form.target = '_blank';
          
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'image_url';
          input.value = publicUrl;
          
          form.appendChild(input);
          document.body.appendChild(form);
          form.submit();
          document.body.removeChild(form);
          
          console.log('✅ Used POST method for Google search');
          return;
        } catch (error) {
          console.log('POST method failed, falling back to GET:', error);
        }
      }
      
      console.log('Opening:', searchUrl);
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
      
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to manual upload instructions
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
            '3. Click the upload button',
            '4. Select your downloaded image file'
          ],
          directUrl: 'https://lens.google.com'
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
            ? 'Upload an image or provide a public image URL to enable external search tools.'
            : imageUrl.includes('vsrid=')
              ? '🎯 SUCCESS! You have a Google vsrid URL - this contains your reverse search results (just like labnol.org generates)'
              : imageUrl.includes('test-urls') || imageUrl.includes('picsum.photos')
                ? '🧪 Development Mode: Using test image for reverse search demonstration (configure BLOB_READ_WRITE_TOKEN for real uploads)'
                : imageUrl.startsWith('http')
                  ? '🔗 Public URL detected: You can use direct search (faster) or manual upload (more private)'
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
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>📋 How it works:</strong> Each button below will:
              </p>
              <ul className="text-blue-800 dark:text-blue-200 text-sm mt-2 ml-4 list-disc space-y-1">
                <li>Show you step-by-step instructions for that search engine</li>
                <li>Automatically open the search engine website in a new tab</li>
                <li>Guide you through uploading your downloaded image file</li>
              </ul>
              <p className="text-blue-700 dark:text-blue-300 text-xs mt-3 font-medium">
                💡 Tip: Download your image first using the ⬇ button above, then click any search button for instructions.
              </p>
              
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                <button
                  onClick={() => setShowManualFallback(true)}
                  className="inline-flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Need help? View detailed manual upload guide
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {searchProviders.map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => handleSearch(provider)}
                  className={`
                    flex flex-col items-center gap-2 p-4 rounded-xl text-white font-medium
                    transition-all duration-200 hover:scale-105 hover:shadow-lg
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
                    min-h-touch ${provider.color}
                  `}
                  aria-label={`Get instructions for ${provider.name}`}
                >
                  <span className="text-2xl" role="img" aria-hidden="true">
                    {provider.icon}
                  </span>
                  <span className="text-sm text-center leading-tight">
                    {provider.name}
                  </span>
                  <span className="text-xs opacity-75">Search Now</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {searchProviders.map((provider) => (
              <button
                key={provider.name}
                onClick={() => handleSearch(provider)}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-xl text-white font-medium
                  transition-all duration-200 hover:scale-105 hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50
                  min-h-touch ${provider.color}
                `}
                aria-label={`Search on ${provider.name}`}
              >
                <span className="text-2xl" role="img" aria-hidden="true">
                  {provider.icon}
                </span>
                <span className="text-sm text-center leading-tight">
                  {provider.name}
                </span>
                <span className="text-xs opacity-75">Direct Search</span>
              </button>
            ))}
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

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
          How Reverse Search Works (Like labnol.org)
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• External tools search the web for visually similar images</li>
          <li>• Google Lens generates vsrid URLs like: https://www.google.com/search?vsrid=...</li>
          <li>• Multiple matches may indicate a widely distributed image</li>
          <li>• Original source and earliest publication date help verify authenticity</li>
          <li>• No matches don't guarantee authenticity - could be a new creation</li>
          <li>• Our method mimics labnol.org's approach for consistent results</li>
        </ul>
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