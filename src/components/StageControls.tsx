import React from 'react';
import { StagePreset } from '../types';
import { STAGE_PRESETS } from '../data/cameras';
import { Layers, Eye, Sparkles } from 'lucide-react';

interface StageControlsProps {
  currentPreset: StagePreset;
  onSelectPreset: (preset: StagePreset) => void;
  onSelectDirectorView: (view: 'FOH' | 'STAGE_TOP' | 'PIT_WIDE' | 'HERO_PERFORMER' | 'SIDE_CRANE') => void;
}

export const StageControls: React.FC<StageControlsProps> = ({
  currentPreset,
  onSelectPreset,
  onSelectDirectorView
}) => {
  return (
    <div className="bg-neutral-900/90 backdrop-blur-md rounded-xl border border-neutral-800 p-3 flex flex-col gap-2.5 text-xs font-sans text-neutral-200">
      {/* HEADER */}
      <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
        <div className="p-1 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <Layers className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="font-bold tracking-wide text-neutral-100">3D CONCERT STAGE & VENUE</span>
          <span className="text-[10px] text-neutral-400 font-mono ml-2">(Stage Folder Visuals)</span>
        </div>
      </div>

      {/* 4 STAGE PRESETS */}
      <div className="grid grid-cols-2 gap-2">
        {STAGE_PRESETS.map(preset => {
          const isSelected = preset.id === currentPreset.id;
          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`p-1.5 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${
                isSelected
                  ? 'bg-neutral-800 border-indigo-400 shadow-md ring-1 ring-indigo-500/40'
                  : 'bg-neutral-950/40 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="w-full h-14 rounded overflow-hidden relative">
                <img
                  src={preset.thumb}
                  alt={preset.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-1 left-1.5 font-bold text-[10px] text-white truncate max-w-[90%]">
                  {preset.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DIRECTOR ARENA CAMERA PRESETS */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-neutral-800">
        <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-medium">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Director 3D Arena Perspectives</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => onSelectDirectorView('FOH')}
            className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 font-medium border border-neutral-700/60"
          >
            FOH Soundboard
          </button>
          <button
            onClick={() => onSelectDirectorView('PIT_WIDE')}
            className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 font-medium border border-neutral-700/60"
          >
            Catwalk Pit
          </button>
          <button
            onClick={() => onSelectDirectorView('STAGE_TOP')}
            className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 font-medium border border-neutral-700/60"
          >
            Overhead Grid
          </button>
          <button
            onClick={() => onSelectDirectorView('HERO_PERFORMER')}
            className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 font-medium border border-neutral-700/60"
          >
            Performer Hero
          </button>
          <button
            onClick={() => onSelectDirectorView('SIDE_CRANE')}
            className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 font-medium border border-neutral-700/60"
          >
            High Stadium Jib
          </button>
        </div>
      </div>
    </div>
  );
};

