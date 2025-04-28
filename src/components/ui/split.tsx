
import React, { useEffect, useRef, useState } from 'react';
import SplitHandle from '../ftp-explorer/SplitHandle';

interface SplitProps {
  children: React.ReactNode[];
  direction?: 'horizontal' | 'vertical';
  sizes?: number[];
  minSize?: number;
  className?: string;
}

export const Split: React.FC<SplitProps> = ({
  children,
  direction = 'vertical',
  sizes = [50, 50],
  minSize = 100,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [splitSizes, setSplitSizes] = useState<number[]>(sizes);
  const [dragging, setDragging] = useState(false);
  const [initialPos, setInitialPos] = useState(0);
  const [initialSizes, setInitialSizes] = useState<number[]>([]);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (!dragging) {
        updateChildrenSizes();
      }
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [containerRef.current, splitSizes]);
  
  const updateChildrenSizes = () => {
    if (!containerRef.current || !children || children.length !== 2) return;
    
    const containerSize = direction === 'vertical'
      ? containerRef.current.clientHeight
      : containerRef.current.clientWidth;
    
    const pane1 = containerRef.current.children[0] as HTMLElement;
    const pane2 = containerRef.current.children[2] as HTMLElement;
    
    if (pane1 && pane2) {
      if (direction === 'vertical') {
        pane1.style.height = `${splitSizes[0]}%`;
        pane2.style.height = `${splitSizes[1]}%`;
      } else {
        pane1.style.width = `${splitSizes[0]}%`;
        pane2.style.width = `${splitSizes[1]}%`;
      }
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setInitialPos(direction === 'vertical' ? e.clientY : e.clientX);
    setInitialSizes([...splitSizes]);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    
    const containerSize = direction === 'vertical'
      ? containerRef.current.clientHeight
      : containerRef.current.clientWidth;
      
    const delta = (direction === 'vertical' ? e.clientY : e.clientX) - initialPos;
    const deltaPercent = (delta / containerSize) * 100;
    
    const newSizes = [
      Math.max(minSize / containerSize * 100, Math.min(100 - minSize / containerSize * 100, initialSizes[0] + deltaPercent)),
      Math.max(minSize / containerSize * 100, Math.min(100 - minSize / containerSize * 100, initialSizes[1] - deltaPercent)),
    ];
    
    setSplitSizes(newSizes);
    updateChildrenSizes();
  };
  
  const handleMouseUp = () => {
    setDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  return (
    <div 
      ref={containerRef}
      className={`split ${direction} ${className}`}
      style={{ 
        display: 'flex', 
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        width: '100%',
        height: '100%',
      }}
    >
      <div 
        style={{ 
          [direction === 'vertical' ? 'height' : 'width']: `${splitSizes[0]}%`,
          overflow: 'hidden',
        }}
      >
        {children[0]}
      </div>
      
      <div
        ref={gutterRef}
        className={`gutter gutter-${direction}`}
        onMouseDown={handleMouseDown}
        style={{
          cursor: direction === 'vertical' ? 'row-resize' : 'col-resize',
          [direction === 'vertical' ? 'height' : 'width']: '8px',
        }}
      >
        <SplitHandle 
          direction={direction} 
          elementRef={gutterRef}
          dragging={dragging}
        />
      </div>
      
      <div
        style={{
          [direction === 'vertical' ? 'height' : 'width']: `${splitSizes[1]}%`,
          overflow: 'hidden',
        }}
      >
        {children[1]}
      </div>
    </div>
  );
};
