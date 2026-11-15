import * as THREE from 'three';
import { WeaponType } from '../types/hvh';
import { AGENTS, WEAPONS } from '../utils/constants';

export interface BotConfig {
  name: string;
  agentId: string;
  weapon: WeaponType;
  yawType: 'spinbot' | 'jitter' | 'lby';
  spinSpeed: number;
  desyncOffset: number;
  pitch: number; // -1.45 for pitch down
  reactionTime: number; // in seconds
  hitChance: number;
}

export class HvHBot {
  public scene: THREE.Scene;
  public group: THREE.Group;
  public ghostGroup: THREE.Group;
  public config: BotConfig;

  // Stats
  public hp = 100;
  public armor = 100;
  public isAlive = true;
  public kills = 0;
  public deaths = 0;

  // Body parts & hitboxes
  public headMesh!: THREE.Mesh;
  public torsoMesh!: THREE.Mesh;
  public leftLeg!: THREE.Mesh;
  public rightLeg!: THREE.Mesh;

  // Anti-Aim simulation
  public realYaw = 0;
  public fakeYaw = 0;
  public currentPitch = -1.45; // pitch down by default
  public lbyTimer = 0;

  // AI State
  public targetPoint: THREE.Vector3;
  public moveSpeed = 6.5;
  public nextShotTime = 0;
  public lastSeenPlayerTime = 0;
  public waypoints: THREE.Vector3[] = [];
  public currentWaypointIdx = 0;

  constructor(scene: THREE.Scene, config: BotConfig, initialPos: THREE.Vector3, waypoints: THREE.Vector3[]) {
    this.scene = scene;
    this.config = config;
    this.waypoints = waypoints;
    this.targetPoint = waypoints[0] || initialPos.clone();

    this.group = new THREE.Group();
    this.group.position.copy(initialPos);
    this.ghostGroup = new THREE.Group();
    this.ghostGroup.position.copy(initialPos);

    this.buildBotModel(this.group, false);
    this.buildBotModel(this.ghostGroup, true); // Ghost desync mesh

    this.scene.add(this.group);
    this.scene.add(this.ghostGroup);
  }

  private buildBotModel(parent: THREE.Group, isGhost: boolean) {
    const agent = AGENTS.find((a) => a.id === this.config.agentId) || AGENTS[1];
    const baseColor = isGhost ? 0xff0055 : parseInt(agent.primaryColor.replace('#', '0x'), 16);
    const secColor = isGhost ? 0x880022 : parseInt(agent.secondaryColor.replace('#', '0x'), 16);

    const makeMat = (col: number) => {
      if (isGhost) {
        return new THREE.MeshBasicMaterial({
          color: 0xff0066,
          wireframe: true,
          transparent: true,
          opacity: 0.3,
        });
      }
      return new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.6,
        metalness: 0.2,
      });
    };

    // Torso
    const torsoGeo = new THREE.BoxGeometry(1.0, 1.4, 0.6);
    const torso = new THREE.Mesh(torsoGeo, makeMat(secColor));
    torso.position.y = 1.9;
    parent.add(torso);
    if (!isGhost) this.torsoMesh = torso;

    // Tactical Vest
    const vestGeo = new THREE.BoxGeometry(1.06, 0.9, 0.66);
    const vest = new THREE.Mesh(vestGeo, makeMat(baseColor));
    vest.position.set(0, 0.1, 0);
    torso.add(vest);

    // Head
    const headGeo = new THREE.BoxGeometry(0.55, 0.6, 0.55);
    const head = new THREE.Mesh(headGeo, makeMat(baseColor));
    head.position.set(0, 0.95, 0);
    torso.add(head);
    if (!isGhost) this.headMesh = head;

    // Weapon
    const gunGeo = new THREE.BoxGeometry(0.18, 0.28, 1.7);
    const weaponData = WEAPONS[this.config.weapon];
    const gunMat = isGhost
      ? makeMat(0xff0055)
      : new THREE.MeshStandardMaterial({
          color: parseInt((weaponData?.modelColor || '#047857').replace('#', '0x'), 16),
          metalness: 0.7,
        });
    const gun = new THREE.Mesh(gunGeo, gunMat);
    gun.position.set(0.4, 0.1, 0.7);
    torso.add(gun);

    // Legs
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
    }
  }

  public update(delta: number, playerPos: THREE.Vector3, now: number) {
    if (!this.isAlive) {
      this.group.rotation.x = -Math.PI / 2; // fallen on ground
      this.group.position.y = 0.4;
      this.ghostGroup.visible = false;
      return;
    }

    // 1. Waypoint movement (peeking corners)
    if (this.waypoints.length > 0) {
      const dest = this.waypoints[this.currentWaypointIdx];
      const dir = new THREE.Vector3().subVectors(dest, this.group.position);
      dir.y = 0;
      const dist = dir.length();

      if (dist < 1.0) {
        this.currentWaypointIdx = (this.currentWaypointIdx + 1) % this.waypoints.length;
      } else {
        dir.normalize();
        this.group.position.addScaledVector(dir, this.moveSpeed * delta);
      }
    }

    // 2. Anti-Aim calculation
    if (this.config.yawType === 'spinbot') {
      this.realYaw += this.config.spinSpeed * delta * 5;
    } else if (this.config.yawType === 'jitter') {
      const jitter = Math.sin(now * 0.015) > 0 ? 0.8 : -0.8;
      const angleToPlayer = Math.atan2(playerPos.x - this.group.position.x, playerPos.z - this.group.position.z);
      this.realYaw = angleToPlayer + Math.PI + jitter;
    } else {
      // LBY Breaker
      this.lbyTimer += delta;
      if (this.lbyTimer > 1.1) {
        this.realYaw += 2.1;
        this.lbyTimer = 0;
      }
    }

    // Desync Fake Angle
    this.fakeYaw = this.realYaw + this.config.desyncOffset;

    // Apply Pitch Down
    if (this.torsoMesh) {
      this.torsoMesh.rotation.x = this.config.pitch;
    }

    this.group.rotation.y = this.realYaw;

    // Update Ghost Mesh (shows bot's fake angle in reddish wireframe)
    this.ghostGroup.position.copy(this.group.position);
    this.ghostGroup.rotation.y = this.fakeYaw;
    this.ghostGroup.visible = true;
  }

  public takeDamage(dmg: number, _isHeadshot: boolean): boolean {
    if (!this.isAlive) return false;
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isAlive = false;
      this.deaths++;
      return true; // was killed
    }
    return false;
  }

  public respawn(pos: THREE.Vector3) {
    this.hp = 100;
    this.armor = 100;
    this.isAlive = true;
    this.group.position.copy(pos);
    this.group.position.y = 0;
    this.group.rotation.set(0, 0, 0);
    if (this.torsoMesh) {
      this.torsoMesh.rotation.set(this.config.pitch, 0, 0);
    }
  }

  public getHeadWorldPos(): THREE.Vector3 {
    const pos = new THREE.Vector3();
    if (this.headMesh) {
      this.headMesh.getWorldPosition(pos);
    } else {
      this.group.getWorldPosition(pos);
      pos.y += 2.5;
    }
    return pos;
  }

  public getChestWorldPos(): THREE.Vector3 {
    const pos = new THREE.Vector3();
    if (this.torsoMesh) {
      this.torsoMesh.getWorldPosition(pos);
    } else {
      this.group.getWorldPosition(pos);
      pos.y += 1.8;
    }
    return pos;
  }
}
