'use client';

import { ReactNode } from 'react';
import { useParallax } from '@/lib/hooks/useParallax';

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  direction?: 'up' | 'down';
}

export default function ParallaxSection({ 
  children, 
  speed = 0.5, 
  className = '',
  direction = 'up' 
}: ParallaxSectionProps) {
  const offset = useParallax(speed);
  const transform = direction === 'up' ? -offset : offset;

  return (
    <div
      className={className}
      style={{
        transform: `translateY(${transform}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      {children}
    </div>
  );
}
