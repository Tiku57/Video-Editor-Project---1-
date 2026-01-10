import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type Clip = {
  id: string;
  source: string; // Blob URL
  type: 'video' | 'audio';
  start: number; // Start time on timeline (seconds)
  duration: number; // Length of the clip (seconds)
  offset: number; // Where in the original file does this clip start? (Trimming)
  name: string;
};

export type Track = {
  id: string;
  clips: Clip[];
};

interface EditorState {
  tracks: Track[];
  currentTime: number;
  isPlaying: boolean;
  maxTime: number;
  zoom: number;

  // Actions
  addTrack: () => void;
  addClip: (trackId: string, file: File) => void;
  updateClipStart: (trackId: string, clipId: string, newStart: number) => void;
  splitClip: (trackId: string, clipId: string, splitTime: number) => void;
  deleteClip: (trackId: string, clipId: string) => void;
  setPlayhead: (time: number) => void;
  setZoom: (zoom: number) => void;
  togglePlay: () => void;
}

export const useStore = create<EditorState>((set, get) => ({
  tracks: [{ id: 'track-1', clips: [] }],
  currentTime: 0,
  isPlaying: false,
  maxTime: 120, // Default 2 mins
  zoom: 50, // Pixels per second

  addTrack: () => set((state) => ({ tracks: [...state.tracks, { id: uuidv4(), clips: [] }] })),

  addClip: (trackId, file) => {
    const objectUrl = URL.createObjectURL(file);
    const type = file.type.includes('video') ? 'video' : 'audio';
    
    // Load metadata to get REAL duration
    const tempElement = document.createElement(type === 'video' ? 'video' : 'audio');
    tempElement.src = objectUrl;
    
    tempElement.onloadedmetadata = () => {
      const duration = tempElement.duration;
      
      const newClip: Clip = {
        id: uuidv4(),
        source: objectUrl,
        type,
        start: 0, 
        duration: duration,
        offset: 0,
        name: file.name,
      };

      set((state) => ({
        tracks: state.tracks.map((t) => 
          t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t
        ),
      }));
      
      tempElement.remove();
    };
  },

  updateClipStart: (trackId, clipId, newStart) => set((state) => ({
    tracks: state.tracks.map((t) => 
      t.id === trackId 
      ? { 
          ...t, 
          clips: t.clips.map((c) => c.id === clipId ? { ...c, start: Math.max(0, newStart) } : c) 
        } 
      : t
    ),
  })),

  splitClip: (trackId, clipId, splitTime) => set((state) => {
    return {
      tracks: state.tracks.map((t) => {
        if (t.id !== trackId) return t;
        
        const clipIndex = t.clips.findIndex(c => c.id === clipId);
        if (clipIndex === -1) return t;
        const clip = t.clips[clipIndex];

        // Boundary Check
        if (splitTime <= clip.start || splitTime >= clip.start + clip.duration) {
          return t;
        }

        const relativeSplit = splitTime - clip.start;
        const firstHalf = { ...clip, duration: relativeSplit };
        const secondHalf = {
          ...clip,
          id: uuidv4(),
          start: splitTime,
          duration: clip.duration - relativeSplit,
          offset: clip.offset + relativeSplit
        };

        const newClips = [...t.clips];
        newClips.splice(clipIndex, 1, firstHalf, secondHalf);
        return { ...t, clips: newClips };
      })
    };
  }),

  // Memory Management: Revoke Blob URL
  deleteClip: (trackId, clipId) => set((state) => {
    const track = state.tracks.find(t => t.id === trackId);
    const clip = track?.clips.find(c => c.id === clipId);
    if (clip) {
        URL.revokeObjectURL(clip.source); 
    }

    return {
      tracks: state.tracks.map((t) => 
        t.id === trackId 
        ? { ...t, clips: t.clips.filter((c) => c.id !== clipId) } 
        : t
      )
    };
  }),

  setPlayhead: (time) => set({ currentTime: Math.max(0, time) }),
  setZoom: (zoom) => set({ zoom }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
}));