import * as THREE from 'three';
import { StageBuilder } from './StageBuilder';
import { CameraRigModels } from './CameraRigModels';
import { CameraRigState, StagePreset } from '../types';
import { computeRigWorldTransform, calculateVerticalFov } from '../utils/optics';
import { CAMERA_BODIES } from '../data/cameras';

export class SceneManager {
  private mainCanvas: HTMLCanvasElement;
  private pipCanvas: HTMLCanvasElement | null = null;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private stageBuilder: StageBuilder;

  // Director Viewport Camera (Orbit / Arena perspective)
  public directorCamera: THREE.PerspectiveCamera;
  private directorTarget: THREE.Vector3 = new THREE.Vector3(0, 3, 0);
  private directorRadius: number = 32;
  private directorTheta: number = Math.PI * 0.25; // horizontal orbit angle
  private directorPhi: number = Math.PI * 0.32; // vertical elevation angle

  // Active Rig Camera (Viewfinder / PIP)
  public activeRigCamera: THREE.PerspectiveCamera;

  // Multicamera rig 3D instances
  private rigMeshMap: Map<string, THREE.Group> = new Map();
  private rigs: CameraRigState[] = [];
  private activeRigId: string | null = null;

  private isDragging: boolean = false;
  private isPanning: boolean = false;
  private prevMouseX: number = 0;
  private prevMouseY: number = 0;

  private animFrameId: number | null = null;
  private clock: THREE.Clock = new THREE.Clock();

  // Selection callback
  public onSelectRig: ((rigId: string) => void) | null = null;

  constructor(mainCanvas: HTMLCanvasElement, pipCanvas?: HTMLCanvasElement) {
    this.mainCanvas = mainCanvas;
    this.pipCanvas = pipCanvas || null;

    // Initialize WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.mainCanvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(mainCanvas.clientWidth, mainCanvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05070b);

    // Build Concert Stage Venue
    this.stageBuilder = new StageBuilder();
    this.scene.add(this.stageBuilder.group);

    // Setup Director Camera
    const aspect = mainCanvas.clientWidth / mainCanvas.clientHeight || 16 / 9;
    this.directorCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 300);
    this.updateDirectorCameraPosition();

