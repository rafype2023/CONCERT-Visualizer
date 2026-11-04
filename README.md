# CineStage 3D • Professional Concert Multicam & Rig Previz

A professional 3D cinematography and multi-camera pre-visualization (previz) web application for concert, arena, and broadcast productions.

Built with **Three.js**, **React 19**, **TypeScript**, and **Tailwind CSS**.

---

## Key Features

### 1. Professional Sony Cinema & CineAlta Cameras
- **Sony FX6** (4K Full-Frame 10.2MP Exmor R, S-Log3, compact run-and-gun rig)
- **Sony Burano** (8.6K Full-Frame CineAlta, IBIS in-body stabilization, PL/E-mount)
- **Sony Venice 2 (8K)** (Flagship CineAlta, X-OCN internal, raw recorder, studio configuration)
- **Sony FR7** (Full-Frame Cinema Line Robotic PTZ with remote motorized pan/tilt/zoom)

### 2. Cinema Mounts & Movement Support Rigs
- **Heavy Studio Tripod / Pedestal**: Fluid head with pan handle and pedestal riser height.
- **Motorized Slider**: Linear belt-driven travel, rail length (1–4m), auto ping-pong patrol, and motor speed controls.
- **Studio Track Dolly**: Arena floor rails with straight track or curved catwalk runway arc mode.
- **TechnoJib / Telescopic Crane**: 360° base swing, boom elevation tilt (-35° to +65°), telescoping arm reach (4–12m), and motorized 3-axis remote head.
- **Aerial CableCam / Skycam**: Suspended high-tension cables spanning the arena, trolley traverse, and winch elevation drop.
- **Handheld / Steadicam / 3-Axis Gimbal**: Roaming stage operator with Ronin 2 stabilization and natural organic sway/shake simulation.

### 3. Real-Time Optical Calculations & Picture-In-Picture (PIP) Viewfinder
- Mathematical FOV calculations based on sensor width/height (Full Frame 36×24mm vs Super 35 crop).
- Real-time floating PIP Viewfinder displaying what the active camera lens sees.
- **Broadcast Viewfinder HUD**:
  - Live Timecode (`01:24:32:18`) and `[REC ●]` status.
  - Tally lamps: **PROGRAM** (Red / On-Air), **PREVIEW** (Green), or Standby.
  - Cinema Aspect Ratio Mattes: `16:9`, `2.39:1 CinemaScope`, `4:3`, `9:16 Vertical Social`, or Off.
  - Framing overlays: Rule-of-Thirds grid, Action Safe (90%), Title Safe (80%), and center crosshairs.
  - Live lens focal length (mm), T-stop / Iris, sensor mode, and battery indicators.
  - **Director Eyepiece Fullscreen**: Step directly into the camera's optical point of view.

### 4. Interactive Rig Kinematics & Cinematic Motion Triggers
- Real-time Pan, Tilt, and Roll virtual controls with snap-to-center.
- Direct slider, dolly, crane boom, and cablecam controls alongside the PIP.
- Performer Target Tracking: Lock camera orientation to center-stage lead performer.
- One-click Cinematic Move Presets:
  - *Hero Chorus Crane Dive*
  - *Catwalk Dolly Push-In*
  - *Slider Drummer Reveal*
  - *Skycam Arena Flyover*
  - *Performer 360 Orbit*
  - *FOH Box Zoom In*

### 5. 3D Stage Environment with Real Stage Artwork
- Constructs a full 3D concert venue using the high-resolution stage artwork from `Stage/`:
  - **Massive Stadium Concert Spectacle**
  - **Spectacular Arena (6 Dynamic Views)**
  - **Dynamic Stadium Stage (5 Views)**
  - **Massive Concert Production (3 Views)**
- Curved backstage LED video wall and giant Left/Right IMAG towers.
- Dynamic moving-head spotlights with sweeping volumetric light beams.
- Elevated performance deck with catwalk thrust runway, drum riser with 3D drum kit, microphone stands, and crowd silhouettes.

### 6. OB Van Multiviewer Wall
- 6-Channel Production Control Room monitor wall displaying all active cameras simultaneously with live tallies and camera specifications.

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## Project Structure
```
├── Stage/               # Stage environment visual artwork
├── Cameras/             # Camera body references and specs
├── public/              # Served assets (stage backdrops, camera photos)
├── src/
│   ├── components/      # DirectorHUD, RigController, CameraManager, StageControls
│   ├── data/            # Camera specifications, lenses, mounts, stage presets
│   ├── scene/           # Three.js StageBuilder, CameraRigModels, SceneManager
│   ├── types/           # TypeScript interfaces for rigs, optics, and presets
│   ├── utils/           # Optical FOV and kinematic transformation calculations
│   ├── App.tsx          # Main application component & layout
│   └── main.tsx         # Application entrypoint
├── package.json
└── vite.config.ts
```
