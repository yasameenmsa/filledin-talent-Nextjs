'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  once?: boolean;
}

/**
 * Lightweight alternative to framer-motion for scroll animations
 * Uses Intersection Observer API for better performance
 */
export function AnimateOnScroll({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.6,
  once = true,
}: AnimateOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [once]);

  const getTransform = () => {
    if (isVisible) return 'translate3d(0, 0, 0)';

    switch (direction) {
      case 'up':
        return 'translate3d(0, 50px, 0)';
      case 'down':
        return 'translate3d(0, -50px, 0)';
      case 'left':
        return 'translate3d(50px, 0, 0)';
      case 'right':
        return 'translate3d(-50px, 0, 0)';
      case 'none':
        return 'translate3d(0, 0, 0)';
      default:
        return 'translate3d(0, 50px, 0)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Fade animation component
 */
export function FadeIn({ children, className = '', delay = 0, duration = 0.5, once = true }: Omit<AnimateOnScrollProps, 'direction'>) {
  return (
    <AnimateOnScroll className={className} delay={delay} direction="none" duration={duration} once={once}>
      {children}
    </AnimateOnScroll>
  );
}

/**
 * Slide up animation component (most common)
 */
export function SlideUp({ children, className = '', delay = 0, duration = 0.6, once = true }: Omit<AnimateOnScrollProps, 'direction'>) {
  return (
    <AnimateOnScroll className={className} delay={delay} direction="up" duration={duration} once={once}>
      {children}
    </AnimateOnScroll>
  );
}
