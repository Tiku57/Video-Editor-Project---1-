import React, { useRef, useState, useEffect } from 'react';
import { useStore, type Clip } from '../store/useStore'; // Fixed Import
import { Scissors, Trash2 } from 'lucide-react';

const ClipItem = ({ clip, trackId }: { clip: Clip; trackId: string }) => {
  const { zoom, splitClip, currentTime, updateClipStart, deleteClip } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [initialClipStart, setInitialClipStart] = useState(0);

  // Drag Logic
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX;
      const deltaTime = deltaX / zoom;
      updateClipStart(trackId, clip.id, initialClipStart + deltaTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartX, initialClipStart, zoom, trackId, clip.id, updateClipStart]);

  return (
    <div
      className={`absolute h-full rounded-md border border-blue-400 group overflow-hidden shadow-sm select-none cursor-grab active:cursor-grabbing ${
        isDragging ? 'bg-blue-700 z-50 ring-2 ring-white' : 'bg-blue-600'
      }`}
      style={{
        left: `${clip.start * zoom}px`,
        width: `${clip.duration * zoom}px`,
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        setIsDragging(true);
        setDragStartX(e.clientX);
        setInitialClipStart(clip.start);
      }}
    >
      <div className="p-1 text-xs text-white font-medium truncate pointer-events-none">
        {clip.name}
      </div>
      
      {/* Tools - Only visible on hover and NOT dragging */}
      {!isDragging && (
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
            className="bg-white text-black p-1 rounded-full hover:bg-gray-200"
            title="Split at Playhead"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              splitClip(trackId, clip.id, currentTime); 
            }}
          >
            <Scissors size={10} />
          </button>
           <button 
            className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            title="Delete Clip"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              deleteClip(trackId, clip.id); 
            }}
          >
            <Trash2 size={10} />
          </button>
        </div>
      )}
    </div>
  );
};

export const Timeline = () => {
  const { tracks, zoom, currentTime, setPlayhead, maxTime } = useStore();
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left + timelineRef.current.scrollLeft;
    setPlayhead(offsetX / zoom);
  };

  const ticks = Array.from({ length: maxTime }, (_, i) => i);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-gray-900 border-t border-gray-800">
      
      {/* Ruler */}
      <div 
        className="h-8 bg-gray-950 border-b border-gray-800 sticky top-0 z-30 flex items-end select-none"
        style={{ width: `${maxTime * zoom}px` }}
        onClick={handleTimelineClick}
      >
        {ticks.map((t) => (
          <div 
            key={t} 
            className="absolute border-l border-gray-600 h-3 text-[10px] text-gray-400 pl-1"
            style={{ left: `${t * zoom}px` }}
          >
            {t % 5 === 0 && <span>{t}s</span>}
          </div>
        ))}
      </div>

      {/* Tracks */}
      <div 
        ref={timelineRef}
        className="flex-1 overflow-auto relative min-h-[200px]"
        onClick={handleTimelineClick}
      >
        <div style={{ width: `${maxTime * zoom}px` }} className="relative min-h-full">
          
          {/* Playhead */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-40 pointer-events-none"
            style={{ left: `${currentTime * zoom}px` }}
          >
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-500 -ml-[5px]" />
          </div>

          {tracks.map((track) => (
            <div key={track.id} className="h-24 border-b border-gray-800 relative hover:bg-gray-800/50 transition">
              {track.clips.map((clip) => (
                <ClipItem key={clip.id} clip={clip} trackId={track.id} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};