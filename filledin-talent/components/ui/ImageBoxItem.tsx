'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageBoxItemProps } from '@/types/ImageBox';
import { cn } from '@/lib/utils';
import { placeholderImages } from '@/lib/config/imageBoxConfig';

const ImageBoxItem: React.FC<ImageBoxItemProps> = ({
  data,
  showPlaceholder,
  className,
  onClick
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleClick = () => {
    if (onClick) {
      onClick(data);
    }
  };

  const shouldShowPlaceholder = !data.imageUrl || imageError;
  const displayImage = shouldShowPlaceholder 
    ? (showPlaceholder ? placeholderImages.default : null)
    : data.imageUrl;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 ease-in-out',
        'hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1',
        'cursor-pointer border border-gray-100',
        className
      )}
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative h-48 sm:h-52 md:h-56 lg:h-60 overflow-hidden">
        {displayImage ? (
          <>
            <Image
              src={displayImage}
              alt={data.title}
              fill
              className={cn(
                'object-cover transition-transform duration-500 ease-in-out',
                'group-hover:scale-110',
                imageLoading ? 'opacity-0' : 'opacity-100'
              )}
              onError={handleImageError}
              onLoad={handleImageLoad}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            
            {/* Loading overlay */}
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          /* Placeholder when no image */
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium">Image coming soon</p>
            </div>
          </div>
        )}
        
        {/* Category badge */}
        {data.category && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800 backdrop-blur-sm">
              {data.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {data.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
          {data.description}
        </p>
        
        {/* Read more indicator */}
        <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors duration-200">
          <span>Learn More</span>
          <svg 
            className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 border-2 border-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default ImageBoxItem;