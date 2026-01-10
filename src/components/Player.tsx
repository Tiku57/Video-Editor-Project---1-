import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';

export const Player = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // We use this hidden element to play both Video and Audio
  const hiddenMediaRef = useRef<HTMLVideoElement>(document.createElement('video'));
  const { tracks, currentTime, isPlaying, setPlayhead } = useStore();

  // 1. RENDERING & MEDIA SYNC LOOP
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const media = hiddenMediaRef.current;

    // A. FIND ACTIVE CLIP (Video OR Audio)
    // We look for ANY track that has a clip at the current time
    const activeTrack = tracks.find(t => t.clips.some(c => 
      currentTime >= c.start && currentTime < c.start + c.duration
    ));
    
    const activeClip = activeTrack?.clips.find(
      c => currentTime >= c.start && currentTime < c.start + c.duration
    );

    // B. LOAD SOURCE
    if (activeClip && activeClip.source !== media.src) {
      media.src = activeClip.source;
      media.load();
    }

    // C. SYNC LOGIC (The crucial fix for Audio)
    if (activeClip) {
      const targetTime = (currentTime - activeClip.start) + activeClip.offset;
      
      if (isPlaying) {
        // If playing, we let the media play naturally to ensure audio works.
        // We only "force" the time if it drifts too far (> 0.2s)
        if (media.paused) {
             media.play().catch(e => console.error("Playback failed:", e));
        }
        
        if (Math.abs(media.currentTime - targetTime) > 0.2) {
          media.currentTime = targetTime;
        }
      } else {
        // If paused, we force the time to match the scrub bar exactly
        media.pause();
        media.currentTime = targetTime;
      }
    } else {
      // No clip here? Pause.
      media.pause();
    }

    // D. DRAW TO CANVAS (Visuals)
    const draw = () => {
      if (ctx) {
        // Clear screen
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas!.width, canvas!.height);

        if (activeClip && activeClip.type === 'video') {
           // Draw video frame
           ctx.drawImage(media, 0, 0, canvas!.width, canvas!.height);
        } else if (activeClip && activeClip.type === 'audio') {
           // Draw generic Audio Waveform placeholder
           ctx.fillStyle = '#1e3a8a'; // Blue color
           ctx.font = "20px monospace";
           ctx.fillText("AUDIO PLAYING", 340, 220);
           ctx.fillText(activeClip.name, 300, 250);
        }
      }
    };
    
    // Draw loop
    const interval = setInterval(draw, 1000 / 30); 
    return () => clearInterval(interval);

  }, [currentTime, tracks, isPlaying]); // Re-run if these change

  // 2. PLAYBACK CLOCK (Global Timer)
  useEffect(() => {
    let animationFrame: number;
    let lastTime = Date.now();

    const loop = () => {
      if (!isPlaying) return;
      
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Update the global store time
      // This moves the red line
      setPlayhead(useStore.getState().currentTime + delta);
      
      animationFrame = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      lastTime = Date.now();
      loop();
    }
    
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, setPlayhead]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black shadow-2xl rounded-lg overflow-hidden border border-gray-800">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={450} 
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
};