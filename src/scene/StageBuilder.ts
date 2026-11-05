import * as THREE from 'three';
import { StagePreset } from '../types';

export class StageBuilder {
  public group: THREE.Group;
  public walkableMeshes: THREE.Object3D[] = [];

  private movingLightHeads: { group: THREE.Group; baseTilt: number; phase: number; speed: number }[] = [];
  private haloGroup: THREE.Group | null = null;

  // Dynamic Procedural Concert Canvases (Main Wide LED + Vertical IMAG)
  private mainLedCanvas: HTMLCanvasElement;
  private mainLedCtx: CanvasRenderingContext2D | null;
  private mainLedTexture: THREE.CanvasTexture;

  private imagCanvas: HTMLCanvasElement;
  private imagCtx: CanvasRenderingContext2D | null;
  private imagTexture: THREE.CanvasTexture;

  private currentPresetId: string = 'stadium-spectacle';
  private lastCanvasUpdate: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // 1. Main 3-Panel Backdrop Canvas (Wide aspect)
    this.mainLedCanvas = document.createElement('canvas');
    this.mainLedCanvas.width = 1024;
    this.mainLedCanvas.height = 384;
    this.mainLedCtx = this.mainLedCanvas.getContext('2d');
    this.mainLedTexture = new THREE.CanvasTexture(this.mainLedCanvas);
    this.mainLedTexture.colorSpace = THREE.SRGBColorSpace;

    // 2. Vertical IMAG Screen Canvas (Portrait aspect)
    this.imagCanvas = document.createElement('canvas');
    this.imagCanvas.width = 384;
    this.imagCanvas.height = 640;
    this.imagCtx = this.imagCanvas.getContext('2d');
    this.imagTexture = new THREE.CanvasTexture(this.imagCanvas);
    this.imagTexture.colorSpace = THREE.SRGBColorSpace;

