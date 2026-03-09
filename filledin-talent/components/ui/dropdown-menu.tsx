'use client';

import React, { useEffect, useRef, useState } from 'react';

interface DropdownMenuProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  animation?: 'fade' | 'slide' | 'scale';
}

/**
 * CSS-based dropdown menu animation (replaces framer-motion AnimatePresence)
 */
export function DropdownMenu({ isOpen, children, className = '', animation = 'fade' }: DropdownMenuProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200); // Match CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const getAnimationClass = () => {
    if (!isAnimating) return 'opacity-0 scale-95 -translate-y-2';
    switch (animation) {
      case 'slide':
        return 'opacity-100 translate-y-0';
      case 'scale':
        return 'opacity-100 scale-100';
      default:
        return 'opacity-100 translate-y-0 scale-100';
    }
  };

  return (
    <div
      ref={contentRef}
      className={`transition-all duration-200 ease-in-out ${getAnimationClass()} ${className}`}
    >
      {children}
    </div>
  );
}

interface CollapsibleMenuProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * CSS-based collapsible menu for mobile navigation
 */
export function CollapsibleMenu({ isOpen, children, className = '' }: CollapsibleMenuProps) {
  const contentRef = useRef<HTMLDivElement>(null);


  return (
    <div
      ref={contentRef}
      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ height: isOpen ? 'auto' : '0px' }}
    >
      {children}
    </div>
  );
}
