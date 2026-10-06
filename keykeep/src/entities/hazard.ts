import type { LaneHazard } from '../types';

export function tickHazard(hazard: LaneHazard, deltaSeconds: number): boolean {
  hazard.duration -= deltaSeconds;
  return hazard.duration > 0;
}

export function hazardDamage(hazard: LaneHazard, baseDamage: number): number {
  return Math.max(1, Math.round(baseDamage * hazard.level));
}
