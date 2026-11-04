import React from 'react';
import { CameraRigState, CameraBodyId, MountType } from '../types';
import { CAMERA_BODIES, MOUNT_TYPES, LENSES } from '../data/cameras';
import {
  MapPin,
  Move,
  Camera,
  Layers,
  Sliders,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Maximize,
  Compass
} from 'lucide-react';

interface StagingControlsProps {
  activeRig: CameraRigState;
  onUpdateRig: (updates: Partial<CameraRigState>) => void;
  onUpdateBasePosition: (newPos: [number, number, number]) => void;
  clickToPlaceEnabled: boolean;
  onToggleClickToPlace: () => void;
  onProceedToDirectorMode: () => void;
}

const STAGE_HOTSPOTS = [
  { name: 'FOH Desk', pos: [0, 0, 32] as [number, number, number], desc: 'Front of House' },
  { name: 'Catwalk Tip', pos: [0, 0, 13] as [number, number, number], desc: 'Runway B-Stage' },
  { name: 'Pit Center', pos: [0, 0, 16] as [number, number, number], desc: 'Stage Apron' },
  { name: 'Stage Left Crane', pos: [-14, 0, 8] as [number, number, number], desc: 'High Reach Jib' },
  { name: 'Stage Right Crane', pos: [14, 0, 8] as [number, number, number], desc: 'High Reach Jib' },
  { name: 'Drum Riser', pos: [-3, 1.8, -6] as [number, number, number], desc: 'Upstage Close' },
  { name: 'Guitar Stage Left', pos: [-6, 1.8, -2] as [number, number, number], desc: 'Catwalk Side' },
  { name: 'Arena Skycam', pos: [0, 15, 0] as [number, number, number], desc: 'Aerial Cables' }
];

