export type CameraBodyId = 'FX6' | 'BURANO' | 'VENICE2' | 'FR7';

export interface CameraBodySpec {
  id: CameraBodyId;
  name: string;
  subTitle: string;
  resolution: string;
  sensor: string;
  sensorWidthMm: number;
  sensorHeightMm: number;
  mount: string;
  dynamicRange: string;
  features: string[];
  image: string;
  weightKg: number;
}

export type MountType = 'TRIPOD' | 'SLIDER' | 'DOLLY' | 'CRANE' | 'CABLE' | 'GIMBAL';

export interface MountSpec {
  id: MountType;
  name: string;
  category: string;
  description: string;
  icon: string;
}

export interface LensSpec {
  id: string;
  name: string;
  type: 'PRIME' | 'ZOOM';
  minFocalLength: number;
  maxFocalLength: number;
  defaultFocalLength: number;
  maxAperture: string;
  mount: string;
  weightKg: number;
}

export type TallyState = 'OFF' | 'PREVIEW' | 'PROGRAM';
export type AspectRatioMask = '16:9' | '2.39:1' | '4:3' | '9:16' | 'OFF';

export interface RigMovementParams {
  // Common rotation
  pan: number; // degrees -180 to 180
  tilt: number; // degrees -85 to 85
  roll: number; // degrees -45 to 45
  
  // Height / Elevation
  height: number; // meters from floor
  
  // Slider specific
  sliderLength: number; // meters (1 to 4m)
  sliderPosition: number; // 0 to 1 (0% to 100% along rail)
  sliderPingPong: boolean;
  sliderSpeed: number; // m/s
  sliderAngle: number; // degrees rotation of rail in world (Y-axis)
  
  // Dolly specific
  dollyTrackPosition: number; // 0 to 1 along track
  dollyTrackType: 'STRAIGHT' | 'RUNWAY_CURVE';
  dollyPingPong: boolean;
  dollySpeed: number;
  
  // Crane / TechnoJib specific
  craneBaseAngle: number; // degrees 0-360 base rotation
  craneArmLength: number; // meters (4 to 12m)
  craneElevation: number; // degrees -40 to 70
  craneHeadPan: number;
  craneHeadTilt: number;
  craneHeadRoll: number;
  
  // CableCam specific
  cablePosition: number; // 0 to 1 along aerial span
  cableElevationDrop: number; // meters down from cable line
  cablePingPong: boolean;
  cableSpeed: number;
  
  // Handheld / Gimbal specific
  handheldSway: boolean;
  handheldSwayIntensity: number; // 0 to 1
  handheldRoaming: boolean;
  handheldPathAngle: number; // walking direction
}

export interface CameraRigState {
  id: string;
  name: string;
  bodyId: CameraBodyId;
  lensId: string;
  focalLength: number; // current mm
  aperture: string; // T/f-stop
  sensorCrop: 'FF' | 'S35';
  focusDistance: number; // meters
  
  mountType: MountType;
  basePosition: [number, number, number]; // [x, y, z] anchor coordinates
  movement: RigMovementParams;
  
  tally: TallyState;
  colorTag: string;
  lookAtTarget: boolean; // auto-track stage center performer
}

export interface StagePreset {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  thumb: string;
  accentColor: string;
  trussStyle: 'CONCERT_HIGH' | 'STADIUM_MASSIVE' | 'FESTIVAL_ARCH';
  crowdDensity: 'PACKED' | 'MEDIUM' | 'ARENA_FULL';
}
