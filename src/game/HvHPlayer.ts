import * as THREE from 'three';
import { AGENTS, WEAPONS } from '../utils/constants';
import { CheatConfig, WeaponType } from '../types/hvh';

export interface HitboxNodes {
  head: THREE.Object3D;
  chest: THREE.Object3D;
  stomach: THREE.Object3D;
  pelvis: THREE.Object3D;
  leftFoot: THREE.Object3D;
  rightFoot: THREE.Object3D;
}

export class HvHPlayer {
  public group: THREE.Group;
  public ghostGroup: THREE.Group;
  public autoPeekRing: THREE.Mesh | null = null;
  public autoPeekPos: THREE.Vector3 | null = null;
  public isAutoPeeking = false;

  // Body parts
  public headMesh!: THREE.Mesh;
  public torsoMesh!: THREE.Mesh;
  public leftArm!: THREE.Mesh;
  public rightArm!: THREE.Mesh;
  public weaponMesh!: THREE.Mesh;
  public leftLeg!: THREE.Mesh;
  public rightLeg!: THREE.Mesh;
  public hitboxes!: HitboxNodes;

  // Angles
  public realYaw = 0;
  public fakeYaw = 0;
  public pitch = 0;
  public lbyTimer = 0;
  public jitterSide = 1;

  // Movement & State
  public position = new THREE.Vector3(0, 0, 36);
  public velocity = new THREE.Vector3(0, 0, 0);
  public isGrounded = true;
  public isCrouched = false;
  public fakeDuckTick = 0;
  public isAlive = true;
  public currentAgentId = 'sir_bloody_darryl';
  public currentWeapon: WeaponType = 'scar20';

  constructor(scene: THREE.Scene, initialAgentId = 'sir_bloody_darryl') {
    this.currentAgentId = initialAgentId;
    this.group = new THREE.Group();
    this.ghostGroup = new THREE.Group();
    this.buildModel(this.group, false);
    this.buildModel(this.ghostGroup, true); // Ghost desync model

    scene.add(this.group);
    scene.add(this.ghostGroup);
    this.createAutoPeekMarker(scene);
  }

