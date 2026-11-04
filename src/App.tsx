import React, { useState, useEffect, useRef } from 'react';
import { CameraRigState, StagePreset, AspectRatioMask, RigMovementParams, AppMode } from './types';
import { STAGE_PRESETS, CAMERA_BODIES, LENSES } from './data/cameras';
import { SceneManager } from './scene/SceneManager';
import { DirectorHUD } from './components/DirectorHUD';
import { RigController } from './components/RigController';
import { StagingControls } from './components/StagingControls';
import { CameraManager } from './components/CameraManager';
import { StageControls } from './components/StageControls';
import {
  Video,
  Sliders,
  Layers,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Camera,
  Play,
  RotateCcw,
  Sparkles,
  MapPin,
  Film,
  Radio,
  Tv,
  ArrowRight,
  Eye,
  Columns
} from 'lucide-react';

const INITIAL_RIGS: CameraRigState[] = [
  {
    id: 'cam-1',
    name: 'CAM 1 • STAGE LEFT CRANE',
    bodyId: 'VENICE2',
    lensId: 'CP_50',
    focalLength: 50,
    aperture: 'T1.3',
    sensorCrop: 'FF',
    focusDistance: 6.0,
    mountType: 'CRANE',
    basePosition: [-14, 0, 8],
    movement: {
      pan: 35,
      tilt: -12,
      roll: 0,
      height: 2.0,
      sliderLength: 2.0,
      sliderPosition: 0.5,
      sliderPingPong: false,
      sliderSpeed: 1.0,
      sliderAngle: 0,
      dollyTrackPosition: 0.5,
      dollyTrackType: 'STRAIGHT',
      dollyPingPong: false,
      dollySpeed: 1.0,
      craneBaseAngle: 38,
      craneArmLength: 9.0,
      craneElevation: 22,
      craneHeadPan: 0,
      craneHeadTilt: -18,
      craneHeadRoll: 0,
      cablePosition: 0.5,
      cableElevationDrop: 3.0,
      cablePingPong: false,
      cableSpeed: 1.0,
      handheldSway: false,
      handheldSwayIntensity: 0.5,
      handheldRoaming: false,
      handheldPathAngle: 0
    },
    tally: 'PROGRAM',
    colorTag: '#ef4444',
    lookAtTarget: true
  },
  {
    id: 'cam-2',
    name: 'CAM 2 • RUNWAY SLIDER',
    bodyId: 'BURANO',
    lensId: 'CZ_16_35',
    focalLength: 24,
    aperture: 'T2.9',
    sensorCrop: 'FF',
    focusDistance: 4.0,
    mountType: 'SLIDER',
    basePosition: [0, 0, 15.5],
    movement: {
      pan: 0,
      tilt: 4,
      roll: 0,
      height: 1.4,
      sliderLength: 3.5,
      sliderPosition: 0.5,
      sliderPingPong: true,
      sliderSpeed: 0.8,
      sliderAngle: 90,
      dollyTrackPosition: 0.5,
      dollyTrackType: 'STRAIGHT',
      dollyPingPong: false,
      dollySpeed: 1.0,
      craneBaseAngle: 0,
      craneArmLength: 6.0,
      craneElevation: 0,
      craneHeadPan: 0,
      craneHeadTilt: 0,
      craneHeadRoll: 0,
      cablePosition: 0.5,
      cableElevationDrop: 2.0,
      cablePingPong: false,
      cableSpeed: 1.0,
      handheldSway: false,
      handheldSwayIntensity: 0.5,
      handheldRoaming: false,
      handheldPathAngle: 0
    },
    tally: 'PREVIEW',
    colorTag: '#22c55e',
    lookAtTarget: true
  },
  {
    id: 'cam-3',
    name: 'CAM 3 • FOH BOX ZOOM',
    bodyId: 'FX6',
    lensId: 'CINE_BOX_25_250',
    focalLength: 135,
    aperture: 'T3.5',
    sensorCrop: 'FF',
    focusDistance: 32.0,
    mountType: 'TRIPOD',
    basePosition: [0, 0, 32],
    movement: {
      pan: 0,
      tilt: -5,
      roll: 0,
      height: 1.8,
      sliderLength: 2.0,
      sliderPosition: 0.5,
      sliderPingPong: false,
      sliderSpeed: 1.0,
      sliderAngle: 0,
      dollyTrackPosition: 0.5,
      dollyTrackType: 'STRAIGHT',
      dollyPingPong: false,
      dollySpeed: 1.0,
      craneBaseAngle: 0,
      craneArmLength: 6.0,
      craneElevation: 0,
      craneHeadPan: 0,
      craneHeadTilt: 0,
      craneHeadRoll: 0,
      cablePosition: 0.5,
      cableElevationDrop: 2.0,
      cablePingPong: false,
      cableSpeed: 1.0,
      handheldSway: false,
      handheldSwayIntensity: 0.5,
      handheldRoaming: false,
      handheldPathAngle: 0
    },
    tally: 'OFF',
    colorTag: '#3b82f6',
    lookAtTarget: true
  },
  {
    id: 'cam-4',
    name: 'CAM 4 • DRUM RISER PTZ',
    bodyId: 'FR7',
    lensId: 'CZ_28_135',
    focalLength: 45,
    aperture: 'f/4.0',
    sensorCrop: 'FF',
    focusDistance: 2.5,
    mountType: 'TRIPOD',
    basePosition: [-2.8, 1.8, -6],
    movement: {
      pan: 80,
      tilt: -4,
      roll: 0,
      height: 1.3,
      sliderLength: 2.0,
      sliderPosition: 0.5,
      sliderPingPong: false,
      sliderSpeed: 1.0,
      sliderAngle: 0,
      dollyTrackPosition: 0.5,
      dollyTrackType: 'STRAIGHT',
      dollyPingPong: false,
      dollySpeed: 1.0,
      craneBaseAngle: 0,
      craneArmLength: 6.0,
      craneElevation: 0,
      craneHeadPan: 0,
      craneHeadTilt: 0,
      craneHeadRoll: 0,
      cablePosition: 0.5,
      cableElevationDrop: 2.0,
      cablePingPong: false,
      cableSpeed: 1.0,
      handheldSway: false,
      handheldSwayIntensity: 0.5,
      handheldRoaming: false,
      handheldPathAngle: 0
    },
    tally: 'OFF',
    colorTag: '#f59e0b',
    lookAtTarget: false
  },
  {
    id: 'cam-5',
    name: 'CAM 5 • PIT STEADICAM',
    bodyId: 'FX6',
    lensId: 'CP_24',
    focalLength: 24,
    aperture: 'T1.4',
    sensorCrop: 'FF',
    focusDistance: 3.0,
    mountType: 'GIMBAL',
    basePosition: [3.5, 0, 10],
    movement: {
      pan: -25,
      tilt: 8,
      roll: 0,
      height: 1.6,
      sliderLength: 2.0,
      sliderPosition: 0.5,
      sliderPingPong: false,
      sliderSpeed: 1.0,
      sliderAngle: 0,
      dollyTrackPosition: 0.5,
      dollyTrackType: 'STRAIGHT',
      dollyPingPong: false,
      dollySpeed: 1.0,
      craneBaseAngle: 0,
      craneArmLength: 6.0,
      craneElevation: 0,
      craneHeadPan: 0,
      craneHeadTilt: 0,
      craneHeadRoll: 0,
      cablePosition: 0.5,
      cableElevationDrop: 2.0,
      cablePingPong: false,
      cableSpeed: 1.0,
      handheldSway: true,
      handheldSwayIntensity: 0.7,
      handheldRoaming: false,
      handheldPathAngle: 0
    },
    tally: 'OFF',
    colorTag: '#ec4899',
    lookAtTarget: true
  },
  {
    id: 'cam-6',
    name: 'CAM 6 • SKYCAM ARENA FLYER',
    bodyId: 'BURANO',
    lensId: 'CP_35',
    focalLength: 35,
    aperture: 'T1.3',
    sensorCrop: 'FF',
    focusDistance: 12.0,
    mountType: 'CABLE',
    basePosition: [0, 15, 0],
    movement: {
      pan: 0,
      tilt: -48,
      roll: 0,
      height: 12.0,
      sliderLength: 2.0,
      sliderPosition: 0.5,
      sliderPingPong: false,
      sliderSpeed: 1.0,
      sliderAngle: 0,
      dollyTrackPosition: 0.5,
      dollyTrackType: 'STRAIGHT',
      dollyPingPong: false,
      dollySpeed: 1.0,
      craneBaseAngle: 0,
      craneArmLength: 6.0,
      craneElevation: 0,
      craneHeadPan: 0,
      craneHeadTilt: 0,
      craneHeadRoll: 0,
      cablePosition: 0.5,
      cableElevationDrop: 3.5,
      cablePingPong: true,
      cableSpeed: 0.6,
      handheldSway: false,
      handheldSwayIntensity: 0.5,
      handheldRoaming: false,
      handheldPathAngle: 0
    },
    tally: 'OFF',
    colorTag: '#8b5cf6',
    lookAtTarget: true
  }
];

