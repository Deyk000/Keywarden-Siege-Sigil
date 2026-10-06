import type { HeroDef, TargetMode } from './types';

export const VIRTUAL_WIDTH = 960;
export const VIRTUAL_HEIGHT = 640;
export const HERO_SIZE = 68;
export const TOTAL_CAMPAIGN_LEVELS = 20;
export const KEY_MAP: Record<string, number> = {
  KeyE: 0, KeyR: 1, KeyT: 2, KeyY: 3, KeyU: 4, KeyD: 5, KeyF: 6, KeyG: 7, KeyH: 8, KeyJ: 9,
  KeyC: 10, KeyV: 11, KeyB: 12, KeyN: 13, KeyM: 14,
  e: 0, E: 0, r: 1, R: 1, t: 2, T: 2, y: 3, Y: 3, u: 4, U: 4, d: 5, D: 5,
  f: 6, F: 6, g: 7, G: 7, h: 8, H: 8, j: 9, J: 9, c: 10, C: 10, v: 11, V: 11,
  b: 12, B: 12, n: 13, N: 13, m: 14, M: 14
};
export const KEY_LABELS = ['E', 'R', 'T', 'Y', 'U', 'D', 'F', 'G', 'H', 'J', 'C', 'V', 'B', 'N', 'M'];
export const UPGRADE_COSTS: Record<number, number> = { 1: 150, 2: 300, 3: 600, 4: 1200 };
export const TARGET_MODES: TargetMode[] = ['FIRST', 'LAST', 'STRONGEST', 'WEAKEST'];
export const WAYPOINTS = [
  { x: 175, y: 485 }, { x: 175, y: 100 }, { x: 785, y: 100 }, { x: 785, y: 470 }
];

