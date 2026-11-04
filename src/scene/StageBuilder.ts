import * as THREE from 'three';
import { StagePreset } from '../types';

export class StageBuilder {
  public group: THREE.Group;
  private ledMaterials: THREE.MeshBasicMaterial[] = [];
  private arenaDomeMaterial: THREE.MeshBasicMaterial | null = null;
  private movingLightBeams: THREE.Mesh[] = [];
  private movingLightHeads: THREE.Group[] = [];
  private textureLoader: THREE.TextureLoader;
  private animCanvas: HTMLCanvasElement;
  private animCtx: CanvasRenderingContext2D | null;
  private animTexture: THREE.CanvasTexture;

  constructor() {
    this.group = new THREE.Group();
    this.textureLoader = new THREE.TextureLoader();

    // Create dynamic animated canvas for pulsating concert graphics
    this.animCanvas = document.createElement('canvas');
    this.animCanvas.width = 1024;
    this.animCanvas.height = 512;
    this.animCtx = this.animCanvas.getContext('2d');
    this.animTexture = new THREE.CanvasTexture(this.animCanvas);
    this.animTexture.wrapS = THREE.RepeatWrapping;
    this.animTexture.wrapT = THREE.RepeatWrapping;

    this.buildConcertVenue();
  }

  private buildConcertVenue() {
    // 1. Arena Ground / Floor
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c10,
      roughness: 0.6,
      metalness: 0.4
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.group.add(ground);

    // Floor Grid / Safety Markings
    const grid = new THREE.GridHelper(100, 50, 0x3b82f6, 0x1e293b);
    grid.position.y = 0.01;
    this.group.add(grid);

    // 2. Main Stage Structure
    this.buildStagePlatform();

    // 3. Stage Equipment & Performers
    this.buildStageProps();

    // 4. LED Video Walls & Backdrops
    this.buildLedWalls();

    // 5. Overhead Trusses & Line Arrays
    this.buildRiggingAndTrusses();

    // 6. Dynamic Moving Spotlights
    this.buildStageLighting();

    // 7. Audience Area & Stadium Surrounds
    this.buildStadiumArena();
  }

