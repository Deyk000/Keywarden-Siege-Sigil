import type { GridHero, HeroDef, SaveData, GameState, MenuTab } from '../types';
import { ALL_HEROES } from '../constants';

const SAVE_KEY = 'keykeep_hybrid_save_v5';

const defaultSaveData: SaveData = {
  unlockedLevel: 1,
  sovereignDucats: 900,
  antimatter: 15,
  equippedDeckIds: ['archer', 'knight', 'horseman', 'mage', 'trebuchet'],
  unlockedHeroIds: ['archer', 'knight', 'horseman', 'mage', 'trebuchet'],
  heroLevels: { archer: 1, knight: 1, horseman: 1, mage: 1, trebuchet: 1 }
};

export function loadSaveData(): SaveData {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return structuredClone(defaultSaveData);
  try {
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      ...defaultSaveData,
      ...parsed,
      sovereignDucats: Math.max(0, Number(parsed.sovereignDucats) || 0),
      antimatter: Math.max(0, Number(parsed.antimatter) || 0),
      equippedDeckIds: Array.isArray(parsed.equippedDeckIds) && parsed.equippedDeckIds.length === 5 
        ? parsed.equippedDeckIds 
        : defaultSaveData.equippedDeckIds,
      unlockedHeroIds: Array.isArray(parsed.unlockedHeroIds) 
        ? parsed.unlockedHeroIds 
        : defaultSaveData.unlockedHeroIds,
      heroLevels: parsed.heroLevels && typeof parsed.heroLevels === 'object' 
        ? parsed.heroLevels 
        : defaultSaveData.heroLevels
    };
  } catch (error) {
    console.warn('[KeyKeep] Could not read save data; using defaults.', error);
    return structuredClone(defaultSaveData);
  }
}

export function writeSaveData(data: SaveData): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export const state = {
  saveData: loadSaveData(),
  currentCampaignLevel: 1,
  gameState: 'MENU' as GameState,
  currentMenuTab: 'HOME' as MenuTab,
  currentTargetModeIndex: 0,
  mana: 160,
  summonCost: 40,
  castleHp: 100,
  isGameOver: false,
  isVictory: false,
  currentWave: 1,
  maxWavesForLevel: 4,
  waveEnemiesSpawned: 0,
  waveEnemiesTotal: 10,
  waveSpawnInterval: 1.5,
  spawnTimer: 0,
  bossSpawnedThisWave: false,
  waveIntermissionTimer: 0,
  grid: new Array<GridHero | null>(15).fill(null),
  screenShakeTimer: 0,
  screenShakeMagnitude: 0
};

export function getEquippedHeroDeck(): HeroDef[] {
  return state.saveData.equippedDeckIds.map(id => {
    const def = ALL_HEROES.find(h => h.id === id);
    return def ? { ...def, level: state.saveData.heroLevels[id] || 1 } : ALL_HEROES[0];
  });
}