import * as THREE from 'three';
import { CameraRigState } from '../types';

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

  // Stage center performer coordinate (Center Stage Vocalist chest/head height on 1.8m deck)
  const stageTarget = new THREE.Vector3(0, 3.3, 2.2);

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
        const cycle = (timeSec * movement.sliderSpeed * 0.5) % 2;
        t = cycle > 1 ? 2 - cycle : cycle;
      }
      const offsetDist = (t - 0.5) * movement.sliderLength;
      const sliderRad = THREE.MathUtils.degToRad(movement.sliderAngle);

      camPos.copy(base);
      // Local rail is along X-axis rotated by sliderAngle around Y
      camPos.x += Math.cos(sliderRad) * offsetDist;
      camPos.z -= Math.sin(sliderRad) * offsetDist;
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
        // Curved arc relative to base position
        const radius = 8.0;
        const angle = THREE.MathUtils.lerp(-Math.PI * 0.4, Math.PI * 0.4, t);
        camPos.x = base.x + Math.sin(angle) * radius;
        camPos.z = base.z + (Math.cos(angle) - 1) * (radius * 0.6);
      } else {
        // Straight track traverse along Z-axis (push-in / pull-out) or X-axis
        const trackLen = 12.0;
        camPos.z = base.z + (t - 0.5) * trackLen;
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
      const pivotY = base.y + 2.4;

      // Boom tip position
      const reach = Math.cos(elevRad) * armLen;
      camPos.set(
        base.x + Math.sin(baseSwingRad) * reach,
        pivotY + Math.sin(elevRad) * armLen,
        base.z + Math.cos(baseSwingRad) * reach
      );

      // Remote Head Pan/Tilt/Roll relative to jib swing
      const totalPan = movement.craneBaseAngle + movement.craneHeadPan + movement.pan;
      const totalTilt = movement.craneHeadTilt + movement.tilt;
      const totalRoll = movement.craneHeadRoll + movement.roll;

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

      // Aerial cable span centered at basePosition
      const cableHeight = Math.max(10, base.y + 15);
      const spanA = new THREE.Vector3(base.x - 24, cableHeight, base.z - 12);
      const spanB = new THREE.Vector3(base.x + 24, cableHeight, base.z + 12);

      camPos.lerpVectors(spanA, spanB, t);
      const sag = Math.sin(t * Math.PI) * 1.2;
      camPos.y -= movement.cableElevationDrop + sag;

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
    // Apply manual pan/tilt offsets on top of target lock so the operator can still fine-tune framing!
    dummy.rotateY(THREE.MathUtils.degToRad(movement.pan * 0.25));
    dummy.rotateX(THREE.MathUtils.degToRad(movement.tilt * 0.25));
    camRot.copy(dummy.rotation);
  }

  const forward = new THREE.Vector3(0, 0, -1).applyEuler(camRot);

  return {
    position: camPos,
    rotation: camRot,
    lookAtDirection: forward
  };
}
