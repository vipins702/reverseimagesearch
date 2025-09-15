// src/components/ResultCard.tsx
import React from 'react';
import { Save, Share, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

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

interface ResultCardProps {
  result: AnalysisResult;
  onSave?: () => void;
  onShare?: () => void;
  onReport?: () => void;
  onViewDetails?: () => void;
}

export default function ResultCard({ 
  result, 
  onSave, 
  onShare, 
  onReport, 
  onViewDetails 
}: ResultCardProps) {
  // Calculate confidence ring animation
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (circumference * result.confidence) / 100;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-primary-600';
    if (confidence >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircle className="w-6 h-6 text-primary-600" />;
    if (confidence >= 50) return <Clock className="w-6 h-6 text-amber-600" />;
    return <AlertTriangle className="w-6 h-6 text-red-600" />;
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'Likely Authentic';
    if (confidence >= 50) return 'Needs Review';
    return 'Suspicious';
  };

  const getRecommendation = (confidence: number) => {
    if (confidence >= 80) {
      return 'Image shows strong indicators of authenticity. Multiple verification methods suggest this is likely an original, unmanipulated image.';
    }
    if (confidence >= 50) {
      return 'Mixed signals detected. Some indicators suggest manipulation while others support authenticity. Manual review recommended.';
    }
    return 'Multiple indicators suggest this image may have been manipulated. Further investigation strongly recommended before use.';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Authenticity Analysis Results
          </h2>
          <div className="flex items-center gap-2">
            {getConfidenceIcon(result.confidence)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Confidence Ring */}
        <div className="text-center mb-8">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={getConfidenceColor(result.confidence)}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transition: 'stroke-dashoffset 2s ease-in-out 0.5s'
                }}
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getConfidenceColor(result.confidence)}`}>
                  {result.confidence}%
                </div>
                <div className="text-sm text-gray-500 font-medium">confidence</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className={`text-xl font-bold ${getConfidenceColor(result.confidence)}`}>
              {getConfidenceLabel(result.confidence)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              {getRecommendation(result.confidence)}
            </p>
          </div>
        </div>

        {/* Breakdown Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* AI Detection */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                AI Detection
              </h4>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
              {Math.round(result.modelScore * 100)}%
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Deep learning analysis score
            </p>
          </div>

          {/* Forensic Analysis */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                Forensics
              </h4>
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
              {result.forensic.clones.length === 0 ? '✓' : `${result.forensic.clones.length} flags`}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              {result.forensic.clones.length === 0 ? 'No issues detected' : 'Clone regions found'}
            </p>
          </div>

          {/* Reverse Search */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-green-900 dark:text-green-200">
                Reverse Search
              </h4>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
              {result.reverseMatches.length}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              Similar images found
            </p>
          </div>
        </div>

        {/* Confidence Calculation Explanation */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            How Confidence is Calculated
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Our confidence score combines multiple analysis methods:
          </p>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>• AI Detection Model</span>
              <span className="font-medium">40% weight</span>
            </div>
            <div className="flex justify-between">
              <span>• Forensic Analysis (ELA, clones)</span>
              <span className="font-medium">35% weight</span>
            </div>
            <div className="flex justify-between">
              <span>• Reverse Search Results</span>
              <span className="font-medium">25% weight</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                Important Disclaimer
              </h4>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                This analysis is <strong>advisory only — not definitive proof</strong> of authenticity. 
                Results should be considered alongside other verification methods and expert analysis 
                when making important decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="btn-primary flex-1 sm:flex-none min-w-[120px]"
            >
              View Details
            </button>
          )}
          
          {onSave && (
            <button
              onClick={onSave}
              className="btn-secondary inline-flex items-center gap-2 flex-1 sm:flex-none min-w-[120px] justify-center"
            >
              <Save className="w-4 h-4" />
              Save Report
            </button>
          )}
          
          {onShare && (
            <button
              onClick={onShare}
              className="btn-secondary inline-flex items-center gap-2 flex-1 sm:flex-none min-w-[120px] justify-center"
            >
              <Share className="w-4 h-4" />
              Share
            </button>
          )}
          
          {onReport && (
            <button
              onClick={onReport}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Report Issue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}