  private buildStagePlatform() {
    const stageGroup = new THREE.Group();

    // Main Stage Deck (26m wide x 14m deep x 1.8m high)
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x121418,
      roughness: 0.25,
      metalness: 0.6
    });
    const mainDeckGeo = new THREE.BoxGeometry(26, 1.8, 14);
    const mainDeck = new THREE.Mesh(mainDeckGeo, deckMat);
    mainDeck.position.set(0, 0.9, -4);
    mainDeck.receiveShadow = true;
    stageGroup.add(mainDeck);

    // Stage Front Catwalk / Thrust Runway (4m wide x 12m long extending toward pit)
    const runwayGeo = new THREE.BoxGeometry(4, 1.8, 12);
    const runway = new THREE.Mesh(runwayGeo, deckMat);
    runway.position.set(0, 0.9, 7);
    stageGroup.add(runway);

    // Runway B-Stage Thrust (Octagonal or diamond at the front)
    const bStageGeo = new THREE.CylinderGeometry(4.5, 4.5, 1.8, 8);
    const bStage = new THREE.Mesh(bStageGeo, deckMat);
    bStage.position.set(0, 0.9, 13);
    stageGroup.add(bStage);

    // Stage Front Edge Glow Strips (Neon Cyan / Gold edge lighting)
    const neonMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const edgeFrontGeo = new THREE.BoxGeometry(26.2, 0.08, 0.1);
    const edgeFront = new THREE.Mesh(edgeFrontGeo, neonMat);
    edgeFront.position.set(0, 1.81, 3);
    stageGroup.add(edgeFront);

    // Pit Barricade (Mojo crowd safety barrier)
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.3 });
    const barrierGeo = new THREE.CylinderGeometry(14, 14, 1.2, 32, 1, true, 0, Math.PI);
    const barrier = new THREE.Mesh(barrierGeo, barrierMat);
    barrier.rotation.y = -Math.PI / 2;
    barrier.position.set(0, 0.6, 9);
    stageGroup.add(barrier);

    this.group.add(stageGroup);
  }

  private buildStageProps() {
    const propsGroup = new THREE.Group();

    // Drum Riser (Upstage Center)
    const riserMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const riserGeo = new THREE.BoxGeometry(4.5, 0.6, 4);
    const riser = new THREE.Mesh(riserGeo, riserMat);
    riser.position.set(0, 2.1, -7);
    propsGroup.add(riser);

    // Drum Kit
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9, roughness: 0.1 });
    const drumShellMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.3 });
    const cymbalMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.2 });

    // Bass Drum
    const bassGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.8, 24);
    const bass = new THREE.Mesh(bassGeo, drumShellMat);
    bass.rotation.x = Math.PI / 2;
    bass.position.set(0, 3.1, -7);
    propsGroup.add(bass);

    // Snare & Toms
    const snareGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
    const snare = new THREE.Mesh(snareGeo, drumShellMat);
    snare.position.set(-0.6, 3.1, -6.6);
    propsGroup.add(snare);

    const tomGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 16);
    const tom1 = new THREE.Mesh(tomGeo, drumShellMat);
    tom1.position.set(-0.4, 3.7, -6.9);
    propsGroup.add(tom1);

    const tom2 = new THREE.Mesh(tomGeo, drumShellMat);
    tom2.position.set(0.4, 3.7, -6.9);
    propsGroup.add(tom2);

    // Cymbals
    const cymbalGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.02, 24);
    const crash = new THREE.Mesh(cymbalGeo, cymbalMat);
    crash.position.set(-1.1, 3.9, -6.7);
    crash.rotation.z = 0.2;
    propsGroup.add(crash);

    const ride = new THREE.Mesh(cymbalGeo, cymbalMat);
    ride.position.set(1.1, 3.8, -6.7);
    ride.rotation.z = -0.15;
    propsGroup.add(ride);

    // Drummer Silhouette Stand-in
    const drummerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const drummerHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), drummerMat);
    drummerHead.position.set(0, 3.7, -7.8);
    const drummerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.7, 12), drummerMat);
    drummerBody.position.set(0, 3.1, -7.8);
    propsGroup.add(drummerHead);
    propsGroup.add(drummerBody);

    // Lead Performer Mark (Center Stage Front)
    const singerGroup = new THREE.Group();
    singerGroup.position.set(0, 1.8, 0);

    // Mic Stand
    const micPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.5, 8), chromeMat);
    micPole.position.y = 0.75;
    const micHead = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), chromeMat);
    micHead.position.set(0, 1.55, 0.1);
    singerGroup.add(micPole);
    singerGroup.add(micHead);

    // Singer Silhouette Stand-in
    const performerMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, roughness: 0.8 });
    const singerHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), performerMat);
    singerHead.position.set(0, 1.65, -0.3);
    const singerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.85, 12), performerMat);
    singerBody.position.set(0, 1.15, -0.3);
    const singerLegs = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.9, 12), performerMat);
    singerLegs.position.set(0, 0.45, -0.3);
    singerGroup.add(singerHead);
    singerGroup.add(singerBody);
    singerGroup.add(singerLegs);

    // Foldback Stage Audio Monitors (Wedges)
    const wedgeGeo = new THREE.BoxGeometry(0.6, 0.3, 0.4);
    const wedgeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const wedgeL = new THREE.Mesh(wedgeGeo, wedgeMat);
    wedgeL.position.set(-1.2, 0.15, 0.5);
    wedgeL.rotation.x = 0.3;
    singerGroup.add(wedgeL);

    const wedgeR = new THREE.Mesh(wedgeGeo, wedgeMat);
    wedgeR.position.set(1.2, 0.15, 0.5);
    wedgeR.rotation.x = 0.3;
    singerGroup.add(wedgeR);

    propsGroup.add(singerGroup);

    // Guitarist Stage Left & Bassist Stage Right
    const guitarGroupL = new THREE.Group();
    guitarGroupL.position.set(-6, 1.8, -2);
    const guitarHead = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), performerMat);
    guitarHead.position.y = 1.65;
    const guitarBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 1.5, 12), performerMat);
    guitarBody.position.y = 0.75;
    guitarGroupL.add(guitarHead);
    guitarGroupL.add(guitarBody);

    // Guitar Amp Stacks (Marshall / Ampeg)
    const ampGeo = new THREE.BoxGeometry(0.9, 1.3, 0.5);
    const ampMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6 });
    const ampL = new THREE.Mesh(ampGeo, ampMat);
    ampL.position.set(-7.5, 2.45, -6);
    propsGroup.add(ampL);

    const ampR = new THREE.Mesh(ampGeo, ampMat);
    ampR.position.set(7.5, 2.45, -6);
    propsGroup.add(ampR);

    propsGroup.add(guitarGroupL);
    this.group.add(propsGroup);
  }

  private buildLedWalls() {
    const ledGroup = new THREE.Group();

    // Giant Upstage Curved LED Wall (28m wide x 11m tall)
    const mainCurveGeo = new THREE.CylinderGeometry(24, 24, 11, 48, 1, true, -Math.PI * 0.35, Math.PI * 0.7);
    const mainLedMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide
    });
    this.ledMaterials.push(mainLedMat);

    const mainLed = new THREE.Mesh(mainCurveGeo, mainLedMat);
    mainLed.rotation.y = Math.PI;
    mainLed.position.set(0, 7.3, 13.5);
    ledGroup.add(mainLed);

    // Giant Left IMAG Screen Tower (7m wide x 10m high)
    const imagGeo = new THREE.PlaneGeometry(7, 10);
    const imagMatL = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    this.ledMaterials.push(imagMatL);
    const imagL = new THREE.Mesh(imagGeo, imagMatL);
    imagL.position.set(-16.5, 8.5, -2);
    imagL.rotation.y = 0.45;
    ledGroup.add(imagL);

    // Giant Right IMAG Screen Tower
    const imagMatR = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    this.ledMaterials.push(imagMatR);
    const imagR = new THREE.Mesh(imagGeo, imagMatR);
    imagR.position.set(16.5, 8.5, -2);
    imagR.rotation.y = -0.45;
    ledGroup.add(imagR);

    // Overhead Circular Halo LED Screen
    const haloGeo = new THREE.CylinderGeometry(6, 6, 1.8, 32, 1, true);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, side: THREE.DoubleSide });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 11.5, -2);
    ledGroup.add(halo);

    this.group.add(ledGroup);
  }

  private buildRiggingAndTrusses() {
    const trussGroup = new THREE.Group();
    const trussMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.9,
      roughness: 0.2
    });

    // Overhead Main Mother-Grid Rectangular Trusses
    const beamGeoX = new THREE.BoxGeometry(32, 0.4, 0.4);
    const beamGeoZ = new THREE.BoxGeometry(0.4, 0.4, 22);

    // Front of House Truss
    const frontTruss = new THREE.Mesh(beamGeoX, trussMat);
    frontTruss.position.set(0, 13.5, 6);
    trussGroup.add(frontTruss);

    // Mid Stage Truss
    const midTruss = new THREE.Mesh(beamGeoX, trussMat);
    midTruss.position.set(0, 14.5, -2);
    trussGroup.add(midTruss);

    // Upstage LED Truss
    const upTruss = new THREE.Mesh(beamGeoX, trussMat);
    upTruss.position.set(0, 14.0, -10);
    trussGroup.add(upTruss);

    // Side Connecting Trusses
    const trussSideL = new THREE.Mesh(beamGeoZ, trussMat);
    trussSideL.position.set(-16, 14.0, -2);
    trussGroup.add(trussSideL);

    const trussSideR = new THREE.Mesh(beamGeoZ, trussMat);
    trussSideR.position.set(16, 14.0, -2);
    trussGroup.add(trussSideR);

    // Four Vertical Support Truss Towers
    const towerGeo = new THREE.BoxGeometry(0.8, 15, 0.8);
    const towerPos = [
      [-16, 7.5, 6],
      [16, 7.5, 6],
      [-16, 7.5, -10],
      [16, 7.5, -10]
    ];
    towerPos.forEach(([x, y, z]) => {
      const tower = new THREE.Mesh(towerGeo, trussMat);
      tower.position.set(x, y, z);
      trussGroup.add(tower);
    });

    // Hanging Curved J-Array PA Speakers (Left & Right)
    const speakerMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.7 });
    [-14, 14].forEach(x => {
      const arrayGroup = new THREE.Group();
      arrayGroup.position.set(x, 12, 4);
      for (let i = 0; i < 8; i++) {
        const boxGeo = new THREE.BoxGeometry(1.6, 0.45, 0.7);
        const box = new THREE.Mesh(boxGeo, speakerMat);
        box.position.y = -i * 0.52;
        box.rotation.x = -i * 0.05; // natural J-curve array splay angle
        arrayGroup.add(box);
      }
      trussGroup.add(arrayGroup);
    });

    this.group.add(trussGroup);
  }

  private buildStageLighting() {
    const lightsGroup = new THREE.Group();

    // 10 Moving Head Spot Fixtures along the Mid & Front Trusses
    const headMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const beamGeo = new THREE.ConeGeometry(2.5, 22, 24, 1, true);
    // Pivot cone at tip
    beamGeo.translate(0, -11, 0);

    const beamColors = [
      0x00f0ff, 0xa855f7, 0x3b82f6, 0xec4899,
      0xf59e0b, 0x10b981, 0x06b6d4, 0x6366f1,
      0xec4899, 0x3b82f6
    ];

    const fixturePositions = [
      [-12, 13.5, 6],
      [-7, 13.5, 6],
      [-2, 13.5, 6],
      [3, 13.5, 6],
      [8, 13.5, 6],
      [-10, 14.5, -2],
      [-5, 14.5, -2],
      [0, 14.5, -2],
      [5, 14.5, -2],
      [10, 14.5, -2]
    ];

    fixturePositions.forEach((pos, idx) => {
      const fixture = new THREE.Group();
      fixture.position.set(pos[0], pos[1], pos[2]);

      // Base yoke
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.2, 12), headMat);
      fixture.add(base);

      // Rotating head
      const head = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), headMat);
      head.add(body);

      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), lensMat);
      lens.position.set(0, -0.25, 0);
      lens.rotation.x = Math.PI / 2;
      head.add(lens);

      // Semi-transparent volumetric beam cone
      const beamColor = beamColors[idx % beamColors.length];
      const beamMat = new THREE.MeshBasicMaterial({
        color: beamColor,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(0, -0.28, 0);
      head.add(beam);

      this.movingLightBeams.push(beam);
      this.movingLightHeads.push(head);

      fixture.add(head);
      lightsGroup.add(fixture);
    });

    // Stage Ambient & Key Directional Lighting
    const ambLight = new THREE.AmbientLight(0x222630, 1.2);
    lightsGroup.add(ambLight);

    const stageKeyLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    stageKeyLight.position.set(0, 15, 12);
    stageKeyLight.target.position.set(0, 1.8, 0);
    lightsGroup.add(stageKeyLight);
    lightsGroup.add(stageKeyLight.target);

    // Rim / Backlight for performers
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 3.0);
    rimLight.position.set(0, 14, -8);
    rimLight.target.position.set(0, 1.8, 0);
    lightsGroup.add(rimLight);
    lightsGroup.add(rimLight.target);

    this.group.add(lightsGroup);
  }

  private buildStadiumArena() {
    const arenaGroup = new THREE.Group();

    // 360-degree Stadium Perimeter Cylinder / Skybox
    const domeGeo = new THREE.CylinderGeometry(55, 55, 38, 48, 1, true);
    this.arenaDomeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.BackSide
    });
    const dome = new THREE.Mesh(domeGeo, this.arenaDomeMaterial);
    dome.position.y = 15;
    arenaGroup.add(dome);

    // Standing Pit Audience Crowd Silhouettes
    const crowdGroup = new THREE.Group();
    const crowdMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.9
    });

    // Procedural crowd clusters in front of stage
    const crowdGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.7, 8);
    for (let i = 0; i < 90; i++) {
      const person = new THREE.Mesh(crowdGeo, crowdMat);
      // Scatter in pit between runway and barricade
      const angle = (Math.random() - 0.5) * Math.PI * 0.9;
      const dist = 6 + Math.random() * 14;
      const x = Math.sin(angle) * dist;
      const z = 7 + Math.cos(angle) * dist;

      // Don't spawn on top of the catwalk
      if (Math.abs(x) < 2.5 && z < 14) continue;

      person.position.set(x, 0.85, z);
      person.rotation.y = Math.atan2(-x, -z); // face stage

      // Random raised hands / smartphone camera glow
      if (Math.random() > 0.65) {
        const phoneGlow = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        phoneGlow.position.set(x + (Math.random() - 0.5) * 0.2, 1.95 + Math.random() * 0.25, z);
        crowdGroup.add(phoneGlow);
      }
      crowdGroup.add(person);
    }
    arenaGroup.add(crowdGroup);

    this.group.add(arenaGroup);
  }

  /**
   * Applies the user-selected stage preset images from the workspace `Stage/` folder
   */
  public applyStagePreset(preset: StagePreset) {
    this.textureLoader.load(preset.image, texture => {
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.colorSpace = THREE.SRGBColorSpace;

      // Apply to all LED video surfaces
      this.ledMaterials.forEach(mat => {
        mat.map = texture;
        mat.needsUpdate = true;
      });

      // Apply to Stadium Dome Skybox
      if (this.arenaDomeMaterial) {
        this.arenaDomeMaterial.map = texture;
        this.arenaDomeMaterial.needsUpdate = true;
      }
    });
  }

  /**
   * Animation update loop for moving head spot beams and dynamic LED screen visuals
   */
  public update(timeSec: number) {
    // 1. Animate Moving Head Spotlights (Smooth concert sweeping patterns)
    this.movingLightHeads.forEach((head, idx) => {
      const phase = idx * 0.65;
      const panAngle = Math.sin(timeSec * 0.8 + phase) * 0.7;
      const tiltAngle = -0.4 + Math.cos(timeSec * 0.6 + phase * 1.2) * 0.45;

      head.rotation.y = panAngle;
      head.rotation.x = tiltAngle;
    });

    // 2. Animate LED Screen Pulse / Audio Equalizer graphic
    if (this.animCtx) {
      const ctx = this.animCtx;
      const w = this.animCanvas.width;
      const h = this.animCanvas.height;

      // Dark background with gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#090514');
      bgGrad.addColorStop(1, '#020005');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Equalizer bars
      const bars = 32;
      const barWidth = w / bars;
      for (let i = 0; i < bars; i++) {
        const barHeight = Math.sin(timeSec * 4 + i * 0.5) * 120 + 160 + Math.random() * 20;
        const grad = ctx.createLinearGradient(0, h, 0, h - barHeight);
        grad.addColorStop(0, '#3b82f6');
        grad.addColorStop(0.5, '#ec4899');
        grad.addColorStop(1, '#f59e0b');

        ctx.fillStyle = grad;
        ctx.fillRect(i * barWidth + 4, h - barHeight, barWidth - 8, barHeight);
      }

      // Concert Neon Logo / Watermark
      ctx.font = 'bold 36px "Space Grotesk", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.textAlign = 'center';
      ctx.fillText('LIVE STADIUM PRODUCTION', w / 2, 80);

      this.animTexture.needsUpdate = true;
    }
  }
}