export const StagingControls: React.FC<StagingControlsProps> = ({
  activeRig,
  onUpdateRig,
  onUpdateBasePosition,
  clickToPlaceEnabled,
  onToggleClickToPlace,
  onProceedToDirectorMode
}) => {
  const currentBody = CAMERA_BODIES[activeRig.bodyId];
  const currentMount = MOUNT_TYPES[activeRig.mountType];
  const currentLens = LENSES.find(l => l.id === activeRig.lensId) || LENSES[0];

  return (
    <div className="bg-neutral-900/90 backdrop-blur-md rounded-xl border border-neutral-800 p-4 flex flex-col gap-4 text-xs font-sans text-neutral-200 shadow-xl max-h-[calc(100vh-8.5rem)] overflow-y-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-100 tracking-wide">3D STAGE RIG POSITIONING</h3>
            <p className="text-[11px] text-neutral-400 font-mono">
              Editing: <span className="text-cyan-400 font-semibold">{activeRig.name}</span>
            </p>
          </div>
        </div>

        {/* Proceed to Director Mode Button */}
        <button
          onClick={onProceedToDirectorMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-950 transition-all cursor-pointer"
        >
          <span>Director Mode</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SECTION 1: INTERACTIVE CLICK-TO-PLACE IN 3D ARENA */}
      <div className="bg-neutral-950/70 p-3 rounded-lg border border-neutral-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-neutral-200 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Stage Placement</span>
          </span>
          <button
            onClick={onToggleClickToPlace}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
              clickToPlaceEnabled
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200'
            }`}
          >
            {clickToPlaceEnabled ? 'Click-to-Place: ON' : 'Click-to-Place: OFF'}
          </button>
        </div>

        {clickToPlaceEnabled && (
          <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-200 leading-relaxed font-mono">
            ℹ️ <span className="font-bold">Click anywhere on the 3D Stage deck, catwalk, or arena floor</span> to immediately relocate this camera rig!
          </div>
        )}

        {/* 3D Coordinate Sliders */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* X (Left / Right) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-neutral-400">STAGE X (Left/Right)</span>
              <span className="text-cyan-400 font-bold">{activeRig.basePosition[0].toFixed(1)}m</span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="0.5"
              value={activeRig.basePosition[0]}
              onChange={e =>
                onUpdateBasePosition([
                  parseFloat(e.target.value),
                  activeRig.basePosition[1],
                  activeRig.basePosition[2]
                ])
              }
              className="w-full accent-cyan-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
              <span>Stage Left</span>
              <span>Center</span>
              <span>Stage Right</span>
            </div>
          </div>

          {/* Z (Upstage / Front) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-neutral-400">STAGE Z (Depth/Arena)</span>
              <span className="text-cyan-400 font-bold">{activeRig.basePosition[2].toFixed(1)}m</span>
            </div>
            <input
              type="range"
              min="-15"
              max="40"
              step="0.5"
              value={activeRig.basePosition[2]}
              onChange={e =>
                onUpdateBasePosition([
                  activeRig.basePosition[0],
                  activeRig.basePosition[1],
                  parseFloat(e.target.value)
                ])
              }
              className="w-full accent-cyan-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
              <span>Upstage Back</span>
              <span>Catwalk Tip</span>
              <span>FOH Stadium</span>
            </div>
          </div>
        </div>

        {/* Quick Hotspot Anchors */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-neutral-800/60">
          <span className="text-neutral-400 text-[10px] font-mono">QUICK STAGE HOTSPOTS:</span>
          <div className="grid grid-cols-4 gap-1.5">
            {STAGE_HOTSPOTS.map(h => (
              <button
                key={h.name}
                onClick={() => onUpdateBasePosition(h.pos)}
                className="px-1.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 text-[10px] text-neutral-200 text-left transition-colors"
                title={`${h.name} (${h.desc})`}
              >
                <div className="font-semibold truncate">{h.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: CAMERA BODY SELECTION */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span>Professional Cinema Camera Body</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(CAMERA_BODIES) as CameraBodyId[]).map(bId => {
            const b = CAMERA_BODIES[bId];
            const isCur = activeRig.bodyId === bId;
            return (
              <div
                key={bId}
                onClick={() => onUpdateRig({ bodyId: bId })}
                className={`p-2 rounded-lg border cursor-pointer flex items-center gap-2.5 transition-all ${
                  isCur
                    ? 'bg-neutral-800 border-cyan-400 ring-1 ring-cyan-500/50 shadow-md'
                    : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="w-12 h-12 bg-neutral-900 rounded p-1 flex items-center justify-center shrink-0">
                  <img src={b.image} alt={b.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-white truncate">{b.name}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">{b.resolution}</span>
                  <span className="text-[9px] text-neutral-400 truncate">{b.sensor}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: MOUNT & SUPPORT RIG SELECTION */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Mount & Movement Support Rig</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(MOUNT_TYPES) as MountType[]).map(mType => {
            const m = MOUNT_TYPES[mType];
            const isCur = activeRig.mountType === mType;
            return (
              <div
                key={mType}
                onClick={() => onUpdateRig({ mountType: mType })}
                className={`p-2 rounded-lg border cursor-pointer transition-all ${
                  isCur
                    ? 'bg-neutral-800 border-indigo-400 ring-1 ring-indigo-500/50 shadow-md'
                    : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="font-bold text-xs text-white">{m.name.split('/')[0]}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">{m.category}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: LENS SELECTION */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Cinema Optics & Lens</span>
        </label>
        <select
          value={activeRig.lensId}
          onChange={e => {
            const l = LENSES.find(x => x.id === e.target.value);
            if (l) {
              onUpdateRig({
                lensId: l.id,
                focalLength: l.defaultFocalLength,
                aperture: l.maxAperture
              });
            }
          }}
          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
        >
          {LENSES.map(lens => (
            <option key={lens.id} value={lens.id}>
              {lens.name} • {lens.maxAperture} ({lens.type})
            </option>
          ))}
        </select>
      </div>

      {/* FOOTER CTA: DIRECT ENTRY TO DIRECTOR MODE */}
      <div className="pt-2 border-t border-neutral-800 flex justify-end">
        <button
          onClick={onProceedToDirectorMode}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>Open Director Mode (Control Rig & Observe POV)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
