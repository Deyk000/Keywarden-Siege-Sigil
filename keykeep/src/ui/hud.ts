import { Container, Graphics, Sprite, Text, TextStyle, NineSliceSprite } from 'pixi.js';
import { GameTextures } from '../gameAssets';
import { getHeroTexture } from '../sprites';
import { state, getEquippedHeroDeck, writeSaveData } from '../state/gameState';
import { TARGET_MODES, UPGRADE_COSTS } from '../constants';
import { createPanel, createUiButton } from './uiHelpers';
import { sound } from '../audio';

export interface BattleHud {
  hudPanel: NineSliceSprite;
  manaText: Text;
  goldBattleText: Text;
  levelWaveText: Text;
  targetBtn: Container;
  returnBtn: Container;
  summonBtn: Container;
  castleBarContainer: Container;
  updateCastleHp: () => void;
  refreshDeckTray: () => void;
  updateUpgradeCards: () => void;
}

export function createBattleHud(
  uiLayer: Container,
  onSummonHero: () => void,
  onReturnToMenu: () => void,
  onSpawnFloatingText: (msg: string, x: number, y: number, color: string) => void,
  onUpdateGridHeroVisuals: () => void
): BattleHud {
  const hudPanel = createPanel(GameTextures.panelBrown, 16, 12, 540, 68, 16);
  uiLayer.addChild(hudPanel);

  const manaText = new Text({
    text: `⚡ Aether: ${Math.floor(state.mana)}`,
    style: new TextStyle({ fontFamily: 'Lilita One', fill: '#38bdf8', fontSize: 16 })
  });
  manaText.position.set(30, 20);
  uiLayer.addChild(manaText);

  const goldBattleText = new Text({
    text: `🪙 Ducats: ${state.saveData.sovereignDucats}`,
    style: new TextStyle({ fontFamily: 'Lilita One', fill: '#facc15', fontSize: 15 })
  });
  goldBattleText.position.set(30, 46);
  uiLayer.addChild(goldBattleText);

  const levelWaveText = new Text({
    text: `STAGE ${state.currentCampaignLevel} - WAVE ${state.currentWave}/${state.maxWavesForLevel}`,
    style: new TextStyle({ fontFamily: 'Cinzel Decorative', fill: '#f8fafc', fontSize: 14, fontWeight: 'bold' })
  });
  levelWaveText.position.set(165, 20);
  uiLayer.addChild(levelWaveText);

  const targetBtn = createUiButton(
    GameTextures.btnBeige,
    GameTextures.btnBeigePressed,
    190, 28,
    `Priority: ${TARGET_MODES[state.currentTargetModeIndex]} [Tab]`,
    new TextStyle({ fontFamily: 'Lilita One', fill: '#78350f', fontSize: 11 }),
    () => {
      state.currentTargetModeIndex = (state.currentTargetModeIndex + 1) % TARGET_MODES.length;
      if (targetBtn && targetBtn.children[1]) {
        (targetBtn.children[1] as Text).text = `Priority: ${TARGET_MODES[state.currentTargetModeIndex]} [Tab]`;
      }
    }
  );
  targetBtn.position.set(165, 46);
  uiLayer.addChild(targetBtn);

  const returnBtn = createUiButton(
    GameTextures.btnBeige,
    GameTextures.btnBeigePressed,
    85, 48,
    'WAR ROOM',
    new TextStyle({ fontFamily: 'Lilita One', fill: '#78350f', fontSize: 11 }),
    onReturnToMenu
  );
  returnBtn.position.set(455, 22);
  uiLayer.addChild(returnBtn);

  const summonBtn = createUiButton(
    GameTextures.btnBlue,
    GameTextures.btnBluePressed,
    230, 48,
    `Summon (${state.summonCost}) [Space]`,
    new TextStyle({ fontFamily: 'Lilita One', fill: '#ffffff', fontSize: 14 }),
    onSummonHero
  );
  summonBtn.position.set(365, 444);
  uiLayer.addChild(summonBtn);

  // Keep Health Bar
  const castleBarContainer = new Container();
  castleBarContainer.position.set(725, 545);
  uiLayer.addChild(castleBarContainer);

  const barBack = createPanel(GameTextures.panelInsetBrown, 0, 0, 120, 18, 6);
  castleBarContainer.addChild(barBack);

  const barFill = new Graphics();
  castleBarContainer.addChild(barFill);

  const castleHpText = new Text({
    text: `Keep: ${state.castleHp}/100`,
    style: new TextStyle({ fontFamily: 'Lilita One', fill: '#ffffff', fontSize: 11 })
  });
  castleHpText.anchor.set(0.5);
  castleHpText.position.set(60, 9);
  castleBarContainer.addChild(castleHpText);

  const updateCastleHp = () => {
    const pct = Math.max(0, state.castleHp / 100);
    barFill.clear();
    barFill.roundRect(2, 2, 116 * pct, 14, 4).fill(pct > 0.4 ? 0x22c55e : 0xef4444);
    castleHpText.text = `Keep: ${state.castleHp}/100`;
  };

  const upgradeCards: Container[] = [];
  const upgradeCostTexts: Text[] = [];
  const upgradeLvlTexts: Text[] = [];

  const trayStartX = 196;
  const trayY = 502;
  const cardW = 108;
  const cardH = 104;
  const cardGap = 8;

  const updateUpgradeCards = () => {
    const equipped = getEquippedHeroDeck();
    equipped.forEach((heroDef, idx) => {
      const lvl = heroDef.level;
      const lvlText = upgradeLvlTexts[idx];
      const costText = upgradeCostTexts[idx];
      if (!lvlText || !costText) return;

      lvlText.text = lvl >= 4 ? 'MAX' : `Lvl ${lvl}`;
      costText.text = lvl >= 4 ? 'MAX' : `▲ ${UPGRADE_COSTS[lvl]}`;
    });
  };

  const refreshDeckTray = () => {
    upgradeCards.forEach(c => uiLayer.removeChild(c));
    upgradeCards.length = 0;
    upgradeCostTexts.length = 0;
    upgradeLvlTexts.length = 0;

    const equippedDeck = getEquippedHeroDeck();

    equippedDeck.forEach((heroDef, idx) => {
      const card = new Container();
      card.position.set(trayStartX + idx * (cardW + cardGap), trayY);

      const frame = createPanel(GameTextures.panelInsetBrown, 0, 0, cardW, cardH, 12);
      card.addChild(frame);

      const keyBadge = new Text({
        text: `[${idx + 1}]`,
        style: new TextStyle({ fontFamily: 'Lilita One', fill: '#facc15', fontSize: 11 })
      });
      keyBadge.position.set(6, 4);
      card.addChild(keyBadge);

      const charIcon = new Sprite(getHeroTexture(heroDef.id));
      charIcon.anchor.set(0.5);
      charIcon.position.set(cardW / 2, 38);
      charIcon.width = 54;
      charIcon.height = 54;
      card.addChild(charIcon);

      const lvlText = new Text({
        text: `Lvl ${heroDef.level}`,
        style: new TextStyle({ fontFamily: 'Lilita One', fill: '#38bdf8', fontSize: 11 })
      });
      lvlText.anchor.set(0.5);
      lvlText.position.set(cardW / 2, 60);
      card.addChild(lvlText);
      upgradeLvlTexts.push(lvlText);

      const costBtn = createUiButton(
        GameTextures.btnBeige,
        GameTextures.btnBeigePressed,
        cardW - 16, 24,
        `▲ 100`,
        new TextStyle({ fontFamily: 'Lilita One', fill: '#78350f', fontSize: 11 }),
        () => {
          const currentLvl = heroDef.level;
          if (currentLvl >= 4) return;
          const cost = UPGRADE_COSTS[currentLvl];
          if (state.mana >= cost) {
            state.mana -= cost;
            state.saveData.heroLevels[heroDef.id] = currentLvl + 1;
            writeSaveData(state.saveData);
            sound.playUpgrade();
            updateUpgradeCards();
            onSpawnFloatingText(`UPGRADE!`, trayStartX + idx * (cardW + cardGap) + cardW / 2, trayY, '#38bdf8');
            onUpdateGridHeroVisuals();
          }
        }
      );
      costBtn.position.set(8, 74);
      card.addChild(costBtn);

      const costTxt = costBtn.children[1] as Text;
      if (costTxt) upgradeCostTexts.push(costTxt);

      upgradeCards.push(card);
      uiLayer.addChild(card);
    });
  };

  return {
    hudPanel, manaText, goldBattleText, levelWaveText,
    targetBtn, returnBtn, summonBtn, castleBarContainer,
    updateCastleHp, refreshDeckTray, updateUpgradeCards
  };
}
