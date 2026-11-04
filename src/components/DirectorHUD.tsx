import React, { useState } from 'react';
import { CameraRigState, AspectRatioMask } from '../types';
import { CAMERA_BODIES, LENSES } from '../data/cameras';
import { Maximize2, Minimize2, Grid, Crosshair, Eye, Video, Radio } from 'lucide-react';

interface DirectorHUDProps {
  rig: CameraRigState;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  aspectMask: AspectRatioMask;
  onSetAspectMask: (mask: AspectRatioMask) => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  showSafeAreas: boolean;
  onToggleSafeAreas: () => void;
}

export const DirectorHUD: React.FC<DirectorHUDProps> = ({
  rig,
  isFullscreen,
  onToggleFullscreen,
  aspectMask,
  onSetAspectMask,
  showGuides,
  onToggleGuides,
  showSafeAreas,
  onToggleSafeAreas
}) => {
  const body = CAMERA_BODIES[rig.bodyId];
  const lens = LENSES.find(l => l.id === rig.lensId) || LENSES[0];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none overflow-hidden font-mono text-xs">
      {/* Aspect Ratio Mattes (Masks) */}
      {aspectMask === '2.39:1' && (
        <>
          <div className="absolute top-0 left-0 right-0 h-[14%] bg-black/90 pointer-events-none border-b border-neutral-700/50 z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-[14%] bg-black/90 pointer-events-none border-t border-neutral-700/50 z-10" />
        </>
      )}
      {aspectMask === '4:3' && (
        <>
          <div className="absolute top-0 bottom-0 left-0 w-[12.5%] bg-black/90 pointer-events-none border-r border-neutral-700/50 z-10" />
          <div className="absolute top-0 bottom-0 right-0 w-[12.5%] bg-black/90 pointer-events-none border-l border-neutral-700/50 z-10" />
        </>
      )}
      {aspectMask === '9:16' && (
        <>
          <div className="absolute top-0 bottom-0 left-0 w-[35%] bg-black/90 pointer-events-none border-r border-neutral-700/50 z-10" />
          <div className="absolute top-0 bottom-0 right-0 w-[35%] bg-black/90 pointer-events-none border-l border-neutral-700/50 z-10" />
        </>
      )}

      {/* Rule of Thirds Grid Overlay */}
      {showGuides && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-1/3 left-0 right-0 border-b border-cyan-400/25" />
          <div className="absolute top-2/3 left-0 right-0 border-b border-cyan-400/25" />
          <div className="absolute left-1/3 top-0 bottom-0 border-r border-cyan-400/25" />
          <div className="absolute left-2/3 top-0 bottom-0 border-r border-cyan-400/25" />
        </div>
      )}

      {/* Safe Action (90%) and Safe Title (80%) Boxes */}
      {showSafeAreas && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          {/* Action Safe 90% */}
          <div className="absolute w-[90%] h-[90%] border border-amber-400/30">
            <span className="absolute top-1 left-1 text-[9px] text-amber-400/60 font-sans">90% ACTION</span>
          </div>
          {/* Title Safe 80% */}
          <div className="absolute w-[80%] h-[80%] border border-dashed border-amber-400/20">
            <span className="absolute top-1 left-1 text-[9px] text-amber-400/50 font-sans">80% TITLE</span>
          </div>
        </div>
      )}

      {/* Center Crosshairs */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
        <div className="w-8 h-8 relative flex items-center justify-center">
          <div className="w-full h-[1px] bg-red-500/70" />
          <div className="h-full w-[1px] bg-red-500/70 absolute" />
          <div className="w-2.5 h-2.5 rounded-full border border-red-500/60 absolute" />
        </div>
      </div>

      {/* TOP BAR: REC Status, Timecode, Camera ID & Tally */}
      <div className="relative z-20 flex items-center justify-between pointer-events-auto bg-neutral-950/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-800">
        <div className="flex items-center gap-2.5">
          {/* REC indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/40 font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>REC</span>
          </div>
          <span className="text-neutral-100 font-bold tracking-wider">01:24:32:18</span>
          <span className="text-neutral-400 text-[10px] hidden sm:inline">23.98 FPS • 4K DCI</span>
        </div>

        {/* Center: Camera Name & Tally Light */}
        <div className="flex items-center gap-2">
          <div
            className={`px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider flex items-center gap-1.5 shadow-sm transition-colors ${
              rig.tally === 'PROGRAM'
                ? 'bg-red-600 text-white shadow-red-500/50 animate-pulse'
                : rig.tally === 'PREVIEW'
                ? 'bg-emerald-600 text-white shadow-emerald-500/50'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>{rig.tally === 'PROGRAM' ? 'ON AIR' : rig.tally === 'PREVIEW' ? 'PRV' : 'CAM'}</span>
          </div>
          <span className="font-semibold text-neutral-200 uppercase tracking-wide">{rig.name}</span>
        </div>

        {/* Right Tools: Viewfinder guides & fullscreen */}
        <div className="flex items-center gap-1 text-neutral-400">
          <button
            onClick={onToggleGuides}
            className={`p-1 rounded hover:bg-neutral-800 hover:text-neutral-100 transition-colors ${showGuides ? 'text-cyan-400 bg-cyan-950/50' : ''}`}
            title="Toggle Rule-of-Thirds Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleSafeAreas}
            className={`p-1 rounded hover:bg-neutral-800 hover:text-neutral-100 transition-colors ${showSafeAreas ? 'text-amber-400 bg-amber-950/50' : ''}`}
            title="Toggle Safe Areas"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleFullscreen}
            className="p-1 rounded hover:bg-neutral-800 hover:text-neutral-100 transition-colors text-neutral-300"
            title={isFullscreen ? 'Exit Fullscreen' : 'Director Eyepiece Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* BOTTOM BAR: Lens specs, Sensor mode, Rig type & battery */}
      <div className="relative z-20 flex items-center justify-between pointer-events-auto bg-neutral-950/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-800 text-[11px]">
        {/* Left: Lens & Optics info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <span className="text-[10px] text-neutral-400 font-normal">FOCAL:</span>
            <span>{Math.round(rig.focalLength)}mm</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <span className="text-[10px] text-neutral-400 font-normal">IRIS:</span>
            <span className="font-bold">{rig.aperture}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-neutral-300">
            <span className="text-[10px] text-neutral-500 font-normal">SENSOR:</span>
            <span className="bg-neutral-800 px-1.5 py-0.2 rounded text-[10px] font-semibold text-neutral-200">
              {rig.sensorCrop === 'FF' ? 'FULL FRAME' : 'SUPER 35'}
            </span>
          </div>
        </div>

        {/* Center: Camera Body & Rig Badge */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 text-[10px]">{body.name}</span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-200 font-medium">{rig.mountType}</span>
        </div>

        {/* Right: Aspect ratio selector & Media/Power */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-700 rounded p-0.5 text-[9px]">
            {(['16:9', '2.39:1', '4:3', '9:16', 'OFF'] as AspectRatioMask[]).map(mask => (
              <button
                key={mask}
                onClick={() => onSetAspectMask(mask)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  aspectMask === mask ? 'bg-cyan-600 text-white font-bold' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {mask}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-neutral-400 hidden md:inline font-mono">
            BAT <span className="text-emerald-400 font-bold">14.8V</span>
          </div>
        </div>
      </div>
    </div>
  );
};
