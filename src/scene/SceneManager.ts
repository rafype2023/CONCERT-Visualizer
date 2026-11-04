import * as THREE from 'three';
import { StageBuilder } from './StageBuilder';
import { CameraRigModels } from './CameraRigModels';
import { CameraRigState, StagePreset } from '../types';
import { computeRigWorldTransform, calculateVerticalFov } from '../utils/optics';
import { CAMERA_BODIES } from '../data/cameras';

export class SceneManager {
  private arenaCanvas: HTMLCanvasElement;
  private povCanvas: HTMLCanvasElement | null = null;
  private arenaRenderer: THREE.WebGLRenderer;
  private povRenderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private stageBuilder: StageBuilder;

  // Director Viewport Camera (Orbit / Arena perspective)
  public directorCamera: THREE.PerspectiveCamera;
  private directorTarget: THREE.Vector3 = new THREE.Vector3(0, 2.5, 0);
  private directorRadius: number = 28;
  private directorTheta: number = Math.PI * 0.2; // horizontal orbit angle
  private directorPhi: number = Math.PI * 0.35; // vertical elevation angle

  // Active Rig Camera (Viewfinder / POV)
  public activeRigCamera: THREE.PerspectiveCamera;

  // Rig Observer Camera (tracks active rig from outside in Director mode)
  public rigObserverCamera: THREE.PerspectiveCamera;

  // Multicamera rig 3D instances
  private rigMeshMap: Map<string, THREE.Group> = new Map();
  private selectionRings: Map<string, THREE.Mesh> = new Map();
  private rigs: CameraRigState[] = [];
  private activeRigId: string | null = null;

  // Floor raycast target plane
  private groundRaycastMesh: THREE.Mesh;

  private isDragging: boolean = false;
  private isPanning: boolean = false;
  private prevMouseX: number = 0;
  private prevMouseY: number = 0;
  private clickStartTime: number = 0;

  // Staging placement mode
  public clickToPlaceEnabled: boolean = true;

  private animFrameId: number | null = null;
  private clock: THREE.Clock = new THREE.Clock();

  // Callbacks
  public onSelectRig: ((rigId: string) => void) | null = null;
  public onMoveRigPosition: ((rigId: string, newPos: [number, number, number]) => void) | null = null;

  constructor(arenaCanvas: HTMLCanvasElement, povCanvas?: HTMLCanvasElement) {
    this.arenaCanvas = arenaCanvas;
    this.povCanvas = povCanvas || null;

    // 1. Initialize Arena WebGL Renderer
    this.arenaRenderer = new THREE.WebGLRenderer({
      canvas: this.arenaCanvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.arenaRenderer.setSize(arenaCanvas.clientWidth, arenaCanvas.clientHeight, false);
    this.arenaRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.arenaRenderer.shadowMap.enabled = true;
    this.arenaRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.arenaRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.arenaRenderer.toneMappingExposure = 1.15;

    // 2. Initialize POV Renderer if povCanvas provided
    if (this.povCanvas) {
      this.initPovRenderer(this.povCanvas);
    }

    // 3. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05070b);

    // 4. Build Concert Stage Venue
    this.stageBuilder = new StageBuilder();
    this.scene.add(this.stageBuilder.group);

    // Raycasting invisible plane covering stage & arena
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const groundMat = new THREE.MeshBasicMaterial({ visible: false });
    this.groundRaycastMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundRaycastMesh.rotation.x = -Math.PI / 2;
    this.groundRaycastMesh.position.y = 0;
    this.scene.add(this.groundRaycastMesh);

    // 5. Setup Cameras
    const aspect = arenaCanvas.clientWidth / arenaCanvas.clientHeight || 16 / 9;
    this.directorCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 300);
    this.updateDirectorCameraPosition();

    // Active Rig Optical Camera
    this.activeRigCamera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 300);

    // Rig Observer Camera (tracks the rig closely from 4 meters away)
    this.rigObserverCamera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 100);

