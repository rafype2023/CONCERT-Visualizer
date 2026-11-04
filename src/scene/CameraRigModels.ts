import * as THREE from 'three';
import { CameraRigState } from '../types';
import { calculateVerticalFov, calculateHorizontalFov } from '../utils/optics';
import { CAMERA_BODIES } from '../data/cameras';

export class CameraRigModels {
  /**
   * Builds the complete 3D hierarchy for a camera mounted on its specific rig.
   */
  public static createRigMesh(rig: CameraRigState): THREE.Group {
    const root = new THREE.Group();
    root.name = `Rig_${rig.id}`;

    // Base Support Rig
    const mountMesh = this.createMountMesh(rig);
    root.add(mountMesh);

    // Camera Body + Lens Assembly
    const camAssembly = this.createCameraAssembly(rig);
    camAssembly.name = `CameraAssembly_${rig.id}`;
    root.add(camAssembly);

    // Optical View Frustum (Wireframe pyramid showing camera FOV)
    const frustum = this.createFrustumMesh(rig);
    frustum.name = `Frustum_${rig.id}`;
    camAssembly.add(frustum);

    return root;
  }

  private static createCameraAssembly(rig: CameraRigState): THREE.Group {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.8,
      roughness: 0.25
    });
    const accentGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.2
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.9,
      roughness: 0.05
    });

    const tallyMat = new THREE.MeshBasicMaterial({
      color: rig.tally === 'PROGRAM' ? 0xef4444 : rig.tally === 'PREVIEW' ? 0x22c55e : 0x52525b
    });

    switch (rig.bodyId) {
      case 'FX6': {
        // Compact Cinema Line body
        const bodyGeo = new THREE.BoxGeometry(0.24, 0.28, 0.32);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        // Top Handle
        const handleGeo = new THREE.BoxGeometry(0.06, 0.08, 0.35);
        const handle = new THREE.Mesh(handleGeo, bodyMat);
        handle.position.set(0, 0.18, -0.02);
        group.add(handle);

        // Articulating 3.5" LCD Monitor
        const lcdGeo = new THREE.BoxGeometry(0.03, 0.14, 0.2);
        const lcd = new THREE.Mesh(lcdGeo, bodyMat);
        lcd.position.set(-0.16, 0.18, 0.06);
        lcd.rotation.y = 0.3;
        group.add(lcd);

        // Shotgun Microphone
        const micGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.25, 12);
        const mic = new THREE.Mesh(micGeo, bodyMat);
        mic.rotation.x = Math.PI / 2;
        mic.position.set(0.09, 0.22, -0.15);
        group.add(mic);

        // Lens Mount Ring (Sony E-mount chrome ring)
        const mountRing = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 24), accentGoldMat);
        mountRing.rotation.x = Math.PI / 2;
        mountRing.position.set(0, 0, -0.17);
        group.add(mountRing);

        // Cine Lens Barrel
        const lensLen = 0.28;
        const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, lensLen, 24), bodyMat);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(0, 0, -0.17 - lensLen / 2);
        group.add(lens);

        // Front Glass Element
        const glass = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), glassMat);
        glass.position.set(0, 0, -0.17 - lensLen - 0.005);
        glass.rotation.y = Math.PI;
        group.add(glass);

        // Tally Lamp
        const tally = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), tallyMat);
        tally.position.set(0, 0.14, -0.16);
        group.add(tally);
        break;
      }

      case 'BURANO': {
        // Robust 8.6K CineAlta Body
        const bodyGeo = new THREE.BoxGeometry(0.32, 0.34, 0.36);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        // Carbon fiber side plate accent
        const plateGeo = new THREE.BoxGeometry(0.01, 0.24, 0.28);
        const plateMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
        const plate = new THREE.Mesh(plateGeo, plateMat);
        plate.position.set(0.165, 0, 0);
        group.add(plate);

        // Top Handle
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.4), bodyMat);
        handle.position.set(0, 0.22, 0);
        group.add(handle);

        // High-res OLED Viewfinder / EVF with circular loupe
        const evfGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.22, 16);
        const evf = new THREE.Mesh(evfGeo, bodyMat);
        evf.rotation.x = Math.PI / 2;
        evf.position.set(-0.19, 0.15, 0.05);
        group.add(evf);

        // PL Mount Collar
        const plMount = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 24), accentGoldMat);
        plMount.rotation.x = Math.PI / 2;
        plMount.position.set(0, 0, -0.2);
        group.add(plMount);

        // Heavy Cine Prime / Zoom Lens
        const lensLen = 0.35;
        const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, lensLen, 24), bodyMat);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(0, 0, -0.2 - lensLen / 2);
        group.add(lens);

        // Matte Box with Eyebrow Flag
        const matteBoxGeo = new THREE.BoxGeometry(0.24, 0.18, 0.08);
        const matteBox = new THREE.Mesh(matteBoxGeo, bodyMat);
        matteBox.position.set(0, 0, -0.2 - lensLen - 0.04);
        group.add(matteBox);

        const flagGeo = new THREE.BoxGeometry(0.26, 0.01, 0.14);
        const flag = new THREE.Mesh(flagGeo, bodyMat);
        flag.position.set(0, 0.1, -0.2 - lensLen - 0.08);
        flag.rotation.x = -0.3;
        group.add(flag);

        // Tally
        const tally = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 0.02), tallyMat);
        tally.position.set(0, 0.18, -0.18);
        group.add(tally);
        break;
      }

      case 'VENICE2': {
        // Flagship Heavy Cinema Studio Body
        const bodyGeo = new THREE.BoxGeometry(0.36, 0.38, 0.44);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        // Raw Recorder Back / V-Mount Dual Battery Plate
        const batGeo = new THREE.BoxGeometry(0.3, 0.28, 0.12);
        const batMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.6 });
        const battery = new THREE.Mesh(batGeo, batMat);
        battery.position.set(0, 0, 0.28);
        group.add(battery);

        // Assistant Side OLED Screen (Right side)
        const asstLcd = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.12, 0.18), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
        asstLcd.position.set(0.185, 0.02, 0.04);
        group.add(asstLcd);

        // Dual 19mm Studio Rods along bottom
        const rodMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95 });
        const rodGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.8, 12);
        [-0.09, 0.09].forEach(rx => {
          const rod = new THREE.Mesh(rodGeo, rodMat);
          rod.rotation.x = Math.PI / 2;
          rod.position.set(rx, -0.2, -0.1);
          group.add(rod);
        });

        // Heavy Cinema Box / Studio Zoom Lens
        const lensLen = 0.48;
        const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, lensLen, 24), bodyMat);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(0, 0, -0.22 - lensLen / 2);
        group.add(lens);

        // Studio Matte Box with Top and Side Flags
        const mb = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.1), bodyMat);
        mb.position.set(0, 0, -0.22 - lensLen - 0.05);
        group.add(mb);

        // Big Top Tally Light
        const tally = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.04), tallyMat);
        tally.position.set(0, 0.24, -0.18);
        group.add(tally);
        break;
      }

      case 'FR7': {
        // Robotic Cinema PTZ
        const baseGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.12, 24);
        const base = new THREE.Mesh(baseGeo, bodyMat);
        group.add(base);

        // Motorized Pan/Tilt Fork Arms
        const forkL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.26, 0.1), bodyMat);
        forkL.position.set(-0.16, 0.14, 0);
        group.add(forkL);

        const forkR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.26, 0.1), bodyMat);
        forkR.position.set(0.16, 0.14, 0);
        group.add(forkR);

        // Center PTZ Sphere / Camera Core
        const sphereGeo = new THREE.SphereGeometry(0.14, 24, 24);
        const sphere = new THREE.Mesh(sphereGeo, bodyMat);
        sphere.position.set(0, 0.16, 0);
        group.add(sphere);

        // Sony FE PZ 28-135mm Cinema Power Zoom Lens
        const lensLen = 0.28;
        const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, lensLen, 24), bodyMat);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(0, 0.16, -lensLen / 2 - 0.12);
        group.add(lens);

        // Tally Ring on PTZ Base
        const tallyRing = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.015, 12, 32), tallyMat);
        tallyRing.rotation.x = Math.PI / 2;
        tallyRing.position.set(0, 0.05, 0);
        group.add(tallyRing);
        break;
      }
    }

    // Color ID identification ring badge
    const colorRingMat = new THREE.MeshBasicMaterial({ color: rig.colorTag });
    const idRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.01, 8, 24), colorRingMat);
    idRing.rotation.x = Math.PI / 2;
    idRing.position.set(0, 0.3, 0);
    group.add(idRing);

    return group;
  }

  private static createMountMesh(rig: CameraRigState): THREE.Group {
    const mountGroup = new THREE.Group();
    mountGroup.name = `Mount_${rig.id}`;

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x3f3f46,
      metalness: 0.9,
      roughness: 0.3
    });
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.3,
      roughness: 0.6
    });

    switch (rig.mountType) {
      case 'TRIPOD': {
        // 3 Carbon Fiber Legs extending down from fluid head
        const legLen = rig.movement.height;
        const legRadius = 0.025;
        const splayDist = 0.55;

        for (let i = 0; i < 3; i++) {
          const angle = (i * 2 * Math.PI) / 3;
          const legGeo = new THREE.CylinderGeometry(legRadius, legRadius * 0.7, legLen, 12);
          const leg = new THREE.Mesh(legGeo, carbonMat);

          const footX = Math.sin(angle) * splayDist;
          const footZ = Math.cos(angle) * splayDist;

          // Position leg midpoint
          leg.position.set(footX / 2, legLen / 2, footZ / 2);

          // Aim leg toward top center
          leg.lookAt(0, legLen, 0);
          leg.rotateX(Math.PI / 2);
          mountGroup.add(leg);
        }

        // Fluid Head base
        const headBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.14, 16), metalMat);
        headBase.position.y = legLen - 0.07;
        mountGroup.add(headBase);

        // Pan Handle Bar
        const handleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 8), metalMat);
        handleBar.position.set(0.18, legLen - 0.05, 0.2);
        handleBar.rotation.x = 0.5;
        mountGroup.add(handleBar);
        break;
      }

      case 'SLIDER': {
        // Linear dual-rail extrusion
        const len = rig.movement.sliderLength;
        const railGeo = new THREE.CylinderGeometry(0.02, 0.02, len, 16);
        railGeo.rotateZ(Math.PI / 2);

        const sliderAngleRad = THREE.MathUtils.degToRad(rig.movement.sliderAngle);

        const rail1 = new THREE.Mesh(railGeo, metalMat);
        rail1.position.set(0, rig.movement.height - 0.06, -0.06);
        const rail2 = new THREE.Mesh(railGeo, metalMat);
        rail2.position.set(0, rig.movement.height - 0.06, 0.06);

        mountGroup.add(rail1);
        mountGroup.add(rail2);

        // Tripod Stands at Left and Right ends
        [-len / 2 + 0.1, len / 2 - 0.1].forEach(x => {
          const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, rig.movement.height - 0.06, 12), metalMat);
          stand.position.set(x, (rig.movement.height - 0.06) / 2, 0);
          mountGroup.add(stand);
        });

        // Motorized carriage block
        const carriage = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.22), metalMat);
        const carriageX = (rig.movement.sliderPosition - 0.5) * len;
        carriage.position.set(carriageX, rig.movement.height - 0.04, 0);
        carriage.name = `Carriage_${rig.id}`;
        mountGroup.add(carriage);

        mountGroup.rotation.y = sliderAngleRad;
        break;
      }

      case 'DOLLY': {
        // Floor rails
        const railLen = 16;
        const trackGeo = new THREE.CylinderGeometry(0.025, 0.025, railLen, 12);
        trackGeo.rotateX(Math.PI / 2);

        const trackL = new THREE.Mesh(trackGeo, metalMat);
        trackL.position.set(-0.4, 0.04, 0);
        const trackR = new THREE.Mesh(trackGeo, metalMat);
        trackR.position.set(0.4, 0.04, 0);
        mountGroup.add(trackL);
        mountGroup.add(trackR);

        // Heavy Dolly Chassis with 4 track wheel bogies
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.18, 1.2), metalMat);
        chassis.position.set(0, 0.16, 0);
        mountGroup.add(chassis);

        // Center Hydraulic Pedestal Column
        const colHeight = rig.movement.height;
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, colHeight, 16), metalMat);
        col.position.set(0, colHeight / 2 + 0.18, 0);
        mountGroup.add(col);

        // Operator Seat
        const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16), carbonMat);
        seat.position.set(0.35, 0.65, 0.3);
        mountGroup.add(seat);
        break;
      }

      case 'CRANE': {
        // Heavy base on wheels
        const baseGeo = new THREE.BoxGeometry(1.6, 0.4, 1.6);
        const base = new THREE.Mesh(baseGeo, metalMat);
        base.position.y = 0.2;
        mountGroup.add(base);

        // Base Tower Pivot
        const pivotHeight = 2.0;
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, pivotHeight, 16), metalMat);
        tower.position.y = pivotHeight / 2 + 0.4;
        mountGroup.add(tower);

        // Crane Boom Arm (Telescoping carbon/lattice beam)
        const armLen = rig.movement.craneArmLength;
        const armGroup = new THREE.Group();
        armGroup.position.y = pivotHeight + 0.4;
        armGroup.name = `CraneArm_${rig.id}`;

        const armGeo = new THREE.BoxGeometry(0.24, 0.24, armLen);
        const arm = new THREE.Mesh(armGeo, carbonMat);
        arm.position.z = armLen / 2;
        armGroup.add(arm);

        // Counterweight stack at rear
        const counterweightGeo = new THREE.BoxGeometry(0.6, 0.5, 0.7);
        const counterweight = new THREE.Mesh(counterweightGeo, metalMat);
        counterweight.position.z = -1.2;
        armGroup.add(counterweight);

        // Apply Boom Swing & Elevation
        armGroup.rotation.y = THREE.MathUtils.degToRad(rig.movement.craneBaseAngle);
        armGroup.rotation.x = THREE.MathUtils.degToRad(-rig.movement.craneElevation);

        mountGroup.add(armGroup);
        break;
      }

      case 'CABLE': {
        // Suspended Aerial Cable line (Spans across arena)
        const cableMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
        const cableGeo = new THREE.CylinderGeometry(0.008, 0.008, 60, 8);
        cableGeo.rotateZ(Math.PI / 2);
        const cable = new THREE.Mesh(cableGeo, cableMat);
        cable.position.set(0, 16, 0);
        mountGroup.add(cable);

        // Motorized Trolley Car
        const trolley = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.4), metalMat);
        trolley.position.set(0, 15.8, 0);
        mountGroup.add(trolley);
        break;
      }

      case 'GIMBAL': {
        // Ronin 2 Carbon Fiber Outer Ring
        const ringGeo = new THREE.TorusGeometry(0.38, 0.02, 12, 32);
        const ring = new THREE.Mesh(ringGeo, carbonMat);
        ring.position.y = rig.movement.height;
        mountGroup.add(ring);

        // Operator Stand-in Silhouette
        const opMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
        const opBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 1.4, 12), opMat);
        opBody.position.set(0, 0.7, 0.55);
        mountGroup.add(opBody);

        const opHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), opMat);
        opHead.position.set(0, 1.55, 0.55);
        mountGroup.add(opHead);
        break;
      }
    }

    return mountGroup;
  }

  /**
   * Generates a wireframe optical frustum pyramid showing the camera's lens coverage
   */
  private static createFrustumMesh(rig: CameraRigState): THREE.LineSegments {
    const bodySpec = CAMERA_BODIES[rig.bodyId];
    const vFov = calculateVerticalFov(rig.focalLength, bodySpec.sensorHeightMm, rig.sensorCrop);
    const hFov = calculateHorizontalFov(rig.focalLength, bodySpec.sensorWidthMm, rig.sensorCrop);

    const distance = 8.0; // projection distance in meters
    const halfH = Math.tan(THREE.MathUtils.degToRad(vFov / 2)) * distance;
    const halfW = Math.tan(THREE.MathUtils.degToRad(hFov / 2)) * distance;

    // 5 vertices of the frustum pyramid
    const vertices: number[] = [
      // Apex (camera lens)
      0, 0, 0,
      // 4 corners of projection rectangle
      -halfW, halfH, -distance,
      halfW, halfH, -distance,
      halfW, -halfH, -distance,
      -halfW, -halfH, -distance
    ];

    // Indices for wireframe lines
    const indices: number[] = [
      0, 1,
      0, 2,
      0, 3,
      0, 4,
      1, 2,
      2, 3,
      3, 4,
      4, 1
    ];

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex(indices);

    const frustumColor = rig.tally === 'PROGRAM' ? 0xef4444 : rig.tally === 'PREVIEW' ? 0x22c55e : 0x06b6d4;
    const mat = new THREE.LineBasicMaterial({
      color: frustumColor,
      transparent: true,
      opacity: 0.6
    });

    return new THREE.LineSegments(geom, mat);
  }
}

