import { CameraBodySpec, LensSpec, MountSpec, StagePreset } from '../types';

export const CAMERA_BODIES: Record<string, CameraBodySpec> = {
  FX6: {
    id: 'FX6',
    name: 'Sony FX6',
    subTitle: 'Full-Frame Cinema Camera (ILME-FX6V)',
    resolution: '4K DCI / UHD 120p',
    sensor: '10.2MP Full-Frame Back-Illuminated Exmor R CMOS',
    sensorWidthMm: 35.6,
    sensorHeightMm: 20.0,
    mount: 'Sony E-Mount',
    dynamicRange: '15+ Stops in S-Log3',
    features: [
      'Electronic Variable ND Filter (1/4 to 1/128)',
      'Dual Base ISO 800 / 12,800',
      'Fast Hybrid AF with Real-Time Eye AF',
      'Compact Run-and-Gun Cinema Body'
    ],
    image: '/cameras/sony-fx6.png',
    weightKg: 0.89
  },
  BURANO: {
    id: 'BURANO',
    name: 'Sony BURANO 8K',
    subTitle: 'Digital Motion Picture Camera (MPC-2610)',
    resolution: '8.6K 30p / 6K 60p / 4K 120p',
    sensor: '8.6K Full-Frame CMOS Sensor (8632 x 4856)',
    sensorWidthMm: 35.9,
    sensorHeightMm: 24.0,
    mount: 'PL Mount & Lever-Lock E-Mount',
    dynamicRange: '16 Stops Dynamic Range',
    features: [
      'World-first In-Body Image Stabilization (IBIS) for PL/E-mount',
      'Internal Variable ND Filter',
      'Dual Base ISO 800 / 3200',
      'High mobility for solo/small crew cinematography'
    ],
    image: '/cameras/sony-burano.png',
    weightKg: 2.4
  },
  VENICE2: {
    id: 'VENICE2',
    name: 'Sony VENICE 2 (8K)',
    subTitle: 'Flagship Digital Motion Picture Camera (MPC-3628)',
    resolution: '8.6K Full Frame / X-OCN 16-bit Internal',
    sensor: 'Interchangeable 8.6K 3:2 Full-Frame CMOS Sensor',
    sensorWidthMm: 35.9,
    sensorHeightMm: 24.0,
    mount: 'Solid Cinema PL Mount (Native E-mount underneath)',
    dynamicRange: '16 Stops Dynamic Range',
    features: [
      'Internal X-OCN 16-bit & ProRes 4444 recording',
      'Dual Base ISO 800 / 3200 for extreme low light',
      'Interchangeable 8K/6K sensor block design',
      'Standard on blockbuster cinema & premium stadium concerts'
    ],
    image: '/cameras/sony-venice2.png',
    weightKg: 4.3
  },
  FR7: {
    id: 'FR7',
    name: 'Sony FR7 Cinema PTZ',
    subTitle: 'Full-Frame PTZ Robotic Cinema Camera (ILME-FR7K)',
    resolution: '4K UHD 120p / DCI 60p',
    sensor: '4K Full-Frame Exmor R CMOS Sensor',
    sensorWidthMm: 35.6,
    sensorHeightMm: 20.0,
    mount: 'Sony E-Mount Robotic Pan/Tilt Base',
    dynamicRange: '15+ Stops in S-Log3',
    features: [
      'Smooth robotic remote Pan/Tilt speeds from 0.02° to 90°/sec',
      'E-Mount interchangeable lens compatibility',
      'Integrated Web app & RM-IP500 remote controller support',
      'Ideal for robotic truss, drum riser & catwalk ceiling mounts'
    ],
    image: '/cameras/sony-fr7.png',
    weightKg: 3.1
  }
};

export const MOUNT_TYPES: Record<string, MountSpec> = {
  TRIPOD: {
    id: 'TRIPOD',
    name: 'Heavy Studio Tripod / Pedestal',
    category: 'Fixed & Elevation',
    description: 'Rock-solid carbon fiber 3-stage legs with fluid head and pan handle.',
    icon: 'Triangle'
  },
  SLIDER: {
    id: 'SLIDER',
    name: 'Motorized Precision Slider',
    category: 'Linear Track',
    description: 'Automated linear belt-driven slide with ping-pong motion and speed controls.',
    icon: 'Sliders'
  },
  DOLLY: {
    id: 'DOLLY',
    name: 'Studio Dolly on Floor Track',
    category: 'Track Dolly',
    description: 'Heavy studio quad-dolly riding along straight or curved arena floor tracks.',
    icon: 'GitCommit'
  },
  CRANE: {
    id: 'CRANE',
    name: 'TechnoJib / Telescopic Crane',
    category: 'Jib & Crane',
    description: 'High-reach counterweighted crane with 360° swing and 3-axis motorized remote head.',
    icon: 'Maximize2'
  },
  CABLE: {
    id: 'CABLE',
    name: 'CableCam / Skycam Rig',
    category: 'Suspended Aerial',
    description: 'High-speed trolley suspended on high-tension steel cables over the arena.',
    icon: 'Activity'
  },
  GIMBAL: {
    id: 'GIMBAL',
    name: 'Steadicam / 3-Axis Gimbal',
    category: 'Handheld & Roaming',
    description: 'Dynamic roaming stage operator with Ronin 2 3-axis stabilization and organic sway.',
    icon: 'Move'
  }
};

