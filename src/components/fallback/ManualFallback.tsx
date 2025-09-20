import React from 'react';
import { Download, ExternalLink, AlertTriangle } from 'lucide-react';

interface ManualFallbackProps {
  imageUrl: string;
  onClose: () => void;
}

const ManualFallback: React.FC<ManualFallbackProps> = ({ imageUrl, onClose }) => {
  const downloadImage = () => {
    if (imageUrl.startsWith('data:')) {
      // Create download link for data URL
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `reverse-search-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For regular URLs, open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const searchEngineInstructions = [
    {
      name: 'Google Images',
      url: 'https://images.google.com',
      steps: [
        'Go to images.google.com',
        'Click the camera icon in the search bar',
        'Click "Upload an image"',
        'Select your downloaded image file'
      ]
    },
    {
      name: 'TinEye',
      url: 'https://tineye.com',
      steps: [
        'Go to tineye.com',
        'Click the "Upload" button',
        'Select your downloaded image file',
        'Wait for search results'
      ]
    },
    {
      name: 'Yandex Images',
      url: 'https://yandex.com/images',
      steps: [
        'Go to yandex.com/images',
        'Click the camera icon',
        'Click "Select file"',
        'Upload your downloaded image'
      ]
    },
    {
      name: 'Bing Visual Search',
      url: 'https://www.bing.com/visualsearch',
      steps: [
        'Go to bing.com/visualsearch',
        'Click "Browse" or drag image',
        'Select your downloaded image file',
        'View search results'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Manual Upload Instructions
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              📋 Why Manual Upload?
            </h3>
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              If direct URL search fails, manual upload is always reliable. This method works 100% of the time.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Step 1: Download Your Image
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Save the image to your computer first
                </p>
              </div>
              <button
                onClick={downloadImage}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Image
              </button>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Step 2: Choose a Search Engine
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchEngineInstructions.map((engine, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {engine.name}
                      </h4>
                      <a
                        href={engine.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title={`Open ${engine.name}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <ol className="space-y-1">
                      {engine.steps.map((step, stepIndex) => (
                        <li
                          key={stepIndex}
                          className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                        >
                          <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                            {stepIndex + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">
              💡 Pro Tips
            </h3>
            <ul className="text-green-800 dark:text-green-300 text-sm space-y-1">
              <li>• Try multiple search engines for comprehensive results</li>
              <li>• Look for earliest publication dates to find original source</li>
              <li>• Multiple matches may indicate wide distribution</li>
              <li>• No matches don't guarantee authenticity</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={downloadImage}
              className="flex-1 btn-primary inline-flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download & Start Manual Search
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualFallback;