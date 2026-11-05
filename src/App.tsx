import React, { useState, useEffect, useRef } from 'react';
import { CameraRigState, StagePreset, AspectRatioMask, RigMovementParams, AppMode } from './types';
import { STAGE_PRESETS, CAMERA_BODIES } from './data/cameras';
import { SceneManager } from './scene/SceneManager';
import { StageBuilder } from './scene/StageBuilder';
import { DirectorHUD } from './components/DirectorHUD';
import { RigController } from './components/RigController';
import { StagingControls } from './components/StagingControls';
import { CameraManager } from './components/CameraManager';
import { StageControls } from './components/StageControls';
import { HelpModal } from './components/HelpModal';
import {
  Video,
  Layers,
  LayoutGrid,
  Camera,
  MapPin,
  Film,
  Tv,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

const INITIAL_RIGS: CameraRigState[] = [
  {
    id: 'cam-1',
    name: 'CAM 1 • STAGE LEFT CRANE',
    bodyId: 'VENICE2',
    lensId: 'CP_50',
    focalLength: 35,
    aperture: 'T1.3',
    sensorCrop: 'FF',
    focusDistance: 8.0,
    mountType: 'CRANE',
    basePosition: [-14.5, 0.0, 10.5],
    movement: {
      pan: 0,
      tilt: 0,
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
      craneBaseAngle: 125,
      craneArmLength: 9.5,
      craneElevation: 24,
      craneHeadPan: 0,
      craneHeadTilt: -14,
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
    name: 'CAM 2 • CATWALK SLIDER',
    bodyId: 'BURANO',
    lensId: 'CZ_16_35',
    focalLength: 24,
    aperture: 'T2.9',
    sensorCrop: 'FF',
    focusDistance: 5.0,
    mountType: 'SLIDER',
    basePosition: [0.0, 1.8, 15.0],
    movement: {
      pan: 0,
      tilt: 4,
      roll: 0,
      height: 1.35,
      sliderLength: 3.2,
      sliderPosition: 0.5,
      sliderPingPong: true,
      sliderSpeed: 0.75,
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
    tally: 'PREVIEW',
    colorTag: '#22c55e',
    lookAtTarget: true
  },
  {
    id: 'cam-3',
    name: 'CAM 3 • FOH BOX ZOOM',
    bodyId: 'FX6',
    lensId: 'CINE_BOX_25_250',
    focalLength: 110,
    aperture: 'T3.5',
    sensorCrop: 'FF',
    focusDistance: 34.0,
    mountType: 'TRIPOD',
    basePosition: [0.0, 0.6, 35.0],
    movement: {
      pan: 0,
      tilt: -2,
      roll: 0,
      height: 1.9,
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
    focalLength: 35,
    aperture: 'f/4.0',
    sensorCrop: 'FF',
    focusDistance: 3.5,
    mountType: 'TRIPOD',
    basePosition: [-2.8, 3.2, -4.8],
    movement: {
      pan: 75,
      tilt: -6,
      roll: 0,
      height: 1.4,
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
    name: 'CAM 5 • ON-STAGE STEADICAM',
    bodyId: 'FX6',
    lensId: 'CP_24',
    focalLength: 24,
    aperture: 'T1.4',
    sensorCrop: 'FF',
    focusDistance: 4.0,
    mountType: 'GIMBAL',
    basePosition: [4.2, 1.8, 1.8],
    movement: {
      pan: 0,
      tilt: 0,
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
      handheldSwayIntensity: 0.65,
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
    focalLength: 28,
    aperture: 'T1.3',
    sensorCrop: 'FF',
    focusDistance: 14.0,
    mountType: 'CABLE',
    basePosition: [0.0, 0.0, 6.0],
    movement: {
      pan: 0,
      tilt: -35,
      roll: 0,
      height: 15.0,
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
      cableElevationDrop: 3.0,
      cablePingPong: true,
      cableSpeed: 0.55,
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

  // App Modes: STAGING (3D setup) | DIRECTOR (Live Rig + POV) | MULTIVIEW (Live Monitor Wall)
  const [mode, setMode] = useState<AppMode>('STAGING');

  const [rigs, setRigs] = useState<CameraRigState[]>(INITIAL_RIGS);
  const [activeRigId, setActiveRigId] = useState<string>('cam-1');
  const [currentStagePreset, setCurrentStagePreset] = useState<StagePreset>(STAGE_PRESETS[0]);

  // Staging sidebar active tab
  const [stagingTab, setStagingTab] = useState<'POSITION' | 'ALL_CAMERAS' | 'STAGE_THEMES'>('POSITION');
  const [clickToPlaceEnabled, setClickToPlaceEnabled] = useState<boolean>(true);
  const [hoverCoord, setHoverCoord] = useState<[number, number, number] | null>(null);

  // Director mode layout
  const [directorLayout, setDirectorLayout] = useState<'SPLIT' | 'POV_DOMINANT' | 'STAGE_DOMINANT'>('SPLIT');

  // Help Modal state
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Viewfinder overlays
  const [aspectMask, setAspectMask] = useState<AspectRatioMask>('16:9');
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [showSafeAreas, setShowSafeAreas] = useState<boolean>(true);

  const activeRig = rigs.find(r => r.id === activeRigId) || rigs[0];

  // Initialize SceneManager once on persistent canvases
  useEffect(() => {
    if (!arenaCanvasRef.current) return;

    const mgr = new SceneManager(arenaCanvasRef.current, povCanvasRef.current || undefined);
    sceneManagerRef.current = mgr;

    mgr.onSelectRig = (id: string) => {
      setActiveRigId(id);
    };

    mgr.onMoveRigPosition = (id: string, newPos: [number, number, number]) => {
      setRigs(prev => prev.map(r => (r.id === id ? { ...r, basePosition: newPos } : r)));
    };

    mgr.onHoverStageCoord = coord => {
      setHoverCoord(coord);
    };

    mgr.setStagePreset(currentStagePreset);
    mgr.updateRigs(rigs, activeRigId);

    return () => {
      mgr.destroy();
    };
  }, []);

  // Sync rigs to SceneManager
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.updateRigs(rigs, activeRigId);
    }
  }, [rigs, activeRigId]);

  // Sync clickToPlace & multiview flags and trigger resize when switching modes or layouts
  useEffect(() => {
    const mgr = sceneManagerRef.current;
    if (!mgr) return;

    mgr.clickToPlaceEnabled = mode === 'STAGING' && clickToPlaceEnabled;
    mgr.isMultiviewActive = mode === 'MULTIVIEW';
    mgr.setPovCanvas(povCanvasRef.current);

    // Allow layout flexbox transition to settle then resize
    const timer = setTimeout(() => {
      mgr.handleResize();
    }, 20);
    return () => clearTimeout(timer);
  }, [mode, directorLayout, clickToPlaceEnabled]);

  // Stage Preset change
  const handleSelectPreset = (preset: StagePreset) => {
    setCurrentStagePreset(preset);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setStagePreset(preset);
    }
  };

  // Director Viewport Preset
  const handleDirectorView = (
    view: 'FOH' | 'STAGE_TOP' | 'PIT_WIDE' | 'HERO_PERFORMER' | 'SIDE_CRANE' | 'BACKSTAGE' | 'ON_STAGE_CROWD'
  ) => {
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

  // Add Rig (auto-snaps to correct architectural elevation)
  const handleAddRig = (newRig: CameraRigState) => {
    const surfaceY = StageBuilder.getSurfaceElevationAt(newRig.basePosition[0], newRig.basePosition[2]);
    const adjustedRig: CameraRigState = {
      ...newRig,
      basePosition: [newRig.basePosition[0], surfaceY, newRig.basePosition[2]]
    };
    setRigs(prev => [...prev, adjustedRig]);
    setActiveRigId(adjustedRig.id);
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
        setRigs(prev =>
          prev.map(r =>
            r.id === crane.id
              ? {
                  ...r,
                  movement: {
                    ...r.movement,
                    craneElevation: 12,
                    craneArmLength: 11.5,
                    craneBaseAngle: 115,
                    craneHeadTilt: -15
                  }
                }
              : r
          )
        );
        break;
      }
      case 'CATWALK_PUSH': {
        const slider = rigs.find(r => r.mountType === 'SLIDER') || activeRig;
        setActiveRigId(slider.id);
        setRigs(prev =>
          prev.map(r =>
            r.id === slider.id
              ? {
                  ...r,
                  movement: { ...r.movement, sliderPosition: 0.9, sliderPingPong: true, sliderSpeed: 1.25 }
                }
              : r
          )
        );
        break;
      }
      case 'DRUMMER_REVEAL': {
        const ptz = rigs.find(r => r.bodyId === 'FR7') || activeRig;
        setActiveRigId(ptz.id);
        setRigs(prev =>
          prev.map(r => (r.id === ptz.id ? { ...r, movement: { ...r.movement, pan: 78, tilt: -4 } } : r))
        );
        break;
      }
      case 'SKYCAM_FLY': {
        const cable = rigs.find(r => r.mountType === 'CABLE') || activeRig;
        setActiveRigId(cable.id);
        setRigs(prev =>
          prev.map(r =>
            r.id === cable.id
              ? { ...r, movement: { ...r.movement, cablePosition: 0.85, cableElevationDrop: 3.5, cablePingPong: true } }
              : r
          )
        );
        break;
      }
      case 'HERO_ORBIT': {
        const stedi = rigs.find(r => r.mountType === 'GIMBAL') || activeRig;
        setActiveRigId(stedi.id);
        setRigs(prev =>
          prev.map(r =>
            r.id === stedi.id
              ? { ...r, movement: { ...r.movement, handheldSway: true, handheldSwayIntensity: 0.85 } }
              : r
          )
        );
        break;
      }
      case 'FOH_ZOOM': {
        const foh = rigs.find(r => r.mountType === 'TRIPOD') || activeRig;
        setActiveRigId(foh.id);
        setRigs(prev => prev.map(r => (r.id === foh.id ? { ...r, focalLength: 195 } : r)));
        break;
      }
    }
  };

  // Compute CSS classes for the persistent 3D Arena and Optical POV containers
  const isDirectorSplit = mode === 'DIRECTOR' && directorLayout === 'SPLIT';
  const isDirectorPovDom = mode === 'DIRECTOR' && directorLayout === 'POV_DOMINANT';
  const isDirectorStageDom = mode === 'DIRECTOR' && directorLayout === 'STAGE_DOMINANT';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 select-none">
      {/* TOP HEADER: BRANDING, 3-MODE WORKFLOW SWITCHER & HELP BUTTON */}
      <header className="h-13 bg-neutral-950/95 border-b border-neutral-800 px-4 flex items-center justify-between z-30 shrink-0 backdrop-blur-md">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 via-cyan-600 to-indigo-600 flex items-center justify-center p-0.5 shadow-md">
            <div className="w-full h-full bg-neutral-950 rounded-[7px] flex items-center justify-center">
              <Camera className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wider flex items-center gap-2">
              <span>CINESTAGE 3D</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded font-mono font-normal hidden sm:inline">
                ARCHITECTURAL 3D STAGE
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

        {/* Right: Live PGM Status & Help Button */}
        <div className="flex items-center gap-2.5">
          <div className="hidden xl:flex items-center gap-2 font-mono text-xs bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full">
            <span className="text-neutral-500">ON AIR:</span>
            <span className="text-red-400 font-bold animate-pulse">
              {rigs.find(r => r.tally === 'PROGRAM')?.name || 'NONE'}
            </span>
          </div>

          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold text-xs transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Ayuda / Guía</span>
          </button>
        </div>
      </header>

      {/* DIRECTOR CONSOLE SUB-HEADER (Visible when in Director Mode) */}
      {mode === 'DIRECTOR' && (
        <div className="h-10 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between z-20 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-100 flex items-center gap-1.5 font-mono">
              <Film className="w-3.5 h-3.5 text-red-500" />
              <span>DIRECTOR CONSOLE:</span>
              <span className="text-cyan-400">{activeRig.name}</span>
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300 font-mono text-[11px]">
              {CAMERA_BODIES[activeRig.bodyId].name} en {activeRig.mountType} (Pos: [{activeRig.basePosition[0].toFixed(1)}m, {activeRig.basePosition[1].toFixed(1)}m, {activeRig.basePosition[2].toFixed(1)}m])
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 p-0.5 rounded-lg text-[11px] font-medium">
              <button
                onClick={() => setDirectorLayout('SPLIT')}
                className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
                  directorLayout === 'SPLIT' ? 'bg-cyan-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Split 50/50 (POV + 3D)
              </button>
              <button
                onClick={() => setDirectorLayout('POV_DOMINANT')}
                className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
                  directorLayout === 'POV_DOMINANT' ? 'bg-cyan-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                POV Grande + PIP 3D
              </button>
              <button
                onClick={() => setDirectorLayout('STAGE_DOMINANT')}
                className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
                  directorLayout === 'STAGE_DOMINANT' ? 'bg-cyan-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Escenario 3D + PIP POV
              </button>
            </div>

            <button
              onClick={() => setMode('STAGING')}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs border border-neutral-700 cursor-pointer"
            >
              Reubicar en 3D
            </button>
          </div>
        </div>
      )}

      {/* MAIN PERSISTENT WORKSPACE BODY */}
      <div className="relative flex-1 w-full flex overflow-hidden">
        {/* CENTER / LEFT VIEWPORTS STAGE (Holds persistent Arena & POV Canvases so they never unmount!) */}
        <div
          className={`flex-1 relative flex overflow-hidden ${
            isDirectorSplit ? 'flex-col md:flex-row' : ''
          }`}
        >
          {/* 1. OPTICAL CAMERA POV CONTAINER */}
          <div
            className={
              mode === 'STAGING' || isDirectorStageDom
                ? 'absolute top-4 right-4 z-20 w-[390px] sm:w-[450px] aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-cyan-500/80 bg-black'
                : isDirectorSplit
                ? 'flex-1 relative border-r border-neutral-800 bg-black overflow-hidden order-1'
                : isDirectorPovDom
                ? 'w-full h-full relative bg-black overflow-hidden'
                : 'hidden'
            }
          >
            <canvas
              ref={povCanvasRef}
              width={1280}
              height={720}
              className="w-full h-full block object-cover"
            />
            <DirectorHUD
              rig={activeRig}
              isFullscreen={isDirectorPovDom}
              onToggleFullscreen={() => {
                if (mode === 'STAGING') {
                  setMode('DIRECTOR');
                  setDirectorLayout('POV_DOMINANT');
                } else {
                  setDirectorLayout(isDirectorPovDom ? 'SPLIT' : 'POV_DOMINANT');
                }
              }}
              aspectMask={aspectMask}
              onSetAspectMask={setAspectMask}
              showGuides={showGuides}
              onToggleGuides={() => setShowGuides(!showGuides)}
              showSafeAreas={showSafeAreas}
              onToggleSafeAreas={() => setShowSafeAreas(!showSafeAreas)}
            />
          </div>

          {/* 2. 3D ARCHITECTURAL STAGE & ARENA CANVAS CONTAINER */}
          <div
            className={
              mode === 'STAGING' || isDirectorStageDom
                ? 'w-full h-full relative bg-neutral-950 overflow-hidden'
                : isDirectorSplit
                ? 'flex-1 relative bg-neutral-950 overflow-hidden order-2'
                : isDirectorPovDom
                ? 'absolute bottom-4 right-4 z-20 w-72 sm:w-88 aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-neutral-700 bg-neutral-950'
                : 'w-full h-full relative bg-neutral-950 overflow-hidden'
            }
          >
            <canvas
              ref={arenaCanvasRef}
              className="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
            />

            {mode === 'DIRECTOR' && (
              <div className="absolute top-3 left-3 pointer-events-none z-10 px-2.5 py-1 rounded bg-black/75 border border-neutral-700 text-[10px] font-mono text-neutral-300 font-bold">
                OBSERVADOR 3D DEL ESCENARIO (ARRASTRA PARA ORBITAR)
              </div>
            )}
          </div>

          {/* STAGING MODE OVERLAYS (Left Control Dock & Bottom Instructions) */}
          {mode === 'STAGING' && (
            <>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-neutral-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/40 text-xs font-mono text-neutral-200 shadow-xl flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>
                  <strong className="text-cyan-400">MODO ESCENARIO 3D:</strong> Arrastra para orbitar • Haz clic sobre cualquier piso/tarima para colocar la cámara • Clic en cualquier rig para seleccionarlo
                </span>
              </div>

              <div className="absolute top-4 left-4 z-20 w-84 sm:w-96 flex flex-col gap-2">
                <div className="flex items-center gap-1 bg-neutral-900/90 backdrop-blur-md p-1 rounded-xl border border-neutral-800 text-xs font-medium">
                  <button
                    onClick={() => setStagingTab('POSITION')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      stagingTab === 'POSITION' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Posición & Rig</span>
                  </button>
                  <button
                    onClick={() => setStagingTab('ALL_CAMERAS')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      stagingTab === 'ALL_CAMERAS' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Cámaras ({rigs.length})</span>
                  </button>
                  <button
                    onClick={() => setStagingTab('STAGE_THEMES')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      stagingTab === 'STAGE_THEMES' ? 'bg-cyan-600 text-white font-bold shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Escenario 3D</span>
                  </button>
                </div>

                {stagingTab === 'POSITION' && (
                  <StagingControls
                    activeRig={activeRig}
                    hoverCoord={hoverCoord}
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
                    onOpenHelpReferences={() => setIsHelpOpen(true)}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* RIGHT DOCK IN DIRECTOR MODE: REAL-TIME RIG MOVEMENT CONTROLS CONSOLE */}
        {mode === 'DIRECTOR' && (
          <div className="w-84 sm:w-96 p-3 bg-neutral-950/95 border-l border-neutral-800 overflow-y-auto shrink-0 z-20">
            <RigController
              rig={activeRig}
              onUpdateMovement={handleUpdateMovement}
              onUpdateRig={handleUpdateRig}
              onTriggerPresetMove={handleTriggerPresetMove}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* WORKFLOW 3: LIVE MULTIVIEWER WALL (Renders real-time 3D POV of all cams!) */}
        {/* ========================================================================= */}
        {mode === 'MULTIVIEW' && (
          <div className="absolute inset-0 z-40 bg-neutral-950 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <LayoutGrid className="w-5 h-5 text-indigo-400" />
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wider font-mono">
                    OB TRUCK MULTIVIEWER WALL • {rigs.length} CÁMARAS EN VIVO (3D POV REAL-TIME)
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    Haz clic en cualquier monitor para operar esa cámara en el Modo Director o cambia sus luces Tally (PGM / PRV)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode('STAGING')}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer"
                >
                  Reubicar Cámaras en 3D
                </button>
                <button
                  onClick={() => setMode('DIRECTOR')}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Abrir Director Mode</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 flex-1 overflow-y-auto">
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
                    className={`relative rounded-xl overflow-hidden border-2 cursor-pointer flex flex-col justify-between bg-black transition-all group ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-500/40'
                        : rig.tally === 'PROGRAM'
                        ? 'border-red-600 shadow-lg shadow-red-950/50'
                        : rig.tally === 'PREVIEW'
                        ? 'border-emerald-500'
                        : 'border-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    {/* Real-Time 3D Optical POV Canvas for this Camera! */}
                    <canvas
                      ref={el => {
                        if (sceneManagerRef.current) {
                          sceneManagerRef.current.registerMultiviewCanvas(rig.id, el);
                        }
                      }}
                      width={640}
                      height={360}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Top Broadcast Overlay */}
                    <div className="relative z-10 flex items-center justify-between p-2.5 bg-gradient-to-b from-black/85 via-black/40 to-transparent font-mono text-xs">
                      <span className="font-bold text-white flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: rig.colorTag }}
                        />
                        <span className="truncate">{rig.name}</span>
                      </span>
                      <div
                        className={`px-2 py-0.5 rounded font-bold text-[10px] shrink-0 ${
                          rig.tally === 'PROGRAM'
                            ? 'bg-red-600 text-white animate-pulse'
                            : rig.tally === 'PREVIEW'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-900/80 text-neutral-300 border border-neutral-700'
                        }`}
                      >
                        {rig.tally === 'PROGRAM' ? 'ON AIR' : rig.tally === 'PREVIEW' ? 'PREVIEW' : `CAM ${idx + 1}`}
                      </div>
                    </div>

                    {/* Center Crosshair */}
                    <div className="relative z-10 pointer-events-none flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                      <div className="px-2.5 py-1 rounded bg-black/70 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        Clic para Operar Rig en Modo Director
                      </div>
                    </div>

                    {/* Bottom Specs & Tally Cut Bar */}
                    <div className="relative z-10 flex items-center justify-between p-2.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-[11px] font-mono text-neutral-300">
                      <div>
                        <span className="text-cyan-400 font-bold">{body.name}</span>
                        <span className="mx-1.5 text-neutral-500">•</span>
                        <span>{rig.mountType}</span>
                        <span className="mx-1.5 text-neutral-500">•</span>
                        <span className="text-amber-300">{Math.round(rig.focalLength)}mm</span>
                      </div>
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleSetTally(rig.id, rig.tally === 'PROGRAM' ? 'OFF' : 'PROGRAM')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                            rig.tally === 'PROGRAM' ? 'bg-red-600 text-white' : 'bg-neutral-900/90 hover:bg-red-600/80 text-neutral-300 hover:text-white border border-neutral-700'
                          }`}
                        >
                          PGM
                        </button>
                        <button
                          onClick={() => handleSetTally(rig.id, rig.tally === 'PREVIEW' ? 'OFF' : 'PREVIEW')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                            rig.tally === 'PREVIEW' ? 'bg-emerald-600 text-white' : 'bg-neutral-900/90 hover:bg-emerald-600/80 text-neutral-300 hover:text-white border border-neutral-700'
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

      {/* BOTTOM CAMERA SWITCHER STRIP IN DIRECTOR MODE */}
      {mode === 'DIRECTOR' && (
        <div className="h-14 bg-neutral-950 border-t border-neutral-800/90 px-4 flex items-center justify-between gap-3 shrink-0 z-30">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[11px] font-mono text-neutral-400 shrink-0 font-bold">CAMBIAR CÁMARA:</span>
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

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSetTally(activeRig.id, 'PROGRAM')}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors cursor-pointer ${
                activeRig.tally === 'PROGRAM'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950 animate-pulse'
                  : 'bg-neutral-800 text-red-400 hover:bg-red-600 hover:text-white border border-red-900'
              }`}
            >
              CUT PGM
            </button>
            <button
              onClick={() => handleSetTally(activeRig.id, 'PREVIEW')}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wider transition-colors cursor-pointer ${
                activeRig.tally === 'PREVIEW'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'bg-neutral-800 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-900'
              }`}
            >
              TAKE PRV
            </button>
          </div>
        </div>
      )}

      {/* HELP & USER GUIDE MODAL */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onSelectMode={m => setMode(m)}
      />
    </div>
  );
}
