import * as THREE from 'three';
import { CameraRigState } from '../types';
import { CAMERA_BODIES } from '../data/cameras';

/**
 * Calculates Vertical Field of View (FOV) in degrees for Three.js PerspectiveCamera
 * given focal length in mm and sensor dimensions.
 */
export function calculateVerticalFov(focalLengthMm: number, sensorHeightMm: number, cropMode: 'FF' | 'S35' = 'FF'): number {
  const effectiveHeight = cropMode === 'S35' ? sensorHeightMm * 0.72 : sensorHeightMm;
  const fovRad = 2 * Math.atan(effectiveHeight / (2 * focalLengthMm));
  return (fovRad * 180) / Math.PI;
}

/**
 * Calculates Horizontal Field of View (FOV) in degrees
 */
export function calculateHorizontalFov(focalLengthMm: number, sensorWidthMm: number, cropMode: 'FF' | 'S35' = 'FF'): number {
  const effectiveWidth = cropMode === 'S35' ? sensorWidthMm * 0.72 : sensorWidthMm;
  const fovRad = 2 * Math.atan(effectiveWidth / (2 * focalLengthMm));
  return (fovRad * 180) / Math.PI;
}

export interface ComputedTransform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  lookAtDirection: THREE.Vector3;
}

/**
 * Solves the kinematic world transform (position & orientation) of a camera rig
 */
