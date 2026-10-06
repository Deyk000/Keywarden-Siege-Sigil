import { Texture } from 'pixi.js';
import type { HeroId } from './types';
import { GameTextures } from './gameAssets';

const HERO_SPRITE_MAPPING: Record<HeroId, { base: string; attackOffset: number }> = {
  archer: { base: 'unitRanger', attackOffset: 0 },
  knight: { base: 'unitPaladin', attackOffset: 0 },
  horseman: { base: 'unitCavalry', attackOffset: 0 },
  mage: { base: 'unitMage', attackOffset: 0 },
  trebuchet: { base: 'unitTrebuchet', attackOffset: 0 },
  pyromancer: { base: 'unitPyromancer', attackOffset: 0 },
  ballista: { base: 'unitBallista', attackOffset: 0 },
  alchemist: { base: 'unitAlchemist', attackOffset: 0 },
  assassin: { base: 'unitAssassin', attackOffset: 0 },
  frostweaver: { base: 'unitFrostweaver', attackOffset: 0 },
  cleric: { base: 'unitCleric', attackOffset: 0 },
  berserker: { base: 'unitBerserker', attackOffset: 0 },
  druid: { base: 'unitDruid', attackOffset: 0 },
  bombardier: { base: 'unitBombardier', attackOffset: 0 },
  necromancer: { base: 'unitNecromancer', attackOffset: 0 }
};

export function getHeroTexture(heroId: HeroId): Texture {
  const map = HERO_SPRITE_MAPPING[heroId] || HERO_SPRITE_MAPPING.archer;
  const tex = GameTextures[map.base];
  if (tex && tex.source) {
    tex.source.scaleMode = 'nearest';
  }
  return tex || Texture.WHITE;
}
