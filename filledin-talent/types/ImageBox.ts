export interface ImageBoxData {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  category?: string;
}

export interface ImageBoxConfig {
  boxes: ImageBoxData[];
  layout: 'grid' | 'masonry' | 'flex';
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  spacing: 'sm' | 'md' | 'lg';
  showPlaceholder: boolean;
}

export interface ImageBoxProps {
  currentLanguage: string;
  config?: Partial<ImageBoxConfig>;
  className?: string;
}

export interface ImageBoxItemProps {
  data: ImageBoxData;
  showPlaceholder: boolean;
  className?: string;
  onClick?: (data: ImageBoxData) => void;
}