import React from 'react';
import { Player } from './components/Player';
import { Timeline } from './components/Timeline';
import { useStore } from './store/useStore';
import { Play, Pause, Plus, ZoomIn, Upload } from 'lucide-react';

function App() {
  const { isPlaying, togglePlay, addTrack, addClip, zoom, setZoom, currentTime } = useStore();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addClip('track-1', file);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-white font-sans overflow-hidden">
      
      {/* HEADER / TOP BAR */}
      <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-2">
           <span className="text-blue-500 font-bold tracking-wider">PREMIERE<span className="text-white">LITE</span></span>
           <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded ml-2">v1.0</span>
        </div>
        <div className="text-xs text-gray-400">Project 1: Advanced Frontend Track</div>
      </div>

      {/* MIDDLE SECTION: PLAYER & SIDEBAR */}
      <div className="flex-1 flex min-h-0">
        
        {/* LEFT: Sidebar Assets */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="font-semibold text-sm text-gray-200 mb-3">Media Assets</h2>
            
            {/* Styled Upload Button */}
            <div className="relative group">
              <button className="w-full h-24 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:border-blue-500 group-hover:text-blue-400 transition bg-gray-800/50">
                <Upload size={20} />
                <span className="text-xs">Click to Upload</span>
              </button>
              <input 
                type="file" 
                accept="video/*,audio/*" 
                onChange={handleFileUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-4">
             <button 
              onClick={() => addTrack()} 
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition shadow-md"
            >
              <Plus size={14} /> Add Video Track
            </button>
          </div>
        </div>

        {/* RIGHT: Main Player Area */}
        <div className="flex-1 flex flex-col bg-gray-950 relative">
          <div className="flex-1 flex items-center justify-center p-8">
             <Player />
          </div>

          {/* Player Controls Bar */}
          <div className="h-12 bg-gray-900 border-t border-gray-800 flex items-center px-4 gap-6 shrink-0">
            <button 
              onClick={togglePlay} 
              className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:bg-gray-200 text-black transition"
            >
              {isPlaying ? <Pause size={14} fill="black" /> : <Play size={14} fill="black" className="ml-0.5"/>}
            </button>
            
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Timecode</span>
              <span className="text-sm font-mono text-blue-400">
                {currentTime.toFixed(2)}s
              </span>
            </div>

            <div className="h-6 w-px bg-gray-700 mx-2"></div>

            <div className="flex items-center gap-3">
               <ZoomIn size={14} className="text-gray-400"/>
               <input 
                 type="range" 
                 min="10" 
                 max="200" 
                 step="10"
                 value={zoom} 
                 onChange={(e) => setZoom(Number(e.target.value))}
                 className="w-32 accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
               />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM: Timeline */}
      <div className="h-1/3 min-h-[200px] border-t border-gray-700 flex flex-col z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <Timeline />
      </div>
    </div>
  );
}

export default App;