import * as THREE from 'three';
import { StageBuilder } from './StageBuilder';
import { CameraRigModels } from './CameraRigModels';
import { CameraRigState, StagePreset } from '../types';
import { computeRigWorldTransform, calculateVerticalFov } from '../utils/optics';
import { CAMERA_BODIES } from '../data/cameras';

export class SceneManager {
  private arenaCanvas: HTMLCanvasElement;
  private povCanvas: HTMLCanvasElement | null = null;
  private multiviewCanvases: Map<string, HTMLCanvasElement> = new Map();

  private arenaRenderer: THREE.WebGLRenderer;
  // Single shared offscreen WebGL renderer for POV & Multiview feeds (prevents WebGL context leaks)
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenRenderer: THREE.WebGLRenderer;

  private scene: THREE.Scene;
  private stageBuilder: StageBuilder;

  // Director Viewport Camera (Orbit / Arena perspective)
  public directorCamera: THREE.PerspectiveCamera;
  private directorTarget: THREE.Vector3 = new THREE.Vector3(0, 3.0, 2);
  private directorRadius: number = 34;
  private directorTheta: number = Math.PI * 0.18;
  private directorPhi: number = Math.PI * 0.34;

  // Optical Rig Camera (Viewfinder / POV / Multiview)
  public activeRigCamera: THREE.PerspectiveCamera;

  // Multicamera rig 3D instances & signatures for zero-stall updates
  private rigMeshMap: Map<string, THREE.Group> = new Map();
  private rigSignatureMap: Map<string, string> = new Map();
  private selectionRings: Map<string, THREE.Mesh> = new Map();
  private rigs: CameraRigState[] = [];
  private activeRigId: string | null = null;

  // Interactive 3D Hover Placement Reticle
  private placementReticle: THREE.Group;

  private isDragging: boolean = false;
  private isPanning: boolean = false;
  private prevMouseX: number = 0;
  private prevMouseY: number = 0;
  private downMouseX: number = 0;
  private downMouseY: number = 0;

  // Staging placement mode
  public clickToPlaceEnabled: boolean = true;
  public isMultiviewActive: boolean = false;
  private multiviewRoundRobinIdx: number = 0;

  private animFrameId: number | null = null;
  private clock: THREE.Clock = new THREE.Clock();

  // Callbacks
  public onSelectRig: ((rigId: string) => void) | null = null;
  public onMoveRigPosition: ((rigId: string, newPos: [number, number, number]) => void) | null = null;
  public onHoverStageCoord: ((coord: [number, number, number] | null) => void) | null = null;

