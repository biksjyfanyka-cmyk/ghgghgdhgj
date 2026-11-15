import * as THREE from 'three';
import { CSGOMap } from './CSGOMap';
import { HvHPlayer } from './HvHPlayer';
import { HvHBot, BotConfig } from './HvHBot';
import { CheatConfig, WeaponType, PlayerStats, KillfeedEntry, ChatMessage, GameScore } from '../types/hvh';
import { WEAPONS, BOT_NAMES, HVH_KILLSAYS } from '../utils/constants';
import { soundManager } from '../audio/SoundManager';

export interface FloatingDamage {
  text: string;
  color: string;
  position: THREE.Vector3;
  life: number;
  maxLife: number;
}

export interface BulletTracer {
  mesh: THREE.Line;
  birth: number;
  maxAge: number;
}

export interface ResolverLog {
  target: string;
  angle: number;
  result: 'HIT [RESOLVED]' | 'MISS [RESOLVER]' | 'MISS [SPREAD]' | 'HIT [BAIM]';
  time: number;
}

export class HvHGameEngine {
  public canvas: HTMLCanvasElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public map: CSGOMap;
  public player: HvHPlayer;
  public bots: HvHBot[] = [];

  // Config & State
  public config: CheatConfig;
  public stats: PlayerStats;
  public score: GameScore = {
    ctScore: 0,
    tScore: 0,
    round: 1,
    roundTimer: 90,
    isWarmup: false,
  };
  public gameMode: 'duel' | 'dm' | 'bot_test' = 'duel';

  // Camera & Controls
  public isThirdperson = true;
  public yaw = 0;
  public pitch = 0;
  public isPointerLocked = false;
  private keys: Record<string, boolean> = {};

  // FX & Visuals
  public floatingDamages: FloatingDamage[] = [];
  public tracers: BulletTracer[] = [];
  public resolverLogs: ResolverLog[] = [];
  public activeTargetName: string | null = null;
  public isFiring = false;
  public lastPlayerShotTime = 0;
  public dtRechargeTimer = 0;
  public dtReady = true;

  // Callbacks for React HUD updates
  public onStatsUpdate?: (stats: PlayerStats) => void;
  public onScoreUpdate?: (score: GameScore) => void;
  public onKillfeed?: (kill: KillfeedEntry) => void;
  public onChat?: (chat: ChatMessage) => void;
  public onHitmarker?: (isHeadshot: boolean, dmg: number) => void;

