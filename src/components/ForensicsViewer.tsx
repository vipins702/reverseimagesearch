// src/components/ForensicsViewer.tsx
import { useState } from 'react';
import { Eye, EyeOff, ZoomIn, Info, MapPin } from 'lucide-react';

interface CloneRegion {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ForensicsData {
  elaImageUrl: string;
  clones: CloneRegion[];
  metadata: Record<string, any>;
}

interface ForensicsViewerProps {
  originalImageUrl: string;
  forensicsData: ForensicsData;
}

export default function ForensicsViewer({ 
  originalImageUrl, 
  forensicsData 
}: ForensicsViewerProps) {
  const [showElaOverlay, setShowElaOverlay] = useState(false);
  const [selectedClone, setSelectedClone] = useState<number | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);

  const formatMetadataValue = (key: string, value: any) => {
    if (key === 'timestamp' && typeof value === 'string') {
      return new Date(value).toLocaleString();
    }
    if (key === 'gps' && typeof value === 'object' && value.lat && value.lng) {
      return `${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}`;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const getMetadataIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case 'gps':
      case 'location':
        return <MapPin className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Level Analysis */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Error Level Analysis (ELA)
          </h3>
          <button
            onClick={() => setShowElaOverlay(!showElaOverlay)}
            className={`
              inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              ${showElaOverlay 
                ? 'bg-primary-100 text-primary-700 hover:bg-primary-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {showElaOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showElaOverlay ? 'Hide ELA' : 'Show ELA'}
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Highlights areas with different compression levels that may indicate manipulation
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Original Image */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Original Image
              </h4>
              <div className="relative group">
                <img
                  src={originalImageUrl}
                  alt="Original image"
                  className="w-full h-auto rounded-lg bg-gray-100"
                />
                {showElaOverlay && (
                  <img
                    src={forensicsData.elaImageUrl}
                    alt="ELA overlay"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-70 mix-blend-multiply"
                  />
                )}
              </div>
            </div>

            {/* ELA Analysis */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                ELA Analysis
              </h4>
              <img
                src={forensicsData.elaImageUrl}
                alt="Error Level Analysis"
                className="w-full h-auto rounded-lg bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-2">
                Bright areas indicate potential manipulation. Uniform darkness suggests authenticity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clone Detection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Clone Detection
        </h3>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Identifies copy-paste regions that may indicate digital manipulation
        </p>

        {forensicsData.clones.length === 0 ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200 text-sm">
              ✓ No clone regions detected - good sign for authenticity
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-4">
              <div className="relative">
                <img
                  src={originalImageUrl}
                  alt="Image with clone detection overlays"
                  className="w-full h-auto rounded-lg"
                />
                
                {/* Clone Region Overlays */}
                {forensicsData.clones.map((clone, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedClone(selectedClone === index ? null : index)}
                    className={`
                      absolute border-2 rounded transition-all
                      ${selectedClone === index 
                        ? 'border-red-500 bg-red-500/20' 
                        : 'border-red-400 bg-red-400/10 hover:bg-red-400/20'
                      }
                    `}
                    style={{
                      left: `${(clone.x / 400) * 100}%`, // Assuming 400px reference width
                      top: `${(clone.y / 300) * 100}%`,  // Assuming 300px reference height
                      width: `${(clone.w / 400) * 100}%`,
                      height: `${(clone.h / 300) * 100}%`,
                      minWidth: '44px',
                      minHeight: '44px'
                    }}
                    aria-label={`Clone region ${index + 1}`}
                  >
                    <span className="absolute -top-6 -left-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                      {index + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clone Details */}
            <div className="grid gap-3">
              {forensicsData.clones.map((clone, index) => (
                <div
                  key={index}
                  className={`
                    p-4 rounded-lg border transition-all cursor-pointer
                    ${selectedClone === index
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
                      : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setSelectedClone(selectedClone === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-red-500 text-white text-sm font-medium rounded-full flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Clone Region {index + 1}
                        </p>
                        <p className="text-xs text-gray-500">
                          Position: ({clone.x}, {clone.y}) • Size: {clone.w}×{clone.h}px
                        </p>
                      </div>
                    </div>
                    <ZoomIn className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                <strong>Found {forensicsData.clones.length} clone region{forensicsData.clones.length !== 1 ? 's' : ''}:</strong> 
                {' '}This suggests potential copy-paste manipulation. Click regions above to examine details.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Image Metadata */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Image Metadata (EXIF)
          </h3>
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {showMetadata ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {Object.keys(forensicsData.metadata).length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No metadata found - this could indicate the image was processed or edited
            </p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {forensicsData.metadata.camera && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 mb-1">Camera</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {forensicsData.metadata.camera}
                  </div>
                </div>
              )}
              {forensicsData.metadata.timestamp && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 mb-1">Timestamp</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatMetadataValue('timestamp', forensicsData.metadata.timestamp)}
                  </div>
                </div>
              )}
              {forensicsData.metadata.gps && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 mb-1">Location</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatMetadataValue('gps', forensicsData.metadata.gps)}
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Metadata */}
            {showMetadata && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-4 space-y-3">
                  {Object.entries(forensicsData.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="text-gray-400 mt-0.5">
                        {getMetadataIcon(key)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all">
                          {formatMetadataValue(key, value)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}