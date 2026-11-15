export type WeaponType = 'scar20' | 'ssg08' | 'awp' | 'deagle' | 'g3sg1' | 'dualies';

export interface WeaponData {
  id: WeaponType;
  name: string;
  category: 'primary' | 'secondary' | 'knife';
  price: number;
  damage: number;
  rpm: number; // rounds per minute
  clipSize: number;
  maxAmmo: number;
  armorPenetration: number;
  penetrationPower: number; // wallbang capacity
  spread: number;
  doubleTapEligible: boolean;
  modelColor: string;
  soundType: 'sniper' | 'heavy' | 'awp' | 'pistol';
}

export interface AgentModel {
  id: string;
  name: string;
  team: 'T' | 'CT';
  title: string;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  description: string;
  quote: string;
}

export interface KnifeSkin {
  id: string;
  name: string;
  skin: string;
  bladeColor: string;
  handleColor: string;
}

export interface GloveSkin {
  id: string;
  name: string;
  color1: string;
  color2: string;
}

export type AntiAimPitch = 'pitch_down' | 'pitch_up' | 'jitter' | 'zero';
export type AntiAimYaw = 'backward' | 'spinbot' | 'jitter' | 'lby_breaker' | 'freestanding';
export type DesyncSide = 'left' | 'right' | 'jitter';
export type ChamsMaterial = 'flat' | 'metallic' | 'glow' | 'wireframe' | 'pulsing' | 'glass';
export type HitsoundChoice = 'neverlose' | 'skeet' | 'bell' | 'cod' | 'anime';

export interface CheatConfig {
  // Ragebot
  ragebotEnabled: boolean;
  silentAim: boolean;
  autoFire: boolean;
  hitChance: number; // 0 - 100%
  minDamage: number; // 1 - 100
  targetHitbox: 'head' | 'chest' | 'stomach' | 'multipoint';
  preferBaim: boolean;
  doubleTap: boolean;
  hideShots: boolean;
  autoStop: boolean;
  autoScope: boolean;
  autoWall: boolean;
  resolver: boolean;
  backtrack: boolean; // backtrack 200ms

  // Anti-Aim
  antiAimEnabled: boolean;
  pitch: AntiAimPitch;
  yaw: AntiAimYaw;
  yawSpeed: number; // spin speed
  desync: boolean;
  desyncAngle: number; // max 58
  desyncSide: DesyncSide;
  fakeLagTicks: number; // 1 - 14
  fakeDuck: boolean;
  slowWalk: boolean;
  legMovement: 'slide' | 'jitter' | 'normal';

  // Visuals
  boxEsp: boolean;
  nameEsp: boolean;
  healthEsp: boolean;
  skeletonEsp: boolean;
  chamsEnabled: boolean;
  chamsType: ChamsMaterial;
  chamsColor: string;
  xrayChams: boolean;
  bulletTracers: boolean;
  tracerColor: string;
  bulletImpacts: boolean;
  damageIndicators: boolean;
  thirdperson: boolean;
  thirdpersonDist: number;
  fov: number;
  showGhostModel: boolean;
  indicators: boolean;
  hitsound: HitsoundChoice;
  hitsoundVolume: number;

  // Misc
  autoBhop: boolean;
  autoPeek: boolean;
  autoPeekColor: string;
  clantagSpammer: boolean;
  clantag: string;
  killsay: boolean;
  killsayText: string;
  watermark: boolean;
  keybindsList: boolean;
  radarHack: boolean;

  // Cosmetics
  agentId: string;
  knifeId: string;
  gloveId: string;
  weaponSkin: string;
}

export interface PlayerStats {
  hp: number;
  armor: number;
  helmet: boolean;
  kills: number;
  deaths: number;
  headshots: number;
  score: number;
  money: number;
  ammoInClip: number;
  ammoReserve: number;
  activeWeapon: WeaponType;
  secondaryWeapon: WeaponType;
  isReloading: boolean;
  isCrouching: boolean;
  isScoped: boolean;
  isAutoPeeking: boolean;
  dtCharged: boolean;
  dtRechargeProgress: number; // 0 to 1
  fakeAngle: number;
  realAngle: number;
}

export interface KillfeedEntry {
  id: string;
  killer: string;
  victim: string;
  weapon: WeaponType;
  isHeadshot: boolean;
  isWallbang: boolean;
  isNoScope: boolean;
  isDoubleTap: boolean;
  isLocalPlayerKiller: boolean;
  isLocalPlayerVictim: boolean;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  team: 'T' | 'CT' | 'SPEC';
  text: string;
  isCheatKillsay?: boolean;
}

export interface GameScore {
  ctScore: number;
  tScore: number;
  round: number;
  roundTimer: number;
  isWarmup: boolean;
  matchWinner?: 'CT' | 'T';
}
