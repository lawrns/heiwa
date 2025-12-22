import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface ScrollIndicatorProps {
  targetRef?: React.RefObject<HTMLElement>;
  onScrollComplete?: () => void;
  className?: string;
  text?: string;
}

export function ScrollIndicator({ 
  targetRef, 
  onScrollComplete, 
  className = '',
  text = 'Scroll for more'
}: ScrollIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScrollable = () => {
      const container = targetRef?.current || containerRef.current?.parentElement;
      if (!container) return;

      const isScrollable = container.scrollHeight > container.clientHeight;
      setIsVisible(isScrollable && !hasScrolled);
    };

    const handleScroll = () => {
      const container = targetRef?.current || containerRef.current?.parentElement;
      if (!container) return;

      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
      
      if (isAtBottom) {
        setHasScrolled(true);
        setIsVisible(false);
        onScrollComplete?.();
      } else if (hasScrolled) {
        setHasScrolled(false);
        setIsVisible(true);
      }
    };

    // Initial check
    checkScrollable();

    // Set up scroll listener
    const container = targetRef?.current || containerRef.current?.parentElement;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', checkScrollable);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', checkScrollable);
    };
  }, [targetRef, hasScrolled, onScrollComplete]);

  const handleScrollClick = () => {
    const container = targetRef?.current || containerRef.current?.parentElement;
    if (!container) return;

    const scrollTarget = container.scrollHeight - container.clientHeight;
    container.scrollTo({
      top: scrollTarget,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={containerRef}
      className={`
        flex flex-col items-center justify-center py-4 px-6
        bg-gradient-to-b from-transparent to-orange-50/30
        border-t border-orange-100/50
        cursor-pointer group
        transition-all duration-300 ease-out
        hover:bg-orange-50/50
        ${className}
      `}
      onClick={handleScrollClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleScrollClick();
        }
      }}
      aria-label="Scroll down to see more content"
    >
      <span className="text-sm text-[#ec681c] font-medium mb-2 group-hover:text-[#d65d16] motion-safe:transition-colors motion-reduce:transition-none">
        {text}
      </span>
      
      <div className="relative">
        <ChevronDown 
          size={20} 
          className="text-[#ec681c] animate-bounce group-hover:text-[#d65d16] motion-safe:transition-colors motion-reduce:transition-none" 
        />
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-[#ec681c]/20 rounded-full blur-md animate-pulse" />
      </div>

      {/* Hint text */}
      <span className="text-xs text-[#ec681c]/70 mt-2 group-hover:text-[#ec681c] motion-safe:transition-colors motion-reduce:transition-none">
        Click to scroll ↓
      </span>
    </div>
  );
}