export function computeRigWorldTransform(rig: CameraRigState, timeSec: number = 0): ComputedTransform {
  const { movement, basePosition, mountType, lookAtTarget } = rig;
  const base = new THREE.Vector3(basePosition[0], basePosition[1], basePosition[2]);
  const camPos = new THREE.Vector3();
  const camRot = new THREE.Euler(0, 0, 0, 'YXZ');

  // Stage center performer coordinate (Singer podium mark)
  const stageTarget = new THREE.Vector3(0, 2.0, 0);

  switch (mountType) {
    case 'TRIPOD': {
      camPos.copy(base);
      camPos.y += movement.height;
      camRot.set(
        THREE.MathUtils.degToRad(movement.tilt),
        THREE.MathUtils.degToRad(movement.pan),
        THREE.MathUtils.degToRad(movement.roll),
        'YXZ'
      );
      break;
    }

    case 'SLIDER': {
      let t = movement.sliderPosition;
      if (movement.sliderPingPong) {
        // Continuous ping-pong animation based on speed
        const cycle = (timeSec * movement.sliderSpeed * 0.5) % 2;
        t = cycle > 1 ? 2 - cycle : cycle;
      }
      const halfLen = movement.sliderLength / 2;
      const offsetDist = (t - 0.5) * movement.sliderLength;
      const sliderRad = THREE.MathUtils.degToRad(movement.sliderAngle);

      camPos.copy(base);
      camPos.x += Math.sin(sliderRad) * offsetDist;
      camPos.z += Math.cos(sliderRad) * offsetDist;
      camPos.y += movement.height;

      camRot.set(
        THREE.MathUtils.degToRad(movement.tilt),
        THREE.MathUtils.degToRad(movement.pan + movement.sliderAngle),
        THREE.MathUtils.degToRad(movement.roll),
        'YXZ'
      );
      break;
    }

    case 'DOLLY': {
      let t = movement.dollyTrackPosition;
      if (movement.dollyPingPong) {
        const cycle = (timeSec * movement.dollySpeed * 0.25) % 2;
        t = cycle > 1 ? 2 - cycle : cycle;
      }

      camPos.copy(base);
      if (movement.dollyTrackType === 'RUNWAY_CURVE') {
        // Catwalk horseshoe arc in front of stage
        const radius = 12;
        const angle = THREE.MathUtils.lerp(-Math.PI * 0.45, Math.PI * 0.45, t);
        camPos.x = Math.sin(angle) * radius;
        camPos.z = 10 + Math.cos(angle) * (radius * 0.5);
      } else {
        // Straight pit track traverse
        const trackLen = 14;
        camPos.x = base.x + (t - 0.5) * trackLen;
      }
      camPos.y += movement.height;

      camRot.set(
        THREE.MathUtils.degToRad(movement.tilt),
        THREE.MathUtils.degToRad(movement.pan),
        THREE.MathUtils.degToRad(movement.roll),
        'YXZ'
      );
      break;
    }

    case 'CRANE': {
      const baseSwingRad = THREE.MathUtils.degToRad(movement.craneBaseAngle);
      const elevRad = THREE.MathUtils.degToRad(movement.craneElevation);
      const armLen = movement.craneArmLength;

      // Jib pivot height
      const pivotY = base.y + 2.0;

      // Boom tip position
      const reach = Math.cos(elevRad) * armLen;
      camPos.set(
        base.x + Math.sin(baseSwingRad) * reach,
        pivotY + Math.sin(elevRad) * armLen,
        base.z + Math.cos(baseSwingRad) * reach
      );

      // Remote Head Pan/Tilt/Roll relative to jib swing
      const totalPan = movement.craneBaseAngle + movement.craneHeadPan;
      const totalTilt = movement.craneHeadTilt;
      const totalRoll = movement.craneHeadRoll;

      camRot.set(
        THREE.MathUtils.degToRad(totalTilt),
        THREE.MathUtils.degToRad(totalPan),
        THREE.MathUtils.degToRad(totalRoll),
        'YXZ'
      );
      break;
    }

    case 'CABLE': {
      let t = movement.cablePosition;
      if (movement.cablePingPong) {
        const cycle = (timeSec * movement.cableSpeed * 0.15) % 2;
        t = cycle > 1 ? 2 - cycle : cycle;
      }

      // Arena aerial cable anchors (high in the arena)
      const spanA = new THREE.Vector3(-25, 16, -20);
      const spanB = new THREE.Vector3(25, 14, 25);

      camPos.lerpVectors(spanA, spanB, t);
      // Realistic catenary sag + winch descent
      const sag = Math.sin(t * Math.PI) * 1.5;
      camPos.y -= (movement.cableElevationDrop + sag);

      camRot.set(
        THREE.MathUtils.degToRad(movement.tilt),
        THREE.MathUtils.degToRad(movement.pan),
        THREE.MathUtils.degToRad(movement.roll),
        'YXZ'
      );
      break;
    }

    case 'GIMBAL': {
      camPos.copy(base);
      camPos.y += movement.height;

      // Organic walking / sway micro-vibrations
      if (movement.handheldSway) {
        const swayIntensity = movement.handheldSwayIntensity;
        const swayX = Math.sin(timeSec * 2.2) * 0.04 * swayIntensity;
        const swayY = Math.abs(Math.sin(timeSec * 4.4)) * 0.05 * swayIntensity;
        const swayZ = Math.cos(timeSec * 1.8) * 0.03 * swayIntensity;
        camPos.x += swayX;
        camPos.y += swayY;
        camPos.z += swayZ;

        const swayPitch = Math.sin(timeSec * 3.1) * 1.2 * swayIntensity;
        const swayYaw = Math.cos(timeSec * 1.7) * 1.8 * swayIntensity;
        const swayRoll = Math.sin(timeSec * 2.4) * 0.9 * swayIntensity;

        camRot.set(
          THREE.MathUtils.degToRad(movement.tilt + swayPitch),
          THREE.MathUtils.degToRad(movement.pan + swayYaw),
          THREE.MathUtils.degToRad(movement.roll + swayRoll),
          'YXZ'
        );
      } else {
        camRot.set(
          THREE.MathUtils.degToRad(movement.tilt),
          THREE.MathUtils.degToRad(movement.pan),
          THREE.MathUtils.degToRad(movement.roll),
          'YXZ'
        );
      }
      break;
    }
  }

  // If auto-tracking performer target:
  if (lookAtTarget) {
    const dummy = new THREE.Object3D();
    dummy.position.copy(camPos);
    dummy.lookAt(stageTarget);
    camRot.copy(dummy.rotation);
  }

  const forward = new THREE.Vector3(0, 0, -1).applyEuler(camRot);

  return {
    position: camPos,
    rotation: camRot,
    lookAtDirection: forward
  };
}

