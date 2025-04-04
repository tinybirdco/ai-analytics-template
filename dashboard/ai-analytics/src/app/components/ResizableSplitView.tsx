import { useState, useRef, useEffect } from 'react';

interface ResizableSplitViewProps {
  topComponent: React.ReactNode;
  bottomComponent: React.ReactNode;
  initialTopHeight?: string;
  minTopHeight?: string;
  minBottomHeight?: string;
}

export default function ResizableSplitView({
  topComponent,
  bottomComponent,
  initialTopHeight = '60vh',
  minTopHeight = '30vh',
  minBottomHeight = '20vh'
}: ResizableSplitViewProps) {
  const [topHeight, setTopHeight] = useState(initialTopHeight);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  // Convert vh to pixels
  const vhToPixels = (vh: string) => {
    const vhValue = parseFloat(vh);
    return (window.innerHeight * vhValue) / 100;
  };

  // Convert pixels to vh
  const pixelsToVh = (pixels: number) => {
    return `${(pixels / window.innerHeight) * 100}vh`;
  };

  // Handle mouse down on the drag handle
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  // Handle mouse move during dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const mouseY = e.clientY - containerRect.top;
    
    // Calculate new height in pixels
    let newHeightPixels = mouseY;
    
    // Apply min/max constraints
    const minTopPixels = vhToPixels(minTopHeight);
    const minBottomPixels = vhToPixels(minBottomHeight);
    
    if (newHeightPixels < minTopPixels) {
      newHeightPixels = minTopPixels;
    } else if (containerHeight - newHeightPixels < minBottomPixels) {
      newHeightPixels = containerHeight - minBottomPixels;
    }
    
    // Convert back to vh and update state
    setTopHeight(pixelsToVh(newHeightPixels));
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef} 
      className="flex flex-col w-full h-full relative bg-[#262626] rounded-lg overflow-hidden"
    >
      {/* Top component */}
      <div style={{ height: topHeight }} className="w-full overflow-hidden">
        {topComponent}
      </div>
      
      {/* Drag handle */}
      <div
        ref={dragHandleRef}
        className={`h-2 bg-[rgb(53, 53, 53)] hover:bg-[var(--accent)] cursor-row-resize flex items-center justify-center transition-colors ${
          isDragging ? 'bg-[var(--accent)]' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className="w-8 h-1 bg-gray-500 rounded-full"></div>
      </div>
      
      {/* Bottom component */}
      <div className="flex-1 w-full overflow-hidden">
        {bottomComponent}
      </div>
    </div>
  );
} 