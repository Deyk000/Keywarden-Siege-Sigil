import { KEY_MAP } from '../constants';
import { state } from '../state/gameState';

export interface InputHandlers {
  onHeroAttack: (index: number) => void;
  onCycleTargetMode: () => void;
  onSummonHero: () => void;
  onUpgradeHeroCard: (deckIndex: number) => void;
  onStartMatch: () => void;
}

export function installInputSystem(handlers: InputHandlers): () => void {
  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.repeat) return;

    if (state.gameState !== 'BATTLE') {
      if (e.code === 'Space' || e.code === 'Enter' || e.key === ' ' || e.key === 'Enter') {
        handlers.onStartMatch();
      }
      return;
    }

    if (e.code === 'Tab' || e.key === 'Tab') {
      e.preventDefault();
      handlers.onCycleTargetMode();
      return;
    }

    const numMap: Record<string, number> = {
      Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4,
      '1': 0, '2': 1, '3': 2, '4': 3, '5': 4
    };
    const numIdx = numMap[e.code] ?? numMap[e.key];
    if (numIdx !== undefined) {
      e.preventDefault();
      handlers.onUpgradeHeroCard(numIdx);
      return;
    }

    if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      handlers.onSummonHero();
      return;
    }

    const slotIndex = KEY_MAP[e.code] ?? KEY_MAP[e.key];
    if (slotIndex !== undefined) {
      e.preventDefault();
      handlers.onHeroAttack(slotIndex);
    }
  };

  window.addEventListener('keydown', onKeyDown, { capture: true, passive: false });
  return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
}