// src/components/ReverseSearchButtons.tsx
import { useState } from 'react';
import { ExternalLink, Copy, Search, Download, X } from 'lucide-react';

interface ReverseSearchButtonsProps {
  imageUrl: string;
  onApiSearch?: () => void;
  isApiAvailable?: boolean;
}

const searchProviders = [
  {
    name: 'Google Images',
    key: 'google',
    url: 'https://www.google.com/searchbyimage?image_url=',
    icon: '🔍',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    name: 'Google Lens',
    key: 'google_lens',
    url: 'https://lens.google.com/uploadbyurl?url=',
    icon: '📷',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    name: 'TinEye',
    key: 'tineye',
    url: 'https://tineye.com/search?url=',
    icon: '🔎',
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    name: 'Bing Visual',
    key: 'bing',
    url: 'https://www.bing.com/images/search?view=detailv2&iss=1&FORM=IRSBIQ&cbir=sbi&imgurl=',
    icon: '🌐',
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    name: 'Yandex',
    key: 'yandex',
    url: 'https://yandex.com/images/search?rpt=imageview&url=',
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
  const [selectedProvider, setSelectedProvider] = useState<typeof searchProviders[0] | null>(null);

  const openExternalSearch = async (provider: typeof searchProviders[0]) => {
    // Check if it's a data URL (uploaded file)
    if (imageUrl.startsWith('data:')) {
      // For data URLs, show modal instructions since external search engines 
      // cannot access base64 data directly
      setSelectedProvider(provider);
      setShowInstructions(true);
      return;
    }
    
    // For public URLs, open search engine directly
    const encodedUrl = encodeURIComponent(imageUrl);
    const searchUrl = provider.url + encodedUrl;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  const getDetailedInstructions = (provider: typeof searchProviders[0]) => {
    switch (provider.key) {
      case 'google':
        return {
          steps: [
            '1. 📥 Download the image using the ⬇ button above',
            '2. 🌐 Go to images.google.com (opening now...)',
            '3. 📷 Click the camera icon in the search bar',
            '4. 📁 Choose "Upload an image" and select your downloaded file'
          ],
          tip: 'Google Images provides comprehensive reverse search results.',
          directUrl: 'https://images.google.com'
        };
      case 'google_lens':
        return {
          steps: [
            '1. 📥 Download the image using the ⬇ button above',
            '2. 🌐 Go to lens.google.com (opening now...)',
            '3. 📤 Click the upload button or drag your image',
            '4. 📁 Select your downloaded image file'
          ],
          tip: 'Google Lens can identify objects, text, and provide contextual information.',
          directUrl: 'https://lens.google.com'
        };
      case 'bing':
        return {
          steps: [
            '1. 📥 Download the image using the ⬇ button above',
            '2. 🌐 Go to bing.com/visualsearch (opening now...)',
            '3. 📤 Click "Browse" or drag your image to the upload area',
            '4. 📁 Select your downloaded image file'
          ],
          tip: 'Bing Visual Search excels at product identification and shopping results.',
          directUrl: 'https://www.bing.com/visualsearch'
        };
      case 'yandex':
        return {
          steps: [
            '1. 📥 Download the image using the ⬇ button above',
            '2. 🌐 Go to yandex.com/images (opening now...)',
            '3. 📷 Click the camera icon in the search bar',
            '4. 📁 Choose "Select file" and upload your downloaded image'
          ],
          tip: 'Yandex often finds unique results not available on other search engines.',
          directUrl: 'https://yandex.com/images'
        };
      case 'tineye':
        return {
          steps: [
            '1. 📥 Download the image using the ⬇ button above',
            '2. 🌐 Go to tineye.com (opening now...)',
            '3. 📤 Click "Upload" button',
            '4. 📁 Select your downloaded image file'
          ],
          tip: 'TinEye specializes in finding exact matches and tracking image origins.',
          directUrl: 'https://tineye.com'
        };
      default:
        return {
          steps: [
            '1. 📥 Download the image using the ⬇ button above',
            '2. 🌐 Visit the search engine website',
            '3. 📤 Look for an image upload or camera icon',
            '4. 📁 Upload your downloaded image file'
          ],
          tip: 'Each search engine may have different upload methods.',
          directUrl: 'https://google.com'
        };
    }
  };

  const copyImageUrl = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      // You could add a toast notification here
      console.log('Image URL copied to clipboard');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const downloadImage = () => {
    if (imageUrl.startsWith('data:')) {
      // Create download link for data URL
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For regular URLs, open in new tab (browser will handle download)
      window.open(imageUrl, '_blank');
    }
  };

  const isValidUrl = imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('https'));
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
          Open image in external search engines to find similar or identical images
        </p>

        {(!isValidUrl && !isDataUrl) ? (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Upload an image or provide a public image URL to enable external search tools.
            </p>
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
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {searchProviders.map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => openExternalSearch(provider)}
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
                  <span className="text-xs opacity-75">Get Instructions</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {searchProviders.map((provider) => (
              <button
                key={provider.name}
                onClick={() => openExternalSearch(provider)}
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
                <ExternalLink className="w-4 h-4 opacity-75" />
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
          How Reverse Search Works
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• External tools search the web for visually similar images</li>
          <li>• Multiple matches may indicate a widely distributed image</li>
          <li>• Original source and earliest publication date help verify authenticity</li>
          <li>• No matches don't guarantee authenticity - could be a new creation</li>
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
                const instructions = getDetailedInstructions(selectedProvider);
                return (
                  <div className="space-y-4">
                    <ol className="space-y-3">
                      {instructions.steps.map((step, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">{step.replace(/^\d+\.\s*/, '')}</span>
                        </li>
                      ))}
                    </ol>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        <strong>💡 Tip:</strong> {instructions.tip}
                      </p>
                    </div>
                    
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
    </div>
  );
}