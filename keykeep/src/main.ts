import { run } from './systems/battleLoop';

const key = '__keykeep_started__';
const scope = globalThis as typeof globalThis & { [key]?: boolean };
if (!scope[key]) {
  scope[key] = true;
  void run().catch((error: unknown) => {
    console.error('[KeyKeep] Failed to initialize game.', error);
  });
}
