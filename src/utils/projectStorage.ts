import { ProjectSettings, CameraRigState } from '../types';

const STORAGE_KEY = 'cinestage_project_settings_v1';

/**
 * Downloads the current configuration as a formatted .json file
 */
export function exportProjectToJson(settings: ProjectSettings, customFileName?: string): string {
  const dataStr = JSON.stringify(settings, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeName = (customFileName || settings.projectName || 'Concert-Stage-Previz')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `${safeName}-${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return fileName;
}

/**
 * Parses and validates an uploaded .json file
 */
export async function importProjectFromJson(file: File): Promise<ProjectSettings> {
  const text = await file.text();
  let parsed: any;

  try {
    parsed = JSON.parse(text);
  } catch (err: any) {
    throw new Error('El archivo seleccionado no es un formato JSON válido.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('El archivo no contiene un objeto de configuración válido.');
  }

  if (!Array.isArray(parsed.rigs) || parsed.rigs.length === 0) {
    throw new Error('La configuración no contiene ninguna cámara en el arreglo "rigs".');
  }

  // Validate and sanitize each rig
  const sanitizedRigs: CameraRigState[] = parsed.rigs.map((r: any, idx: number) => {
    if (!r.id || !r.name || !r.bodyId || !r.mountType) {
      throw new Error(`La cámara #${idx + 1} no tiene las propiedades obligatorias.`);
    }

    const basePos = Array.isArray(r.basePosition) && r.basePosition.length === 3
      ? [Number(r.basePosition[0]) || 0, Number(r.basePosition[1]) || 0, Number(r.basePosition[2]) || 0]
      : [0, 0, 10];

    const mov = r.movement || {};
    const sanitizedMovement = {
      pan: Number(mov.pan) || 0,
      tilt: Number(mov.tilt) || 0,
      roll: Number(mov.roll) || 0,
      height: Number(mov.height) || 1.6,
      sliderLength: Number(mov.sliderLength) || 2.0,
      sliderPosition: Number(mov.sliderPosition) || 0.5,
      sliderPingPong: Boolean(mov.sliderPingPong),
      sliderSpeed: Number(mov.sliderSpeed) || 1.0,
      sliderAngle: Number(mov.sliderAngle) || 0,
      dollyTrackPosition: Number(mov.dollyTrackPosition) || 0.5,
      dollyTrackType: mov.dollyTrackType === 'RUNWAY_CURVE' ? 'RUNWAY_CURVE' : 'STRAIGHT',
      dollyPingPong: Boolean(mov.dollyPingPong),
      dollySpeed: Number(mov.dollySpeed) || 1.0,
      craneBaseAngle: Number(mov.craneBaseAngle) || 45,
      craneArmLength: Number(mov.craneArmLength) || 8.0,
      craneElevation: Number(mov.craneElevation) || 15,
      craneHeadPan: Number(mov.craneHeadPan) || 0,
      craneHeadTilt: Number(mov.craneHeadTilt) || 0,
      craneHeadRoll: Number(mov.craneHeadRoll) || 0,
      cablePosition: Number(mov.cablePosition) || 0.5,
      cableElevationDrop: Number(mov.cableElevationDrop) || 3.0,
      cablePingPong: Boolean(mov.cablePingPong),
      cableSpeed: Number(mov.cableSpeed) || 1.0,
      handheldSway: Boolean(mov.handheldSway),
      handheldSwayIntensity: Number(mov.handheldSwayIntensity) || 0.5,
      handheldRoaming: Boolean(mov.handheldRoaming),
      handheldPathAngle: Number(mov.handheldPathAngle) || 0
    };

    return {
      id: String(r.id),
      name: String(r.name),
      bodyId: r.bodyId,
      lensId: String(r.lensId || 'CP_50'),
      focalLength: Number(r.focalLength) || 50,
      aperture: String(r.aperture || 'T1.4'),
      sensorCrop: r.sensorCrop === 'S35' ? 'S35' : 'FF',
      focusDistance: Number(r.focusDistance) || 5.0,
      mountType: r.mountType,
      basePosition: basePos as [number, number, number],
      movement: sanitizedMovement,
      tally: r.tally === 'PROGRAM' ? 'PROGRAM' : r.tally === 'PREVIEW' ? 'PREVIEW' : 'OFF',
      colorTag: String(r.colorTag || '#3b82f6'),
      lookAtTarget: r.lookAtTarget !== undefined ? Boolean(r.lookAtTarget) : true
    };
  });

  const validatedSettings: ProjectSettings = {
    version: parsed.version || '1.0.0',
    projectName: parsed.projectName || 'Concert-Stage-Previz',
    savedAt: parsed.savedAt || new Date().toISOString(),
    stagePresetId: parsed.stagePresetId || 'stadium-spectacle',
    activeRigId: parsed.activeRigId || sanitizedRigs[0].id,
    directorLayout: parsed.directorLayout || 'SPLIT',
    aspectMask: parsed.aspectMask || '16:9',
    showGuides: parsed.showGuides !== undefined ? Boolean(parsed.showGuides) : true,
    showSafeAreas: parsed.showSafeAreas !== undefined ? Boolean(parsed.showSafeAreas) : true,
    rigs: sanitizedRigs
  };

  return validatedSettings;
}

/**
 * Saves current settings to browser localStorage
 */
export function saveToLocalStorage(settings: ProjectSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('No se pudo guardar la configuración en localStorage', e);
  }
}

/**
 * Loads settings from browser localStorage if available
 */
export function loadFromLocalStorage(): ProjectSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.rigs) && parsed.rigs.length > 0) {
      return parsed as ProjectSettings;
    }
  } catch (e) {
    console.warn('No se pudo cargar la configuración de localStorage', e);
  }
  return null;
}

/**
 * Clears saved project settings in localStorage
 */
export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}
