import React, { useState } from 'react';
import { CameraRigState, CameraBodyId, MountType } from '../types';
import { CAMERA_BODIES, MOUNT_TYPES, LENSES } from '../data/cameras';
import { Plus, Video, Radio, Trash2, Settings2, Sliders, Check, MapPin } from 'lucide-react';

interface CameraManagerProps {
  rigs: CameraRigState[];
  activeRigId: string;
  onSelectRig: (id: string) => void;
  onAddRig: (newRig: CameraRigState) => void;
  onRemoveRig: (id: string) => void;
  onSetTally: (id: string, tally: 'PROGRAM' | 'PREVIEW' | 'OFF') => void;
}

export const CameraManager: React.FC<CameraManagerProps> = ({
  rigs,
  activeRigId,
  onSelectRig,
  onAddRig,
  onRemoveRig,
  onSetTally
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Add camera wizard state
  const [selectedBody, setSelectedBody] = useState<CameraBodyId>('VENICE2');
  const [selectedMount, setSelectedMount] = useState<MountType>('CRANE');
  const [selectedLens, setSelectedLens] = useState<string>('CP_50');
  const [customName, setCustomName] = useState<string>('');
  const [posPreset, setPosPreset] = useState<string>('FOH');

  const handleCreate = () => {
    const lensObj = LENSES.find(l => l.id === selectedLens) || LENSES[0];
    const bodyObj = CAMERA_BODIES[selectedBody];

    let basePos: [number, number, number] = [0, 0, 30];
    let defPan = 0;
    let defTilt = -5;
    let defHeight = 1.6;

    if (posPreset === 'FOH') {
      basePos = [0, 0, 32];
      defPan = 0;
      defTilt = -4;
    } else if (posPreset === 'PIT_CENTER') {
      basePos = [0, 0, 16];
      defPan = 0;
      defTilt = 5;
    } else if (posPreset === 'STAGE_LEFT_CRANE') {
      basePos = [-14, 0, 10];
      defPan = 45;
      defTilt = -15;
    } else if (posPreset === 'DRUM_RISER') {
      basePos = [-3, 1.8, -6];
      defPan = 75;
      defTilt = 0;
    } else if (posPreset === 'SKYCAM') {
      basePos = [0, 16, 0];
      defPan = 0;
      defTilt = -45;
    }

    const newRig: CameraRigState = {
      id: `cam-${Date.now().toString().slice(-4)}`,
      name: customName || `CAM ${rigs.length + 1} - ${bodyObj.name}`,
      bodyId: selectedBody,
      lensId: selectedLens,
      focalLength: lensObj.defaultFocalLength,
      aperture: lensObj.maxAperture,
      sensorCrop: 'FF',
      focusDistance: 5.0,
      mountType: selectedMount,
      basePosition: basePos,
      movement: {
        pan: defPan,
        tilt: defTilt,
        roll: 0,
        height: defHeight,
        sliderLength: 2.0,
        sliderPosition: 0.5,
        sliderPingPong: false,
        sliderSpeed: 1.0,
        sliderAngle: 0,
        dollyTrackPosition: 0.5,
        dollyTrackType: 'STRAIGHT',
        dollyPingPong: false,
        dollySpeed: 1.0,
        craneBaseAngle: 45,
        craneArmLength: 8.0,
        craneElevation: 15,
        craneHeadPan: 0,
        craneHeadTilt: -15,
        craneHeadRoll: 0,
        cablePosition: 0.5,
        cableElevationDrop: 3.0,
        cablePingPong: false,
        cableSpeed: 1.0,
        handheldSway: true,
        handheldSwayIntensity: 0.6,
        handheldRoaming: false,
        handheldPathAngle: 0
      },
      tally: 'OFF',
      colorTag: ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'][rigs.length % 6],
      lookAtTarget: true
    };

    onAddRig(newRig);
    setShowAddModal(false);
    setCustomName('');
  };

  return (
    <div className="bg-neutral-900/90 backdrop-blur-md rounded-xl border border-neutral-800 p-3 flex flex-col gap-2.5 text-xs font-sans text-neutral-200">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-red-600/20 text-red-400 border border-red-500/30">
            <Video className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold tracking-wide text-neutral-100">PRODUCTION CAMERAS</span>
            <span className="text-[10px] text-neutral-400 font-mono ml-2">({rigs.length} Active Rigs)</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Rig</span>
        </button>
      </div>

      {/* CAMERA LIST */}
      <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
        {rigs.map((rig, idx) => {
          const body = CAMERA_BODIES[rig.bodyId];
          const isSelected = rig.id === activeRigId;

          return (
            <div
              key={rig.id}
              onClick={() => onSelectRig(rig.id)}
              className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                isSelected
                  ? 'bg-neutral-800/90 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/50'
                  : 'bg-neutral-950/40 border-neutral-800 hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Cam Number Badge & Color Tag */}
                <div
                  className="w-6 h-6 rounded flex items-center justify-center font-bold font-mono text-[11px] text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: rig.colorTag }}
                >
                  {idx + 1}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-100 truncate">{rig.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-cyan-300 font-mono">
                      {rig.mountType}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono truncate">
                    {body.name} • {Math.round(rig.focalLength)}mm
                  </span>
                </div>
              </div>

              {/* Tally Switchers (PGM / PRV) & Delete */}
              <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => onSetTally(rig.id, rig.tally === 'PROGRAM' ? 'OFF' : 'PROGRAM')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono transition-colors ${
                    rig.tally === 'PROGRAM'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-neutral-800 text-neutral-400 hover:text-red-400'
                  }`}
                  title="Cut to PROGRAM (Red Tally)"
                >
                  PGM
                </button>
                <button
                  onClick={() => onSetTally(rig.id, rig.tally === 'PREVIEW' ? 'OFF' : 'PREVIEW')}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono transition-colors ${
                    rig.tally === 'PREVIEW'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:text-emerald-400'
                  }`}
                  title="Take to PREVIEW (Green Tally)"
                >
                  PRV
                </button>
                {rigs.length > 1 && (
                  <button
                    onClick={() => onRemoveRig(rig.id)}
                    className="p-1 rounded text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                    title="Remove Camera"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD CAMERA MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 shadow-2xl flex flex-col gap-4 text-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white tracking-wide">ADD PROFESSIONAL CAMERA RIG</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Camera Body */}
            <div>
              <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2">
                1. Select Camera Body (Sony Cinema Line & CineAlta)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(Object.keys(CAMERA_BODIES) as CameraBodyId[]).map(bId => {
                  const b = CAMERA_BODIES[bId];
                  const isCur = selectedBody === bId;
                  return (
                    <div
                      key={bId}
                      onClick={() => setSelectedBody(bId)}
                      className={`p-2.5 rounded-xl border cursor-pointer flex flex-col items-center text-center transition-all ${
                        isCur
                          ? 'bg-neutral-800 border-cyan-400 shadow-md ring-2 ring-cyan-500/30'
                          : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="w-full h-20 bg-neutral-900 rounded-lg overflow-hidden mb-2 flex items-center justify-center p-1">
                        <img
                          src={b.image}
                          alt={b.name}
                          className="max-h-full max-w-full object-contain filter drop-shadow"
                        />
                      </div>
                      <span className="font-bold text-xs text-white">{b.name}</span>
                      <span className="text-[10px] text-cyan-400 font-mono mt-0.5">{b.resolution}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Mount & Support Rig */}
            <div>
              <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-2">
                2. Select Mount & Movement Support Rig
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(MOUNT_TYPES) as MountType[]).map(mType => {
                  const m = MOUNT_TYPES[mType];
                  const isCur = selectedMount === mType;
                  return (
                    <div
                      key={mType}
                      onClick={() => setSelectedMount(mType)}
                      className={`p-2 rounded-lg border cursor-pointer transition-all ${
                        isCur
                          ? 'bg-neutral-800 border-indigo-400 ring-1 ring-indigo-500/40'
                          : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="font-semibold text-xs text-neutral-100">{m.name}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{m.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Lens & Focal Length */}
            <div>
              <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                3. Choose Cinema Lens
              </label>
              <select
                value={selectedLens}
                onChange={e => setSelectedLens(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {LENSES.map(lens => (
                  <option key={lens.id} value={lens.id}>
                    {lens.name} ({lens.maxAperture})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 4: Position Preset */}
            <div>
              <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                4. Starting Stage Position
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'FOH', label: 'Front of House (FOH)' },
                  { id: 'PIT_CENTER', label: 'Pit Center Catwalk' },
                  { id: 'STAGE_LEFT_CRANE', label: 'Stage Left High Crane' },
                  { id: 'DRUM_RISER', label: 'Drum Riser Close-up' },
                  { id: 'SKYCAM', label: 'Aerial Arena Skycam' }
                ].map(pos => (
                  <button
                    key={pos.id}
                    onClick={() => setPosPreset(pos.id)}
                    className={`p-2 rounded border text-left text-xs ${
                      posPreset === pos.id
                        ? 'bg-neutral-800 border-cyan-400 text-white font-medium'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Deploy Camera Rig to Stage</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

