import React from 'react';
import { StagePreset } from '../types';
import { STAGE_PRESETS } from '../data/cameras';
import { Layers, Eye, Image as ImageIcon } from 'lucide-react';

interface StageControlsProps {
  currentPreset: StagePreset;
  onSelectPreset: (preset: StagePreset) => void;
  onSelectDirectorView: (
    view: 'FOH' | 'STAGE_TOP' | 'PIT_WIDE' | 'HERO_PERFORMER' | 'SIDE_CRANE' | 'BACKSTAGE' | 'ON_STAGE_CROWD'
  ) => void;
  onOpenHelpReferences: () => void;
}

export const StageControls: React.FC<StageControlsProps> = ({
  currentPreset,
  onSelectPreset,
  onSelectDirectorView,
  onOpenHelpReferences
}) => {
  return (
    <div className="bg-neutral-900/90 backdrop-blur-md rounded-xl border border-neutral-800 p-3.5 flex flex-col gap-3 text-xs font-sans text-neutral-200 shadow-xl">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold tracking-wide text-neutral-100 block">ESCENARIO ARQUITECTÓNICO 3D</span>
            <span className="text-[10px] text-neutral-400 font-mono">Visuales en Pantallas LED & Ángulos 3D</span>
          </div>
        </div>
        <button
          onClick={onOpenHelpReferences}
          className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-cyan-400 border border-neutral-700 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
        >
          <ImageIcon className="w-3 h-3" />
          <span>Ver Referencias</span>
        </button>
      </div>

      {/* DIRECTOR ARENA CAMERA PRESETS (Matching the Reference Angles!) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-neutral-300 text-[11px] font-bold">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ángulos de Inspección del Escenario 3D</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onSelectDirectorView('FOH')}
            className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-200 font-medium border border-neutral-700/70 text-left cursor-pointer"
          >
            1. Vista Frontal (FOH)
          </button>
          <button
            onClick={() => onSelectDirectorView('SIDE_CRANE')}
            className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-200 font-medium border border-neutral-700/70 text-left cursor-pointer"
          >
            2. Vista Lateral (Andamios)
          </button>
          <button
            onClick={() => onSelectDirectorView('ON_STAGE_CROWD')}
            className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-200 font-medium border border-neutral-700/70 text-left cursor-pointer"
          >
            3. Desde Tarima al Público
          </button>
          <button
            onClick={() => onSelectDirectorView('BACKSTAGE')}
            className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-200 font-medium border border-neutral-700/70 text-left cursor-pointer"
          >
            4. Vista Backstage (Detrás)
          </button>
          <button
            onClick={() => onSelectDirectorView('PIT_WIDE')}
            className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-200 font-medium border border-neutral-700/70 text-left cursor-pointer"
          >
            5. Foso & Pasarela (Pit)
          </button>
          <button
            onClick={() => onSelectDirectorView('STAGE_TOP')}
            className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-200 font-medium border border-neutral-700/70 text-left cursor-pointer"
          >
            6. Vista Cenital (Plano Planta)
          </button>
        </div>
      </div>

      {/* 4 PROCEDURAL LED WALL VISUAL THEMES */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-neutral-800">
        <span className="text-[11px] font-bold text-neutral-300">
          Tema Visual en Pantallas LED 3D (Animado en Tiempo Real):
        </span>
        <div className="grid grid-cols-2 gap-2">
          {STAGE_PRESETS.map(preset => {
            const isSelected = preset.id === currentPreset.id;
            return (
              <div
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`p-2 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${
                  isSelected
                    ? 'bg-neutral-800 border-indigo-400 shadow-md ring-1 ring-indigo-500/40'
                    : 'bg-neutral-950/50 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: preset.accentColor }}
                  />
                  <span className="font-bold text-[11px] text-white truncate">{preset.name}</span>
                </div>
                <span className="text-[10px] text-neutral-400 line-clamp-1">{preset.subtitle}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