  constructor(arenaCanvas: HTMLCanvasElement, povCanvas?: HTMLCanvasElement) {
    this.arenaCanvas = arenaCanvas;
    this.povCanvas = povCanvas || null;

    // 1. Initialize Arena WebGL Renderer
    this.arenaRenderer = new THREE.WebGLRenderer({
      canvas: this.arenaCanvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.arenaRenderer.setSize(arenaCanvas.clientWidth || 1280, arenaCanvas.clientHeight || 720, false);
    this.arenaRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.arenaRenderer.shadowMap.enabled = true;
    this.arenaRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.arenaRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.arenaRenderer.toneMappingExposure = 1.15;

    // 2. Initialize Shared Offscreen Optical Renderer (used for POV & Multiview monitors)
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = 960;
    this.offscreenCanvas.height = 540;
    this.offscreenRenderer = new THREE.WebGLRenderer({
      canvas: this.offscreenCanvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.offscreenRenderer.setSize(960, 540, false);
    this.offscreenRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.offscreenRenderer.toneMappingExposure = 1.18;

    // 3. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060810);
    this.scene.fog = new THREE.FogExp2(0x090b14, 0.0045);

    // 4. Build True 3D Concert Stage Venue
    this.stageBuilder = new StageBuilder();
    this.scene.add(this.stageBuilder.group);

    // 5. Build 3D Hover Placement Reticle
    this.placementReticle = this.createPlacementReticle();
    this.placementReticle.visible = false;
    this.scene.add(this.placementReticle);

    // 6. Setup Cameras
    const aspect = arenaCanvas.clientWidth / arenaCanvas.clientHeight || 16 / 9;
    this.directorCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 300);
    this.updateDirectorCameraPosition();

    this.activeRigCamera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 300);

    this.setupEventListeners();
    this.startLoop();
  }

  private createPlacementReticle(): THREE.Group {
    const g = new THREE.Group();
    const outerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.65, 0.8, 32),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.03;

    const innerDot = new THREE.Mesh(
      new THREE.CircleGeometry(0.18, 20),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
    );
    innerDot.rotation.x = -Math.PI / 2;
    innerDot.position.y = 0.03;

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.8, 8),
      new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.45 })
    );
    beam.position.y = 0.9;

    g.add(outerRing, innerDot, beam);
    return g;
  }

  public setArenaCanvas(canvas: HTMLCanvasElement | null) {
    if (!canvas || canvas === this.arenaCanvas) return;
    this.arenaCanvas = canvas;
    this.arenaRenderer.dispose();
    this.arenaRenderer = new THREE.WebGLRenderer({
      canvas: this.arenaCanvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.arenaRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.arenaRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.arenaRenderer.toneMappingExposure = 1.15;
    this.setupEventListeners();
    this.handleResize();
  }

  public setPovCanvas(canvas: HTMLCanvasElement | null) {
    this.povCanvas = canvas;
  }

  public registerMultiviewCanvas(rigId: string, canvas: HTMLCanvasElement | null) {
    if (canvas) {
      this.multiviewCanvases.set(rigId, canvas);
    } else {
      this.multiviewCanvases.delete(rigId);
    }
  }

  public setStagePreset(preset: StagePreset) {
    this.stageBuilder.applyStagePreset(preset);
  }

  private getRigStructuralSignature(rig: CameraRigState): string {
    return [
      rig.bodyId,
      rig.mountType,
      rig.tally,
      rig.colorTag,
      Math.round(rig.focalLength),
      rig.sensorCrop,
      rig.movement.height.toFixed(2),
      rig.movement.sliderLength.toFixed(1),
      rig.movement.sliderAngle.toFixed(0),
      rig.movement.craneArmLength.toFixed(1)
    ].join('|');
  }

  private disposeGroup(group: THREE.Object3D) {
    group.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(m => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
  }

  public updateRigs(rigs: CameraRigState[], activeRigId: string) {
    this.rigs = rigs;
    this.activeRigId = activeRigId;

    const currentIds = new Set(rigs.map(r => r.id));

    // Remove deleted rigs
    for (const [id, mesh] of this.rigMeshMap.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(mesh);
        this.disposeGroup(mesh);
        this.rigMeshMap.delete(id);
        this.rigSignatureMap.delete(id);
        const selRing = this.selectionRings.get(id);
        if (selRing) {
          this.scene.remove(selRing);
          this.disposeGroup(selRing);
          this.selectionRings.delete(id);
        }
      }
    }

    // Add or selectively update rigs
    for (const rig of rigs) {
      const sig = this.getRigStructuralSignature(rig);
      const prevSig = this.rigSignatureMap.get(rig.id);
      let rigGroup = this.rigMeshMap.get(rig.id);

      if (!rigGroup || sig !== prevSig) {
        if (rigGroup) {
          this.scene.remove(rigGroup);
          this.disposeGroup(rigGroup);
        }
        rigGroup = CameraRigModels.createRigMesh(rig);
        this.scene.add(rigGroup);
        this.rigMeshMap.set(rig.id, rigGroup);
        this.rigSignatureMap.set(rig.id, sig);
      }

      // Floor Selection Halo Ring
      let ring = this.selectionRings.get(rig.id);
      if (!ring) {
        const ringGeo = new THREE.RingGeometry(0.85, 1.05, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: rig.id === activeRigId ? 0x00f0ff : 0x475569,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: rig.id === activeRigId ? 0.95 : 0.35
        });
        ring = new THREE.Mesh(ringGeo, ringMat);
        this.scene.add(ring);
        this.selectionRings.set(rig.id, ring);
      } else {
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.color.set(rig.id === activeRigId ? 0x00f0ff : 0x475569);
        mat.opacity = rig.id === activeRigId ? 0.95 : 0.35;
      }
      ring.position.set(rig.basePosition[0], rig.basePosition[1] + 0.04, rig.basePosition[2]);
    }
  }

  private updateDirectorCameraPosition() {
    this.directorPhi = Math.max(0.05, Math.min(Math.PI * 0.48, this.directorPhi));
    const x = this.directorTarget.x + this.directorRadius * Math.sin(this.directorPhi) * Math.sin(this.directorTheta);
    const y = this.directorTarget.y + this.directorRadius * Math.cos(this.directorPhi);
    const z = this.directorTarget.z + this.directorRadius * Math.sin(this.directorPhi) * Math.cos(this.directorTheta);

    this.directorCamera.position.set(x, y, z);
    this.directorCamera.lookAt(this.directorTarget);
  }

  private setupEventListeners() {
    const canvas = this.arenaCanvas;

    const onMouseDown = (e: MouseEvent) => {
      this.downMouseX = e.clientX;
      this.downMouseY = e.clientY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      if (e.button === 0) {
        this.isDragging = true;
      } else if (e.button === 2 || e.button === 1) {
        this.isPanning = true;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isDragging && !this.isPanning) {
        this.updateHoverReticle(e.clientX, e.clientY);
        return;
      }

      const deltaX = e.clientX - this.prevMouseX;
      const deltaY = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      if (this.isDragging) {
        this.directorTheta -= deltaX * 0.006;
        this.directorPhi -= deltaY * 0.006;
        this.updateDirectorCameraPosition();
      } else if (this.isPanning) {
        const panSpeed = 0.025 * (this.directorRadius / 25);
        const forward = new THREE.Vector3();
        this.directorCamera.getWorldDirection(forward);
        const right = new THREE.Vector3().crossVectors(forward, this.directorCamera.up).normalize();

        this.directorTarget.addScaledVector(right, -deltaX * panSpeed);
        this.directorTarget.y = Math.max(0, Math.min(22, this.directorTarget.y + deltaY * panSpeed));
        this.updateDirectorCameraPosition();
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      const moveDist = Math.hypot(e.clientX - this.downMouseX, e.clientY - this.downMouseY);
      this.isDragging = false;
      this.isPanning = false;

      // Treat as a click if mouse moved less than 6 pixels
      if (moveDist < 6 && e.button === 0) {
        this.handleClick(e.clientX, e.clientY, e.shiftKey);
      }
    };

    const onMouseLeave = () => {
      this.placementReticle.visible = false;
      if (this.onHoverStageCoord) this.onHoverStageCoord(null);
    };

    canvas.onmousedown = onMouseDown;
    canvas.onmousemove = onMouseMove;
    canvas.onmouseup = onMouseUp;
    canvas.onmouseleave = onMouseLeave;

    canvas.onwheel = (e: WheelEvent) => {
      e.preventDefault();
      this.directorRadius = Math.max(3, Math.min(115, this.directorRadius + e.deltaY * 0.035));
      this.updateDirectorCameraPosition();
    };

    canvas.oncontextmenu = (e: MouseEvent) => e.preventDefault();

    const resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    resizeObserver.observe(this.arenaCanvas);
  }

  private raycastStageSurface(clientX: number, clientY: number): [number, number, number] | null {
    const rect = this.arenaCanvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.directorCamera);

    const hits = raycaster.intersectObjects(this.stageBuilder.walkableMeshes, false);
    if (hits.length > 0) {
      const p = hits[0].point;
      const clampedX = Math.max(-42, Math.min(42, p.x));
      const clampedZ = Math.max(-24, Math.min(48, p.z));
      const surfaceY = StageBuilder.getSurfaceElevationAt(clampedX, clampedZ);
      return [Number(clampedX.toFixed(1)), Number(surfaceY.toFixed(2)), Number(clampedZ.toFixed(1))];
    }
    return null;
  }

  private updateHoverReticle(clientX: number, clientY: number) {
    if (!this.clickToPlaceEnabled) {
      this.placementReticle.visible = false;
      return;
    }
    const coord = this.raycastStageSurface(clientX, clientY);
    if (coord) {
      this.placementReticle.position.set(coord[0], coord[1], coord[2]);
      this.placementReticle.visible = true;
      if (this.onHoverStageCoord) this.onHoverStageCoord(coord);
    } else {
      this.placementReticle.visible = false;
      if (this.onHoverStageCoord) this.onHoverStageCoord(null);
    }
  }

  private handleClick(clientX: number, clientY: number, isShiftHeld: boolean) {
    const rect = this.arenaCanvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.directorCamera);

    // 1. Check if clicked on an existing Camera Rig first
    const rigGroups: THREE.Object3D[] = [];
    this.rigMeshMap.forEach(group => rigGroups.push(group));

    const rigIntersects = raycaster.intersectObjects(rigGroups, true);
    if (rigIntersects.length > 0) {
      let topObj: THREE.Object3D | null = rigIntersects[0].object;
      while (topObj && !topObj.name.startsWith('Rig_') && topObj.parent) {
        topObj = topObj.parent;
      }
      if (topObj && topObj.name.startsWith('Rig_')) {
        const rigId = topObj.name.replace('Rig_', '');
        if (this.onSelectRig) {
          this.onSelectRig(rigId);
        }
        return;
      }
    }

    // 2. Otherwise, if click-to-place is enabled (or Shift held), place active camera at clicked 3D surface coordinate
    if ((this.clickToPlaceEnabled || isShiftHeld) && this.activeRigId && this.onMoveRigPosition) {
      const coord = this.raycastStageSurface(clientX, clientY);
      if (coord) {
        this.onMoveRigPosition(this.activeRigId, coord);
      }
    }
  }

  public setDirectorPresetView(
    preset: 'FOH' | 'STAGE_TOP' | 'PIT_WIDE' | 'HERO_PERFORMER' | 'SIDE_CRANE' | 'BACKSTAGE' | 'ON_STAGE_CROWD'
  ) {
    switch (preset) {
      case 'FOH':
        this.directorTarget.set(0, 4.5, 0);
        this.directorRadius = 44;
        this.directorTheta = 0;
        this.directorPhi = Math.PI * 0.4;
        break;
      case 'STAGE_TOP':
        this.directorTarget.set(0, 2.0, 2);
        this.directorRadius = 52;
        this.directorTheta = 0;
        this.directorPhi = 0.1;
        break;
      case 'PIT_WIDE':
        this.directorTarget.set(0, 3.5, 4);
        this.directorRadius = 18;
        this.directorTheta = Math.PI * 0.16;
        this.directorPhi = Math.PI * 0.43;
        break;
      case 'HERO_PERFORMER':
        this.directorTarget.set(0, 3.2, 2);
        this.directorRadius = 9;
        this.directorTheta = -0.22;
        this.directorPhi = Math.PI * 0.44;
        break;
      case 'SIDE_CRANE':
        this.directorTarget.set(0, 5.0, 0);
        this.directorRadius = 36;
        this.directorTheta = Math.PI * 0.38;
        this.directorPhi = Math.PI * 0.36;
        break;
      case 'BACKSTAGE':
        this.directorTarget.set(0, 3.5, -10);
        this.directorRadius = 16;
        this.directorTheta = Math.PI;
        this.directorPhi = Math.PI * 0.42;
        break;
      case 'ON_STAGE_CROWD':
        this.directorTarget.set(0, 2.5, 16);
        this.directorRadius = 14;
        this.directorTheta = Math.PI * 0.88;
        this.directorPhi = Math.PI * 0.38;
        break;
    }
    this.updateDirectorCameraPosition();
  }

  public handleResize() {
    const aW = this.arenaCanvas.clientWidth;
    const aH = this.arenaCanvas.clientHeight;
    if (aW > 0 && aH > 0) {
      this.arenaRenderer.setSize(aW, aH, false);
      this.directorCamera.aspect = aW / aH;
      this.directorCamera.updateProjectionMatrix();
    }
  }

  private startLoop() {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      this.render();
    };
    loop();
  }

  private renderRigPovToCanvas(rig: CameraRigState, time: number, targetCanvas: HTMLCanvasElement) {
    const bodySpec = CAMERA_BODIES[rig.bodyId];
    const vFov = calculateVerticalFov(rig.focalLength, bodySpec.sensorHeightMm, rig.sensorCrop);

    const w = targetCanvas.width || 640;
    const h = targetCanvas.height || 360;

    if (this.offscreenCanvas.width !== w || this.offscreenCanvas.height !== h) {
      this.offscreenRenderer.setSize(w, h, false);
    }

    this.activeRigCamera.fov = vFov;
    this.activeRigCamera.aspect = w / h;
    this.activeRigCamera.updateProjectionMatrix();

    const transform = computeRigWorldTransform(rig, time);
    this.activeRigCamera.position.copy(transform.position);
    this.activeRigCamera.rotation.copy(transform.rotation);

    // Hide the rig's own mesh & placement reticle during optical capture
    const activeGroup = this.rigMeshMap.get(rig.id);
    const prevReticleVis = this.placementReticle.visible;
    if (activeGroup) activeGroup.visible = false;
    this.placementReticle.visible = false;

    this.offscreenRenderer.render(this.scene, this.activeRigCamera);

    if (activeGroup) activeGroup.visible = true;
    this.placementReticle.visible = prevReticleVis;

    const ctx = targetCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(this.offscreenCanvas, 0, 0, w, h);
    }
  }

  private render() {
    const time = this.clock.getElapsedTime();

    // 1. Update Concert Venue moving heads & visuals
    this.stageBuilder.update(time);

    // 2. Update Kinematics for all camera rigs
    let activeRigState: CameraRigState | null = null;

    for (const rig of this.rigs) {
      const transform = computeRigWorldTransform(rig, time);
      const group = this.rigMeshMap.get(rig.id);

      if (group) {
        group.position.set(rig.basePosition[0], rig.basePosition[1], rig.basePosition[2]);

        const camAssembly = group.getObjectByName(`CameraAssembly_${rig.id}`);
        if (camAssembly) {
          camAssembly.position.copy(transform.position).sub(group.position);
          camAssembly.rotation.copy(transform.rotation);
        }

        if (rig.mountType === 'SLIDER') {
          const carriage = group.getObjectByName(`Carriage_${rig.id}`);
          if (carriage) {
            let t = rig.movement.sliderPosition;
            if (rig.movement.sliderPingPong) {
              const cycle = (time * rig.movement.sliderSpeed * 0.5) % 2;
              t = cycle > 1 ? 2 - cycle : cycle;
            }
            carriage.position.x = (t - 0.5) * rig.movement.sliderLength;
          }
        }

        if (rig.mountType === 'CRANE') {
          const armGroup = group.getObjectByName(`CraneArm_${rig.id}`);
          if (armGroup) {
            armGroup.rotation.y = THREE.MathUtils.degToRad(rig.movement.craneBaseAngle);
            armGroup.rotation.x = THREE.MathUtils.degToRad(-rig.movement.craneElevation);
          }
        }
      }

      const ring = this.selectionRings.get(rig.id);
      if (ring) {
        ring.position.set(rig.basePosition[0], rig.basePosition[1] + 0.04, rig.basePosition[2]);
      }

      if (rig.id === this.activeRigId) {
        activeRigState = rig;
      }
    }

    // 3. Render Main 3D Arena View (if visible)
    if (this.arenaCanvas.clientWidth > 0 && this.arenaCanvas.clientHeight > 0) {
      this.arenaRenderer.render(this.scene, this.directorCamera);
    }

    // 4. Render Active Camera Optical POV (in Staging PIP or Director Mode)
    if (this.povCanvas && activeRigState && !this.isMultiviewActive) {
      this.renderRigPovToCanvas(activeRigState, time, this.povCanvas);
    }

    // 5. Render Live Multiview Wall Monitors (renders 2 cameras per frame at 60fps = 20fps per monitor for 6 cams, ultra smooth!)
    if (this.isMultiviewActive && this.rigs.length > 0) {
      const camsPerFrame = Math.min(2, this.rigs.length);
      for (let i = 0; i < camsPerFrame; i++) {
        const idx = (this.multiviewRoundRobinIdx + i) % this.rigs.length;
        const rig = this.rigs[idx];
        const mvCanvas = this.multiviewCanvases.get(rig.id);
        if (mvCanvas) {
          this.renderRigPovToCanvas(rig, time, mvCanvas);
        }
      }
      this.multiviewRoundRobinIdx = (this.multiviewRoundRobinIdx + camsPerFrame) % this.rigs.length;
    }
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.arenaRenderer.dispose();
    this.offscreenRenderer.dispose();
  }
}
