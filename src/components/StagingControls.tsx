import React from 'react';
import { CameraRigState, CameraBodyId, MountType } from '../types';
import { CAMERA_BODIES, MOUNT_TYPES, LENSES } from '../data/cameras';
import { StageBuilder } from '../scene/StageBuilder';
import {
  MapPin,
  Move,
  Camera,
  Sliders,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface StagingControlsProps {
  activeRig: CameraRigState;
  hoverCoord: [number, number, number] | null;
  onUpdateRig: (updates: Partial<CameraRigState>) => void;
  onUpdateBasePosition: (newPos: [number, number, number]) => void;
  clickToPlaceEnabled: boolean;
  onToggleClickToPlace: () => void;
  onProceedToDirectorMode: () => void;
}

const STAGE_HOTSPOTS = [
  { name: 'FOH Control', pos: [0, 0.6, 35.0] as [number, number, number], desc: 'Front of House' },
  { name: 'Catwalk Tip', pos: [0, 1.8, 25.0] as [number, number, number], desc: 'Pasarela Frente' },
  { name: 'Catwalk Mid', pos: [1.6, 1.8, 14.0] as [number, number, number], desc: 'Pasarela Media' },
  { name: 'Main Stage Center', pos: [-3.5, 1.8, 2.5] as [number, number, number], desc: 'Tarima Principal' },
  { name: 'Upper Band Riser', pos: [-3.2, 3.2, -5.0] as [number, number, number], desc: '2do Nivel Batería' },
  { name: 'Stage Left Crane', pos: [-15.0, 0.0, 10.0] as [number, number, number], desc: 'Foso Izquierdo' },
  { name: 'Stage Right Crane', pos: [15.0, 0.0, 10.0] as [number, number, number], desc: 'Foso Derecho' },
  { name: 'Backstage Corridor', pos: [0, 0.0, -16.5] as [number, number, number], desc: 'Detrás del Escenario' }
];

export const StagingControls: React.FC<StagingControlsProps> = ({
  activeRig,
  hoverCoord,
  onUpdateRig,
  onUpdateBasePosition,
  clickToPlaceEnabled,
  onToggleClickToPlace,
  onProceedToDirectorMode
}) => {
  const handleXZSliderChange = (newX: number, newZ: number) => {
    const autoY = StageBuilder.getSurfaceElevationAt(newX, newZ);
    onUpdateBasePosition([newX, autoY, newZ]);
  };

  return (
    <div className="bg-neutral-900/90 backdrop-blur-md rounded-xl border border-neutral-800 p-4 flex flex-col gap-3.5 text-xs font-sans text-neutral-200 shadow-xl max-h-[calc(100vh-8.5rem)] overflow-y-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-100 tracking-wide">POSICIONAR EN ESCENARIO 3D</h3>
            <p className="text-[11px] text-neutral-400 font-mono">
              Activa: <span className="text-cyan-400 font-semibold">{activeRig.name}</span>
            </p>
          </div>
        </div>

        {/* Proceed to Director Mode Button */}
        <button
          onClick={onProceedToDirectorMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-950 transition-all cursor-pointer"
        >
          <span>Ver POV</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SECTION 1: INTERACTIVE CLICK-TO-PLACE IN 3D ARENA */}
      <div className="bg-neutral-950/70 p-3 rounded-lg border border-neutral-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-neutral-200 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-cyan-400" />
            <span>Colocación Interactiva 3D</span>
          </span>
          <button
            onClick={onToggleClickToPlace}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
              clickToPlaceEnabled
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200'
            }`}
          >
            {clickToPlaceEnabled ? 'Click-to-Place: ACTIVO' : 'Click-to-Place: OFF'}
          </button>
        </div>

        {clickToPlaceEnabled && (
          <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-200 leading-relaxed font-mono flex items-center justify-between">
            <span>Haz clic en cualquier piso, tarima, pasarela o backstage para mover la cámara allí.</span>
            {hoverCoord && (
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold shrink-0 ml-2">
                [{hoverCoord[0]}m, {hoverCoord[1]}m, {hoverCoord[2]}m]
              </span>
            )}
          </div>
        )}

        {/* 3D Coordinate Sliders (X, Z, Y) */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {/* X (Left / Right) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-neutral-400">EJE X (Lados)</span>
              <span className="text-cyan-400 font-bold">{activeRig.basePosition[0].toFixed(1)}m</span>
            </div>
            <input
              type="range"
              min="-32"
              max="32"
              step="0.5"
              value={activeRig.basePosition[0]}
              onChange={e => handleXZSliderChange(parseFloat(e.target.value), activeRig.basePosition[2])}
              className="w-full accent-cyan-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>

          {/* Z (Backstage / Stage / Catwalk / FOH) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-neutral-400">EJE Z (Fondo)</span>
              <span className="text-cyan-400 font-bold">{activeRig.basePosition[2].toFixed(1)}m</span>
            </div>
            <input
              type="range"
              min="-22"
              max="42"
              step="0.5"
              value={activeRig.basePosition[2]}
              onChange={e => handleXZSliderChange(activeRig.basePosition[0], parseFloat(e.target.value))}
              className="w-full accent-cyan-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>

          {/* Y (Floor Elevation) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-neutral-400">NIVEL Y (Piso)</span>
              <span className="text-amber-400 font-bold">{activeRig.basePosition[1].toFixed(1)}m</span>
            </div>
            <input
              type="range"
              min="0"
              max="14"
              step="0.2"
              value={activeRig.basePosition[1]}
              onChange={e =>
                onUpdateBasePosition([
                  activeRig.basePosition[0],
                  parseFloat(e.target.value),
                  activeRig.basePosition[2]
                ])
              }
              className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Hotspot Anchors */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-neutral-800/60">
          <span className="text-neutral-400 text-[10px] font-mono">UBICACIONES RÁPIDAS DEL ESCENARIO 3D:</span>
          <div className="grid grid-cols-4 gap-1.5">
            {STAGE_HOTSPOTS.map(h => (
              <button
                key={h.name}
                onClick={() => onUpdateBasePosition(h.pos)}
                className="px-1.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700/60 text-[10px] text-neutral-200 text-left transition-colors cursor-pointer"
                title={`${h.name} (${h.desc})`}
              >
                <div className="font-semibold truncate">{h.name}</div>
                <div className="text-[9px] text-neutral-400 truncate">{h.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: CAMERA BODY SELECTION */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span>1. Elige la Cámara Profesional (Sony Cinema)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(CAMERA_BODIES) as CameraBodyId[]).map(bId => {
            const b = CAMERA_BODIES[bId];
            const isCur = activeRig.bodyId === bId;
            return (
              <div
                key={bId}
                onClick={() => onUpdateRig({ bodyId: bId })}
                className={`p-2 rounded-lg border cursor-pointer flex items-center gap-2 transition-all ${
                  isCur
                    ? 'bg-neutral-800 border-cyan-400 ring-1 ring-cyan-500/50 shadow-md'
                    : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="w-11 h-11 bg-neutral-900 rounded p-1 flex items-center justify-center shrink-0">
                  <img src={b.image} alt={b.name} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-white truncate">{b.name}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">{b.resolution}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: MOUNT & SUPPORT RIG SELECTION */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>2. Elige el Rig / Soporte de Movimiento</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
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
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>3. Elige el Lente de Cine</span>
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
      <div className="pt-1 border-t border-neutral-800 flex justify-end">
        <button
          onClick={onProceedToDirectorMode}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>Ir a Modo Director (Operar Rig y Ver POV)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
