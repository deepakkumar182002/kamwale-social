"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface DropUpPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  minHeight?: number;
  maxHeight?: number;
}

const DropUpPanel = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  minHeight = 300,
  maxHeight = 600
}: DropUpPanelProps) => {
  const [height, setHeight] = useState(minHeight);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setHeight(minHeight);
    }
  }, [isOpen, minHeight]);

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startY.current = clientY;
    startHeight.current = height;
  };

  const handleDragMove = (e: TouchEvent | MouseEvent) => {
    if (!isDragging) return;
    
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
    const deltaY = startY.current - clientY;
    const newHeight = Math.min(Math.max(startHeight.current + deltaY, minHeight), maxHeight);
    setHeight(newHeight);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('touchend', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, height]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-40 transition-opacity lg:hidden"
        onClick={onClose}
      />

      {/* Drop-up Panel */}
      <div 
        className="fixed left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl z-50 transition-all duration-300 lg:hidden"
        style={{ 
          bottom: 56, // Above bottom nav (14 * 4 = 56px)
          height: `${height}px`
        }}
      >
        {/* Drag Handle */}
        <div 
          className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing border-b border-gray-200 dark:border-gray-800 relative"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {/* Drag indicator */}
          <div className="absolute top-2 w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          
          {/* Title and Controls */}
          <div className="flex items-center justify-between w-full px-4 mt-2">
            <h2 className="text-lg font-bold dark:text-white">{title}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHeight(height === maxHeight ? minHeight : maxHeight)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                {height === maxHeight ? (
                  <ChevronDown className="w-5 h-5 dark:text-white" />
                ) : (
                  <ChevronUp className="w-5 h-5 dark:text-white" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-60px)] scrollbar-hide">
          {children}
        </div>
      </div>
    </>
  );
};

export default DropUpPanel;
