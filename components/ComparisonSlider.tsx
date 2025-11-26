import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight, Download, RefreshCw, ZoomIn, ZoomOut, Maximize, Share2 } from 'lucide-react';
import Button from './Button';
import { downloadImage, shareImage } from '../utils';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  onReset: () => void;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ beforeImage, afterImage, onReset }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent resizing if clicking controls
    if ((e.target as HTMLElement).closest('button')) return;
    setIsResizing(true);
  };

  const handleMouseUp = () => setIsResizing(false);
  
  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(x, 0), 100));
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing]);

  const handleTouchMove = (e: React.TouchEvent | TouchEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(x, 0), 100));
  };

  const adjustZoom = (delta: number) => {
    setZoomLevel(prev => {
      const newZoom = Math.min(Math.max(prev + delta, 1), 3); // Max 3x zoom, Min 1x
      return Number(newZoom.toFixed(1));
    });
  };

  const handleShare = async () => {
    const success = await shareImage(
      afterImage, 
      "Quintin's Virtual Dressing Room", 
      "Check out this virtual try-on I created!"
    );
    if (!success) {
      // Fallback behavior if Web Share API is not available or cancelled
      // Just a subtle notification or we rely on the button simply not doing anything visible besides console log
      // In a real app, maybe show a "Copied to clipboard" toast
      console.log("Share skipped or not supported");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in zoom-in duration-500">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start pointer-events-none">
          <div className="bg-white/70 dark:bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-gray-200 dark:border-white/10 shadow-lg">
            <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ArrowLeftRight size={12} className="text-accent-600 dark:text-accent-400"/> Compare
            </span>
          </div>

          {/* Zoom Controls */}
          <div className="flex gap-2 pointer-events-auto bg-white/70 dark:bg-black/50 backdrop-blur-md p-1 rounded-lg border border-gray-200 dark:border-white/10 shadow-lg">
             <button 
                onClick={() => adjustZoom(-0.5)} 
                disabled={zoomLevel <= 1}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-md text-gray-800 dark:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Zoom Out"
             >
                <ZoomOut size={18} />
             </button>
             <div className="flex items-center justify-center px-2 min-w-[3rem]">
                <span className="text-xs font-mono text-gray-800 dark:text-white">{Math.round(zoomLevel * 100)}%</span>
             </div>
             <button 
                onClick={() => adjustZoom(0.5)} 
                disabled={zoomLevel >= 3}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-md text-gray-800 dark:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Zoom In"
             >
                <ZoomIn size={18} />
             </button>
             {zoomLevel > 1 && (
               <button 
                  onClick={() => setZoomLevel(1)}
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-md text-accent-600 dark:text-accent-400 border-l border-gray-300 dark:border-white/10 ml-1 transition-colors"
                  title="Reset Zoom"
               >
                  <Maximize size={18} />
               </button>
             )}
          </div>
        </div>

        {/* Scrollable Wrapper for Zoom */}
        <div 
           ref={wrapperRef}
           className="relative w-full h-[50vh] min-h-[400px] md:h-[600px] overflow-auto bg-gray-100 dark:bg-[#1a1a1a] cursor-col-resize custom-scrollbar"
        >
          {/* Scalable Container */}
          <div 
            ref={containerRef}
            className="relative h-full origin-top-left transition-transform duration-200 ease-out"
            style={{ 
              width: `${zoomLevel * 100}%`, 
              height: `${zoomLevel * 100}%`,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={() => setIsResizing(true)}
            onTouchEnd={() => setIsResizing(false)}
            onTouchMove={handleTouchMove}
          >
            {/* After Image (Background) */}
            <img 
              src={afterImage} 
              alt="After" 
              className="absolute top-0 left-0 w-full h-full object-contain bg-gray-100 dark:bg-[#1a1a1a] select-none"
              draggable={false}
            />

            {/* Before Image (Foreground - Clipped) */}
            <div 
              className="absolute top-0 left-0 w-full h-full overflow-hidden select-none"
              style={{ width: `${sliderPosition}%` }}
            >
              <img 
                src={beforeImage} 
                alt="Before" 
                className="absolute top-0 left-0 max-w-none object-contain select-none"
                style={{ 
                    width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
                    height: '100%'
                }}
                draggable={false}
              />
               {/* Label */}
               <div className="absolute bottom-6 left-6 z-10 scale-100 origin-bottom-left" style={{ transform: `scale(${1/zoomLevel})`}}>
                  <span className="bg-white/70 dark:bg-black/50 backdrop-blur-md text-gray-900 dark:text-white text-xs font-bold px-2 py-1 rounded border border-gray-200 dark:border-white/10">BEFORE</span>
               </div>
            </div>

            {/* Label for After */}
             <div className="absolute bottom-6 right-6 z-10 pointer-events-none origin-bottom-right" style={{ transform: `scale(${1/zoomLevel})`}}>
                <span className="bg-accent-500/80 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded border border-white/10 shadow-lg">AFTER</span>
             </div>

            {/* Slider Handle */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white cursor-col-resize shadow-[0_0_15px_rgba(0,0,0,0.5)] z-30"
              style={{ left: `${sliderPosition}%` }}
            >
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-gray-900 transition-transform hover:scale-110"
                style={{ transform: `translate(-50%, -50%) scale(${1/zoomLevel})` }}
              >
                <ArrowLeftRight size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 md:p-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 z-20">
          <Button 
            variant="secondary" 
            onClick={onReset}
            icon={<RefreshCw size={16} />}
            className="w-full sm:w-auto"
          >
            Try Another
          </Button>
          <div className="flex gap-3 w-full sm:w-auto">
             <Button 
               variant="outline"
               onClick={handleShare}
               icon={<Share2 size={16} />}
               className="flex-1 sm:flex-initial"
             >
               Share
             </Button>
             <Button 
               onClick={() => downloadImage(afterImage, `quintin-vdr-${Date.now()}.png`)}
               icon={<Download size={16} />}
               className="flex-1 sm:flex-initial"
             >
               Save
             </Button>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <p className="text-center text-gray-500 dark:text-gray-500 text-sm mt-4 px-4">
         Drag slider to compare • Use +/- to zoom • Scroll to pan when zoomed
      </p>
    </div>
  );
};

export default ComparisonSlider;
