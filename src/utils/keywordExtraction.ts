// src/utils/keywordExtraction.ts
export interface SearchKeywords {
  primary: string[];
  secondary: string[];
  suggestions: string[];
}

export const extractImageKeywords = (filename: string, size: { width?: number; height?: number } = {}): SearchKeywords => {
  const primary: string[] = [];
  const secondary: string[] = [];
  const suggestions: string[] = [];

  // Extract from filename
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '').toLowerCase();
  const filenameWords = nameWithoutExt
    .split(/[-_\s]+/)
    .filter(word => word.length > 2)
    .map(word => word.trim());

  // Common search optimization keywords
  const imageSearchKeywords = [
    'reverse image search',
    'find similar images',
    'image lookup',
    'photo search',
    'visual search',
    'duplicate image finder',
    'image source finder',
    'reverse photo search'
  ];

  const qualityKeywords = [
    'high resolution',
    'HD image',
    'high quality',
    'original image',
    'source image',
    'better quality'
  ];

  // Add filename-based keywords
  if (filenameWords.length > 0) {
    primary.push(...filenameWords.slice(0, 3));
    secondary.push(...filenameWords.slice(3));
  }

  // Add image size context
  if (size.width && size.height) {
    if (size.width > 1920 || size.height > 1080) {
      primary.push('high resolution', 'HD');
    }
    if (size.width > size.height) {
      secondary.push('landscape', 'wide image');
    } else if (size.height > size.width) {
      secondary.push('portrait', 'vertical image');
    } else {
      secondary.push('square image');
    }
  }

  // Add search optimization keywords
  suggestions.push(...imageSearchKeywords, ...qualityKeywords);

  return {
    primary: [...new Set(primary)].slice(0, 5),
    secondary: [...new Set(secondary)].slice(0, 8),
    suggestions: [...new Set(suggestions)].slice(0, 12)
  };
};

export const generateSearchQuery = (keywords: SearchKeywords, searchType: 'broad' | 'specific' = 'broad'): string => {
  if (searchType === 'specific') {
    return keywords.primary.slice(0, 3).join(' ');
  }
  
  return [...keywords.primary.slice(0, 2), ...keywords.secondary.slice(0, 1)].join(' ');
};

export const getSearchOptimizationTips = (): string[] => {
  return [
    "Use descriptive filenames for better search results",
    "High-resolution images typically yield more matches",
    "Try multiple search engines for comprehensive results",
    "Consider cropping to focus on main subject",
    "Remove watermarks if possible for better matching"
  ];
};