    this.setupEventListeners();
    this.startLoop();
  }

  public setPovCanvas(canvas: HTMLCanvasElement | null) {
    if (this.povCanvas === canvas) return;
    this.povCanvas = canvas;
    if (this.povRenderer) {
      this.povRenderer.dispose();
      this.povRenderer = null;
    }
    if (this.povCanvas) {
      this.initPovRenderer(this.povCanvas);
    }
  }

  private initPovRenderer(canvas: HTMLCanvasElement) {
    this.povRenderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.povRenderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.povRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.povRenderer.shadowMap.enabled = true;
    this.povRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.povRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.povRenderer.toneMappingExposure = 1.15;
  }

  public setStagePreset(preset: StagePreset) {
    this.stageBuilder.applyStagePreset(preset);
  }

  public updateRigs(rigs: CameraRigState[], activeRigId: string) {
    this.rigs = rigs;
    this.activeRigId = activeRigId;

    const currentIds = new Set(rigs.map(r => r.id));

    // Remove old rigs
    for (const [id, mesh] of this.rigMeshMap.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(mesh);
        this.rigMeshMap.delete(id);
        const selRing = this.selectionRings.get(id);
        if (selRing) {
          this.scene.remove(selRing);
          this.selectionRings.delete(id);
        }
      }
    }

    // Add or update rigs
    for (const rig of rigs) {
      let rigGroup = this.rigMeshMap.get(rig.id);
      if (rigGroup) {
        this.scene.remove(rigGroup);
      }
      rigGroup = CameraRigModels.createRigMesh(rig);
      this.scene.add(rigGroup);
      this.rigMeshMap.set(rig.id, rigGroup);

      // Floor Selection Halo Ring
      let ring = this.selectionRings.get(rig.id);
      if (!ring) {
        const ringGeo = new THREE.RingGeometry(0.8, 0.95, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: rig.id === activeRigId ? 0x00f0ff : 0x475569,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: rig.id === activeRigId ? 0.9 : 0.3
        });
        ring = new THREE.Mesh(ringGeo, ringMat);
        this.scene.add(ring);
        this.selectionRings.set(rig.id, ring);
      } else {
        (ring.material as THREE.MeshBasicMaterial).color.set(rig.id === activeRigId ? 0x00f0ff : 0x475569);
        (ring.material as THREE.MeshBasicMaterial).opacity = rig.id === activeRigId ? 0.9 : 0.3;
      }
      ring.position.set(rig.basePosition[0], 0.05, rig.basePosition[2]);
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

    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      this.clickStartTime = Date.now();
      if (e.button === 0) {
        this.isDragging = true;
      } else if (e.button === 2 || e.button === 1) {
        this.isPanning = true;
      }
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
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

    canvas.addEventListener('mouseup', (e: MouseEvent) => {
      const clickDuration = Date.now() - this.clickStartTime;
      this.isDragging = false;
      this.isPanning = false;

      // Only handle selection/placement if it was a quick click (< 250ms), not a drag
      if (clickDuration < 250 && e.button === 0) {
        this.handleClick(e.clientX, e.clientY, e.shiftKey);
      }
    });

    canvas.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();
      this.directorRadius = Math.max(3, Math.min(140, this.directorRadius + e.deltaY * 0.03));
      this.updateDirectorCameraPosition();
    }, { passive: false });

    canvas.addEventListener('contextmenu', (e: MouseEvent) => e.preventDefault());

    // Window resize observer
    const resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    resizeObserver.observe(this.arenaCanvas);
  }

  private handleClick(clientX: number, clientY: number, isShiftHeld: boolean) {
    const rect = this.arenaCanvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.directorCamera);

    // 1. First check if clicked on any Camera Rig
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

    // 2. If click-to-place enabled or Shift is held, raycast to stage floor/catwalk
    if (this.clickToPlaceEnabled || isShiftHeld) {
      const stageIntersects = raycaster.intersectObject(this.groundRaycastMesh, false);
      if (stageIntersects.length > 0 && this.activeRigId && this.onMoveRigPosition) {
        const p = stageIntersects[0].point;
        // Keep within reasonable arena bounds (-35 to +35 x, -15 to +40 z)
        const clampedX = Math.max(-35, Math.min(35, p.x));
        const clampedZ = Math.max(-18, Math.min(45, p.z));
        this.onMoveRigPosition(this.activeRigId, [clampedX, 0, clampedZ]);
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
    // Resize Arena Renderer
    const aW = this.arenaCanvas.clientWidth;
    const aH = this.arenaCanvas.clientHeight;
    if (aW > 0 && aH > 0) {
      this.arenaRenderer.setSize(aW, aH, false);
      this.directorCamera.aspect = aW / aH;
      this.directorCamera.updateProjectionMatrix();
    }

    // Resize POV Renderer
    if (this.povCanvas && this.povRenderer) {
      const pW = this.povCanvas.clientWidth;
      const pH = this.povCanvas.clientHeight;
      if (pW > 0 && pH > 0) {
        this.povRenderer.setSize(pW, pH, false);
        this.activeRigCamera.aspect = pW / pH;
        this.activeRigCamera.updateProjectionMatrix();
      }
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
    let activeRigWorldPos = new THREE.Vector3();

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

      // Update selection ring position
      const ring = this.selectionRings.get(rig.id);
      if (ring) {
        ring.position.set(rig.basePosition[0], 0.05, rig.basePosition[2]);
      }

      if (rig.id === this.activeRigId) {
        activeRigState = rig;
        activeRigWorldPos.copy(transform.position);
      }
    }

    // 3. Update Active Camera Optical FOV & Position
    if (activeRigState) {
      const bodySpec = CAMERA_BODIES[activeRigState.bodyId];
      const vFov = calculateVerticalFov(activeRigState.focalLength, bodySpec.sensorHeightMm, activeRigState.sensorCrop);

      this.activeRigCamera.fov = vFov;
      this.activeRigCamera.updateProjectionMatrix();

      const activeTransform = computeRigWorldTransform(activeRigState, time);
      this.activeRigCamera.position.copy(activeTransform.position);
      this.activeRigCamera.rotation.copy(activeTransform.rotation);

      // Rig Observer Camera frames the rig from behind/side
      const observerOffset = new THREE.Vector3(2.5, 1.8, 3.5);
      this.rigObserverCamera.position.copy(activeTransform.position).add(observerOffset);
      this.rigObserverCamera.lookAt(activeTransform.position);
    }

    // 4. Render Main Arena View (Director 3D Perspective)
    this.arenaRenderer.render(this.scene, this.directorCamera);

    // 5. Render Camera Optical POV to dedicated POV Renderer if active
    if (this.povRenderer && this.povCanvas && activeRigState) {
      // Hide active camera's own rig mesh so it doesn't obstruct its own lens
      const activeGroup = this.rigMeshMap.get(activeRigState.id);
      if (activeGroup) {
        activeGroup.visible = false;
      }

      this.povRenderer.render(this.scene, this.activeRigCamera);

      if (activeGroup) {
        activeGroup.visible = true;
      }
    }
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.arenaRenderer.dispose();
    if (this.povRenderer) {
      this.povRenderer.dispose();
    }
  }
}