export const ALL_HEROES: HeroDef[] = [
  { id: 'archer', name: 'Ranger', title: 'Marksman', unlocked: true, level: 1, baseDamage: 14, vitalityHp: 180, armorDefense: 10, projSpeed: 18, projRadius: 8, pedestalColor: 0x22c55e, textureKey: 'unitRanger', projTextureKey: 'projArrow', abilityName: 'Iron Caltrops', description: 'Deploys sharp steel caltrops that slow the lane.' },
  { id: 'knight', name: 'Paladin', title: 'High Templar', unlocked: true, level: 1, baseDamage: 26, vitalityHp: 420, armorDefense: 28, projSpeed: 14, projRadius: 10, pedestalColor: 0xef4444, textureKey: 'unitPaladin', projTextureKey: 'projBoulder', abilityName: 'Stone Barricade', description: 'Fortifies stone walls that halt creep advance.' },
  { id: 'horseman', name: 'Cavalry', title: 'Vanguard', unlocked: true, level: 1, baseDamage: 20, vitalityHp: 290, armorDefense: 18, projSpeed: 13, projRadius: 8, pedestalColor: 0xf59e0b, textureKey: 'unitCavalry', projTextureKey: 'projArrow', abilityName: 'Greek Fire', description: 'Ignites burning ground dealing damage over time.' },
  { id: 'mage', name: 'Arcanist', title: 'Theurgist', unlocked: true, level: 1, baseDamage: 18, vitalityHp: 160, armorDefense: 8, projSpeed: 10, projRadius: 10, pedestalColor: 0x3b82f6, textureKey: 'unitMage', projTextureKey: 'projMagic', abilityName: 'Runic Stasis', description: 'Freezes approaching monsters solid in place.' },
  { id: 'trebuchet', name: 'Trebuchet', title: 'Siege Arm', unlocked: true, level: 1, baseDamage: 42, vitalityHp: 350, armorDefense: 22, projSpeed: 5.5, projRadius: 14, pedestalColor: 0xa855f7, textureKey: 'unitTrebuchet', projTextureKey: 'projBoulder', abilityName: 'Molten Bomb', description: 'Launches a shattered boulder for huge area burst.' },
  { id: 'pyromancer', name: 'Pyromancer', title: 'Flame Weaver', unlocked: false, level: 1, baseDamage: 24, vitalityHp: 170, armorDefense: 10, projSpeed: 11, projRadius: 9, pedestalColor: 0xf97316, textureKey: 'unitPyromancer', projTextureKey: 'projMagic', abilityName: 'Lava Puddle', description: 'Scorches the lane with boiling magma.' },
  { id: 'ballista', name: 'Ballista', title: 'Siege Sentry', unlocked: false, level: 1, baseDamage: 32, vitalityHp: 260, armorDefense: 16, projSpeed: 20, projRadius: 8, pedestalColor: 0xd97706, textureKey: 'unitBallista', projTextureKey: 'projArrow', abilityName: 'Piercing Bolt', description: 'Fires heavy harpoons that pierce multiple enemies.' },
  { id: 'alchemist', name: 'Alchemist', title: 'Plague Doctor', unlocked: false, level: 1, baseDamage: 16, vitalityHp: 190, armorDefense: 12, projSpeed: 10, projRadius: 8, pedestalColor: 0x10b981, textureKey: 'unitAlchemist', projTextureKey: 'projMagic', abilityName: 'Corrosive Acid', description: 'Shatters acid flasks that strip enemy armor.' },
  { id: 'assassin', name: 'Assassin', title: 'Shadow Stalker', unlocked: false, level: 1, baseDamage: 28, vitalityHp: 180, armorDefense: 10, projSpeed: 22, projRadius: 6, pedestalColor: 0x64748b, textureKey: 'unitAssassin', projTextureKey: 'projArrow', abilityName: 'Shadow Flurry', description: 'Throws poisoned daggers with critical strike.' },
  { id: 'frostweaver', name: 'Frostweaver', title: 'Ice Sovereign', unlocked: false, level: 1, baseDamage: 19, vitalityHp: 190, armorDefense: 12, projSpeed: 12, projRadius: 9, pedestalColor: 0x06b6d4, textureKey: 'unitFrostweaver', projTextureKey: 'projMagic', abilityName: 'Blizzard Hail', description: 'Summons falling icicles that perpetually chill.' },
  { id: 'cleric', name: 'High Cleric', title: 'Sun Prelate', unlocked: false, level: 1, baseDamage: 17, vitalityHp: 320, armorDefense: 24, projSpeed: 13, projRadius: 9, pedestalColor: 0xfacc15, textureKey: 'unitCleric', projTextureKey: 'projMagic', abilityName: 'Holy Beacon', description: 'Pillars of divine light that smite creeps.' },
  { id: 'berserker', name: 'Berserker', title: 'War Chieftain', unlocked: false, level: 1, baseDamage: 30, vitalityHp: 380, armorDefense: 20, projSpeed: 12, projRadius: 8, pedestalColor: 0x78350f, textureKey: 'unitBerserker', projTextureKey: 'projBoulder', abilityName: 'Blood Frenzy', description: 'Hurls spinning dual axes that shred armor.' },
  { id: 'druid', name: 'Forest Druid', title: 'Keeper of Oaks', unlocked: false, level: 1, baseDamage: 18, vitalityHp: 240, armorDefense: 14, projSpeed: 10, projRadius: 8, pedestalColor: 0x166534, textureKey: 'unitDruid', projTextureKey: 'projMagic', abilityName: 'Bramble Roots', description: 'Grows creeping thorn vines that entangle units.' },
  { id: 'bombardier', name: 'Bombardier', title: 'Dwarf Mortar', unlocked: false, level: 1, baseDamage: 38, vitalityHp: 340, armorDefense: 22, projSpeed: 7.0, projRadius: 12, pedestalColor: 0x52525b, textureKey: 'unitBombardier', projTextureKey: 'projBoulder', abilityName: 'Shrapnel Blast', description: 'Detonates black-powder charges with wide scatter.' },
  { id: 'necromancer', name: 'Necromancer', title: 'Lich of Despair', unlocked: false, level: 1, baseDamage: 22, vitalityHp: 210, armorDefense: 14, projSpeed: 8.5, projRadius: 10, pedestalColor: 0x7e22ce, textureKey: 'unitNecromancer', projTextureKey: 'projMagic', abilityName: 'Soul Curse', description: 'Curse creeps to take 40% increased damage.' }
];
