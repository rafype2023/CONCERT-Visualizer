import React from 'react';
import { CameraRigState, RigMovementParams } from '../types';
import { LENSES, CAMERA_BODIES } from '../data/cameras';
import {
  Compass,
  Move,
  Sliders,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Video,
  Target,
  Sparkles,
  Zap
} from 'lucide-react';

interface RigControllerProps {
  rig: CameraRigState;
  onUpdateMovement: (updates: Partial<RigMovementParams>) => void;
  onUpdateRig: (updates: Partial<CameraRigState>) => void;
  onTriggerPresetMove: (preset: 'HERO_CHORUS_DIVE' | 'CATWALK_PUSH' | 'DRUMMER_REVEAL' | 'SKYCAM_FLY' | 'HERO_ORBIT' | 'FOH_ZOOM') => void;
}

export const RigController: React.FC<RigControllerProps> = ({
  rig,
  onUpdateMovement,
  onUpdateRig,
  onTriggerPresetMove
}) => {
  const { movement } = rig;
  const lens = LENSES.find(l => l.id === rig.lensId) || LENSES[0];
  const body = CAMERA_BODIES[rig.bodyId];

  return (
    <div className="bg-neutral-900/90 backdrop-blur-md rounded-xl border border-neutral-800 p-3.5 flex flex-col gap-3 text-xs font-sans text-neutral-200">
      {/* HEADER: Title & Look-At Target Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide text-neutral-100">RIG MOVEMENT CONTROLS</h3>
            <p className="text-[11px] text-neutral-400 font-mono">
              Active Mount: <span className="text-cyan-400 font-semibold">{rig.mountType}</span>
            </p>
          </div>
        </div>

        {/* Auto Track Stage Target button */}
        <button
          onClick={() => onUpdateRig({ lookAtTarget: !rig.lookAtTarget })}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            rig.lookAtTarget
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
              : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>{rig.lookAtTarget ? 'Target Tracking: ON' : 'Lock to Singer'}</span>
        </button>
      </div>

      {/* SECTION 1: PAN & TILT FLUID HEAD */}
      <div className="grid grid-cols-2 gap-3 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
        {/* PAN */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-mono text-[10px]">PAN (YAW)</span>
            <span className="font-mono text-cyan-400 font-bold">{Math.round(movement.pan)}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            disabled={rig.lookAtTarget}
            value={movement.pan}
            onChange={e => onUpdateMovement({ pan: parseFloat(e.target.value) })}
            className="w-full accent-cyan-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
            <span>-180°</span>
            <button
              onClick={() => onUpdateMovement({ pan: 0 })}
              className="text-neutral-400 hover:text-white underline cursor-pointer"
            >
              0°
            </button>
            <span>+180°</span>
          </div>
        </div>

        {/* TILT */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 font-mono text-[10px]">TILT (PITCH)</span>
            <span className="font-mono text-cyan-400 font-bold">{Math.round(movement.tilt)}°</span>
          </div>
          <input
            type="range"
            min="-80"
            max="80"
            step="1"
            disabled={rig.lookAtTarget}
            value={movement.tilt}
            onChange={e => onUpdateMovement({ tilt: parseFloat(e.target.value) })}
            className="w-full accent-cyan-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
            <span>-80° (Down)</span>
            <button
              onClick={() => onUpdateMovement({ tilt: 0 })}
              className="text-neutral-400 hover:text-white underline cursor-pointer"
            >
              0° (Level)
            </button>
            <span>+80° (Up)</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: RIG-SPECIFIC PARAMETERS */}
      {/* 2A: SLIDER CONTROLS */}
      {rig.mountType === 'SLIDER' && (
        <div className="flex flex-col gap-2.5 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-200">SLIDER CARRIAGE POSITION</span>
            <button
              onClick={() => onUpdateMovement({ sliderPingPong: !movement.sliderPingPong })}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                movement.sliderPingPong
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              {movement.sliderPingPong ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{movement.sliderPingPong ? 'Auto Ping-Pong Active' : 'Start Auto Ping-Pong'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-neutral-400">Position along rail:</span>
              <span className="text-emerald-400 font-bold">{Math.round(movement.sliderPosition * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={movement.sliderPosition}
              onChange={e => onUpdateMovement({ sliderPosition: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-800/50">
            <div>
              <span className="text-neutral-400 text-[10px] block">Rail Length</span>
              <input
                type="range"
                min="1"
                max="4"
                step="0.5"
                value={movement.sliderLength}
                onChange={e => onUpdateMovement({ sliderLength: parseFloat(e.target.value) })}
                className="w-full accent-neutral-400 h-1 bg-neutral-800 rounded"
              />
              <span className="font-mono text-[10px] text-neutral-300">{movement.sliderLength} meters</span>
            </div>
            <div>
              <span className="text-neutral-400 text-[10px] block">Motor Speed</span>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={movement.sliderSpeed}
                onChange={e => onUpdateMovement({ sliderSpeed: parseFloat(e.target.value) })}
                className="w-full accent-neutral-400 h-1 bg-neutral-800 rounded"
              />
              <span className="font-mono text-[10px] text-neutral-300">{movement.sliderSpeed.toFixed(1)}x</span>
            </div>
            <div>
              <span className="text-neutral-400 text-[10px] block">Track Angle</span>
              <input
                type="range"
                min="-90"
                max="90"
                step="5"
                value={movement.sliderAngle}
                onChange={e => onUpdateMovement({ sliderAngle: parseFloat(e.target.value) })}
                className="w-full accent-neutral-400 h-1 bg-neutral-800 rounded"
              />
              <span className="font-mono text-[10px] text-neutral-300">{movement.sliderAngle}°</span>
            </div>
          </div>
        </div>
      )}

      {/* 2B: CRANE / TECHNOJIB CONTROLS */}
      {rig.mountType === 'CRANE' && (
        <div className="flex flex-col gap-2.5 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
          <span className="font-bold text-neutral-200">TECHNOJIB BOOM & REACH</span>

          <div className="grid grid-cols-2 gap-3">
            {/* Jib Base Swing */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-neutral-400">JIB SWING (360°)</span>
                <span className="text-indigo-400 font-bold">{Math.round(movement.craneBaseAngle)}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={movement.craneBaseAngle}
                onChange={e => onUpdateMovement({ craneBaseAngle: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Jib Elevation */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-neutral-400">BOOM ELEVATION</span>
                <span className="text-indigo-400 font-bold">{Math.round(movement.craneElevation)}°</span>
              </div>
              <input
                type="range"
                min="-35"
                max="65"
                step="1"
                value={movement.craneElevation}
                onChange={e => onUpdateMovement({ craneElevation: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 pt-1 border-t border-neutral-800/50">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-neutral-400">TELESCOPING ARM EXTENSION</span>
              <span className="text-indigo-300 font-bold">{movement.craneArmLength.toFixed(1)}m</span>
            </div>
            <input
              type="range"
              min="4"
              max="12"
              step="0.2"
              value={movement.craneArmLength}
              onChange={e => onUpdateMovement({ craneArmLength: parseFloat(e.target.value) })}
              className="w-full accent-indigo-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 2C: DOLLY TRACK CONTROLS */}
      {rig.mountType === 'DOLLY' && (
        <div className="flex flex-col gap-2.5 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-200">FLOOR DOLLY POSITION</span>
            <button
              onClick={() => onUpdateMovement({ dollyPingPong: !movement.dollyPingPong })}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                movement.dollyPingPong
                  ? 'bg-amber-600/20 text-amber-300 border-amber-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              {movement.dollyPingPong ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{movement.dollyPingPong ? 'Auto Track Push' : 'Start Auto Traverse'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-neutral-400">Track Traverse (0 to 100%):</span>
              <span className="text-amber-400 font-bold">{Math.round(movement.dollyTrackPosition * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={movement.dollyTrackPosition}
              onChange={e => onUpdateMovement({ dollyTrackPosition: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/50">
            <span className="text-neutral-400 text-[10px]">Track Layout:</span>
            <button
              onClick={() => onUpdateMovement({ dollyTrackType: 'STRAIGHT' })}
              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                movement.dollyTrackType === 'STRAIGHT'
                  ? 'bg-amber-600/30 text-amber-200 border-amber-500'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              Straight Pit
            </button>
            <button
              onClick={() => onUpdateMovement({ dollyTrackType: 'RUNWAY_CURVE' })}
              className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                movement.dollyTrackType === 'RUNWAY_CURVE'
                  ? 'bg-amber-600/30 text-amber-200 border-amber-500'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              Catwalk Runway Arc
            </button>
          </div>
        </div>
      )}

      {/* 2D: CABLECAM CONTROLS */}
      {rig.mountType === 'CABLE' && (
        <div className="flex flex-col gap-2.5 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-200">AERIAL CABLECAM FLIGHT</span>
            <button
              onClick={() => onUpdateMovement({ cablePingPong: !movement.cablePingPong })}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                movement.cablePingPong
                  ? 'bg-sky-600/20 text-sky-300 border-sky-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              {movement.cablePingPong ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{movement.cablePingPong ? 'Auto Flyover' : 'Start Auto Flyover'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-neutral-400">Cable Traverse:</span>
              <span className="text-sky-400 font-bold">{Math.round(movement.cablePosition * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={movement.cablePosition}
              onChange={e => onUpdateMovement({ cablePosition: parseFloat(e.target.value) })}
              className="w-full accent-sky-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1 pt-1 border-t border-neutral-800/50">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-neutral-400">Winch Elevation Drop:</span>
              <span className="text-sky-300 font-bold">{movement.cableElevationDrop.toFixed(1)}m below cable</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={movement.cableElevationDrop}
              onChange={e => onUpdateMovement({ cableElevationDrop: parseFloat(e.target.value) })}
              className="w-full accent-sky-400 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 2E: HANDHELD / GIMBAL CONTROLS */}
      {rig.mountType === 'GIMBAL' && (
        <div className="flex flex-col gap-2.5 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-200">STEADICAM & GIMBAL OPERATOR</span>
            <button
              onClick={() => onUpdateMovement({ handheldSway: !movement.handheldSway })}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                movement.handheldSway
                  ? 'bg-rose-600/20 text-rose-300 border-rose-500/40'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}
            >
              <span>{movement.handheldSway ? 'Organic Sway: ACTIVE' : 'Smooth Tripod Mode'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-neutral-400">Handheld Shake / Bob Intensity:</span>
              <span className="text-rose-400 font-bold">{Math.round(movement.handheldSwayIntensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={movement.handheldSwayIntensity}
              onChange={e => onUpdateMovement({ handheldSwayIntensity: parseFloat(e.target.value) })}
              className="w-full accent-rose-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* SECTION 3: LENS OPTICS & ZOOM */}
      <div className="flex flex-col gap-2 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
        <div className="flex items-center justify-between">
          <span className="font-bold text-neutral-200">OPTICAL ZOOM & SENSOR</span>
          <span className="font-mono text-cyan-400 font-bold text-xs">{Math.round(rig.focalLength)}mm</span>
        </div>

        {/* Focal length slider */}
        <input
          type="range"
          min={lens.minFocalLength}
          max={lens.maxFocalLength}
          step="1"
          value={rig.focalLength}
          disabled={lens.type === 'PRIME'}
          onChange={e => onUpdateRig({ focalLength: parseFloat(e.target.value) })}
          className="w-full accent-cyan-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
        />

        <div className="flex items-center justify-between text-[10px]">
          <span className="text-neutral-400 font-mono">
            {lens.type === 'PRIME' ? `Prime: ${lens.defaultFocalLength}mm` : `${lens.minFocalLength}mm - ${lens.maxFocalLength}mm Zoom`}
          </span>

          {/* Sensor Crop Mode Button */}
          <button
            onClick={() => onUpdateRig({ sensorCrop: rig.sensorCrop === 'FF' ? 'S35' : 'FF' })}
            className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 hover:bg-neutral-700 font-mono font-medium border border-neutral-700"
          >
            Mode: {rig.sensorCrop === 'FF' ? 'Full Frame (36x24mm)' : 'Super 35 Crop'}
          </button>
        </div>
      </div>

      {/* SECTION 4: CINEMATIC MOTION PRESETS */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-neutral-800">
        <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Cinematic Move Triggers</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => onTriggerPresetMove('HERO_CHORUS_DIVE')}
            className="px-2 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 text-[10px] font-medium text-neutral-200 text-left transition-colors"
          >
            Chorus Crane Dive
          </button>
          <button
            onClick={() => onTriggerPresetMove('CATWALK_PUSH')}
            className="px-2 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 text-[10px] font-medium text-neutral-200 text-left transition-colors"
          >
            Catwalk Dolly Push
          </button>
          <button
            onClick={() => onTriggerPresetMove('DRUMMER_REVEAL')}
            className="px-2 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 text-[10px] font-medium text-neutral-200 text-left transition-colors"
          >
            Slider Drummer Reveal
          </button>
          <button
            onClick={() => onTriggerPresetMove('SKYCAM_FLY')}
            className="px-2 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 text-[10px] font-medium text-neutral-200 text-left transition-colors"
          >
            Skycam Flyover
          </button>
          <button
            onClick={() => onTriggerPresetMove('HERO_ORBIT')}
            className="px-2 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 text-[10px] font-medium text-neutral-200 text-left transition-colors"
          >
            Performer 360 Orbit
          </button>
          <button
            onClick={() => onTriggerPresetMove('FOH_ZOOM')}
            className="px-2 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/80 text-[10px] font-medium text-neutral-200 text-left transition-colors"
          >
            FOH Box Zoom In
          </button>
        </div>
      </div>
    </div>
  );
};
