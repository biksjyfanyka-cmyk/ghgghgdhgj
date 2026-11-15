import * as THREE from 'three';

export interface MapObstacle {
  mesh: THREE.Mesh;
  box: THREE.Box3;
  penetrable: boolean; // can shoot through with auto-wall
  penetrationLoss: number; // 0.3 = loses 30% damage
  name: string;
}

export class CSGOMap {
  public scene: THREE.Scene;
  public obstacles: MapObstacle[] = [];
  public spawnPointsCT: THREE.Vector3[] = [];
  public spawnPointsT: THREE.Vector3[] = [];
  public mapBounds = { minX: -45, maxX: 45, minZ: -55, maxZ: 55 };

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildMap();
  }

  private buildMap() {
    // 1. Map Floor with CS:GO Dust2 style stone/tile grid
    const floorGeo = new THREE.PlaneGeometry(100, 120, 20, 24);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#bfa77e'; // Dust2 sand stone
    ctx.fillRect(0, 0, 512, 512);

    // Tiles pattern
    ctx.strokeStyle = '#937854';
    ctx.lineWidth = 4;
    for (let i = 0; i <= 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
    // Sub-noise
    for (let i = 0; i < 800; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 4, 4);
    }

    const floorTex = new THREE.CanvasTexture(canvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(10, 12);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.85,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 2. Surrounding Perimeter Walls (Dust2 Sandstone blocks)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xcdbb9b,
      roughness: 0.9,
    });
    const darkWallMat = new THREE.MeshStandardMaterial({
      color: 0x8a7251,
      roughness: 0.8,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x965a38,
      roughness: 0.7,
    });

    // North wall
    this.addStaticWall(0, 5, -58, 96, 10, 4, wallMat, false);
    // South wall
    this.addStaticWall(0, 5, 58, 96, 10, 4, wallMat, false);
    // West wall
    this.addStaticWall(-48, 5, 0, 4, 10, 116, wallMat, false);
    // East wall
    this.addStaticWall(48, 5, 0, 4, 10, 116, wallMat, false);

    // 3. Central Arena Layout (Classic HvH Double Peek Setup)
    // Center divider pillars and archway
    this.addStaticWall(-12, 6, 0, 6, 12, 6, darkWallMat, false);
    this.addStaticWall(12, 6, 0, 6, 12, 6, darkWallMat, false);
    // Arch beam connecting pillars
    this.addStaticWall(0, 10, 0, 30, 4, 6, darkWallMat, false);

    // Central Mid Boxes (Penetrable wooden crates - classic CS:GO auto-wall spot!)
    this.addCrate(0, 1.8, -6, 5, 3.6, 5, woodMat, true, 0.25, 'Mid Wood Crate (Autowall)');
    this.addCrate(0, 1.8, 6, 5, 3.6, 5, woodMat, true, 0.25, 'Mid Wood Crate (Autowall)');

    // Left Lane Peek Corner (West side A-long style)
    this.addStaticWall(-26, 4, -18, 16, 8, 4, wallMat, false);
    this.addStaticWall(-26, 4, 18, 16, 8, 4, wallMat, false);
    this.addCrate(-30, 2, 0, 4, 4, 4, woodMat, true, 0.3, 'Long Penetrable Box');

    // Right Lane B-Platform & High-Ground Ramp (East side)
    this.addStaticWall(28, 4, -14, 14, 8, 4, wallMat, false);
    this.addStaticWall(28, 4, 14, 14, 8, 4, wallMat, false);
    this.addCrate(28, 2, 0, 5, 4, 5, darkWallMat, false, 0, 'Stone B-Site Crate');

    // Snipe Boxes near spawns
    this.addCrate(-14, 2, -36, 4.5, 4, 4.5, woodMat, true, 0.25, 'North Snipe Box');
    this.addCrate(14, 2, -36, 4.5, 4, 4.5, darkWallMat, false, 0, 'North Metal Container');

    this.addCrate(-14, 2, 36, 4.5, 4, 4.5, darkWallMat, false, 0, 'South Metal Container');
    this.addCrate(14, 2, 36, 4.5, 4, 4.5, woodMat, true, 0.25, 'South Snipe Box');

    // Spawn Points for CT (North) and T (South)
    this.spawnPointsCT = [
      new THREE.Vector3(0, 0, -44),
      new THREE.Vector3(-18, 0, -42),
      new THREE.Vector3(18, 0, -42),
      new THREE.Vector3(-32, 0, -40),
      new THREE.Vector3(32, 0, -40),
    ];

    this.spawnPointsT = [
      new THREE.Vector3(0, 0, 44),
      new THREE.Vector3(-18, 0, 42),
      new THREE.Vector3(18, 0, 42),
      new THREE.Vector3(-32, 0, 40),
      new THREE.Vector3(32, 0, 40),
    ];

    // Bomb site graffiti markings
    const siteAMesh = this.createSiteMarking('A', 0xef4444);
    siteAMesh.position.set(-28, 0.05, 0);
    this.scene.add(siteAMesh);

    const siteBMesh = this.createSiteMarking('B', 0x3b82f6);
    siteBMesh.position.set(28, 0.05, 0);
    this.scene.add(siteBMesh);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 1.2);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    sunLight.position.set(30, 60, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    this.scene.add(sunLight);

    // Neon accent lights for NeverLose cyber vibe
    const bluePoint = new THREE.PointLight(0x00d4ff, 2, 40);
    bluePoint.position.set(0, 8, 0);
    this.scene.add(bluePoint);
  }

  private addStaticWall(x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material, penetrable: boolean) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const box = new THREE.Box3().setFromObject(mesh);
    this.obstacles.push({
      mesh,
      box,
      penetrable,
      penetrationLoss: penetrable ? 0.3 : 1.0,
      name: 'Wall',
    });
  }

  private addCrate(x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material, penetrable: boolean, penLoss: number, name: string) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    const box = new THREE.Box3().setFromObject(mesh);
    this.obstacles.push({
      mesh,
      box,
      penetrable,
      penetrationLoss: penLoss,
      name,
    });
  }

  private createSiteMarking(letter: string, color: number): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(128, 128, 100, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = ctx.strokeStyle;
    ctx.font = 'bold 120px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 128, 128);

    const tex = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(8, 8);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }
}
