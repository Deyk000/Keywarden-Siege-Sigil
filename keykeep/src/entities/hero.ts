import { Container, Graphics, Sprite } from 'pixi.js';
import type { GridHero, HeroDef } from '../types';
import { HERO_SIZE } from '../constants';

export function createGridHero(definition: HeroDef, tier = 1): GridHero {
  return {
    type: definition, tier, attacksRemainingForAbility: 8, abilityUses: 0,
    isOverheated: false, overheatCooldown: 0, aimAngle: 0, attackProgress: 0
  };
}

export function drawHeroPedestal(container: Container, color: number): Graphics {
  const pedestal = new Graphics();
  pedestal.roundRect(-HERO_SIZE / 2, -HERO_SIZE / 2, HERO_SIZE, HERO_SIZE, 8).fill({ color, alpha: 0.22 });
  pedestal.roundRect(-HERO_SIZE / 2 + 2, -HERO_SIZE / 2 + 2, HERO_SIZE - 4, HERO_SIZE - 4, 6)
    .stroke({ color, width: 2, alpha: 0.8 });
  container.addChild(pedestal);
  return pedestal;
}

export function orientHeroSprite(sprite: Sprite, direction: number): void {
  sprite.scale.x = Math.abs(sprite.scale.x) * (direction < 0 ? -1 : 1);
}
