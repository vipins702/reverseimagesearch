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
    url: 'https://www.google.com/searchbyimage?image_url=',
    icon: '🔍',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    name: 'Google Lens',
    key: 'google_lens', 
    url: 'https://www.google.com/searchbyimage?image_url=',
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
    url: 'https://www.bing.com/images/search?q=imgurl:',
    icon: '🌐',
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    name: 'Yandex',
    key: 'yandex',
    url: 'https://yandex.com/images/search?url=',
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
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<typeof searchProviders[0] | null>(null);

  // Debug logging
  console.log('ReverseSearchButtons rendered with imageUrl:', imageUrl ? imageUrl.substring(0, 50) + '...' : 'null');

  const openExternalSearch = async (provider: typeof searchProviders[0]) => {
    console.log('openExternalSearch called:', { 
      providerName: provider.name, 
      imageUrl: imageUrl.substring(0, 50) + '...', 
      isDataUrl: imageUrl.startsWith('data:'),
      isVsridUrl: imageUrl.includes('vsrid='),
      isGoogleUrl: imageUrl.includes('google.com'),
      isPublicUrl: imageUrl.startsWith('http')
    });
    
    // If this is already a vsrid URL or Google search URL, open it directly
    if (imageUrl.includes('vsrid=') || imageUrl.includes('google.com/search')) {
      console.log('Opening vsrid URL directly');
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Check if it's a data URL (uploaded file) - use manual upload
    if (imageUrl.startsWith('data:')) {
      // For Google Images and Google Lens, we need to upload the image first
      if (provider.key === 'google' || provider.key === 'google_lens') {
        console.log('Data URL detected - using manual upload for', provider.name);
        await handleGoogleImageUpload(provider);
        return;
      }
      
      // For other providers, show modal instructions
      console.log('Showing modal for', provider.name);
      setSelectedProvider(provider);
      setShowInstructions(true);
      return;
    }
    
    // For public URLs (blob storage, test URLs, etc.) - use direct URL method (SAFER)
    if (imageUrl.startsWith('http')) {
      console.log('Public URL detected - using direct search method for', provider.name);
      
      // Show privacy notice for public URLs
      if (imageUrl.includes('blob.vercel-storage.com') || imageUrl.includes('picsum.photos')) {
        setSelectedProvider(provider);
        setShowPrivacyNotice(true);
        return;
      }
      
      // For test URLs, proceed directly
      await openDirectSearch(provider);
      return;
    }
    
    // Fallback to manual upload
    console.log('Using fallback manual upload for', provider.name);
    setSelectedProvider(provider);
    setShowInstructions(true);
  };

  const openDirectSearch = async (provider: typeof searchProviders[0]) => {
    console.log('Opening direct search for', provider.name, 'with URL:', imageUrl);
    
    // CRITICAL: Always use encodeURIComponent for proper URL encoding
    const encodedUrl = encodeURIComponent(imageUrl);
    console.log('Encoded URL:', encodedUrl);
    
    let searchUrl: string;
    
    // Use the correct URL patterns for direct public URL search
    switch (provider.key) {
      case 'google':
      case 'google_lens':
        // Google Images searchbyimage endpoint - this generates vsrid URLs
        searchUrl = `https://www.google.com/searchbyimage?image_url=${encodedUrl}`;
        break;
      case 'tineye':
        // TinEye direct URL parameter
        searchUrl = `https://tineye.com/search?url=${encodedUrl}`;
        break;
      case 'bing':
        // Bing Visual Search with imgurl parameter
        searchUrl = `https://www.bing.com/images/search?q=imgurl:${encodedUrl}&view=detailv2`;
        break;
      case 'yandex':
        // Yandex Images with URL parameter
        searchUrl = `https://yandex.com/images/search?url=${encodedUrl}`;
        break;
      default:
        // Fallback for any other providers
        searchUrl = provider.url + encodedUrl;
    }
    
    console.log('Final search URL:', searchUrl);
    
    // Open in new tab with proper security
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  const handleGoogleImageUpload = async (provider: typeof searchProviders[0]) => {
    try {
      console.log('Starting Google image search process for', provider.name);
      
      // Check if imageUrl is already a Google search URL (don't process these)
      if (imageUrl.includes('google.com/search') || imageUrl.includes('lens.google.com')) {
        console.log('Detected Google search URL - redirecting directly');
        window.open(imageUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      
      // RECOMMENDED APPROACH: Upload to server → get public URL → use Google searchbyimage?image_url=
      // This is much more reliable than trying to upload directly to Google
      
      console.log('Uploading image to server for public URL...');
      
      // Upload image to our server to get a public URL
      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: imageUrl, // Can be data URL or public URL
          filename: `google-search-${Date.now()}.jpg`
        })
      });
      
      // Defensive: try to read text first for clearer errors on 4xx/5xx
      const rawText = await uploadResponse.text();
      let uploadResult: any = null;
      try {
        uploadResult = rawText ? JSON.parse(rawText) : null;
      } catch (e) {
        console.error('Upload JSON parse failed. Raw response:', rawText);
        throw new Error(`Upload responded with non-JSON. Status=${uploadResponse.status}`);
      }
      
      if (!uploadResponse.ok || !uploadResult) {
        console.error('Upload failed response:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          body: uploadResult
        });
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }
      
      console.log('Upload result (parsed):', uploadResult);
      
      if (!uploadResult.success || !uploadResult.publicUrl) {
        throw new Error('Failed to get public URL from upload');
      }
      
      const publicUrl = uploadResult.publicUrl;
      console.log('Got public URL:', publicUrl);

      // STABLE & RELIABLE APPROACH: Use searchbyimage with the public URL.
      // This is the method you recommended, and it is the most robust.
      const searchUrl = `https://www.google.com/searchbyimage?image_url=${encodeURIComponent(publicUrl)}`;
      
      console.log('Opening stable Google search URL:', searchUrl);
      
      // Open the constructed URL. Google will handle the rest.
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
      
      console.log('Google search opened with stable public URL method.');
      return;
      
    } catch (error) {
      console.error('Google search with public URL failed:', error);
      
      // Fallback to manual upload with auto-download
      console.log('Falling back to manual upload method...');
      
      try {
        // Convert image URL to blob for download
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        // Create download for user
        const downloadUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = 'search-image.jpg';
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up the blob URL
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        
        // Use standard Google search URLs
        let targetUrl: string;
        if (provider.key === 'google_lens') {
          targetUrl = 'https://lens.google.com/';
        } else {
          targetUrl = 'https://www.google.com/imghp';
        }
        
        // Show instructions modal with auto-download notification
        setSelectedProvider({
          ...provider,
          autoDownloaded: true,
          labnolStyle: true,
          fallbackReason: 'Public URL method failed - using manual upload fallback'
        } as any);
        setShowInstructions(true);
        
        // Open Google in new tab
        setTimeout(() => {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        }, 500);
        
        console.log('Image auto-downloaded and Google page opened - manual upload fallback');
        
      } catch (downloadError) {
        console.error('Fallback download also failed:', downloadError);
        // Show manual fallback as last resort
        setShowManualFallback(true);
      }
    }
  };

  const getDetailedInstructions = (provider: typeof searchProviders[0]) => {
    const isAutoDownloaded = (provider as any).autoDownloaded;
    
    switch (provider.key) {
      case 'google':
        return {
          steps: isAutoDownloaded ? [
            '1. ✅ Your image has been downloaded automatically as "search-image.jpg"',
            '2. 🌐 Google Images is opening in a new tab...',
            '3. 📷 Click the camera icon in the search bar',
            '4. � Choose "Upload an image" and select the downloaded file'
          ] : [
            '1. �📥 Download the image using the ⬇ button above',
            '2. 🌐 Go to images.google.com (opening now...)',
            '3. 📷 Click the camera icon in the search bar',
            '4. 📁 Choose "Upload an image" and select your downloaded file'
          ],
          tip: 'Google Images provides comprehensive reverse search results. When uploaded directly to Google, you get URLs with vsrid parameters like labnol.org!',
          directUrl: 'https://images.google.com'
        };
      case 'google_lens':
        return {
          steps: isAutoDownloaded ? [
            '1. ✅ Your image has been downloaded automatically as "search-image.jpg"',
            '2. 🌐 Google Lens is opening in a new tab...',
            '3. 📤 Click the upload button or drag your image',
            '4. 📁 Select the downloaded image file'
          ] : [
            '1. 📥 Download the image using the ⬇ button above',
            '2. 🌐 Go to lens.google.com (opening now...)',
            '3. 📤 Click the upload button or drag your image',
            '4. 📁 Select your downloaded image file'
          ],
          tip: 'Google Lens generates vsrid URLs just like labnol.org when you upload images directly. Perfect for detailed visual analysis!',
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
                <span className="text-xs opacity-75">
                  {imageUrl.startsWith('http') ? 'Direct Search' : <ExternalLink className="w-4 h-4" />}
                </span>
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

      {/* Privacy Notice Modal */}
      {showPrivacyNotice && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Privacy Notice
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                <p className="text-orange-800 dark:text-orange-200 text-sm">
                  <strong>🔒 Your Image Privacy:</strong> Using direct URL search will send your hosted image URL to {selectedProvider.name}.
                </p>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <strong>What happens:</strong> {selectedProvider.name} will access your image from our secure cloud storage to perform reverse search.
                </p>
                <p>
                  <strong>Alternative:</strong> You can download the image and upload manually for complete privacy control.
                </p>
                <p>
                  <strong>Our commitment:</strong> Images are auto-deleted from cloud storage within hours and include noindex headers.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPrivacyNotice(false);
                    openDirectSearch(selectedProvider);
                  }}
                  className="flex-1 btn-primary"
                >
                  Proceed with Direct Search
                </button>
                <button
                  onClick={() => {
                    setShowPrivacyNotice(false);
                    handleGoogleImageUpload(selectedProvider);
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Use Manual Upload
                </button>
              </div>
              
              <button
                onClick={() => setShowPrivacyNotice(false)}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
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