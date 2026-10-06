import type { Container, Graphics, Sprite, Text } from 'pixi.js';

export type HeroId =
  | 'archer' | 'knight' | 'horseman' | 'mage' | 'trebuchet'
  | 'pyromancer' | 'ballista' | 'alchemist' | 'assassin' | 'frostweaver'
  | 'cleric' | 'berserker' | 'druid' | 'bombardier' | 'necromancer';

export type EnemyId = 'grunt' | 'scout' | 'tank' | 'boss';

export interface HeroDef {
  id: HeroId;
  name: string;
  title: string;
  unlocked: boolean;
  level: number;
  baseDamage: number;
  vitalityHp: number;
  armorDefense: number;
  projSpeed: number;
  projRadius: number;
  pedestalColor: number;
  textureKey: string;
  projTextureKey: string;
  abilityName: string;
  description: string;
}

export interface GridHero {
  type: HeroDef;
  tier: number;
  attacksRemainingForAbility: number;
  abilityUses: number;
  isOverheated: boolean;
  overheatCooldown: number;
  aimAngle: number;
  attackProgress: number;
}

export interface Enemy {
  id: number;
  type: EnemyId;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  currentSpeed: number;
  distanceProgress: number;
  waypointIndex: number;
  isBoss: boolean;
  freezeTimer: number;
  hitFlinchTimer: number;
  flinchX: number;
  flinchY: number;
  walkCycleTimer: number;
  container: Container;
  sprite: Sprite;
  hpBar: Graphics;
}

export interface Projectile {
  x: number;
  y: number;
  heroId: HeroId;
  tier: number;
  targetEnemy: Enemy | null;
  targetX: number;
  targetY: number;
  damage: number;
  speed: number;
  color: number;
  rotation: number;
  spinSpeed?: number;
  isCleave?: boolean;
  isSplashFreeze?: boolean;
  sprite: Sprite;
}

export interface LaneHazard {
  id: string;
  type: string;
  x: number;
  y: number;
  radius: number;
  duration: number;
  hp?: number;
  color: number;
  level: number;
  container: Container;
  gfx: Graphics;
}

export interface FloatingText {
  text: Text;
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: number;
  size: number;
  gfx: Graphics;
}

export type TargetMode = 'FIRST' | 'LAST' | 'STRONGEST' | 'WEAKEST';
export type GameState = 'MENU' | 'BATTLE';
export type MenuTab = 'HOME' | 'CARDS' | 'PORTALS';

export interface SaveData {
  unlockedLevel: number;
  sovereignDucats: number;
  antimatter: number;
  equippedDeckIds: HeroId[];
  unlockedHeroIds: HeroId[];
  heroLevels: Record<string, number>;
}
