
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
  visible: boolean;
  progress?: number;
  className?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ visible, progress = 0, className }) => {
  if (!visible) return null;
  
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 transition-opacity duration-300", 
      visible ? "opacity-100" : "opacity-0", 
      className
    )}>
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-primary transition-all duration-700 ease-in-out"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            r="48"
            cx="50"
            cy="50"
            style={{
              strokeDasharray: 300,
              strokeDashoffset: 300 - (progress * 300) / 100,
              transformOrigin: 'center',
              transform: 'rotate(-90deg)'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <h4 className="text-lg font-medium animate-pulse">Crawling in progress</h4>
        <p className="mt-2 text-sm text-muted-foreground">Discovering and collecting images...</p>
      </div>
      
      <div className="mt-4 flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className="w-2 h-2 rounded-full bg-primary animate-pulse-slow"
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingAnimation;