export const LENSES: LensSpec[] = [
  {
    id: 'CP_18',
    name: 'Sony GM 18mm T1.5 Cine Wide Prime',
    type: 'PRIME',
    minFocalLength: 18,
    maxFocalLength: 18,
    defaultFocalLength: 18,
    maxAperture: 'T1.5',
    mount: 'E-Mount',
    weightKg: 0.65
  },
  {
    id: 'CP_24',
    name: 'Sony GM 24mm T1.4 Wide Prime',
    type: 'PRIME',
    minFocalLength: 24,
    maxFocalLength: 24,
    defaultFocalLength: 24,
    maxAperture: 'T1.4',
    mount: 'E-Mount',
    weightKg: 0.44
  },
  {
    id: 'CP_35',
    name: 'Sony GM 35mm T1.3 Cinema Prime',
    type: 'PRIME',
    minFocalLength: 35,
    maxFocalLength: 35,
    defaultFocalLength: 35,
    maxAperture: 'T1.3',
    mount: 'E-Mount',
    weightKg: 0.52
  },
  {
    id: 'CP_50',
    name: 'Sony GM 50mm T1.2 Standard Prime',
    type: 'PRIME',
    minFocalLength: 50,
    maxFocalLength: 50,
    defaultFocalLength: 50,
    maxAperture: 'T1.2',
    mount: 'E-Mount',
    weightKg: 0.77
  },
  {
    id: 'CP_85',
    name: 'Sony GM 85mm T1.4 Portrait Prime',
    type: 'PRIME',
    minFocalLength: 85,
    maxFocalLength: 85,
    defaultFocalLength: 85,
    maxAperture: 'T1.4',
    mount: 'E-Mount',
    weightKg: 0.82
  },
  {
    id: 'CP_135',
    name: 'Sony GM 135mm T2.0 Telephoto Prime',
    type: 'PRIME',
    minFocalLength: 135,
    maxFocalLength: 135,
    defaultFocalLength: 135,
    maxAperture: 'T2.0',
    mount: 'E-Mount',
    weightKg: 0.95
  },
  {
    id: 'CZ_16_35',
    name: 'Sony FE C 16-35mm T2.9 Cine Wide Zoom',
    type: 'ZOOM',
    minFocalLength: 16,
    maxFocalLength: 35,
    defaultFocalLength: 20,
    maxAperture: 'T2.9',
    mount: 'E-Mount',
    weightKg: 1.39
  },
  {
    id: 'CZ_28_135',
    name: 'Sony FE PZ 28-135mm f/4 G OSS Cinema Power Zoom',
    type: 'ZOOM',
    minFocalLength: 28,
    maxFocalLength: 135,
    defaultFocalLength: 50,
    maxAperture: 'f/4.0',
    mount: 'E-Mount',
    weightKg: 1.21
  },
  {
    id: 'CZ_70_200',
    name: 'Sony FE 70-200mm T2.8 GM Telephoto Zoom',
    type: 'ZOOM',
    minFocalLength: 70,
    maxFocalLength: 200,
    defaultFocalLength: 100,
    maxAperture: 'T2.8',
    mount: 'E-Mount',
    weightKg: 1.04
  },
  {
    id: 'CINE_BOX_25_250',
    name: 'Angenieux / Fujinon 25-250mm T3.5 Broadcast Stadium Box Zoom',
    type: 'ZOOM',
    minFocalLength: 25,
    maxFocalLength: 250,
    defaultFocalLength: 150,
    maxAperture: 'T3.5',
    mount: 'PL Mount',
    weightKg: 6.8
  }
];

export const STAGE_PRESETS: StagePreset[] = [
  {
    id: 'stadium-spectacle',
    name: 'Massive Stadium Concert Spectacle',
    subtitle: 'Immense 70,000-seat stadium with stadium arch & towering LED wings',
    image: '/stage/stadium-spectacle.png',
    thumb: '/stage/stadium-spectacle.png',
    accentColor: '#3b82f6',
    trussStyle: 'STADIUM_MASSIVE',
    crowdDensity: 'ARENA_FULL'
  },
  {
    id: 'six-views',
    name: 'Spectacular Arena (6 Dynamic Views)',
    subtitle: 'Concert arena with runway thrust, circular truss & moving head spotlights',
    image: '/stage/six-views.png',
    thumb: '/stage/six-views.png',
    accentColor: '#ec4899',
    trussStyle: 'CONCERT_HIGH',
    crowdDensity: 'PACKED'
  },
  {
    id: 'dynamic-five',
    name: 'Dynamic Stadium Stage (5 Views)',
    subtitle: 'Multi-level concert production with curved LED backdrop and pit catwalk',
    image: '/stage/dynamic-five.png',
    thumb: '/stage/dynamic-five.png',
    accentColor: '#8b5cf6',
    trussStyle: 'CONCERT_HIGH',
    crowdDensity: 'PACKED'
  },
  {
    id: 'three-views',
    name: 'Massive Concert Production (3 Views)',
    subtitle: 'Festival stage setup with high-power laser arrays & dual mega-IMAGs',
    image: '/stage/three-views.png',
    thumb: '/stage/three-views.png',
    accentColor: '#f59e0b',
    trussStyle: 'FESTIVAL_ARCH',
    crowdDensity: 'MEDIUM'
  }
];

