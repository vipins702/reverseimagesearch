// src/components/ReverseSearchButtons.tsx
import React from 'react';
import { ExternalLink, Copy, Search, Download } from 'lucide-react';

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
    icon: '�️',
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    name: 'TinEye',
    key: 'tineye',
    url: 'https://tineye.com/search?url=',
    icon: '�',
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
  const openExternalSearch = async (provider: typeof searchProviders[0]) => {
    // Check if it's a data URL (uploaded file)
    if (imageUrl.startsWith('data:')) {
      try {
        // Upload image to backend and get public URL
        const publicUrl = await uploadImageForSearch(imageUrl);
        const encodedUrl = encodeURIComponent(publicUrl);
        const searchUrl = provider.url + encodedUrl;
        window.open(searchUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
        // Fallback to manual instructions
        showManualInstructions(provider);
      }
      return;
    }
    
    // For public URLs, use directly
    const encodedUrl = encodeURIComponent(imageUrl);
    const searchUrl = provider.url + encodedUrl;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  const uploadImageForSearch = async (dataUrl: string): Promise<string> => {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      
      // Upload to backend endpoint
      const uploadResponse = await fetch('/api/upload-for-search', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await uploadResponse.json();
      return result.publicUrl;
    } catch (error) {
      console.error('Failed to upload image for search:', error);
      throw error;
    }
  };

  const showManualInstructions = (provider: typeof searchProviders[0]) => {
    const message = `To search with ${provider.name}:

1. Click the download button (⬇) above to save the image
2. Go to ${getSearchEngineUrl(provider.key)}
3. Upload the downloaded image file

This is required because the image needs to be publicly accessible for external search engines.`;
    
    alert(message);
  };

  const getSearchEngineUrl = (engineKey: string): string => {
    switch (engineKey) {
      case 'google':
        return 'https://images.google.com (click camera icon)';
      case 'google_lens':
        return 'https://lens.google.com';
      case 'bing':
        return 'https://www.bing.com/visualsearch';
      case 'yandex':
        return 'https://yandex.com/images';
      case 'tineye':
        return 'https://tineye.com';
      default:
        return 'the search engine website';
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
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                <strong>External Search Instructions:</strong> Search engines cannot access uploaded files directly.
              </p>
              <ul className="text-amber-800 dark:text-amber-200 text-sm mt-2 ml-4 list-disc space-y-1">
                <li>Click the download button (⬇) above to save your image</li>
                <li>Click any search button below for step-by-step instructions</li>
                <li>Or use the API search option at the bottom for automated results</li>
              </ul>
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
                  <span className="text-xs opacity-75">Instructions</span>
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
    </div>
  );
}