    // Setup Active Rig Viewfinder Camera
    this.activeRigCamera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 300);

    this.setupEventListeners();
    this.startLoop();
  }

  public setPipCanvas(canvas: HTMLCanvasElement | null) {
    this.pipCanvas = canvas;
  }

  public setStagePreset(preset: StagePreset) {
    this.stageBuilder.applyStagePreset(preset);
  }

  public updateRigs(rigs: CameraRigState[], activeRigId: string) {
    this.rigs = rigs;
    this.activeRigId = activeRigId;

    // Track active ids to remove dead meshes
    const currentIds = new Set(rigs.map(r => r.id));

    // Remove old rigs
    for (const [id, mesh] of this.rigMeshMap.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(mesh);
        this.rigMeshMap.delete(id);
      }
    }

    // Add or update rigs
    for (const rig of rigs) {
      let rigGroup = this.rigMeshMap.get(rig.id);
      if (!rigGroup) {
        rigGroup = CameraRigModels.createRigMesh(rig);
        this.scene.add(rigGroup);
        this.rigMeshMap.set(rig.id, rigGroup);
      } else {
        // Rebuild if body, mount, or tally changed
        this.scene.remove(rigGroup);
        rigGroup = CameraRigModels.createRigMesh(rig);
        this.scene.add(rigGroup);
        this.rigMeshMap.set(rig.id, rigGroup);
      }
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
    const canvas = this.mainCanvas;

    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 0) {
        // Left click: orbit
        this.isDragging = true;
      } else if (e.button === 2 || e.button === 1) {
        // Right / Middle click: pan
        this.isPanning = true;
      }
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      // Raycast to check if clicking on a camera rig
      this.handleRaycastSelect(e.clientX, e.clientY);
    });

    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.isDragging && !this.isPanning) return;

      const deltaX = e.clientX - this.prevMouseX;
      const deltaY = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      if (this.isDragging) {
        this.directorTheta -= deltaX * 0.006;
        this.directorPhi -= deltaY * 0.006;
        this.updateDirectorCameraPosition();
      } else if (this.isPanning) {
        const panSpeed = 0.02 * (this.directorRadius / 25);
        const forward = new THREE.Vector3();
        this.directorCamera.getWorldDirection(forward);
        const right = new THREE.Vector3().crossVectors(forward, this.directorCamera.up).normalize();

        this.directorTarget.addScaledVector(right, -deltaX * panSpeed);
        this.directorTarget.y += deltaY * panSpeed;
        this.updateDirectorCameraPosition();
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.isPanning = false;
    });

    canvas.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      this.directorRadius = Math.max(3, Math.min(120, this.directorRadius + e.deltaY * 0.03));
      this.updateDirectorCameraPosition();
    }, { passive: false });

    canvas.addEventListener('contextmenu', (e: MouseEvent) => e.preventDefault());

    // Window resize observer
    const resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    resizeObserver.observe(this.mainCanvas);
  }

  private handleRaycastSelect(clientX: number, clientY: number) {
    const rect = this.mainCanvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.directorCamera);

    const checkObjects: THREE.Object3D[] = [];
    this.rigMeshMap.forEach(group => checkObjects.push(group));

    const intersects = raycaster.intersectObjects(checkObjects, true);
    if (intersects.length > 0) {
      let topObj: THREE.Object3D | null = intersects[0].object;
      while (topObj && !topObj.name.startsWith('Rig_') && topObj.parent) {
        topObj = topObj.parent;
      }
      if (topObj && topObj.name.startsWith('Rig_')) {
        const rigId = topObj.name.replace('Rig_', '');
        if (this.onSelectRig) {
          this.onSelectRig(rigId);
        }
      }
    }
  }

  public setDirectorPresetView(preset: 'FOH' | 'STAGE_TOP' | 'PIT_WIDE' | 'HERO_PERFORMER' | 'SIDE_CRANE') {
    switch (preset) {
      case 'FOH':
        this.directorTarget.set(0, 2.5, 0);
        this.directorRadius = 38;
        this.directorTheta = 0;
        this.directorPhi = Math.PI * 0.38;
        break;
      case 'STAGE_TOP':
        this.directorTarget.set(0, 1.8, 0);
        this.directorRadius = 45;
        this.directorTheta = 0;
        this.directorPhi = 0.08;
        break;
      case 'PIT_WIDE':
        this.directorTarget.set(0, 2.0, 7);
        this.directorRadius = 14;
        this.directorTheta = Math.PI * 0.15;
        this.directorPhi = Math.PI * 0.42;
        break;
      case 'HERO_PERFORMER':
        this.directorTarget.set(0, 1.8, 0);
        this.directorRadius = 6;
        this.directorTheta = -0.2;
        this.directorPhi = Math.PI * 0.45;
        break;
      case 'SIDE_CRANE':
        this.directorTarget.set(0, 3.0, 0);
        this.directorRadius = 28;
        this.directorTheta = Math.PI * 0.45;
        this.directorPhi = Math.PI * 0.35;
        break;
    }
    this.updateDirectorCameraPosition();
  }

  public handleResize() {
    const width = this.mainCanvas.clientWidth;
    const height = this.mainCanvas.clientHeight;
    if (width === 0 || height === 0) return;

    this.renderer.setSize(width, height, false);
    this.directorCamera.aspect = width / height;
    this.directorCamera.updateProjectionMatrix();

    if (this.pipCanvas) {
      this.activeRigCamera.aspect = this.pipCanvas.clientWidth / this.pipCanvas.clientHeight || 16 / 9;
      this.activeRigCamera.updateProjectionMatrix();
    }
  }

  private startLoop() {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      this.render();
    };
    loop();
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
        // Base coordinate
        group.position.set(rig.basePosition[0], rig.basePosition[1], rig.basePosition[2]);

        // Find camera assembly sub-mesh inside rig
        const camAssembly = group.getObjectByName(`CameraAssembly_${rig.id}`);
        if (camAssembly) {
          // Set relative to base
          camAssembly.position.copy(transform.position).sub(group.position);
          camAssembly.rotation.copy(transform.rotation);
        }

        // Animate slider carriage if slider
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

        // Animate crane arm if crane
        if (rig.mountType === 'CRANE') {
          const armGroup = group.getObjectByName(`CraneArm_${rig.id}`);
          if (armGroup) {
            armGroup.rotation.y = THREE.MathUtils.degToRad(rig.movement.craneBaseAngle);
            armGroup.rotation.x = THREE.MathUtils.degToRad(-rig.movement.craneElevation);
          }
        }
      }

      if (rig.id === this.activeRigId) {
        activeRigState = rig;
      }
    }

    // 3. Update Active Camera Lens FOV & Position
    if (activeRigState) {
      const bodySpec = CAMERA_BODIES[activeRigState.bodyId];
      const vFov = calculateVerticalFov(activeRigState.focalLength, bodySpec.sensorHeightMm, activeRigState.sensorCrop);

      this.activeRigCamera.fov = vFov;
      this.activeRigCamera.updateProjectionMatrix();

      const activeTransform = computeRigWorldTransform(activeRigState, time);
      this.activeRigCamera.position.copy(activeTransform.position);
      this.activeRigCamera.rotation.copy(activeTransform.rotation);
    }

    // 4. Render Main Arena View (Director Perspective)
    this.renderer.render(this.scene, this.directorCamera);

    // 5. Render PIP Viewfinder if PIP canvas is active
    if (this.pipCanvas && activeRigState) {
      const pipCtx = this.pipCanvas.getContext('2d');
      if (pipCtx) {
        const pipW = this.pipCanvas.width;
        const pipH = this.pipCanvas.height;

        // Temporarily render active camera using WebGL scissor to copy into PIP canvas
        this.renderer.setViewport(0, 0, pipW, pipH);
        this.renderer.render(this.scene, this.activeRigCamera);
        pipCtx.drawImage(this.mainCanvas, 0, 0, pipW, pipH, 0, 0, pipW, pipH);

        // Restore main viewport
        this.renderer.setViewport(0, 0, this.mainCanvas.width, this.mainCanvas.height);
      }
    }
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.renderer.dispose();
  }
}