  private buildModel(parent: THREE.Group, isGhost: boolean) {
    const agent = AGENTS.find((a) => a.id === this.currentAgentId) || AGENTS[0];
    const baseColor = isGhost ? 0x00f0ff : parseInt(agent.primaryColor.replace('#', '0x'), 16);
    const secColor = isGhost ? 0x0088ff : parseInt(agent.secondaryColor.replace('#', '0x'), 16);

    const makeMat = (col: number, wire = false) => {
      if (isGhost) {
        return new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          wireframe: true,
          transparent: true,
          opacity: 0.35,
        });
      }
      return new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.5,
        metalness: 0.3,
        wireframe: wire,
      });
    };

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(1.0, 1.4, 0.6);
    const torso = new THREE.Mesh(torsoGeo, makeMat(secColor));
    torso.position.y = 1.9;
    torso.castShadow = !isGhost;
    parent.add(torso);
    if (!isGhost) this.torsoMesh = torso;

    // Tactical Vest on Torso
    const vestGeo = new THREE.BoxGeometry(1.06, 0.9, 0.66);
    const vest = new THREE.Mesh(vestGeo, makeMat(baseColor));
    vest.position.set(0, 0.1, 0);
    torso.add(vest);

    // 2. Head (Hitbox)
    const headGeo = new THREE.BoxGeometry(0.55, 0.6, 0.55);
    const headMat = isGhost ? makeMat(0x00ffff) : makeMat(0xfbcfe8); // face tone / mask
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 0.95, 0);
    head.castShadow = !isGhost;
    torso.add(head);
    if (!isGhost) this.headMesh = head;

    // Head mask / helmet
    const maskGeo = new THREE.BoxGeometry(0.58, 0.35, 0.58);
    const mask = new THREE.Mesh(maskGeo, makeMat(baseColor));
    mask.position.set(0, 0.12, 0);
    head.add(mask);

    // Eyes / Goggles
    const gogglesGeo = new THREE.BoxGeometry(0.42, 0.12, 0.15);
    const goggles = new THREE.Mesh(gogglesGeo, new THREE.MeshBasicMaterial({ color: isGhost ? 0x00ffff : 0x00f0ff }));
    goggles.position.set(0, 0.05, 0.26);
    head.add(goggles);

    // 3. Arms
    const armGeo = new THREE.BoxGeometry(0.3, 1.1, 0.3);
    const leftArm = new THREE.Mesh(armGeo, makeMat(secColor));
    leftArm.position.set(-0.7, 0.1, 0.3);
    leftArm.rotation.x = -Math.PI / 4;
    torso.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, makeMat(secColor));
    rightArm.position.set(0.7, 0.1, 0.3);
    rightArm.rotation.x = -Math.PI / 4;
    torso.add(rightArm);

    if (!isGhost) {
      this.leftArm = leftArm;
      this.rightArm = rightArm;
    }

    // 4. Weapon Model (attached to torso/right arm)
    const weaponData = WEAPONS[this.currentWeapon];
    const weaponGroup = new THREE.Group();

    // Body of rifle
    const gunBodyGeo = new THREE.BoxGeometry(0.18, 0.3, 1.8);
    const gunMat = isGhost
      ? makeMat(0x00ffff)
      : new THREE.MeshStandardMaterial({
          color: parseInt((weaponData?.modelColor || '#1e3a8a').replace('#', '0x'), 16),
          metalness: 0.8,
          roughness: 0.3,
        });
    const gunBody = new THREE.Mesh(gunBodyGeo, gunMat);
    weaponGroup.add(gunBody);

    // Long Sniper Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8);
    const barrel = new THREE.Mesh(barrelGeo, gunMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.05, 1.3);
    weaponGroup.add(barrel);

    // Scope
    const scopeGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.8, 8);
    const scopeMat = isGhost ? makeMat(0x00ffff) : new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5 });
    const scope = new THREE.Mesh(scopeGeo, scopeMat);
    scope.rotation.x = Math.PI / 2;
    scope.position.set(0, 0.22, 0.2);
    weaponGroup.add(scope);

    // Magazine
    const magGeo = new THREE.BoxGeometry(0.12, 0.45, 0.3);
    const mag = new THREE.Mesh(magGeo, gunMat);
    mag.position.set(0, -0.3, 0.1);
    weaponGroup.add(mag);

    weaponGroup.position.set(0.35, -0.1, 0.6);
    torso.add(weaponGroup);
    if (!isGhost) this.weaponMesh = gunBody;

    // 5. Legs
    const legGeo = new THREE.BoxGeometry(0.35, 1.2, 0.35);
    const leftLeg = new THREE.Mesh(legGeo, makeMat(secColor));
    leftLeg.position.set(-0.3, 0.6, 0);
    parent.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, makeMat(secColor));
    rightLeg.position.set(0.3, 0.6, 0);
    parent.add(rightLeg);

    if (!isGhost) {
      this.leftLeg = leftLeg;
      this.rightLeg = rightLeg;

      // Assign Hitboxes
      this.hitboxes = {
        head,
        chest: vest,
        stomach: torso,
        pelvis: torso,
        leftFoot: leftLeg,
        rightFoot: rightLeg,
      };
    }
  }

  private createAutoPeekMarker(scene: THREE.Scene) {
    const geo = new THREE.RingGeometry(0.8, 1.1, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    this.autoPeekRing = new THREE.Mesh(geo, mat);
    this.autoPeekRing.rotation.x = -Math.PI / 2;
    this.autoPeekRing.visible = false;
    scene.add(this.autoPeekRing);
  }

  public updateAntiAim(config: CheatConfig, delta: number, viewYaw: number) {
    if (!config.antiAimEnabled) {
      this.realYaw = viewYaw;
      this.fakeYaw = viewYaw;
      this.pitch = 0;
      this.group.rotation.y = this.realYaw;
      this.ghostGroup.visible = false;
      return;
    }

    // 1. Anti-Aim Pitch
    if (config.pitch === 'pitch_down') {
      // Classic HvH down pitch: head tilted down towards chest
      this.pitch = -1.45; // ~ -83 degrees
    } else if (config.pitch === 'pitch_up') {
      this.pitch = 1.45;
    } else if (config.pitch === 'jitter') {
      this.pitch = Math.sin(Date.now() * 0.02) > 0 ? -1.45 : 1.45;
    } else {
      this.pitch = 0;
    }

    if (this.torsoMesh) {
      this.torsoMesh.rotation.x = this.pitch;
    }

    // 2. Anti-Aim Yaw
    if (config.yaw === 'spinbot') {
      this.realYaw += config.yawSpeed * delta * 5;
    } else if (config.yaw === 'jitter') {
      this.jitterSide = Math.sin(Date.now() * 0.03) > 0 ? 1 : -1;
      this.realYaw = viewYaw + Math.PI + this.jitterSide * 0.7;
    } else if (config.yaw === 'lby_breaker') {
      this.lbyTimer += delta;
      if (this.lbyTimer > 1.1) {
        this.realYaw += 2.0; // flick 120 degrees
        this.lbyTimer = 0;
      } else {
        this.realYaw = viewYaw + Math.PI;
      }
    } else {
      // Backward AA
      this.realYaw = viewYaw + Math.PI;
    }

    // 3. Desync / Fake Angle offset
    if (config.desync) {
      const desyncRad = (config.desyncAngle * Math.PI) / 180;
      const multiplier = config.desyncSide === 'left' ? -1 : config.desyncSide === 'right' ? 1 : Math.sin(Date.now() * 0.01) > 0 ? 1 : -1;
      this.fakeYaw = this.realYaw + desyncRad * multiplier;
      this.ghostGroup.visible = config.showGhostModel;
      this.ghostGroup.position.copy(this.group.position);
      this.ghostGroup.rotation.y = this.fakeYaw;
    } else {
      this.fakeYaw = this.realYaw;
      this.ghostGroup.visible = false;
    }

    // 4. Fake Duck
    if (config.fakeDuck) {
      this.fakeDuckTick++;
      const isDucking = this.fakeDuckTick % 12 < 6;
      this.torsoMesh.position.y = isDucking ? 1.2 : 1.9;
    } else {
      this.torsoMesh.position.y = this.isCrouched ? 1.2 : 1.9;
    }

    this.group.rotation.y = this.realYaw;
  }

  public setAutoPeekStart(pos: THREE.Vector3) {
    this.autoPeekPos = pos.clone();
    this.isAutoPeeking = true;
    if (this.autoPeekRing) {
      this.autoPeekRing.position.set(pos.x, 0.08, pos.z);
      this.autoPeekRing.visible = true;
    }
  }

  public triggerAutoPeekReturn(): boolean {
    if (this.isAutoPeeking && this.autoPeekPos) {
      // Teleport or snap back to peek point
      this.position.x = this.autoPeekPos.x;
      this.position.z = this.autoPeekPos.z;
      this.velocity.set(0, 0, 0);
      return true;
    }
    return false;
  }

  public disableAutoPeek() {
    this.isAutoPeeking = false;
    this.autoPeekPos = null;
    if (this.autoPeekRing) {
      this.autoPeekRing.visible = false;
    }
  }

  public getHitboxWorldPos(type: 'head' | 'chest' | 'stomach' | 'pelvis' | 'feet'): THREE.Vector3 {
    const target = new THREE.Vector3();
    if (type === 'head' && this.hitboxes?.head) {
      this.hitboxes.head.getWorldPosition(target);
    } else if (type === 'chest' && this.hitboxes?.chest) {
      this.hitboxes.chest.getWorldPosition(target);
    } else {
      this.group.getWorldPosition(target);
      target.y += 1.5;
    }
    return target;
  }
}