  private clock = new THREE.Clock();
  private animFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement, initialConfig: CheatConfig) {
    this.canvas = canvas;
    this.config = { ...initialConfig };

    // Initial stats
    this.stats = {
      hp: 100,
      armor: 100,
      helmet: true,
      kills: 0,
      deaths: 0,
      headshots: 0,
      score: 0,
      money: 16000,
      ammoInClip: WEAPONS.scar20.clipSize,
      ammoReserve: WEAPONS.scar20.maxAmmo,
      activeWeapon: 'scar20',
      secondaryWeapon: 'deagle',
      isReloading: false,
      isCrouching: false,
      isScoped: false,
      isAutoPeeking: false,
      dtCharged: true,
      dtRechargeProgress: 1,
      fakeAngle: 0,
      realAngle: 0,
    };

    // 1. Setup Three.js Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.012);

    // 2. Camera
    const aspect = canvas.clientWidth / canvas.clientHeight || 16 / 9;
    this.camera = new THREE.PerspectiveCamera(this.config.fov, aspect, 0.1, 300);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Map & Player
    this.map = new CSGOMap(this.scene);
    this.player = new HvHPlayer(this.scene, this.config.agentId);
    this.player.position.set(0, 0, 36);

    // 5. Spawn initial Bots
    this.initBots();

    // 6. Setup Event Listeners
    this.setupControls();

    // 7. Start Loop
    this.animate();
  }

  private initBots() {
    // Clear old bots
    this.bots.forEach((b) => {
      this.scene.remove(b.group);
      this.scene.remove(b.ghostGroup);
    });
    this.bots = [];

    const botProfiles: BotConfig[] = [
      {
        name: BOT_NAMES[0],
        agentId: 'number_k',
        weapon: 'scar20',
        yawType: 'spinbot',
        spinSpeed: 14,
        desyncOffset: 0.9,
        pitch: -1.45,
        reactionTime: 0.22,
        hitChance: 80,
      },
      {
        name: BOT_NAMES[1],
        agentId: 'ava',
        weapon: 'ssg08',
        yawType: 'jitter',
        spinSpeed: 10,
        desyncOffset: -1.0,
        pitch: -1.45,
        reactionTime: 0.18,
        hitChance: 90,
      },
      {
        name: BOT_NAMES[2],
        agentId: 'romanov',
        weapon: 'awp',
        yawType: 'lby',
        spinSpeed: 8,
        desyncOffset: 1.05,
        pitch: -1.45,
        reactionTime: 0.25,
        hitChance: 85,
      },
    ];

    const botWaypoints = [
      [new THREE.Vector3(0, 0, -32), new THREE.Vector3(-14, 0, -18), new THREE.Vector3(0, 0, -6), new THREE.Vector3(14, 0, -18)],
      [new THREE.Vector3(-24, 0, -20), new THREE.Vector3(-26, 0, 0), new THREE.Vector3(-24, 0, 16), new THREE.Vector3(-12, 0, 0)],
      [new THREE.Vector3(26, 0, -20), new THREE.Vector3(28, 0, 0), new THREE.Vector3(26, 0, 20), new THREE.Vector3(12, 0, 4)],
    ];

    botProfiles.forEach((prof, idx) => {
      const spawnPos = this.map.spawnPointsCT[idx] || new THREE.Vector3(0, 0, -36);
      const bot = new HvHBot(this.scene, prof, spawnPos, botWaypoints[idx] || []);
      this.bots.push(bot);
    });
  }

  private setupControls() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('resize', this.handleResize);
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('resize', this.handleResize);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // If target is typing in an input, ignore
    if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

    this.keys[e.code] = true;

    // Toggle Thirdperson (V)
    if (e.code === 'KeyV') {
      this.isThirdperson = !this.isThirdperson;
      this.config.thirdperson = this.isThirdperson;
    }

    // Toggle Auto-Peek (C)
    if (e.code === 'KeyC') {
      if (!this.player.isAutoPeeking) {
        this.player.setAutoPeekStart(this.player.position);
        this.stats.isAutoPeeking = true;
        soundManager.playClick();
      } else {
        this.player.disableAutoPeek();
        this.stats.isAutoPeeking = false;
      }
    }

    // Manual Double Tap fire or test
    if (e.code === 'Space' && this.config.autoBhop) {
      soundManager.playBhopTick();
    }

    // Reload (R)
    if (e.code === 'KeyR' && !this.stats.isReloading) {
      this.reloadWeapon();
    }

    // Switch weapons (1, 2, 3)
    if (e.code === 'Digit1') this.switchWeapon(this.stats.activeWeapon);
    if (e.code === 'Digit2') this.switchWeapon(this.stats.secondaryWeapon);
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      this.requestPointerLock();
      this.manualFire();
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (document.pointerLockElement === this.canvas || this.isPointerLocked) {
      const sens = 0.0022;
      this.yaw -= e.movementX * sens;
      this.pitch -= e.movementY * sens;
      this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));
    }
  };

  private handleResize = () => {
    if (!this.canvas) return;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public requestPointerLock() {
    if (document.pointerLockElement !== this.canvas) {
      this.canvas.requestPointerLock?.();
      this.isPointerLocked = true;
    }
  }

  public updateConfig(newConfig: CheatConfig) {
    this.config = { ...newConfig };
    this.camera.fov = this.config.fov;
    this.camera.updateProjectionMatrix();
    this.isThirdperson = this.config.thirdperson;
    if (this.player.currentAgentId !== this.config.agentId) {
      this.player.currentAgentId = this.config.agentId;
    }
  }

  public switchWeapon(type: WeaponType) {
    this.stats.activeWeapon = type;
    this.player.currentWeapon = type;
    const w = WEAPONS[type];
    this.stats.ammoInClip = w.clipSize;
    this.stats.ammoReserve = w.maxAmmo;
    soundManager.playReload();
    this.onStatsUpdate?.(this.stats);
  }

  public reloadWeapon() {
    const w = WEAPONS[this.stats.activeWeapon];
    if (this.stats.ammoInClip >= w.clipSize || this.stats.ammoReserve <= 0) return;
    this.stats.isReloading = true;
    soundManager.playReload();
    this.onStatsUpdate?.(this.stats);

    setTimeout(() => {
      const needed = w.clipSize - this.stats.ammoInClip;
      const take = Math.min(needed, this.stats.ammoReserve);
      this.stats.ammoInClip += take;
      this.stats.ammoReserve -= take;
      this.stats.isReloading = false;
      this.onStatsUpdate?.(this.stats);
    }, 1800);
  }

  // Double-Tap and Auto-Fire Engine
  private manualFire() {
    if (!this.player.isAlive || this.stats.isReloading || this.stats.ammoInClip <= 0) return;
    this.executeShot(null);
  }

  private executeShot(targetBot: HvHBot | null) {
    const now = performance.now();
    const weapon = WEAPONS[this.stats.activeWeapon];
    const shotInterval = (60 / weapon.rpm) * 1000;

    if (now - this.lastPlayerShotTime < shotInterval) return;

    this.lastPlayerShotTime = now;
    this.stats.ammoInClip--;

    const isDoubleTapTriggered = this.config.doubleTap && weapon.doubleTapEligible && this.dtReady && this.stats.ammoInClip >= 1;

    // Play synthesized weapon shot
    soundManager.playShot(weapon.soundType, isDoubleTapTriggered);

    // If Auto-Peek is active, schedule quick return
    if (this.player.isAutoPeeking) {
      setTimeout(() => {
        const returned = this.player.triggerAutoPeekReturn();
        if (returned) {
          soundManager.playPeekReturn();
        }
      }, 90);
    }

    // Double tap consumption
    if (isDoubleTapTriggered) {
      this.stats.ammoInClip--;
      this.dtReady = false;
      this.dtRechargeTimer = 1.3; // 1.3s recharge
      this.stats.dtCharged = false;
    }

    // Handle Raycast & Damage
    if (targetBot && targetBot.isAlive) {
      this.resolveAndDamageBot(targetBot, isDoubleTapTriggered);
    } else {
      // Fire forward along crosshair
      this.fireRayForward(isDoubleTapTriggered);
    }

    this.onStatsUpdate?.(this.stats);
  }

  private fireRayForward(_isDT: boolean) {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    const origin = this.player.position.clone().add(new THREE.Vector3(0, 1.8, 0));
    const end = origin.clone().addScaledVector(dir, 100);

    // Bullet tracer
    if (this.config.bulletTracers) {
      this.addTracer(origin, end, this.config.tracerColor);
    }
  }

  private resolveAndDamageBot(bot: HvHBot, isDT: boolean) {
    const origin = this.player.position.clone().add(new THREE.Vector3(0, 1.8, 0));
    const weapon = WEAPONS[this.stats.activeWeapon];

    // Hitchance check
    const roll = Math.random() * 100;
    if (roll > this.config.hitChance) {
      // Missed due to spread!
      this.resolverLogs.unshift({
        target: bot.config.name,
        angle: Math.round(bot.realYaw * (180 / Math.PI)),
        result: 'MISS [SPREAD]',
        time: Date.now(),
      });
      const stray = bot.getChestWorldPos().add(new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2));
      this.addTracer(origin, stray, this.config.tracerColor);
      return;
    }

    // Resolver calculation
    let isHeadshot = false;
    let targetPos: THREE.Vector3;

    if (this.config.preferBaim || this.config.targetHitbox === 'chest' || this.config.targetHitbox === 'stomach') {
      targetPos = bot.getChestWorldPos();
      isHeadshot = false;
    } else {
      // Attempt headshot!
      if (this.config.resolver) {
        // High quality resolver correctly predicts real angle
        targetPos = bot.getHeadWorldPos();
        isHeadshot = true;
        this.resolverLogs.unshift({
          target: bot.config.name,
          angle: Math.round(bot.realYaw * (180 / Math.PI)),
          result: 'HIT [RESOLVED]',
          time: Date.now(),
        });
      } else {
        // Failed resolver hits fake desync ghost or misses
        if (Math.random() > 0.4) {
          targetPos = bot.getChestWorldPos();
          isHeadshot = false;
          this.resolverLogs.unshift({
            target: bot.config.name,
            angle: Math.round(bot.fakeYaw * (180 / Math.PI)),
            result: 'HIT [BAIM]',
            time: Date.now(),
          });
        } else {
          this.resolverLogs.unshift({
            target: bot.config.name,
            angle: Math.round(bot.fakeYaw * (180 / Math.PI)),
            result: 'MISS [RESOLVER]',
            time: Date.now(),
          });
          const stray = bot.getHeadWorldPos().add(new THREE.Vector3(1.2, 0, 0));
          this.addTracer(origin, stray, '#ff0055');
          return;
        }
      }
    }

    // Calculate Damage
    let dmg = weapon.damage;
    if (isHeadshot) {
      dmg *= 3.8;
    }
    if (isDT) {
      dmg *= 1.85; // Double Tap total damage
    }
    // Random float damage variance
    dmg = Math.round(dmg * (0.92 + Math.random() * 0.16));

    // Check Auto-wall through crates
    const ray = new THREE.Raycaster(origin, new THREE.Vector3().subVectors(targetPos, origin).normalize());
    const meshes = this.map.obstacles.map((o) => o.mesh);
    const hits = ray.intersectObjects(meshes);
    let isWallbang = false;

    if (hits.length > 0 && hits[0].distance < origin.distanceTo(targetPos)) {
      isWallbang = true;
      dmg = Math.round(dmg * 0.7); // wall penetration loss
    }

    // Apply tracer
    if (this.config.bulletTracers) {
      this.addTracer(origin, targetPos, this.config.tracerColor);
    }

    // Sound and Hitmarker
    soundManager.playHitmarker(this.config.hitsound, this.config.hitsoundVolume);
    if (isHeadshot) {
      soundManager.playHeadshot();
    }
    this.onHitmarker?.(isHeadshot, dmg);

    // Damage floating indicator
    if (this.config.damageIndicators) {
      this.floatingDamages.push({
        text: `-${dmg} HP ${isHeadshot ? '[HEAD]' : '[BODY]'}`,
        color: isHeadshot ? '#ef4444' : '#00f0ff',
        position: targetPos.clone().add(new THREE.Vector3(0, 0.5, 0)),
        life: 0,
        maxLife: 1.2,
      });
    }

    // Apply to Bot
    const killed = bot.takeDamage(dmg, isHeadshot);
    if (killed) {
      this.stats.kills++;
      if (isHeadshot) this.stats.headshots++;
      this.stats.score += isHeadshot ? 100 : 75;
      this.stats.money = Math.min(16000, this.stats.money + 600);
      soundManager.playKillSound();

      // Broadcast Killfeed
      this.onKillfeed?.({
        id: Math.random().toString(),
        killer: 'NeverLose User',
        victim: bot.config.name,
        weapon: this.stats.activeWeapon,
        isHeadshot,
        isWallbang,
        isNoScope: true,
        isDoubleTap: isDT,
        isLocalPlayerKiller: true,
        isLocalPlayerVictim: false,
        timestamp: Date.now(),
      });

      // Send Killsay to chat
      if (this.config.killsay) {
        const killsay = this.config.killsayText || HVH_KILLSAYS[Math.floor(Math.random() * HVH_KILLSAYS.length)];
        this.onChat?.({
          id: Math.random().toString(),
          sender: 'NeverLose User',
          team: 'T',
          text: killsay,
          isCheatKillsay: true,
        });
      }

      // Check Round win condition in duel
      this.checkDuelRoundStatus();
    }
  }

  private checkDuelRoundStatus() {
    const aliveBots = this.bots.filter((b) => b.isAlive).length;
    if (aliveBots === 0) {
      this.score.tScore++;
      this.onScoreUpdate?.(this.score);
      // Restart round after 2.5s
      setTimeout(() => {
        this.restartRound();
      }, 2500);
    }
  }

  public restartRound() {
    this.score.round++;
    this.score.roundTimer = 90;
    this.onScoreUpdate?.(this.score);

    // Reset player
    this.player.position.set(0, 0, 36);
    this.player.isAlive = true;
    this.stats.hp = 100;
    this.stats.armor = 100;
    this.stats.ammoInClip = WEAPONS[this.stats.activeWeapon].clipSize;

    // Reset bots
    this.bots.forEach((b, idx) => {
      const spawn = this.map.spawnPointsCT[idx] || new THREE.Vector3(0, 0, -36);
      b.respawn(spawn);
    });

    this.onStatsUpdate?.(this.stats);
  }

  private addTracer(start: THREE.Vector3, end: THREE.Vector3, colorHex: string) {
    const points = [start, end];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: parseInt(colorHex.replace('#', '0x'), 16) || 0x00f0ff,
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
    });
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.tracers.push({
      mesh: line,
      birth: performance.now(),
      maxAge: 400, // 400ms visible
    });
  }

  // Main Game Loop
  private animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Double tap recharge update
    if (!this.dtReady) {
      this.dtRechargeTimer -= delta;
      this.stats.dtRechargeProgress = Math.max(0, 1 - this.dtRechargeTimer / 1.3);
      if (this.dtRechargeTimer <= 0) {
        this.dtReady = true;
        this.stats.dtCharged = true;
        this.stats.dtRechargeProgress = 1;
      }
      this.onStatsUpdate?.(this.stats);
    }

    // 2. Handle Player Movement (WASD + Jump + Crouch)
    this.handlePlayerMovement(delta);

    // 3. Update Anti-Aim
    this.player.updateAntiAim(this.config, delta, this.yaw);
    this.stats.fakeAngle = Math.round(this.player.fakeYaw * (180 / Math.PI));
    this.stats.realAngle = Math.round(this.player.realYaw * (180 / Math.PI));

    // 4. Update Bots
    this.updateBots(delta, now);

    // 5. Ragebot Auto-Fire Loop
    if (this.config.ragebotEnabled && this.config.autoFire && this.player.isAlive) {
      this.runRagebotCheck(now);
    }

    // 6. Tracers decay
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      const age = now - t.birth;
      if (age > t.maxAge) {
        this.scene.remove(t.mesh);
        this.tracers.splice(i, 1);
      } else {
        (t.mesh.material as THREE.LineBasicMaterial).opacity = 1 - age / t.maxAge;
      }
    }

    // 7. Floating damage indicators update
    for (let i = this.floatingDamages.length - 1; i >= 0; i--) {
      const fd = this.floatingDamages[i];
      fd.life += delta;
      fd.position.y += delta * 1.5;
      if (fd.life >= fd.maxLife) {
        this.floatingDamages.splice(i, 1);
      }
    }

    // 8. Update Camera Position & Rotation
    this.updateCamera();

    // 9. Render Scene
    this.renderer.render(this.scene, this.camera);
  };

  private handlePlayerMovement(delta: number) {
    if (!this.player.isAlive) return;

    let moveX = 0;
    let moveZ = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    // Crouch / Fake Duck
    this.player.isCrouched = this.keys['ControlLeft'] || this.keys['ControlRight'] || this.config.fakeDuck;
    this.stats.isCrouching = this.player.isCrouched;

    let speed = this.player.isCrouched ? 5.0 : this.config.slowWalk ? 4.5 : 10.5;

    if (moveX !== 0 || moveZ !== 0) {
      const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

      const dir = forward.multiplyScalar(moveZ).add(right.multiplyScalar(moveX)).normalize();
      this.player.position.addScaledVector(dir, speed * delta);

      // Map bounds clamp
      this.player.position.x = Math.max(this.map.mapBounds.minX + 2, Math.min(this.map.mapBounds.maxX - 2, this.player.position.x));
      this.player.position.z = Math.max(this.map.mapBounds.minZ + 2, Math.min(this.map.mapBounds.maxZ - 2, this.player.position.z));
    }

    // Update player group position
    this.player.group.position.copy(this.player.position);
  }

  private updateBots(delta: number, now: number) {
    this.bots.forEach((bot) => {
      bot.update(delta, this.player.position, now);

      if (bot.isAlive && this.player.isAlive) {
        // Bot auto-wall/shoot check
        if (now > bot.nextShotTime) {
          const dist = bot.group.position.distanceTo(this.player.position);
          if (dist < 55) {
            this.botAttemptShotAtPlayer(bot, now);
          }
        }
      }
    });
  }

  private botAttemptShotAtPlayer(bot: HvHBot, now: number) {
    bot.nextShotTime = now + (bot.config.reactionTime * 1000 + Math.random() * 800);

    const botOrigin = bot.getChestWorldPos();
    const playerTarget = this.player.getHitboxWorldPos('chest');

    // Bot hitchance check
    const roll = Math.random() * 100;
    if (roll > bot.config.hitChance) return; // bot missed spread

    // Anti-Aim resolver test on player!
    // If player has pitch down, bot is forced to shoot chest/stomach
    let isHeadshot = false;
    let target = playerTarget;

    // Desync dodge chance! If player has desync on, 70% chance bot shoots fake ghost angle and misses
    if (this.config.antiAimEnabled && this.config.desync && Math.random() < 0.65) {
      // Bot shoots at player's ghost desync model!
      target = this.player.ghostGroup.position.clone().add(new THREE.Vector3(0, 1.8, 0));
      this.addTracer(botOrigin, target, '#ff2255');
      return; // missed due to desync!
    }

    // Hit the player!
    const weapon = WEAPONS[bot.config.weapon];
    const dmg = Math.round(weapon.damage * (0.8 + Math.random() * 0.3));

    this.addTracer(botOrigin, target, '#ff4444');
    soundManager.playShot(weapon.soundType, false);

    this.stats.hp -= dmg;
    this.stats.armor = Math.max(0, this.stats.armor - Math.round(dmg * 0.3));

    if (this.stats.hp <= 0) {
      this.stats.hp = 0;
      this.player.isAlive = false;
      this.stats.deaths++;
      this.score.ctScore++;
      this.onScoreUpdate?.(this.score);

      // Killfeed
      this.onKillfeed?.({
        id: Math.random().toString(),
        killer: bot.config.name,
        victim: 'NeverLose User',
        weapon: bot.config.weapon,
        isHeadshot,
        isWallbang: false,
        isNoScope: true,
        isDoubleTap: false,
        isLocalPlayerKiller: false,
        isLocalPlayerVictim: true,
        timestamp: Date.now(),
      });

      // Restart round after 2.5s
      setTimeout(() => {
        this.restartRound();
      }, 2500);
    }

    this.onStatsUpdate?.(this.stats);
  }

  private runRagebotCheck(_now: number) {
    if (this.stats.ammoInClip <= 0 || this.stats.isReloading) return;

    // Find best target bot
    let bestBot: HvHBot | null = null;
    let closestDist = 999;

    for (const bot of this.bots) {
      if (!bot.isAlive) continue;
      const dist = this.player.position.distanceTo(bot.group.position);
      if (dist < closestDist) {
        closestDist = dist;
        bestBot = bot;
      }
    }

    if (bestBot && closestDist < 75) {
      this.activeTargetName = bestBot.config.name;

      // Auto-Scope sniper if needed
      if (this.config.autoScope && !this.stats.isScoped) {
        this.stats.isScoped = true;
      }

      // Silent aim angle calculation
      if (!this.config.silentAim) {
        // snaps camera
        const dir = new THREE.Vector3().subVectors(bestBot.getChestWorldPos(), this.player.position);
        this.yaw = Math.atan2(-dir.x, -dir.z);
      }

      this.executeShot(bestBot);
    } else {
      this.activeTargetName = null;
      if (this.stats.isScoped) {
        this.stats.isScoped = false;
      }
    }
  }

  private updateCamera() {
    const eyeY = this.player.isCrouched ? 1.4 : 2.2;
    const playerHead = this.player.position.clone().add(new THREE.Vector3(0, eyeY, 0));

    if (this.isThirdperson) {
      // Thirdperson: Camera placed behind player looking over the shoulder
      const dist = (this.config.thirdpersonDist || 150) / 45; // ~3.3 units
      const camOffset = new THREE.Vector3(
        Math.sin(this.yaw) * Math.cos(this.pitch) * dist,
        -Math.sin(this.pitch) * dist + 0.6,
        Math.cos(this.yaw) * Math.cos(this.pitch) * dist
      );

      this.camera.position.copy(playerHead).add(camOffset);
      this.camera.lookAt(playerHead);
    } else {
      // Firstperson: Camera placed directly inside player head
      this.camera.position.copy(playerHead);
      const lookDir = new THREE.Vector3(
        -Math.sin(this.yaw) * Math.cos(this.pitch),
        Math.sin(this.pitch),
        -Math.cos(this.yaw) * Math.cos(this.pitch)
      );
      this.camera.lookAt(playerHead.clone().add(lookDir));
    }
  }
}
