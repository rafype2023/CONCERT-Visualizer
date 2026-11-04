import React, { useState, useEffect, useRef } from 'react';
import { CameraRigState, StagePreset, AspectRatioMask, RigMovementParams } from './types';
import { STAGE_PRESETS, CAMERA_BODIES, LENSES } from './data/cameras';
import { SceneManager } from './scene/SceneManager';
import { DirectorHUD } from './components/DirectorHUD';
import { RigController } from './components/RigController';
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
  Info
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
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  const [rigs, setRigs] = useState<CameraRigState[]>(INITIAL_RIGS);
  const [activeRigId, setActiveRigId] = useState<string>('cam-1');
  const [currentStagePreset, setCurrentStagePreset] = useState<StagePreset>(STAGE_PRESETS[0]);

  // View modes
  const [activeTab, setActiveTab] = useState<'CONTROLS' | 'CAMERAS' | 'STAGE'>('CONTROLS');
  const [isPipFullscreen, setIsPipFullscreen] = useState<boolean>(false);
  const [isPipVisible, setIsPipVisible] = useState<boolean>(true);
  const [isMultiviewMode, setIsMultiviewMode] = useState<boolean>(false);

  // Viewfinder overlays
  const [aspectMask, setAspectMask] = useState<AspectRatioMask>('16:9');
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [showSafeAreas, setShowSafeAreas] = useState<boolean>(true);

  // Active rig object
  const activeRig = rigs.find(r => r.id === activeRigId) || rigs[0];

  // Initialize Scene
  useEffect(() => {
    if (!mainCanvasRef.current) return;

    const mgr = new SceneManager(mainCanvasRef.current, pipCanvasRef.current || undefined);
    sceneManagerRef.current = mgr;

    mgr.onSelectRig = (id: string) => {
      setActiveRigId(id);
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

  // Update PIP canvas reference
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setPipCanvas(pipCanvasRef.current);
    }
  }, [isPipFullscreen, isMultiviewMode]);

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

  // Tally Switch
  const handleSetTally = (id: string, tally: 'PROGRAM' | 'PREVIEW' | 'OFF') => {
    setRigs(prev =>
      prev.map(r => {
        if (tally === 'PROGRAM') {
          // Only one camera on program at a time
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
        // Find crane or active
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
      {/* TOP PRODUCTION HEADER BAR */}
      <header className="h-12 bg-neutral-950/90 border-b border-neutral-800/80 px-4 flex items-center justify-between z-30 shrink-0 backdrop-blur-md">
        {/* Left: App Branding */}
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
                MULTICAM & RIG PREVIZ
              </span>
            </h1>
            <p className="text-[10px] text-neutral-400 font-mono hidden sm:block">
              Stage: <span className="text-cyan-400">{currentStagePreset.name}</span>
            </p>
          </div>
        </div>

        {/* Center: Live PGM / PRV Status Pill */}
        <div className="hidden md:flex items-center gap-2 font-mono text-xs bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full">
          <span className="text-neutral-500">LIVE PGM:</span>
          <span className="text-red-400 font-bold animate-pulse">
            {rigs.find(r => r.tally === 'PROGRAM')?.name || 'NONE'}
          </span>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-500">PRV:</span>
          <span className="text-emerald-400 font-bold">
            {rigs.find(r => r.tally === 'PREVIEW')?.name || 'NONE'}
          </span>
        </div>

        {/* Right: View Toggles & Presets */}
        <div className="flex items-center gap-2 text-xs">
          {/* Multiview Mode button */}
          <button
            onClick={() => setIsMultiviewMode(!isMultiviewMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium transition-colors ${
              isMultiviewMode
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isMultiviewMode ? 'Exit Multiview' : 'OB Multiviewer'}</span>
          </button>

          {/* PIP Viewfinder Fullscreen Eyepiece mode */}
          <button
            onClick={() => setIsPipFullscreen(!isPipFullscreen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-medium transition-colors ${
              isPipFullscreen
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-md'
                : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:bg-neutral-800'
            }`}
          >
            {isPipFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPipFullscreen ? 'Exit Eyepiece' : 'Director POV'}</span>
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE BODY */}
      <div className="relative flex-1 w-full h-[calc(100vh-3rem)] overflow-hidden">
        {/* THREE.JS MAIN 3D ARENA CANVAS */}
        <canvas
          ref={mainCanvasRef}
          className="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
        />

        {/* 3D ARENA INSTRUCTIONS PILL (Bottom left) */}
        {!isPipFullscreen && (
          <div className="absolute bottom-3 left-4 z-20 pointer-events-none bg-neutral-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-800/80 text-[11px] text-neutral-400 font-mono flex items-center gap-3">
            <span>Left Click + Drag: Orbit Arena</span>
            <span>•</span>
            <span>Right Click: Pan</span>
            <span>•</span>
            <span>Scroll: Zoom</span>
            <span>•</span>
            <span className="text-cyan-400">Click any Rig to Select</span>
          </div>
        )}

        {/* FLOATING / DOCKED PICTURE-IN-PICTURE (PIP) CAMERA VIEWFINDER */}
        {isPipVisible && (
          <div
            className={`z-20 transition-all duration-200 overflow-hidden shadow-2xl rounded-xl border border-neutral-700 bg-neutral-950 ${
              isPipFullscreen
                ? 'absolute inset-0 rounded-none border-none'
                : 'absolute top-4 right-4 w-[420px] sm:w-[480px] aspect-video border-2 border-cyan-500/70 shadow-cyan-950/40'
            }`}
          >
            {/* Viewfinder Video Output Canvas */}
            <canvas
              ref={pipCanvasRef}
              width={1280}
              height={720}
              className="w-full h-full block object-cover"
            />

            {/* Broadcast Director HUD Overlays */}
            <DirectorHUD
              rig={activeRig}
              isFullscreen={isPipFullscreen}
              onToggleFullscreen={() => setIsPipFullscreen(!isPipFullscreen)}
              aspectMask={aspectMask}
              onSetAspectMask={setAspectMask}
              showGuides={showGuides}
              onToggleGuides={() => setShowGuides(!showGuides)}
              showSafeAreas={showSafeAreas}
              onToggleSafeAreas={() => setShowSafeAreas(!showSafeAreas)}
            />
          </div>
        )}

        {/* SIDE CONTROL PANEL DOCK (Left side) */}
        <div
          className={`absolute top-4 left-4 z-20 w-80 sm:w-96 flex flex-col gap-2 transition-all ${
            isPipFullscreen ? 'hidden' : 'block'
          }`}
        >
          {/* TAB BAR NAVIGATION */}
          <div className="flex items-center gap-1 bg-neutral-900/90 backdrop-blur-md p-1 rounded-xl border border-neutral-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('CONTROLS')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'CONTROLS'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Rig Controls</span>
            </button>
            <button
              onClick={() => setActiveTab('CAMERAS')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'CAMERAS'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Cameras ({rigs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('STAGE')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'STAGE'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D Stage</span>
            </button>
          </div>

          {/* ACTIVE TAB CONTENT */}
          <div className="max-h-[calc(100vh-8.5rem)] overflow-y-auto pr-0.5">
            {activeTab === 'CONTROLS' && (
              <RigController
                rig={activeRig}
                onUpdateMovement={handleUpdateMovement}
                onUpdateRig={handleUpdateRig}
                onTriggerPresetMove={handleTriggerPresetMove}
              />
            )}
            {activeTab === 'CAMERAS' && (
              <CameraManager
                rigs={rigs}
                activeRigId={activeRigId}
                onSelectRig={setActiveRigId}
                onAddRig={handleAddRig}
                onRemoveRig={handleRemoveRig}
                onSetTally={handleSetTally}
              />
            )}
            {activeTab === 'STAGE' && (
              <StageControls
                currentPreset={currentStagePreset}
                onSelectPreset={handleSelectPreset}
                onSelectDirectorView={handleDirectorView}
              />
            )}
          </div>
        </div>

        {/* MULTIVIEWER WALL OVERLAY (When OB Multiviewer mode is active) */}
        {isMultiviewMode && (
          <div className="absolute inset-0 z-40 bg-neutral-950 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white tracking-wider">
                  PRODUCTION CONTROL MULTIVIEWER WALL (6 CHANNELS)
                </h2>
              </div>
              <button
                onClick={() => setIsMultiviewMode(false)}
                className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200"
              >
                Exit Multiviewer
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
                      setIsMultiviewMode(false);
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 cursor-pointer flex flex-col justify-between p-2.5 transition-all ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-500/40 bg-neutral-900'
                        : rig.tally === 'PROGRAM'
                        ? 'border-red-600 bg-neutral-900'
                        : 'border-neutral-800 bg-neutral-950/80 hover:border-neutral-700'
                    }`}
                  >
                    {/* Top status */}
                    <div className="flex items-center justify-between z-10 font-mono text-[11px]">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: rig.colorTag }}
                        />
                        {rig.name}
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
                        {rig.tally}
                      </div>
                    </div>

                    {/* Camera Spec Banner in center */}
                    <div className="flex flex-col items-center justify-center my-auto py-6">
                      <div className="text-2xl font-bold font-mono text-neutral-200 tracking-wider">
                        CAM {idx + 1}
                      </div>
                      <div className="text-xs text-cyan-400 font-semibold">{body.name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-1">
                        {rig.mountType} • {Math.round(rig.focalLength)}mm
                      </div>
                    </div>

                    {/* Bottom controls */}
                    <div className="flex items-center justify-between z-10 text-[10px] font-mono text-neutral-400 border-t border-neutral-800/80 pt-1.5">
                      <span>{body.resolution}</span>
                      <span className="text-cyan-400">Click to Switch</span>
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