export default function App() {
  const arenaCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const povCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  // App Modes: STAGING (3D setup) | DIRECTOR (Live Rig + POV) | MULTIVIEW (Wall)
  const [mode, setMode] = useState<AppMode>('STAGING');

  const [rigs, setRigs] = useState<CameraRigState[]>(INITIAL_RIGS);
  const [activeRigId, setActiveRigId] = useState<string>('cam-1');
  const [currentStagePreset, setCurrentStagePreset] = useState<StagePreset>(STAGE_PRESETS[0]);

  // Staging sidebar active tab
  const [stagingTab, setStagingTab] = useState<'POSITION' | 'ALL_CAMERAS' | 'STAGE_THEMES'>('POSITION');
  const [clickToPlaceEnabled, setClickToPlaceEnabled] = useState<boolean>(true);

  // Director mode layout
  const [directorLayout, setDirectorLayout] = useState<'SPLIT' | 'POV_DOMINANT' | 'STAGE_DOMINANT'>('SPLIT');

  // Viewfinder overlays
  const [aspectMask, setAspectMask] = useState<AspectRatioMask>('16:9');
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [showSafeAreas, setShowSafeAreas] = useState<boolean>(true);

  const activeRig = rigs.find(r => r.id === activeRigId) || rigs[0];

  // Initialize SceneManager
  useEffect(() => {
    if (!arenaCanvasRef.current) return;

    const mgr = new SceneManager(arenaCanvasRef.current, povCanvasRef.current || undefined);
    sceneManagerRef.current = mgr;

    mgr.onSelectRig = (id: string) => {
      setActiveRigId(id);
    };

    mgr.onMoveRigPosition = (id: string, newPos: [number, number, number]) => {
      setRigs(prev =>
        prev.map(r => (r.id === id ? { ...r, basePosition: [newPos[0], r.basePosition[1], newPos[2]] } : r))
      );
    };

    mgr.setStagePreset(currentStagePreset);
    mgr.updateRigs(rigs, activeRigId);

    return () => {
      mgr.destroy();
    };
  }, []);

  // Update rigs in 3D scene
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateRigs(rigs, activeRigId);
    }
  }, [rigs, activeRigId]);

  // Update POV canvas when switching modes or layout
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setPovCanvas(povCanvasRef.current);
      sceneManagerRef.current.handleResize();
    }
  }, [mode, directorLayout]);

  // Stage Preset change
  const handleSelectPreset = (preset: StagePreset) => {
    setCurrentStagePreset(preset);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setStagePreset(preset);
    }
  };

  // Director Viewport Preset
  const handleDirectorView = (view: 'FOH' | 'STAGE_TOP' | 'PIT_WIDE' | 'HERO_PERFORMER' | 'SIDE_CRANE') => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setDirectorPresetView(view);
    }
  };

  // Update active rig movement
  const handleUpdateMovement = (updates: Partial<RigMovementParams>) => {
    setRigs(prev =>
      prev.map(r => (r.id === activeRigId ? { ...r, movement: { ...r.movement, ...updates } } : r))
    );
  };

  // Update active rig properties
  const handleUpdateRig = (updates: Partial<CameraRigState>) => {
    setRigs(prev => prev.map(r => (r.id === activeRigId ? { ...r, ...updates } : r)));
  };

  // Update active rig base position
  const handleUpdateBasePosition = (newPos: [number, number, number]) => {
    setRigs(prev => prev.map(r => (r.id === activeRigId ? { ...r, basePosition: newPos } : r)));
  };

  // Tally Switch
  const handleSetTally = (id: string, tally: 'PROGRAM' | 'PREVIEW' | 'OFF') => {
    setRigs(prev =>
      prev.map(r => {
        if (tally === 'PROGRAM') {
          return r.id === id ? { ...r, tally: 'PROGRAM' } : r.tally === 'PROGRAM' ? { ...r, tally: 'OFF' } : r;
        }
        return r.id === id ? { ...r, tally } : r;
      })
    );
  };

  // Add Rig
  const handleAddRig = (newRig: CameraRigState) => {
    setRigs(prev => [...prev, newRig]);
    setActiveRigId(newRig.id);
  };

  // Remove Rig
  const handleRemoveRig = (id: string) => {
    setRigs(prev => {
      const filtered = prev.filter(r => r.id !== id);
      if (activeRigId === id && filtered.length > 0) {
        setActiveRigId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Cinematic Move Triggers
  const handleTriggerPresetMove = (
    move: 'HERO_CHORUS_DIVE' | 'CATWALK_PUSH' | 'DRUMMER_REVEAL' | 'SKYCAM_FLY' | 'HERO_ORBIT' | 'FOH_ZOOM'
  ) => {
    switch (move) {
      case 'HERO_CHORUS_DIVE': {
        const crane = rigs.find(r => r.mountType === 'CRANE') || activeRig;
        setActiveRigId(crane.id);
        handleUpdateMovement({
          craneElevation: 10,
          craneArmLength: 11,
          craneBaseAngle: 25,
          craneHeadTilt: -15
        });
        break;
      }
      case 'CATWALK_PUSH': {
        const slider = rigs.find(r => r.mountType === 'SLIDER') || activeRig;
        setActiveRigId(slider.id);
        handleUpdateMovement({
          sliderPosition: 0.95,
          sliderPingPong: true,
          sliderSpeed: 1.2
        });
        break;
      }
      case 'DRUMMER_REVEAL': {
        const ptz = rigs.find(r => r.bodyId === 'FR7') || activeRig;
        setActiveRigId(ptz.id);
        handleUpdateMovement({
          pan: 85,
          tilt: -2
        });
        break;
      }
      case 'SKYCAM_FLY': {
        const cable = rigs.find(r => r.mountType === 'CABLE') || activeRig;
        setActiveRigId(cable.id);
        handleUpdateMovement({
          cablePosition: 0.9,
          cableElevationDrop: 4.5,
          cablePingPong: true
        });
        break;
      }
      case 'HERO_ORBIT': {
        const stedi = rigs.find(r => r.mountType === 'GIMBAL') || activeRig;
        setActiveRigId(stedi.id);
        handleUpdateMovement({
          handheldSway: true,
          handheldSwayIntensity: 0.9
        });
        break;
      }
      case 'FOH_ZOOM': {
        const foh = rigs.find(r => r.mountType === 'TRIPOD') || activeRig;
        setActiveRigId(foh.id);
        handleUpdateRig({ focalLength: 220 });
        break;
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 select-none">
      {/* TOP HEADER: BRANDING, MODE SWITCHER & TALLY */}
      <header className="h-13 bg-neutral-950/95 border-b border-neutral-800 px-4 flex items-center justify-between z-30 shrink-0 backdrop-blur-md">
        {/* Left: Branding & Active Stage */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 via-cyan-600 to-indigo-600 flex items-center justify-center p-0.5 shadow-md">
            <div className="w-full h-full bg-neutral-950 rounded-[7px] flex items-center justify-center">
              <Camera className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wider flex items-center gap-2">
              <span>CINESTAGE 3D</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-red-600/20 text-red-400 border border-red-500/30 rounded font-mono font-normal">
                CONCERT PREVIZ
              </span>
            </h1>
          </div>
        </div>

        {/* Center: THE 3 WORKFLOW MODES */}
        <div className="flex items-center gap-1.5 bg-neutral-900/90 border border-neutral-700/80 p-1 rounded-xl shadow-inner font-sans text-xs">
          {/* Mode 1: 3D Stage Setup */}
          <button
            onClick={() => setMode('STAGING')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              mode === 'STAGING'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950 ring-1 ring-cyan-400'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>1. 3D Stage Setup</span>
          </button>

          {/* Mode 2: Director Mode (Rig & POV) */}
          <button
            onClick={() => setMode('DIRECTOR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              mode === 'DIRECTOR'
                ? 'bg-gradient-to-r from-red-600 to-indigo-600 text-white shadow-md shadow-red-950 ring-1 ring-red-400'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>2. Director Mode (Rig & POV)</span>
          </button>

          {/* Mode 3: Broadcast Multiviewer */}
          <button
            onClick={() => setMode('MULTIVIEW')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              mode === 'MULTIVIEW'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950 ring-1 ring-indigo-400'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>3. Multiview Wall</span>
          </button>
        </div>

        {/* Right: Live PGM Status & Camera Switcher shortcut */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 font-mono text-xs bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full">
            <span className="text-neutral-500">ON AIR:</span>
            <span className="text-red-400 font-bold animate-pulse">
              {rigs.find(r => r.tally === 'PROGRAM')?.name || 'NONE'}
            </span>
          </div>
        </div>
      </header>

      {/* WORKSPACE VIEWPORTS CONTAINER */}
      <div className="relative flex-1 w-full h-[calc(100vh-3.25rem)] overflow-hidden">
        {/* ========================================================================= */}
        {/* WORKFLOW 1: 3D STAGE SETUP MODE (Position rig & camera of choice)        */}
        {/* ========================================================================= */}
        {mode === 'STAGING' && (
          <div className="relative w-full h-full">
            {/* 3D ARENA CANVAS (Full screen stage view with orbit & click-to-place) */}
            <canvas
              ref={arenaCanvasRef}
              className="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
            />

            {/* Instruction Banner at bottom center */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-neutral-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/40 text-xs font-mono text-neutral-200 shadow-xl flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>
                <strong className="text-cyan-400">STAGING MODE:</strong> Left click + drag to orbit stage • Click anywhere on stage floor to position rig • Click any camera to select
              </span>
            </div>

            {/* LEFT DOCK: Staging & Rig Placement Controls */}
            <div className="absolute top-4 left-4 z-20 w-84 sm:w-96 flex flex-col gap-2">
              {/* Tab selector */}
              <div className="flex items-center gap-1 bg-neutral-900/90 backdrop-blur-md p-1 rounded-xl border border-neutral-800 text-xs font-medium">
                <button
                  onClick={() => setStagingTab('POSITION')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    stagingTab === 'POSITION' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Position & Rig</span>
                </button>
                <button
                  onClick={() => setStagingTab('ALL_CAMERAS')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    stagingTab === 'ALL_CAMERAS' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Cameras ({rigs.length})</span>
                </button>
                <button
                  onClick={() => setStagingTab('STAGE_THEMES')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    stagingTab === 'STAGE_THEMES' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Stage Theme</span>
                </button>
              </div>

              {/* Tab Contents */}
              {stagingTab === 'POSITION' && (
                <StagingControls
                  activeRig={activeRig}
                  onUpdateRig={handleUpdateRig}
                  onUpdateBasePosition={handleUpdateBasePosition}
                  clickToPlaceEnabled={clickToPlaceEnabled}
                  onToggleClickToPlace={() => setClickToPlaceEnabled(!clickToPlaceEnabled)}
                  onProceedToDirectorMode={() => setMode('DIRECTOR')}
                />
              )}

              {stagingTab === 'ALL_CAMERAS' && (
                <CameraManager
                  rigs={rigs}
                  activeRigId={activeRigId}
                  onSelectRig={setActiveRigId}
                  onAddRig={handleAddRig}
                  onRemoveRig={handleRemoveRig}
                  onSetTally={handleSetTally}
                />
              )}

              {stagingTab === 'STAGE_THEMES' && (
                <StageControls
                  currentPreset={currentStagePreset}
                  onSelectPreset={handleSelectPreset}
                  onSelectDirectorView={handleDirectorView}
                />
              )}
            </div>

            {/* TOP RIGHT: Real-time PIP Viewfinder preview of the active camera */}
            <div className="absolute top-4 right-4 z-20 w-[400px] sm:w-[460px] aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-cyan-500/80 bg-neutral-950">
              <canvas
                ref={povCanvasRef}
                width={1280}
                height={720}
                className="w-full h-full block object-cover"
              />
              <DirectorHUD
                rig={activeRig}
                isFullscreen={false}
                onToggleFullscreen={() => setMode('DIRECTOR')}
                aspectMask={aspectMask}
                onSetAspectMask={setAspectMask}
                showGuides={showGuides}
                onToggleGuides={() => setShowGuides(!showGuides)}
                showSafeAreas={showSafeAreas}
                onToggleSafeAreas={() => setShowSafeAreas(!showSafeAreas)}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* WORKFLOW 2: DIRECTOR MODE (Control Rig while observing Camera POV)       */}
        {/* ========================================================================= */}
        {mode === 'DIRECTOR' && (
          <div className="relative w-full h-full flex flex-col bg-neutral-950">
            {/* DIRECTOR CONSOLE HEADER STRIP */}
            <div className="h-10 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between z-20 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-100 flex items-center gap-1.5 font-mono">
                  <Film className="w-3.5 h-3.5 text-red-500" />
                  <span>DIRECTOR CONSOLE:</span>
                  <span className="text-cyan-400">{activeRig.name}</span>
                </span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-300 font-mono text-[11px]">
                  {CAMERA_BODIES[activeRig.bodyId].name} on {activeRig.mountType}
                </span>
              </div>

              {/* Layout Switcher & Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 p-0.5 rounded-lg text-[11px] font-medium">
                  <button
                    onClick={() => setDirectorLayout('SPLIT')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      directorLayout === 'SPLIT' ? 'bg-cyan-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Split 50/50
                  </button>
                  <button
                    onClick={() => setDirectorLayout('POV_DOMINANT')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      directorLayout === 'POV_DOMINANT' ? 'bg-cyan-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    POV + PIP Stage
                  </button>
                  <button
                    onClick={() => setDirectorLayout('STAGE_DOMINANT')}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      directorLayout === 'STAGE_DOMINANT' ? 'bg-cyan-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Stage + PIP POV
                  </button>
                </div>

                <button
                  onClick={() => setMode('STAGING')}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs border border-neutral-700"
                >
                  Adjust 3D Placement
                </button>
              </div>
            </div>

            {/* DUAL VIEWPORT + RIG CONTROLLER BODY */}
            <div className="flex-1 flex overflow-hidden">
              {/* VIEWPORTS AREA (Left / Center) */}
              <div className="flex-1 relative flex overflow-hidden">
                {/* LAYOUT 1: SPLIT 50/50 */}
                {directorLayout === 'SPLIT' && (
                  <div className="w-full h-full flex flex-col md:flex-row">
                    {/* LEFT PANE: CAMERA OPTICAL POV (What the camera sees) */}
                    <div className="flex-1 relative border-r border-neutral-800 bg-black overflow-hidden">
                      <canvas
                        ref={povCanvasRef}
                        width={1280}
                        height={720}
                        className="w-full h-full block object-cover"
                      />
                      <DirectorHUD
                        rig={activeRig}
                        isFullscreen={false}
                        onToggleFullscreen={() => setDirectorLayout('POV_DOMINANT')}
                        aspectMask={aspectMask}
                        onSetAspectMask={setAspectMask}
                        showGuides={showGuides}
                        onToggleGuides={() => setShowGuides(!showGuides)}
                        showSafeAreas={showSafeAreas}
                        onToggleSafeAreas={() => setShowSafeAreas(!showSafeAreas)}
                      />
                      <div className="absolute top-3 left-3 pointer-events-none z-10 px-2 py-0.5 rounded bg-black/75 border border-cyan-500/50 text-[10px] font-mono text-cyan-400 font-bold">
                        CAMERA POV (OPTICAL OUTPUT)
                      </div>
                    </div>

                    {/* RIGHT PANE: 3D STAGE & RIG OBSERVER VIEW (Watch the rig move in 3D) */}
                    <div className="flex-1 relative bg-neutral-950 overflow-hidden">
                      <canvas
                        ref={arenaCanvasRef}
                        className="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
                      />
                      <div className="absolute top-3 left-3 pointer-events-none z-10 px-2 py-0.5 rounded bg-black/75 border border-neutral-700 text-[10px] font-mono text-neutral-300 font-bold">
                        3D STAGE OBSERVER (RIG PERSPECTIVE)
                      </div>
                    </div>
                  </div>
                )}

                {/* LAYOUT 2: POV DOMINANT + PIP 3D STAGE */}
                {directorLayout === 'POV_DOMINANT' && (
                  <div className="w-full h-full relative">
                    <canvas
                      ref={povCanvasRef}
                      width={1280}
                      height={720}
                      className="w-full h-full block object-cover"
                    />
                    <DirectorHUD
                      rig={activeRig}
                      isFullscreen={true}
                      onToggleFullscreen={() => setDirectorLayout('SPLIT')}
                      aspectMask={aspectMask}
                      onSetAspectMask={setAspectMask}
                      showGuides={showGuides}
                      onToggleGuides={() => setShowGuides(!showGuides)}
                      showSafeAreas={showSafeAreas}
                      onToggleSafeAreas={() => setShowSafeAreas(!showSafeAreas)}
                    />

                    {/* PIP 3D Stage Observer */}
                    <div className="absolute bottom-4 right-4 w-72 sm:w-88 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-neutral-700 bg-neutral-950 z-20">
                      <canvas
                        ref={arenaCanvasRef}
                        className="w-full h-full block cursor-grab active:cursor-grabbing"
                      />
                      <div className="absolute top-2 left-2 pointer-events-none px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-neutral-300">
                        3D STAGE OBSERVER
                      </div>
                    </div>
                  </div>
                )}

                {/* LAYOUT 3: STAGE DOMINANT + PIP POV */}
                {directorLayout === 'STAGE_DOMINANT' && (
                  <div className="w-full h-full relative">
                    <canvas
                      ref={arenaCanvasRef}
                      className="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
                    />
                    <div className="absolute top-4 right-4 w-72 sm:w-96 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-cyan-500/80 bg-black z-20">
                      <canvas
                        ref={povCanvasRef}
                        width={1280}
                        height={720}
                        className="w-full h-full block object-cover"
                      />
                      <DirectorHUD
                        rig={activeRig}
                        isFullscreen={false}
                        onToggleFullscreen={() => setDirectorLayout('POV_DOMINANT')}
                        aspectMask={aspectMask}
                        onSetAspectMask={setAspectMask}
                        showGuides={showGuides}
                        onToggleGuides={() => setShowGuides(!showGuides)}
                        showSafeAreas={showSafeAreas}
                        onToggleSafeAreas={() => setShowSafeAreas(!showSafeAreas)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT DOCK: REAL-TIME RIG MOVEMENT CONTROLS CONSOLE */}
              <div className="w-80 sm:w-96 p-3 bg-neutral-950/90 border-l border-neutral-800 overflow-y-auto">
                <RigController
                  rig={activeRig}
                  onUpdateMovement={handleUpdateMovement}
                  onUpdateRig={handleUpdateRig}
                  onTriggerPresetMove={handleTriggerPresetMove}
                />
              </div>
            </div>

            {/* BOTTOM BAR: BROADCAST CAMERA SWITCHER STRIP */}
            <div className="h-14 bg-neutral-950 border-t border-neutral-800/90 px-4 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                <span className="text-[11px] font-mono text-neutral-400 shrink-0 font-bold">SWITCH CAMERA:</span>
                {rigs.map((rig, idx) => {
                  const isCurrent = rig.id === activeRigId;
                  return (
                    <button
                      key={rig.id}
                      onClick={() => setActiveRigId(rig.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer shrink-0 ${
                        isCurrent
                          ? 'bg-neutral-800 border-cyan-400 ring-2 ring-cyan-500/40 text-white font-bold'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: rig.colorTag }}
                      />
                      <span>CAM {idx + 1}</span>
                      <span className="text-[10px] text-neutral-400">({rig.mountType})</span>
                      {rig.tally === 'PROGRAM' && (
                        <span className="px-1.5 py-0.2 rounded bg-red-600 text-white font-bold text-[9px] animate-pulse">
                          PGM
                        </span>
                      )}
                      {rig.tally === 'PREVIEW' && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white font-bold text-[9px]">
                          PRV
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tally Cut Buttons for currently active camera */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleSetTally(activeRig.id, 'PROGRAM')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors ${
                    activeRig.tally === 'PROGRAM'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-950 animate-pulse'
                      : 'bg-neutral-800 text-red-400 hover:bg-red-600 hover:text-white border border-red-900'
                  }`}
                >
                  CUT PGM
                </button>
                <button
                  onClick={() => handleSetTally(activeRig.id, 'PREVIEW')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors ${
                    activeRig.tally === 'PREVIEW'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                      : 'bg-neutral-800 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-900'
                  }`}
                >
                  TAKE PRV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* WORKFLOW 3: BROADCAST MULTIVIEWER WALL (6 Channels)                      */}
        {/* ========================================================================= */}
        {mode === 'MULTIVIEW' && (
          <div className="absolute inset-0 z-40 bg-neutral-950 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white tracking-wider font-mono">
                  OB TRUCK MULTIVIEWER WALL • {rigs.length} CHANNELS LIVE
                </h2>
              </div>
              <button
                onClick={() => setMode('DIRECTOR')}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <span>Open Director Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1 overflow-hidden">
              {rigs.map((rig, idx) => {
                const isSelected = rig.id === activeRigId;
                const body = CAMERA_BODIES[rig.bodyId];
                return (
                  <div
                    key={rig.id}
                    onClick={() => {
                      setActiveRigId(rig.id);
                      setMode('DIRECTOR');
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 cursor-pointer flex flex-col justify-between p-3 transition-all ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-500/40 bg-neutral-900'
                        : rig.tally === 'PROGRAM'
                        ? 'border-red-600 bg-neutral-900/90 shadow-lg shadow-red-950/50'
                        : rig.tally === 'PREVIEW'
                        ? 'border-emerald-500 bg-neutral-900/80'
                        : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                    }`}
                  >
                    {/* Top status */}
                    <div className="flex items-center justify-between z-10 font-mono text-xs">
                      <span className="font-bold text-white flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: rig.colorTag }}
                        />
                        <span>{rig.name}</span>
                      </span>
                      <div
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          rig.tally === 'PROGRAM'
                            ? 'bg-red-600 text-white animate-pulse'
                            : rig.tally === 'PREVIEW'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {rig.tally === 'PROGRAM' ? 'PROGRAM' : rig.tally === 'PREVIEW' ? 'PREVIEW' : 'STANDBY'}
                      </div>
                    </div>

                    {/* Camera Spec Banner in center */}
                    <div className="flex flex-col items-center justify-center my-auto py-5">
                      <div className="text-3xl font-bold font-mono text-neutral-200 tracking-wider">
                        CAM {idx + 1}
                      </div>
                      <div className="text-xs text-cyan-400 font-semibold mt-1">{body.name}</div>
                      <div className="text-xs text-neutral-400 font-mono mt-0.5">
                        {rig.mountType} • {Math.round(rig.focalLength)}mm {rig.aperture}
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono mt-1">
                        Pos: [{rig.basePosition[0].toFixed(1)}, {rig.basePosition[2].toFixed(1)}]
                      </span>
                    </div>

                    {/* Bottom controls */}
                    <div className="flex items-center justify-between z-10 text-[11px] font-mono text-neutral-400 border-t border-neutral-800/80 pt-2">
                      <span>{body.resolution}</span>
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleSetTally(rig.id, rig.tally === 'PROGRAM' ? 'OFF' : 'PROGRAM')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rig.tally === 'PROGRAM' ? 'bg-red-600 text-white' : 'bg-neutral-800 hover:text-white'
                          }`}
                        >
                          PGM
                        </button>
                        <button
                          onClick={() => handleSetTally(rig.id, rig.tally === 'PREVIEW' ? 'OFF' : 'PREVIEW')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rig.tally === 'PREVIEW' ? 'bg-emerald-600 text-white' : 'bg-neutral-800 hover:text-white'
                          }`}
                        >
                          PRV
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
