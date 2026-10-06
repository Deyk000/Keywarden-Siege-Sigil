import type { Enemy, Projectile } from '../types';

export function moveProjectile(projectile: Projectile, deltaSeconds: number): void {
  const target = projectile.targetEnemy;
  const targetX = target?.x ?? projectile.targetX;
  const targetY = target?.y ?? projectile.targetY;
  const distance = Math.hypot(targetX - projectile.x, targetY - projectile.y);
  if (distance === 0) return;
  projectile.x += (targetX - projectile.x) / distance * projectile.speed * deltaSeconds * 60;
  projectile.y += (targetY - projectile.y) / distance * projectile.speed * deltaSeconds * 60;
  projectile.rotation = Math.atan2(targetY - projectile.y, targetX - projectile.x);
}

export function projectileHitsEnemy(projectile: Projectile, enemy: Enemy, radius: number): boolean {
  return Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y) <= radius;
}
