import type { Enemy } from '../types';
import { WAYPOINTS } from '../constants';

export function advanceEnemyAlongWaypoints(enemy: Enemy, distance: number): void {
  let remaining = distance;
  while (remaining > 0 && enemy.waypointIndex < WAYPOINTS.length) {
    const waypoint = WAYPOINTS[enemy.waypointIndex];
    const dx = waypoint.x - enemy.x;
    const dy = waypoint.y - enemy.y;
    const length = Math.hypot(dx, dy);
    if (length <= remaining) {
      enemy.x = waypoint.x; enemy.y = waypoint.y; enemy.distanceProgress += length;
      enemy.waypointIndex++; remaining -= length;
    } else {
      enemy.x += dx / length * remaining; enemy.y += dy / length * remaining;
      enemy.distanceProgress += remaining; remaining = 0;
    }
  }
}

export function applyEnemyFlinch(enemy: Enemy, x: number, y: number, duration = 0.08): void {
  enemy.flinchX = x; enemy.flinchY = y; enemy.hitFlinchTimer = duration;
}
