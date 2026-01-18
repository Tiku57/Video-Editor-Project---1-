# 🎬 PremiereLite: Advanced Browser-Based Video Editor
```
This project was developed during the Winter Internship '25 at console.success.
```
---

## ⚡ Key Features

* **Multi-Track Timeline:** Drag-and-drop interface to arrange video and audio clips across different tracks.
* **Frame-Precise Rendering:** Custom HTML5 Canvas engine for real-time video previews (60fps).
* **Non-Destructive Editing:** "Split" and "Trim" clips without altering the original source file.
* **Zoomable Interface:** Dynamic timeline zoom (pixels-per-second) for precise editing.
* **Smart Audio Sync:** Custom logic to handle audio playback drift and synchronization with the visual playhead.
* **Memory Optimization:** Efficient handling of `Blob` URLs to prevent browser crashes during large file uploads.

---

## 🛠 Tech Stack & Architecture

* **Frontend Framework:** React (Vite + TypeScript)
* **State Management:** **Zustand** (Chosen for transient state updates to avoid React re-render loops during playback).
* **Rendering Engine:** **HTML5 Canvas API** + `requestAnimationFrame` loop.
* **Styling:** Tailwind CSS (Dark Mode UI).
* **Icons:** Lucide React.

### 🧠 Engineering Decisions

#### 1. The Rendering Loop (Canvas vs DOM)
Instead of using standard `<video>` tags which are heavy to manipulate in a timeline, this project uses a single **Offscreen Video Element** that feeds a **Canvas**.
* **Why?** Allows for future implementation of filters, text overlays, and pixel manipulation.
* **Implementation:** A `requestAnimationFrame` loop draws the current video frame to the canvas based on the global `currentTime` in the Zustand store.

#### 2. State Management (Zustand)
Redux was avoided to reduce boilerplate. Zustand was utilized to separate **Transient State** (Playhead position, rapid updates) from **UI State** (Clip arrangement).
* **Challenge:** Syncing the timeline ruler, the playhead, and the video playback without UI lag.
* **Solution:** The playback loop updates the store's `currentTime`, which subscribers (the Timeline component) read reactively.

#### 3. Handling "Split" Logic
The editor uses **Non-Destructive Editing**. When a user "cuts" a video:
1.  We do not slice the actual file (which is slow).
2.  We clone the clip object in the state.
3.  We calculate the `offset` (start point in source) and `duration` mathematically.
4.  The renderer simply seeks to the correct `offset` when playing that specific segment.

#### 4. Memory Management
Large video files can crash the browser.
* **Optimization:** Files are loaded as `Blob` objects. `URL.createObjectURL()` is used for previewing.
* **Cleanup:** `URL.revokeObjectURL()` is triggered when clips are deleted to prevent memory leaks.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v16+)
* npm

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/advanced-video-editor.git](https://github.com/YOUR_USERNAME/advanced-video-editor.git)
    cd advanced-video-editor
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

---

## 🔮 Future Improvements

* **Video Export:** Using `ffmpeg.wasm` to compile the actual video file in the browser.
* **Waveforms:** Visualizing audio data on the timeline using the Web Audio API.
* **Keyframes:** Adding opacity/scale animation properties to clips.

---

## 👤 Author

**Aaditya Sattawan** 

---
*Built for the Console.Success Advanced Frontend Engineering Challenge.*
