"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
  threshold?: number;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

type RefreshState = 'idle' | 'pulling' | 'ready' | 'loading' | 'complete';

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  isLoading = false,
  threshold = 80,
  disabled = false,
  className = '',
  children
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshState, setRefreshState] = useState<RefreshState>('idle');
  const [isActive, setIsActive] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);
  const rafId = useRef<number>();

  // Calculate progress based on pull distance
  const progress = Math.min(pullDistance / threshold, 1);
  const isReady = pullDistance >= threshold && refreshState === 'pulling';

  // Handle haptic feedback on supported devices
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  // Update pull distance with animation frame
  const updatePullDistance = useCallback((distance: number) => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    
    rafId.current = requestAnimationFrame(() => {
      setPullDistance(Math.max(0, Math.min(distance, threshold * 1.5)));
    });
  }, [threshold]);

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isLoading) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    startY.current = e.touches[0].clientY;
    isDragging.current = true;
    setIsActive(true);
    
    // Prevent scroll momentum
    document.body.style.overflow = 'hidden';
  }, [disabled, isLoading]);

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current || disabled || isLoading) return;

    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;

    if (deltaY > 0) {
      e.preventDefault();
      
      // Apply elastic resistance
      const elasticDistance = Math.pow(deltaY, 0.8);
      updatePullDistance(elasticDistance);
      
      const newState = elasticDistance >= threshold ? 'ready' : 'pulling';
      if (newState !== refreshState && refreshState !== 'loading') {
        setRefreshState(newState);
        
        // Trigger haptic feedback when reaching threshold
        if (newState === 'ready' && refreshState === 'pulling') {
          triggerHaptic('medium');
        }
      }
    }
  }, [disabled, isLoading, threshold, refreshState, updatePullDistance, triggerHaptic]);

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (!isDragging.current) return;

    isDragging.current = false;
    setIsActive(false);
    document.body.style.overflow = '';

    if (refreshState === 'ready' && pullDistance >= threshold) {
      setRefreshState('loading');
      triggerHaptic('heavy');
      
      try {
        await onRefresh();
        setRefreshState('complete');
        
        // Show completion state briefly
        setTimeout(() => {
          setRefreshState('idle');
          setPullDistance(0);
        }, 500);
      } catch (error) {
        setRefreshState('idle');
        setPullDistance(0);
      }
    } else {
      // Animate back to idle
      setRefreshState('idle');
      
      const animateBack = () => {
        setPullDistance(prev => {
          const newDistance = prev * 0.85;
          if (newDistance > 1) {
            requestAnimationFrame(animateBack);
            return newDistance;
          }
          return 0;
        });
      };
      
      requestAnimationFrame(animateBack);
    }
  }, [refreshState, pullDistance, threshold, onRefresh, triggerHaptic]);

  // Mouse event handlers for desktop testing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || isLoading) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    startY.current = e.clientY;
    isDragging.current = true;
    setIsActive(true);
    
    document.addEventListener('mousemove', handleMouseMove as any);
    document.addEventListener('mouseup', handleMouseUp);
  }, [disabled, isLoading]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || disabled || isLoading) return;

    currentY.current = e.clientY;
    const deltaY = currentY.current - startY.current;

    if (deltaY > 0) {
      e.preventDefault();
      
      const elasticDistance = Math.pow(deltaY, 0.8);
      updatePullDistance(elasticDistance);
      
      const newState = elasticDistance >= threshold ? 'ready' : 'pulling';
      if (newState !== refreshState && refreshState !== 'loading') {
        setRefreshState(newState);
      }
    }
  }, [disabled, isLoading, threshold, refreshState, updatePullDistance]);

  const handleMouseUp = useCallback(async () => {
    if (!isDragging.current) return;

    document.removeEventListener('mousemove', handleMouseMove as any);
    document.removeEventListener('mouseup', handleMouseUp);

    await handleTouchEnd();
  }, [handleMouseMove, handleTouchEnd]);

  // Keyboard support
  const handleKeyDown = useCallback(async (e: React.KeyboardEvent) => {
    if (disabled || isLoading) return;
    
    if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setRefreshState('loading');
      
      try {
        await onRefresh();
        setRefreshState('complete');
        setTimeout(() => setRefreshState('idle'), 500);
      } catch (error) {
        setRefreshState('idle');
      }
    }
  }, [disabled, isLoading, onRefresh]);

  // Set up touch event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Update state when external loading changes
  useEffect(() => {
    if (isLoading && refreshState === 'idle') {
      setRefreshState('loading');
    } else if (!isLoading && refreshState === 'loading') {
      setRefreshState('complete');
      setTimeout(() => {
        setRefreshState('idle');
        setPullDistance(0);
      }, 500);
    }
  }, [isLoading, refreshState]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  // Get display text based on state
  const getDisplayText = () => {
    switch (refreshState) {
      case 'pulling':
        return 'Pull down to refresh';
      case 'ready':
        return 'Release to refresh';
      case 'loading':
        return 'Refreshing...';
      case 'complete':
        return 'Refresh complete!';
      default:
        return '';
    }
  };

  // Get icon based on state
  const getIcon = () => {
    if (refreshState === 'loading') {
      return <Loader2 className="animate-spin" size={20} />;
    }
    
    return (
      <RotateCcw
        size={20}
        style={{
          transform: `rotate(${progress * 360}deg)`,
          transition: isActive ? 'none' : 'transform 0.3s ease-out'
        }}
      />
    );
  };

  const indicatorOpacity = refreshState === 'idle' ? progress : 1;
  const indicatorScale = refreshState === 'complete' ? 1.1 : 0.8 + (progress * 0.2);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto touch-pan-y ${className}`}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="main"
      aria-label="Pull to refresh container"
      style={{
        transform: refreshState === 'loading' || refreshState === 'complete' 
          ? `translateY(${Math.min(pullDistance, 60)}px)` 
          : `translateY(${pullDistance * 0.5}px)`,
        transition: isActive ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }}
    >
      {/* Pull-to-refresh indicator */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
        style={{
          transform: `translateX(-50%) translateY(${Math.max(-60, -60 + pullDistance)}px)`,
          opacity: indicatorOpacity,
          transition: isActive ? 'none' : 'opacity 0.2s ease-out, transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
        role="status"
        aria-live="polite"
        aria-label={getDisplayText()}
      >
        <div
          className="flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 p-4 min-w-[100px]"
          style={{
            transform: `scale(${indicatorScale})`,
            transition: isActive ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          {/* Circular progress indicator */}
          <div className="relative mb-2">
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-200"
              style={{
                background: `conic-gradient(#0C831F ${progress * 360}deg, transparent ${progress * 360}deg)`
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-primary">
              {getIcon()}
            </div>
          </div>
          
          {/* Status text */}
          <div className="text-xs font-medium text-gray-600 text-center whitespace-nowrap">
            {getDisplayText()}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Loading overlay */}
      {(refreshState === 'loading' || refreshState === 'complete') && (
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent z-50"
          style={{
            opacity: refreshState === 'loading' ? 1 : 0,
            transition: 'opacity 0.3s ease-out'
          }}
        />
      )}
    </div>
  );
};