import React, { ReactNode } from 'react';

interface NotebookPageProps {
  children?: ReactNode;
  showTornEdge?: boolean;
  className?: string;
}

export default function NotebookPage({
  children,
  showTornEdge = true,
  className = '',
}: NotebookPageProps) {
  return (
    <div 
      className={`
        relative min-h-full w-full paper-texture
        ${showTornEdge ? 'torn-edge pb-12' : ''}
        transition-all duration-300
        ${className}
      `}
      style={{
        backgroundColor: 'var(--color-paper)',
      }}
    >
      {/* 1. Ruled Horizontal Lines */}
      <div className="absolute inset-0 ruled-lines opacity-85 pointer-events-none" />
      
      {/* 2. Red Vertical Margin Line */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-red-400/70 pointer-events-none"
        style={{ left: '48px' }}
      />

      {/* 3. Page Content (padded to clear the red margin line on the left) */}
      <div className="relative min-h-full w-full flex flex-col z-10 pl-16 pr-8 pt-8 pb-14 text-slate-800">
        {children}
      </div>
    </div>
  );
}