    this.drawLedVisuals(0);
    this.buildConcertVenue();
  }

  /**
   * Returns the architectural elevation (Y in meters) for any (X, Z) coordinate on the stage/arena
   */
  public static getSurfaceElevationAt(x: number, z: number): number {
    // Upper Band Riser (Left & Right of center stairs)
    if (z >= -9.5 && z <= -2.5 && Math.abs(x) >= 2.4 && Math.abs(x) <= 14.5) {
      return 3.2;
    }
    // Center Grand Staircase (interpolated between z = -2.5 [y=3.2] and z = 2.0 [y=1.8])
    if (z >= -2.5 && z <= 2.0 && Math.abs(x) < 2.4) {
      const t = (2.0 - z) / 4.5;
      return 1.8 + Math.max(0, Math.min(1, t)) * 1.4;
    }
    // Upper center platform behind stairs
    if (z >= -9.5 && z < -2.5 && Math.abs(x) < 2.4) {
      return 3.2;
    }
    // Main Stage Deck
    if (z >= -10.0 && z <= 4.0 && Math.abs(x) <= 18.0) {
      return 1.8;
    }
    // Center Catwalk / Thrust Runway
    if (z > 4.0 && z <= 26.0 && Math.abs(x) <= 2.2) {
      return 1.8;
    }
    // Catwalk Front B-Stage Tip
    if (z > 25.0 && z <= 28.5 && Math.abs(x) <= 3.5) {
      return 1.8;
    }
    // Default Arena Floor or Backstage Floor
    return 0.0;
  }

  private buildConcertVenue() {
    this.buildSkyAndEnvironment();
    this.buildArenaAndBackstageFloor();
    this.buildMainStageAndCatwalk();
    this.buildStageEquipmentAndBand();
    this.buildLedVideoWalls();
    this.buildScaffoldingAndRoofTrusses();
    this.buildCircularHaloAndLighting();
    this.buildBackstageProductionArea();
    this.buildInstancedCrowdAndFOH();
  }

  private buildSkyAndEnvironment() {
    // Procedural Twilight Sunset Sky Dome (matches the purple/magenta/orange dusk sky in reference images)
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 512;
    skyCanvas.height = 512;
    const ctx = skyCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0.0, '#070913'); // Deep night zenith
      grad.addColorStop(0.35, '#1a1638'); // Indigo dusk
      grad.addColorStop(0.52, '#4a2559'); // Purple clouds
      grad.addColorStop(0.65, '#9d3c5c'); // Sunset crimson/magenta
      grad.addColorStop(0.75, '#e07a47'); // Warm sunset orange horizon
      grad.addColorStop(0.82, '#120d1a'); // Distant tree line / stadium rim
      grad.addColorStop(1.0, '#05060a'); // Ground
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Subtle dusk cloud streaks near horizon
      ctx.fillStyle = 'rgba(255, 140, 80, 0.12)';
      for (let i = 0; i < 40; i++) {
        const y = 240 + Math.random() * 120;
        const h = 4 + Math.random() * 14;
        ctx.fillRect(0, y, 512, h);
      }
    }
    const skyTex = new THREE.CanvasTexture(skyCanvas);
    skyTex.colorSpace = THREE.SRGBColorSpace;

    const skyGeo = new THREE.SphereGeometry(135, 32, 24);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      depthWrite: false
    });
    const skyDome = new THREE.Mesh(skyGeo, skyMat);
    this.group.add(skyDome);

    // Distant Tree Line / Stadium Horizon Silhouette Ring
    const horizonGeo = new THREE.CylinderGeometry(110, 110, 12, 48, 1, true);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x08090f,
      side: THREE.BackSide
    });
    const horizon = new THREE.Mesh(horizonGeo, horizonMat);
    horizon.position.y = 5;
    this.group.add(horizon);

    // Distant Perimeter Stadium Floodlight Towers (like in the On-Stage reference view)
    const towerAngles = [-0.85, -0.5, -0.22, 0.22, 0.5, 0.85];
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });

    towerAngles.forEach(ang => {
      const dist = 78;
      const tx = Math.sin(ang) * dist;
      const tz = Math.cos(ang) * dist;
      const tGroup = new THREE.Group();
      tGroup.position.set(tx, 0, tz);
      tGroup.lookAt(0, 2, 0);

      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.6, 18, 0.6), poleMat);
      pole.position.y = 9;
      tGroup.add(pole);

      const head = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 0.4), glowMat);
      head.position.set(0, 18.2, 0);
      tGroup.add(head);

      this.group.add(tGroup);
    });
  }

  private buildArenaAndBackstageFloor() {
    // Main Arena Floor
    const floorGeo = new THREE.PlaneGeometry(180, 180);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0b0d13,
      roughness: 0.55,
      metalness: 0.25
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);
    this.walkableMeshes.push(floor);

    // Subtle production reference grid
    const grid = new THREE.GridHelper(120, 60, 0x1e293b, 0x111827);
    grid.position.y = 0.01;
    this.group.add(grid);
  }

  private buildMainStageAndCatwalk() {
    const stageGroup = new THREE.Group();

    // Glossy dark stage floor material (reflects stage lights like in the On-Stage photos)
    const stageDeckMat = new THREE.MeshStandardMaterial({
      color: 0x101218,
      roughness: 0.18,
      metalness: 0.65
    });
    const stageFasciaMat = new THREE.MeshStandardMaterial({
      color: 0x090a0f,
      roughness: 0.7,
      metalness: 0.3
    });
    const riserMat = new THREE.MeshStandardMaterial({
      color: 0x161922,
      roughness: 0.28,
      metalness: 0.5
    });

    // 1. Main Stage Deck (36m wide x 14m deep x 1.8m high)
    const mainDeck = new THREE.Mesh(new THREE.BoxGeometry(36, 1.8, 14), stageDeckMat);
    mainDeck.position.set(0, 0.9, -3);
    mainDeck.receiveShadow = true;
    stageGroup.add(mainDeck);
    this.walkableMeshes.push(mainDeck);

    // Extended Side Wings for IMAG & PA Towers (total width 54m)
    const sideWingGeo = new THREE.BoxGeometry(10, 1.8, 12);
    const leftWing = new THREE.Mesh(sideWingGeo, stageFasciaMat);
    leftWing.position.set(-23, 0.9, -2);
    stageGroup.add(leftWing);

    const rightWing = new THREE.Mesh(sideWingGeo, stageFasciaMat);
    rightWing.position.set(23, 0.9, -2);
    stageGroup.add(rightWing);

    // 2. Elevated Upstage Band Risers (Left & Right platforms, height = 3.2m)
    const bandRiserGeo = new THREE.BoxGeometry(11.5, 1.4, 6.5);
    const leftBandRiser = new THREE.Mesh(bandRiserGeo, riserMat);
    leftBandRiser.position.set(-8.25, 2.5, -6);
    stageGroup.add(leftBandRiser);
    this.walkableMeshes.push(leftBandRiser);

    const rightBandRiser = new THREE.Mesh(bandRiserGeo, riserMat);
    rightBandRiser.position.set(8.25, 2.5, -6);
    stageGroup.add(rightBandRiser);
    this.walkableMeshes.push(rightBandRiser);

    // Center upper bridge behind the stairs
    const centerBridge = new THREE.Mesh(new THREE.BoxGeometry(5, 1.4, 3), riserMat);
    centerBridge.position.set(0, 2.5, -7.75);
    stageGroup.add(centerBridge);
    this.walkableMeshes.push(centerBridge);

    // 3. Illuminated Grand Center Staircase (10 glowing steps between main deck and upper riser)
    const numSteps = 10;
    const stairWidth = 4.8;
    const stepLedMat = new THREE.MeshBasicMaterial({ color: 0xfff1d0 });
    for (let i = 0; i < numSteps; i++) {
      const frac = i / numSteps;
      const stepY = 1.8 + (i + 0.5) * (1.4 / numSteps);
      const stepZ = 1.8 - frac * 4.5;
      const stepDepth = 4.5 / numSteps;

      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(stairWidth, 1.4 / numSteps, stepDepth), riserMat);
      stepMesh.position.set(0, stepY, stepZ);
      stageGroup.add(stepMesh);
      this.walkableMeshes.push(stepMesh);

      // Glowing horizontal LED strip on the nose of each step
      const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(stairWidth - 0.1, 0.04, 0.04), stepLedMat);
      ledStrip.position.set(0, stepY + 0.05, stepZ + stepDepth / 2 + 0.01);
      stageGroup.add(ledStrip);
    }

    // 4. Long Center Catwalk / Thrust Runway (4.2m wide x 23m long, extending from z = 4 to z = 27)
    const catwalk = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.8, 23), stageDeckMat);
    catwalk.position.set(0, 0.9, 15.5);
    catwalk.receiveShadow = true;
    stageGroup.add(catwalk);
    this.walkableMeshes.push(catwalk);

    // Warm White / Amber Edge LED Strips along Stage Front and Catwalk
    const warmEdgeMat = new THREE.MeshBasicMaterial({ color: 0xffd89b });
    const stageEdgeL = new THREE.Mesh(new THREE.BoxGeometry(15.9, 0.07, 0.08), warmEdgeMat);
    stageEdgeL.position.set(-10.05, 1.81, 4.0);
    stageGroup.add(stageEdgeL);

    const stageEdgeR = new THREE.Mesh(new THREE.BoxGeometry(15.9, 0.07, 0.08), warmEdgeMat);
    stageEdgeR.position.set(10.05, 1.81, 4.0);
    stageGroup.add(stageEdgeR);

    const catwalkEdgeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 23), warmEdgeMat);
    catwalkEdgeL.position.set(-2.1, 1.81, 15.5);
    stageGroup.add(catwalkEdgeL);

    const catwalkEdgeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 23), warmEdgeMat);
    catwalkEdgeR.position.set(2.1, 1.81, 15.5);
    stageGroup.add(catwalkEdgeR);

    const catwalkTipEdge = new THREE.Mesh(new THREE.BoxGeometry(4.28, 0.07, 0.08), warmEdgeMat);
    catwalkTipEdge.position.set(0, 1.81, 27.0);
    stageGroup.add(catwalkTipEdge);

    // 5. Mojo Pit Barricades (Left, Right, and around Catwalk)
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.35 });
    const barL = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 0.15), barrierMat);
    barL.position.set(-14.5, 0.6, 6.2);
    stageGroup.add(barL);

    const barR = new THREE.Mesh(new THREE.BoxGeometry(22, 1.2, 0.15), barrierMat);
    barR.position.set(14.5, 0.6, 6.2);
    stageGroup.add(barR);

    const catBarL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 23), barrierMat);
    catBarL.position.set(-3.4, 0.6, 17.5);
    stageGroup.add(catBarL);

    const catBarR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 23), barrierMat);
    catBarR.position.set(3.4, 0.6, 17.5);
    stageGroup.add(catBarR);

    this.group.add(stageGroup);
  }

  private buildStageEquipmentAndBand() {
    const equipGroup = new THREE.Group();
    const wedgeMat = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.6 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const cymbalMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.15 });
    const drumShellMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, metalness: 0.4, roughness: 0.25 });

    // 1. Catwalk & Stage Front Floor Monitor Wedges + Floor Moving Lights (just like in the reference photos!)
    const wedgeGeo = new THREE.BoxGeometry(0.55, 0.32, 0.42);
    for (let z = 5.5; z <= 25.5; z += 2.5) {
      [-1.75, 1.75].forEach(x => {
        const wedge = new THREE.Mesh(wedgeGeo, wedgeMat);
        wedge.position.set(x, 1.95, z);
        wedge.rotation.y = x < 0 ? 0.35 : -0.35;
        equipGroup.add(wedge);
      });
    }
    // Front stage lip wedges & floor strobes
    for (let x = -15; x <= 15; x += 3) {
      if (Math.abs(x) < 2.5) continue;
      const wedge = new THREE.Mesh(wedgeGeo, wedgeMat);
      wedge.position.set(x, 1.95, 3.4);
      equipGroup.add(wedge);
    }

    // 2. Symmetrical Dual Drum Kits on the Upper Band Risers (x = -6 and x = +6, y = 3.2m, z = -5.5m)
    [-6.0, 6.0].forEach(dx => {
      const kitGroup = new THREE.Group();
      kitGroup.position.set(dx, 3.2, -5.5);

      // Drum Riser Sub-platform
      const subDeck = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.35, 2.8),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
      );
      subDeck.position.y = 0.175;
      kitGroup.add(subDeck);

      // Double Kick Bass Drums
      [-0.45, 0.45].forEach(kx => {
        const kick = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.65, 20), drumShellMat);
        kick.rotation.x = Math.PI / 2;
        kick.position.set(kx, 0.85, 0.2);
        kitGroup.add(kick);
      });

      // Rack Toms & Floor Toms
      [-0.5, -0.15, 0.2, 0.65].forEach((tx, idx) => {
        const tom = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.28, 14), drumShellMat);
        tom.position.set(tx, idx === 3 ? 0.9 : 1.35, idx === 3 ? -0.2 : 0.1);
        kitGroup.add(tom);
      });

      // Cymbal Stands & Golden Cymbals
      [-1.3, -0.8, 0.0, 0.8, 1.3].forEach((cx, i) => {
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.5, 8), chromeMat);
        stand.position.set(cx, 1.1, 0.15);
        kitGroup.add(stand);

        const cym = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.015, 20), cymbalMat);
        cym.position.set(cx, 1.85 + (i % 2) * 0.15, 0.15);
        cym.rotation.x = 0.15;
        kitGroup.add(cym);
      });

      // Drummer Silhouette
      const drummer = this.createPerformerMesh(0x1e293b, false);
      drummer.position.set(0, 0.35, -0.55);
      kitGroup.add(drummer);

      equipGroup.add(kitGroup);
    });

    // 3. Symmetrical Keyboard / Synth Rigs on Outer Upper Risers (x = -11.2 and x = +11.2)
    [-11.2, 11.2].forEach(kx => {
      const synthGroup = new THREE.Group();
      synthGroup.position.set(kx, 3.2, -5.2);

      // Red Nord-style dual-tier keyboards (visible in the On-Stage reference view!)
      const kbMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.3, metalness: 0.4 });
      const kb1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 0.42), kbMat);
      kb1.position.set(0, 1.0, 0);
      synthGroup.add(kb1);

      const kb2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.09, 0.36), kbMat);
      kb2.position.set(0, 1.28, -0.1);
      kb2.rotation.x = 0.2;
      synthGroup.add(kb2);

      // X-Stand
      const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8), chromeMat);
      leg1.position.set(0, 0.5, 0);
      leg1.rotation.z = 0.45;
      const leg2 = leg1.clone();
      leg2.rotation.z = -0.45;
      synthGroup.add(leg1, leg2);

      const keyboardist = this.createPerformerMesh(0x1e1b4b, false);
      keyboardist.position.set(0, 0, -0.5);
      synthGroup.add(keyboardist);

      equipGroup.add(synthGroup);
    });

    // 4. Front Stage & Catwalk Hero Performers
    // Lead Artist on Catwalk Center (with guitar & mic stand)
    const leadArtist = this.createPerformerMesh(0x312e81, true);
    leadArtist.position.set(0, 1.8, 9.5);
    equipGroup.add(leadArtist);

    // Center Stage Main Vocal Mic Stand & Pedalboard (at z = 1.5m)
    const centerMic = this.createMicStand(chromeMat);
    centerMic.position.set(0, 1.8, 2.2);
    equipGroup.add(centerMic);

    const catwalkTipMic = this.createMicStand(chromeMat);
    catwalkTipMic.position.set(0, 1.8, 24.5);
    equipGroup.add(catwalkTipMic);

    // Lead Guitarist (Stage Left) & Bassist (Stage Right)
    const guitarist = this.createPerformerMesh(0x1e293b, true);
    guitarist.position.set(-7.5, 1.8, 1.2);
    guitarist.rotation.y = 0.25;
    equipGroup.add(guitarist);

    const bassist = this.createPerformerMesh(0x1e293b, true);
    bassist.position.set(7.5, 1.8, 1.2);
    bassist.rotation.y = -0.25;
    equipGroup.add(bassist);

    this.group.add(equipGroup);
  }

  private createMicStand(chromeMat: THREE.Material): THREE.Group {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16), chromeMat);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.55, 8), chromeMat);
    pole.position.y = 0.78;
    const pedalboard = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.05, 0.32),
      new THREE.MeshStandardMaterial({ color: 0x090d16 })
    );
    pedalboard.position.set(0, 0.025, 0.35);
    g.add(base, pole, pedalboard);
    return g;
  }

  private createPerformerMesh(suitColor: number, withGuitar: boolean): THREE.Group {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: suitColor, roughness: 0.6 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd6a78a, roughness: 0.5 });

    // Legs
    [-0.12, 0.12].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.85, 10), mat);
      leg.position.set(lx, 0.425, 0);
      g.add(leg);
    });
    // Torso
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.68, 12), mat);
    torso.position.y = 1.15;
    g.add(torso);
    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), skinMat);
    head.position.y = 1.65;
    g.add(head);

    if (withGuitar) {
      const guitarBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.48, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.5, roughness: 0.2 })
      );
      guitarBody.position.set(-0.05, 1.08, 0.2);
      guitarBody.rotation.z = -0.35;
      const neck = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.06, 0.03),
        new THREE.MeshStandardMaterial({ color: 0x451a03 })
      );
      neck.position.set(-0.35, 1.22, 0.22);
      neck.rotation.z = 0.35;
      g.add(guitarBody, neck);
    }

    return g;
  }

  private buildLedVideoWalls() {
    const ledGroup = new THREE.Group();

    const mainScreenMat = new THREE.MeshBasicMaterial({
      map: this.mainLedTexture,
      side: THREE.FrontSide
    });
    const rearCabinetMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.7,
      roughness: 0.4
    });
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x090a0f, metalness: 0.8, roughness: 0.3 });

    // 1. 3-Panel Upstage LED Wall (Center flat + Left/Right angled wings, just like the reference!)
    // Center Flat LED Wall (18m wide x 9.6m tall)
    const centerLed = new THREE.Mesh(new THREE.PlaneGeometry(18, 9.6), mainScreenMat);
    centerLed.position.set(0, 8.0, -9.4);
    ledGroup.add(centerLed);

    // Rear LED Cabinet Backing (visible from Backstage!)
    const centerBacking = new THREE.Mesh(new THREE.BoxGeometry(18.2, 9.6, 0.35), rearCabinetMat);
    centerBacking.position.set(0, 8.0, -9.6);
    ledGroup.add(centerBacking);

    // Left Angled Wing LED Screen (7.5m wide x 9.6m tall)
    const leftWingGroup = new THREE.Group();
    leftWingGroup.position.set(-9.3, 8.0, -9.4);
    leftWingGroup.rotation.y = 0.42; // angled inward toward center
    const leftLed = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 9.6), mainScreenMat);
    leftLed.position.set(-3.75, 0, 0);
    const leftBack = new THREE.Mesh(new THREE.BoxGeometry(7.5, 9.6, 0.35), rearCabinetMat);
    leftBack.position.set(-3.75, 0, -0.2);
    leftWingGroup.add(leftLed, leftBack);
    ledGroup.add(leftWingGroup);

    // Right Angled Wing LED Screen (7.5m wide x 9.6m tall)
    const rightWingGroup = new THREE.Group();
    rightWingGroup.position.set(9.3, 8.0, -9.4);
    rightWingGroup.rotation.y = -0.42;
    const rightLed = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 9.6), mainScreenMat);
    rightLed.position.set(3.75, 0, 0);
    const rightBack = new THREE.Mesh(new THREE.BoxGeometry(7.5, 9.6, 0.35), rearCabinetMat);
    rightBack.position.set(3.75, 0, -0.2);
    rightWingGroup.add(rightLed, rightBack);
    ledGroup.add(rightWingGroup);

    // Structural Vertical Black Columns separating Center & Wing screens
    [-9.1, 9.1].forEach(px => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.65, 10.5, 0.65), pillarMat);
      pillar.position.set(px, 8.0, -9.3);
      ledGroup.add(pillar);
    });

    // 2. Left & Right Giant Vertical IMAG Screens (x = ±20.0m, 7.2m wide x 12.2m tall)
    const imagMat = new THREE.MeshBasicMaterial({
      map: this.imagTexture,
      side: THREE.FrontSide
    });
    const blinderPodMat = new THREE.MeshBasicMaterial({ color: 0xffb74d });
    const blinderCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    [-20.0, 20.0].forEach(ix => {
      const imagTower = new THREE.Group();
      imagTower.position.set(ix, 8.2, 1.2);

      // Vertical IMAG Screen
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 12.0), imagMat);
      imagTower.add(screen);

      const backing = new THREE.Mesh(new THREE.BoxGeometry(7.4, 12.4, 0.5), rearCabinetMat);
      backing.position.z = -0.3;
      imagTower.add(backing);

      // Vertical Warm Amber Blinder Strips flanking both sides of the IMAG screen (signature detail in reference!)
      [-3.95, 3.95].forEach(bx => {
        const stripHousing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 12.4, 0.4), pillarMat);
        stripHousing.position.set(bx, 0, 0);
        imagTower.add(stripHousing);

        for (let by = -5.5; by <= 5.5; by += 1.0) {
          const pod = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.15), blinderPodMat);
          pod.position.set(bx, by, 0.22);
          imagTower.add(pod);

          const core = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.18), blinderCoreMat);
          core.position.set(bx, by, 0.23);
          imagTower.add(core);
        }
      });

      // Top Header Row of 4 High-Output Blinders above each IMAG
      [-2.7, -0.9, 0.9, 2.7].forEach(tx => {
        const topBlinder = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 0.3), blinderPodMat);
        topBlinder.position.set(tx, 6.9, 0.2);
        imagTower.add(topBlinder);
      });

      ledGroup.add(imagTower);
    });

    this.group.add(ledGroup);
  }

  private buildScaffoldingAndRoofTrusses() {
    const rigGroup = new THREE.Group();

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x181b22,
      metalness: 0.85,
      roughness: 0.3
    });
    const safetyYellowMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.6,
      roughness: 0.35
    });
    const speakerMat = new THREE.MeshStandardMaterial({
      color: 0x090a0d,
      roughness: 0.65,
      metalness: 0.3
    });
    const amberGlowMat = new THREE.MeshBasicMaterial({ color: 0xffc107 });

    // 1. Monumental Overhead Black Steel Roof Structure (y = 16.5m to 20.5m)
    const roofWidth = 34;
    const roofDepth = 18;
    // Longitudinal & Transverse Roof Box Trusses
    for (let z = -11; z <= 5; z += 4) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(roofWidth, 0.85, 0.85), steelMat);
      beam.position.set(0, 17.5, z);
      rigGroup.add(beam);

      const upperBeam = new THREE.Mesh(new THREE.BoxGeometry(roofWidth, 0.65, 0.65), steelMat);
      upperBeam.position.set(0, 20.0, z);
      rigGroup.add(upperBeam);
    }
    for (let x = -16; x <= 16; x += 4) {
      const crossBeam = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, roofDepth), steelMat);
      crossBeam.position.set(x, 17.5, -3);
      rigGroup.add(crossBeam);

      // Vertical truss struts between lower and upper roof chords
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.5, 0.45), steelMat);
      strut.position.set(x, 18.75, 4.5);
      rigGroup.add(strut);
    }

    // Front Brow Row of Warm Amber Stadium Blinders across the main stage roof (z = 4.6m, y = 16.2m)
    for (let x = -14; x <= 14; x += 2.8) {
      const browPod = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.3), amberGlowMat);
      browPod.position.set(x, 16.3, 4.6);
      rigGroup.add(browPod);
    }

    // 2. Main Vertical Steel Truss Towers (flanking the center stage & IMAG wings)
    const mainPillarPositions = [
      [-16.2, 4.2],
      [16.2, 4.2],
      [-16.2, -9.5],
      [16.2, -9.5],
      [-24.2, 1.5],
      [24.2, 1.5],
      [-24.2, -8.5],
      [24.2, -8.5]
    ];
    mainPillarPositions.forEach(([px, pz]) => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(1.1, 18.5, 1.1), steelMat);
      tower.position.set(px, 9.25, pz);
      rigGroup.add(tower);
    });

    // 3. Outer Side Scaffolding Bays with Yellow Zig-Zag Safety Stairs & Purple Uplights (Left & Right Side Views!)
    [-26.5, 26.5].forEach(sx => {
      const sideBay = new THREE.Group();
      sideBay.position.set(sx, 0, -2.5);

      // 4-story scaffolding frame
      const numStories = 4;
      const storyH = 3.8;
      for (let s = 1; s <= numStories; s++) {
        const y = s * storyH;
        const deck = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.18, 9.0), steelMat);
        deck.position.y = y;
        sideBay.add(deck);

        // Zig-zag Yellow Safety Staircase between stories (visible in the Side View reference photos!)
        const stairFlight = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.25, 4.2), safetyYellowMat);
        stairFlight.position.set(sx < 0 ? -0.8 : 0.8, y - storyH / 2, s % 2 === 0 ? 1.2 : -1.2);
        stairFlight.rotation.x = s % 2 === 0 ? 0.65 : -0.65;
        sideBay.add(stairFlight);

        // Yellow safety handrail on outer landing
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 8.8), safetyYellowMat);
        rail.position.set(sx < 0 ? -1.75 : 1.75, y + 0.45, 0);
        sideBay.add(rail);
      }

      // Architectural Purple/Magenta Uplight inside the scaffolding tower
      const purpleLight = new THREE.PointLight(0xa855f7, 25, 16);
      purpleLight.position.set(0, 4.5, 0);
      sideBay.add(purpleLight);

      rigGroup.add(sideBay);
    });

    // 4. Four Hanging Curved J-Array PA Speaker Line Arrays
    // Inner Main PA Arrays (x = ±15.2m, z = 4.5m) & Outer Side-Fill Arrays (x = ±25.0m, z = 2.0m)
    const arrayConfigs = [
      { x: -15.2, y: 15.2, z: 4.5, boxes: 12, rotY: 0.08 },
      { x: 15.2, y: 15.2, z: 4.5, boxes: 12, rotY: -0.08 },
      { x: -25.2, y: 13.5, z: 2.2, boxes: 10, rotY: 0.45 },
      { x: 25.2, y: 13.5, z: 2.2, boxes: 10, rotY: -0.45 }
    ];

    arrayConfigs.forEach(cfg => {
      const arrGroup = new THREE.Group();
      arrGroup.position.set(cfg.x, cfg.y, cfg.z);
      arrGroup.rotation.y = cfg.rotY;

      for (let i = 0; i < cfg.boxes; i++) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.46, 0.85), speakerMat);
        box.position.y = -i * 0.5;
        box.position.z = -Math.pow(i * 0.12, 2) * 0.45; // J-curve pullback
        box.rotation.x = i * 0.045; // progressive downward splay
        arrGroup.add(box);
      }
      rigGroup.add(arrGroup);
    });

    this.group.add(rigGroup);
  }

  private buildCircularHaloAndLighting() {
    const lightsGroup = new THREE.Group();

    // 1. Giant Suspended Circular Halo Truss (16m diameter, tilted slightly toward audience)
    this.haloGroup = new THREE.Group();
    this.haloGroup.position.set(0, 13.4, -1.8);
    this.haloGroup.rotation.x = 0.11; // tilted toward crowd just like in the reference photos

    const haloRadius = 8.2;
    // Outer Rose-Gold / Warm Amber illuminated fascia ring
    const fasciaGeo = new THREE.CylinderGeometry(haloRadius, haloRadius, 0.75, 48, 1, true);
    const fasciaMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.55,
      metalness: 0.8,
      roughness: 0.25,
      side: THREE.DoubleSide
    });
    const fasciaRing = new THREE.Mesh(fasciaGeo, fasciaMat);
    this.haloGroup.add(fasciaRing);

    // Inner structural dark truss torus
    const innerTorus = new THREE.Mesh(
      new THREE.TorusGeometry(haloRadius - 0.35, 0.22, 12, 48),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.3 })
    );
    innerTorus.rotation.x = Math.PI / 2;
    this.haloGroup.add(innerTorus);

    // 16 Moving Head Beam Fixtures around the Circular Halo Ring
    const headMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const coneGeo = new THREE.ConeGeometry(1.65, 16, 20, 1, true);
    coneGeo.translate(0, -8, 0);

    const numHaloLights = 16;
    for (let i = 0; i < numHaloLights; i++) {
      const angle = (i / numHaloLights) * Math.PI * 2;
      const lx = Math.cos(angle) * (haloRadius - 0.2);
      const lz = Math.sin(angle) * (haloRadius - 0.2);

      const fixture = new THREE.Group();
      fixture.position.set(lx, -0.45, lz);

      const head = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), headMat);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.15, 12), lensMat);
      lens.position.y = -0.2;
      lens.rotation.x = Math.PI / 2;
      head.add(body, lens);

      // Alternating cool ice-white/blue and warm amber/magenta beams matching the reference photo
      const beamColor = i % 2 === 0 ? 0xbae6fd : 0xfde68a;
      const beamMat = new THREE.MeshBasicMaterial({
        color: beamColor,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const beam = new THREE.Mesh(coneGeo, beamMat);
      beam.position.y = -0.22;
      head.add(beam);

      fixture.add(head);
      this.haloGroup.add(fixture);

      this.movingLightHeads.push({
        group: head,
        baseTilt: 0.15,
        phase: i * 0.5,
        speed: 0.7
      });
    }

    lightsGroup.add(this.haloGroup);

    // 2. Stage Key, Fill & Rim Directional Lighting
    const ambient = new THREE.AmbientLight(0x2a2438, 1.5);
    lightsGroup.add(ambient);

    const frontKeyLight = new THREE.DirectionalLight(0xfff3e0, 2.8);
    frontKeyLight.position.set(0, 22, 25);
    frontKeyLight.target.position.set(0, 2, 0);
    lightsGroup.add(frontKeyLight, frontKeyLight.target);

    const warmStageGlow = new THREE.PointLight(0xff7733, 45, 35);
    warmStageGlow.position.set(0, 8, -4);
    lightsGroup.add(warmStageGlow);

    const catwalkSpot = new THREE.SpotLight(0xffffff, 35, 40, Math.PI / 4, 0.5);
    catwalkSpot.position.set(0, 18, 18);
    catwalkSpot.target.position.set(0, 1.8, 12);
    lightsGroup.add(catwalkSpot, catwalkSpot.target);

    this.group.add(lightsGroup);
  }

  /**
   * Builds the Backstage Production Area behind the LED wall (z = -10m to -24m)
   * matching the "Backstage View (Behind Stage)" reference photos!
   */
  private buildBackstageProductionArea() {
    const backstageGroup = new THREE.Group();

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.85, roughness: 0.35 });
    const caseMat = new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.5, metalness: 0.3 });
    const aluminumEdgeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });

    // 1. Backstage Rear Staircase (leading from z = -14.5m [y=0] up to z = -9.5m [y=3.2m])
    const steps = 12;
    for (let i = 0; i < steps; i++) {
      const sy = (i + 0.5) * (3.2 / steps);
      const sz = -14.2 + (i / steps) * 4.5;
      const step = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.2 / steps, 0.4), steelMat);
      step.position.set(0, sy, sz);
      backstageGroup.add(step);
    }

    // 2. Colorful Gaffer Tape Lanes on the Backstage Floor (Yellow, Pink, Cyan like in the Backstage photo!)
    const yellowTape = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const pinkTape = new THREE.MeshBasicMaterial({ color: 0xec4899 });
    const cyanTape = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

    const tapeL = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 14), pinkTape);
    tapeL.rotation.x = -Math.PI / 2;
    tapeL.position.set(-2.2, 0.02, -17);
    backstageGroup.add(tapeL);

    const tapeR = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 14), cyanTape);
    tapeR.rotation.x = -Math.PI / 2;
    tapeR.position.set(2.2, 0.02, -17);
    backstageGroup.add(tapeR);

    [-6.5, 6.5].forEach(tx => {
      const lane = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 14), yellowTape);
      lane.rotation.x = -Math.PI / 2;
      lane.position.set(tx, 0.02, -17);
      backstageGroup.add(lane);
    });

    // 3. Rows of Flight Cases / Road Cases & Tech Workstations with Dual Monitors
    const screenGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let z = -12.5; z >= -22.5; z -= 2.5) {
      [-5.2, 5.2, -9.5, 9.5].forEach(cx => {
        const roadCase = new THREE.Group();
        roadCase.position.set(cx, 0.65, z);

        const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 0.85), caseMat);
        const trim = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.06, 0.87), aluminumEdgeMat);
        trim.position.y = 0.52;
        roadCase.add(box, trim);

        // Tech Monitor screens on the inner corridor cases
        if (Math.abs(cx) < 6 && Math.abs(z + 15) < 3) {
          const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.65), screenGlowMat);
          monitor.position.set(cx < 0 ? 0.3 : -0.3, 0.82, 0);
          roadCase.add(monitor);
        }

        backstageGroup.add(roadCase);
      });
    }

    // Backstage work light
    const backLight = new THREE.PointLight(0xfffbeb, 18, 25);
    backLight.position.set(0, 7, -16);
    backstageGroup.add(backLight);

    this.group.add(backstageGroup);
  }

  private buildInstancedCrowdAndFOH() {
    const crowdGroup = new THREE.Group();

    // 1. Front of House (FOH) Mix & Broadcast Control Tent at z = 36m
    const fohGroup = new THREE.Group();
    fohGroup.position.set(0, 0, 35.5);
    const fohMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.4 });
    const fohDeck = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 5), fohMat);
    fohDeck.position.y = 0.3;
    fohGroup.add(fohDeck);
    this.walkableMeshes.push(fohDeck);

    // FOH Roof Canopy & Pillars
    [
      [-3.8, -2.3],
      [3.8, -2.3],
      [-3.8, 2.3],
      [3.8, 2.3]
    ].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.6, 8), fohMat);
      post.position.set(px, 2.1, pz);
      fohGroup.add(post);
    });
    const fohRoof = new THREE.Mesh(new THREE.ConeGeometry(5.8, 1.5, 4), fohMat);
    fohRoof.position.y = 4.6;
    fohRoof.rotation.y = Math.PI / 4;
    fohGroup.add(fohRoof);
    crowdGroup.add(fohGroup);

    // 2. High-Performance InstancedMesh 3D Audience (900 spectators + 220 glowing smartphone screens)
    const count = 900;
    const personGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.68, 7);
    const personMat = new THREE.MeshStandardMaterial({ color: 0x121521, roughness: 0.85 });
    const instancedCrowd = new THREE.InstancedMesh(personGeo, personMat, count);

    const phoneCount = 220;
    const phoneGeo = new THREE.BoxGeometry(0.09, 0.16, 0.02);
    const phoneMat = new THREE.MeshBasicMaterial({ color: 0xfff7ed });
    const instancedPhones = new THREE.InstancedMesh(phoneGeo, phoneMat, phoneCount);

    const dummy = new THREE.Object3D();
    let pIdx = 0;
    let phoneIdx = 0;

    for (let i = 0; i < count * 2 && pIdx < count; i++) {
      const x = (Math.random() - 0.5) * 68;
      const z = 7.0 + Math.random() * 36;

      // Keep clear of the center catwalk & FOH tent
      if (Math.abs(x) < 4.2 && z < 29.0) continue;
      if (Math.abs(x) < 5.5 && z > 32.0 && z < 39.5) continue;

      dummy.position.set(x, 0.84, z);
      dummy.lookAt(0, 2.5, 0);
      dummy.scale.set(1, 0.92 + Math.random() * 0.16, 1);
      dummy.updateMatrix();
      instancedCrowd.setMatrixAt(pIdx++, dummy.matrix);

      if (phoneIdx < phoneCount && Math.random() > 0.72) {
        dummy.position.set(x + (Math.random() - 0.5) * 0.2, 1.88 + Math.random() * 0.22, z);
        dummy.lookAt(0, 4.0, -4);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        instancedPhones.setMatrixAt(phoneIdx++, dummy.matrix);
      }
    }

    instancedCrowd.instanceMatrix.needsUpdate = true;
    instancedPhones.instanceMatrix.needsUpdate = true;
    crowdGroup.add(instancedCrowd, instancedPhones);

    this.group.add(crowdGroup);
  }

  /**
   * Switches the procedural LED wall visual theme (while keeping the 3D architectural stage intact!)
   */
  public applyStagePreset(preset: StagePreset) {
    this.currentPresetId = preset.id;
    this.drawLedVisuals(0, true);
  }

  /**
   * Renders rich procedural concert visuals onto the Main 3-Panel LED Wall and Left/Right Vertical IMAGs
   */
  private drawLedVisuals(timeSec: number, force: boolean = false) {
    // Throttle canvas redraws to ~24fps for optimal CPU/GPU performance
    if (!force && timeSec - this.lastCanvasUpdate < 0.04) return;
    this.lastCanvasUpdate = timeSec;

    // 1. Draw Main 3-Panel Backdrop Visuals
    if (this.mainLedCtx) {
      const ctx = this.mainLedCtx;
      const w = this.mainLedCanvas.width;
      const h = this.mainLedCanvas.height;

      if (this.currentPresetId === 'stadium-spectacle' || this.currentPresetId === 'six-views') {
        // Fiery Sunset Cloudscape (matches the iconic fiery orange/crimson/purple clouds in the reference photos!)
        const bg = ctx.createRadialGradient(w * 0.5, h * 0.85, 20, w * 0.5, h * 0.5, w * 0.65);
        bg.addColorStop(0.0, '#fff7ed');
        bg.addColorStop(0.22, '#fb923c');
        bg.addColorStop(0.5, '#dc2626');
        bg.addColorStop(0.78, '#701a75');
        bg.addColorStop(1.0, '#1e1b4b');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // Animated billowing cloud puffs
        for (let i = 0; i < 18; i++) {
          const cx = ((i * 73 + timeSec * 18 * (i % 2 === 0 ? 1 : -1)) % (w + 200)) - 100;
          const cy = h * (0.25 + 0.55 * Math.sin(i * 1.7 + timeSec * 0.4));
          const rad = 70 + (i % 4) * 35;
          const cGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, rad);
          cGrad.addColorStop(0, i % 3 === 0 ? 'rgba(254, 215, 170, 0.35)' : 'rgba(244, 63, 94, 0.28)');
          cGrad.addColorStop(1, 'rgba(30, 27, 75, 0)');
          ctx.fillStyle = cGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (this.currentPresetId === 'dynamic-five') {
        // Cyber Neon Horizon & Equalizer
        const bg = ctx.createLinearGradient(0, 0, 0, h);
        bg.addColorStop(0, '#090d16');
        bg.addColorStop(0.6, '#1e1b4b');
        bg.addColorStop(1, '#701a75');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        const bars = 48;
        const bw = w / bars;
        for (let i = 0; i < bars; i++) {
          const bh = (Math.sin(timeSec * 3.5 + i * 0.35) * 0.4 + 0.5) * h * 0.75;
          ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#ec4899';
          ctx.fillRect(i * bw + 3, h - bh, bw - 6, bh);
        }
      } else {
        // Gold Arena Starburst
        const bg = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.6);
        bg.addColorStop(0, '#fef08a');
        bg.addColorStop(0.35, '#d97706');
        bg.addColorStop(0.75, '#451a03');
        bg.addColorStop(1, '#090a0f');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(253, 224, 71, 0.25)';
        ctx.lineWidth = 4;
        for (let i = 0; i < 16; i++) {
          const ang = (i / 16) * Math.PI * 2 + timeSec * 0.2;
          ctx.beginPath();
          ctx.moveTo(w / 2, h / 2);
          ctx.lineTo(w / 2 + Math.cos(ang) * w, h / 2 + Math.sin(ang) * w);
          ctx.stroke();
        }
      }

      this.mainLedTexture.needsUpdate = true;
    }

    // 2. Draw Vertical IMAG Screen Visuals (Live Performer Silhouette against fiery sunset clouds!)
    if (this.imagCtx) {
      const ic = this.imagCtx;
      const iw = this.imagCanvas.width;
      const ih = this.imagCanvas.height;

      // Fiery backdrop matching main screen
      const grad = ic.createLinearGradient(0, 0, 0, ih);
      grad.addColorStop(0, '#7c2d12');
      grad.addColorStop(0.45, '#ea580c');
      grad.addColorStop(0.8, '#fda4af');
      grad.addColorStop(1, '#1e1b4b');
      ic.fillStyle = grad;
      ic.fillRect(0, 0, iw, ih);

      // Dramatic Rock Artist Silhouette on the IMAG (just like the reference photos!)
      const sway = Math.sin(timeSec * 1.5) * 6;
      ic.fillStyle = '#1c1917';
      // Shoulders & Torso
      ic.beginPath();
      ic.ellipse(iw * 0.5 + sway, ih * 0.72, 95, 160, 0, 0, Math.PI * 2);
      ic.fill();
      // Head & Flowing Hair
      ic.beginPath();
      ic.arc(iw * 0.5 + sway, ih * 0.42, 46, 0, Math.PI * 2);
      ic.fill();
      ic.beginPath();
      ic.ellipse(iw * 0.54 + sway, ih * 0.48, 58, 90, 0.2, 0, Math.PI * 2);
      ic.fill();

      // Warm rim highlight
      ic.strokeStyle = 'rgba(254, 215, 170, 0.65)';
      ic.lineWidth = 4;
      ic.stroke();

      this.imagTexture.needsUpdate = true;
    }
  }

  /**
   * Per-frame animation update
   */
  public update(timeSec: number) {
    // 1. Smoothly sweep the 16 Moving Head Spotlights on the Circular Halo Ring
    for (const item of this.movingLightHeads) {
      item.group.rotation.z = Math.sin(timeSec * item.speed + item.phase) * 0.38;
      item.group.rotation.x = item.baseTilt + Math.cos(timeSec * (item.speed * 0.8) + item.phase) * 0.28;
    }

    // 2. Update procedural LED screen visuals
    this.drawLedVisuals(timeSec);
  }
}
