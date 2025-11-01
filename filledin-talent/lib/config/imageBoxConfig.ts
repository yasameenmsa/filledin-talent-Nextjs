import { ImageBoxConfig } from '@/types/ImageBox';

// Default configuration for image boxes
export const defaultImageBoxConfig: ImageBoxConfig = {
  boxes: [
    {
      id: 'hrTrends',
      title: '', // Will be populated from translations
      description: '', // Will be populated from translations
      imageUrl: '', // Can be updated dynamically
      category: 'hr'
    },
    {
      id: 'aiTalent',
      title: '', // Will be populated from translations
      description: '', // Will be populated from translations
      imageUrl: '', // Can be updated dynamically
      category: 'technology'
    },
    {
      id: 'industryTrends',
      title: '', // Will be populated from translations
      description: '', // Will be populated from translations
      imageUrl: '', // Can be updated dynamically
      category: 'industry'
    }
  ],
  layout: 'grid',
  columns: {
    mobile: 1,
    tablet: 2,
    desktop: 3
  },
  spacing: 'md',
  showPlaceholder: true
};

// Image URLs configuration - can be easily updated without code changes
export const imageUrls = {
  hrTrends: '/images/hr-trends.jpg',
  aiTalent: '/images/ai-talent.jpg',
  industryTrends: '/images/industry-trends.jpg'
};

// Placeholder images for when main images are not available
export const placeholderImages = {
  hrTrends: '/images/placeholders/hr-placeholder.svg',
  aiTalent: '/images/placeholders/ai-placeholder.svg',
  industryTrends: '/images/placeholders/industry-placeholder.svg',
  default: '/images/placeholders/default-placeholder.svg'
};

// Function to get image URL with fallback
export const getImageUrl = (boxId: string): string => {
  return imageUrls[boxId as keyof typeof imageUrls] || placeholderImages.default;
};

// Function to update image URLs dynamically
export const updateImageUrls = (newUrls: Partial<typeof imageUrls>) => {
  Object.assign(imageUrls, newUrls);
};

// Responsive breakpoints
export const breakpoints = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)'
};