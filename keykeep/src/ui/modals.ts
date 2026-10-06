import { Container, Graphics, Sprite, Text, TextStyle, Application } from 'pixi.js';
import type { HeroDef } from '../types';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, UPGRADE_COSTS } from '../constants';
import { GameTextures } from '../gameAssets';
import { getHeroTexture } from '../sprites';
import { state, writeSaveData, getEquippedHeroDeck } from '../state/gameState';
import { createPanel, createUiButton } from './uiHelpers';
import { sound } from '../audio';

export function openHeroProfileModal(
  heroDef: HeroDef,
  modalLayer: Container,
  onRefreshMenu: () => void
): void {
  modalLayer.removeChildren();

  const isUnlocked = state.saveData.unlockedHeroIds.includes(heroDef.id);
  const isEquipped = state.saveData.equippedDeckIds.includes(heroDef.id);
  const level = state.saveData.heroLevels[heroDef.id] || 1;
  const dmg = heroDef.baseDamage * level;
  const hp = heroDef.vitalityHp * level;
  const def = heroDef.armorDefense * level;

  const overlay = new Graphics();
  overlay.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill({ color: 0x000000, alpha: 0.85 });
  modalLayer.addChild(overlay);

  const scroll = createPanel(GameTextures.panelBeige, 240, 50, 480, 520, 24);
  modalLayer.addChild(scroll);

  const sprite = new Sprite(getHeroTexture(heroDef.id));
  sprite.anchor.set(0.5);
  sprite.position.set(480, 135);
  sprite.width = 110;
  sprite.height = 110;
  if (!isUnlocked) sprite.tint = 0x475569;
  modalLayer.addChild(sprite);

  const name = new Text({
    text: heroDef.name.toUpperCase(),
    style: new TextStyle({ fontFamily: 'Cinzel Decorative', fill: '#451a03', fontSize: 24, fontWeight: 'bold' })
  });
  name.anchor.set(0.5);
  name.position.set(480, 205);
  modalLayer.addChild(name);

  const title = new Text({
    text: `${heroDef.title} • Tier ${level} Specialization`,
    style: new TextStyle({ fontFamily: 'Lilita One', fill: '#854d0e', fontSize: 14 })
  });
  title.anchor.set(0.5);
  title.position.set(480, 230);
  modalLayer.addChild(title);

  const statInset = createPanel(GameTextures.panelInsetBeige, 270, 255, 420, 120, 14);
  modalLayer.addChild(statInset);

  const statsText = new Text({
    text: `⚔ ATTACK POWER: ${dmg} pts (Scales with merge tier)\n❤ VITALITY (HP): ${hp} pts (Keep armor fortification)\n🛡 ARMOR DEFENSE: ${def} rating (Creep mitigation)\n⚡ VELOCITY: ${heroDef.projSpeed * 60} px/s  |  IMPACT RADIUS: ${heroDef.projRadius}`,
    style: new TextStyle({ fontFamily: 'Lilita One', fill: '#271206', fontSize: 13, lineHeight: 22 })
  });
  statsText.position.set(285, 268);
  modalLayer.addChild(statsText);

  const abilityText = new Text({
    text: `EMPOWERED ABILITY: ${heroDef.abilityName}\n${heroDef.description}`,
    style: new TextStyle({ fontFamily: 'Lilita One', fill: '#78350f', fontSize: 13, wordWrap: true, wordWrapWidth: 400 })
  });
  abilityText.position.set(280, 395);
  modalLayer.addChild(abilityText);

  if (isUnlocked) {
    const equipBtn = createUiButton(
      isEquipped ? GameTextures.btnBrown : GameTextures.btnBlue,
      isEquipped ? GameTextures.btnBrownPressed : GameTextures.btnBluePressed,
      190, 46,
      isEquipped ? 'IN ACTIVE DECK' : 'CHANGE DECK SLOT',
      new TextStyle({ fontFamily: 'Lilita One', fill: '#ffffff', fontSize: 13 }),
      () => {
        if (!isEquipped) {
          openDeckSlotSelectorModal(heroDef, modalLayer, onRefreshMenu);
        }
      }
    );
    equipBtn.position.set(270, 475);
    modalLayer.addChild(equipBtn);

    const upCost = UPGRADE_COSTS[level] || 1200;
    const canUpgrade = state.saveData.sovereignDucats >= upCost && level < 4;

    const upBtn = createUiButton(
      GameTextures.btnBeige,
      GameTextures.btnBeigePressed,
      200, 46,
      level >= 4 ? 'MAX LEVEL' : `UPGRADE (${upCost} 🪙)`,
      new TextStyle({ fontFamily: 'Lilita One', fill: canUpgrade ? '#16a34a' : '#78716c', fontSize: 13 }),
      () => {
        if (canUpgrade) {
          state.saveData.sovereignDucats -= upCost;
          state.saveData.heroLevels[heroDef.id] = (state.saveData.heroLevels[heroDef.id] || 1) + 1;
          sound.playUpgrade();
          writeSaveData(state.saveData);
          openHeroProfileModal(heroDef, modalLayer, onRefreshMenu);
        }
      }
    );
    upBtn.position.set(490, 475);
    modalLayer.addChild(upBtn);
  } else {
    const lockNotice = new Text({
      text: 'LOCKED HERO: SUMMON FROM ANTIMATTER PORTALS TAB TO UNLOCK',
      style: new TextStyle({ fontFamily: 'Lilita One', fill: '#991b1b', fontSize: 12 })
    });
    lockNotice.anchor.set(0.5);
    lockNotice.position.set(480, 490);
    modalLayer.addChild(lockNotice);
  }

  const closeBtn = new Container();
  closeBtn.eventMode = 'static';
  closeBtn.cursor = 'pointer';

  const closeCircle = new Graphics();
  closeCircle.circle(0, 0, 16).fill(0x7f1d1d).stroke({ width: 2, color: 0xfacc15 });
  closeBtn.addChild(closeCircle);

  const closeTxt = new Text({ text: '✕', style: new TextStyle({ fill: '#ffffff', fontSize: 16, fontWeight: 'bold' }) });
  closeTxt.anchor.set(0.5);
  closeBtn.addChild(closeTxt);

  closeBtn.position.set(700, 75);
  closeBtn.on('pointerdown', () => {
    modalLayer.removeChildren();
    onRefreshMenu();
  });
  modalLayer.addChild(closeBtn);
}

export function openDeckSlotSelectorModal(
  newHero: HeroDef,
  modalLayer: Container,
  onRefreshMenu: () => void
): void {
  modalLayer.removeChildren();

  const overlay = new Graphics();
  overlay.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill({ color: 0x000000, alpha: 0.88 });
  modalLayer.addChild(overlay);

  const frame = createPanel(GameTextures.panelBeige, 160, 95, 640, 450, 20);
  modalLayer.addChild(frame);

  const title = new Text({
    text: `ASSIGN ${newHero.name.toUpperCase()} TO ACTIVE FORMATION`,
    style: new TextStyle({ fontFamily: 'Cinzel Decorative', fill: '#451a03', fontSize: 18, fontWeight: 'bold' })
  });
  title.anchor.set(0.5);
  title.position.set(480, 135);
  modalLayer.addChild(title);

  const currentDeck = getEquippedHeroDeck();
  const slotW = 100;
  const slotH = 150;
  const startX = 180;
  const gap = 18;

  currentDeck.forEach((curHero, sIdx) => {
    const slotBox = new Container();
    slotBox.position.set(startX + sIdx * (slotW + gap), 185);

    const boxBg = createPanel(GameTextures.panelInsetBrown, 0, 0, slotW, slotH, 12);
    slotBox.addChild(boxBg);

    const sLabel = new Text({
      text: `SLOT ${sIdx + 1}`,
      style: new TextStyle({ fontFamily: 'Lilita One', fill: '#facc15', fontSize: 11 })
    });
    sLabel.anchor.set(0.5);
    sLabel.position.set(slotW / 2, 16);
    slotBox.addChild(sLabel);

    const sIcon = new Sprite(getHeroTexture(curHero.id));
    sIcon.anchor.set(0.5);
    sIcon.position.set(slotW / 2, 58);
    sIcon.width = 54;
    sIcon.height = 54;
    slotBox.addChild(sIcon);

    const sName = new Text({
      text: curHero.name,
      style: new TextStyle({ fontFamily: 'Lilita One', fill: '#ffffff', fontSize: 12 })
    });
    sName.anchor.set(0.5);
    sName.position.set(slotW / 2, 98);
    slotBox.addChild(sName);

    const repBtn = createUiButton(
      GameTextures.btnBlue,
      GameTextures.btnBluePressed,
      slotW - 12, 28,
      'REPLACE',
      new TextStyle({ fontFamily: 'Lilita One', fill: '#ffffff', fontSize: 11 }),
      () => {
        state.saveData.equippedDeckIds[sIdx] = newHero.id;
        writeSaveData(state.saveData);
        sound.playUpgrade();
        modalLayer.removeChildren();
        onRefreshMenu();
      }
    );
    repBtn.position.set(6, 114);
    slotBox.addChild(repBtn);

    modalLayer.addChild(slotBox);
  });

  const cancelBtn = createUiButton(
    GameTextures.btnBeige,
    GameTextures.btnBeigePressed,
    140, 42,
    'CANCEL',
    new TextStyle({ fontFamily: 'Lilita One', fill: '#78350f', fontSize: 13 }),
    () => {
      modalLayer.removeChildren();
      openHeroProfileModal(newHero, modalLayer, onRefreshMenu);
    }
  );
  cancelBtn.position.set(410, 480);
  modalLayer.addChild(cancelBtn);
}

export function triggerSummonAnimation(
  hero: HeroDef,
  isNew: boolean,
  bonusGold: number,
  app: Application,
  modalLayer: Container,
  onRefreshMenu: () => void
): void {
  modalLayer.removeChildren();

  const overlay = new Graphics();
  overlay.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill({ color: 0x000000, alpha: 0.9 });
  modalLayer.addChild(overlay);

  const animContainer = new Container();
  animContainer.position.set(480, 320);
  modalLayer.addChild(animContainer);

  const portalRays = new Graphics();
  for (let r = 0; r < 8; r++) {
    const ang = (r * Math.PI) / 4;
    portalRays.moveTo(0, 0);
    portalRays.lineTo(Math.cos(ang) * 160, Math.sin(ang) * 160);
  }
  portalRays.stroke({ width: 4, color: 0xc084fc, alpha: 0.7 });
  animContainer.addChild(portalRays);

  const cardContainer = new Container();
  cardContainer.scale.set(0.1);
  animContainer.addChild(cardContainer);

  const frame = createPanel(GameTextures.panelBeige, -180, -200, 360, 400, 20);
  cardContainer.addChild(frame);

  const bannerText = new Text({
    text: isNew ? '✨ NEW HERO UNLOCKED! ✨' : '⚡ HERO EMPOWERED! ⚡',
    style: new TextStyle({ fontFamily: 'Cinzel Decorative', fill: isNew ? '#16a34a' : '#0284c7', fontSize: 16, fontWeight: 'bold' })
  });
  bannerText.anchor.set(0.5);
  bannerText.position.set(0, -155);
  cardContainer.addChild(bannerText);

  const sprite = new Sprite(getHeroTexture(hero.id));
  sprite.anchor.set(0.5);
  sprite.position.set(0, -60);
  sprite.width = 110;
  sprite.height = 110;
  cardContainer.addChild(sprite);

  const nameText = new Text({
    text: hero.name.toUpperCase(),
    style: new TextStyle({ fontFamily: 'Cinzel Decorative', fill: '#451a03', fontSize: 24, fontWeight: 'bold' })
  });
  nameText.anchor.set(0.5);
  nameText.position.set(0, 15);
  cardContainer.addChild(nameText);

  const descText = new Text({
    text: isNew 
      ? `${hero.title}\nAdded to your Royal Garrison!`
      : `Upgraded to Level ${state.saveData.heroLevels[hero.id]}!\n+${bonusGold} Sovereign Ducats secured!`,
    style: new TextStyle({ fontFamily: 'Lilita One', fill: '#78350f', fontSize: 13, align: 'center', lineHeight: 18 })
  });
  descText.anchor.set(0.5);
  descText.position.set(0, 65);
  cardContainer.addChild(descText);

  let cleanedUp = false;
  const animTicker = (ticker: { deltaTime: number }) => {
    portalRays.rotation += ticker.deltaTime * 0.05;
    if (cardContainer.scale.x < 1.0) {
      const nextScale = Math.min(1.0, cardContainer.scale.x + ticker.deltaTime * 0.04);
      cardContainer.scale.set(nextScale);
    }
  };

  const cleanup = () => {
    if (!cleanedUp) {
      cleanedUp = true;
      app.ticker.remove(animTicker);
      modalLayer.removeChildren();
      onRefreshMenu();
    }
  };

  const claimBtn = createUiButton(
    GameTextures.btnBlue,
    GameTextures.btnBluePressed,
    200, 48,
    'COLLECT HERO',
    new TextStyle({ fontFamily: 'Lilita One', fill: '#ffffff', fontSize: 14 }),
    () => {
      sound.playUpgrade();
      cleanup();
    }
  );
  claimBtn.position.set(-100, 130);
  cardContainer.addChild(claimBtn);

  app.ticker.add(animTicker);
}

export function showDefeatModal(
  modalLayer: Container,
  onRetry: () => void,
  onReturnMenu: () => void
): void {
  state.isGameOver = true;

  const overlay = new Graphics();
  overlay.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill({ color: 0x000000, alpha: 0.88 });
  modalLayer.addChild(overlay);

  const defeatText = new Text({
    text: 'THE KEEP HAS FALLEN\nYour Treasury was pillaged!',
    style: new TextStyle({ fontFamily: 'Cinzel Decorative', fill: '#dc2626', fontSize: 24, fontWeight: 'bold', align: 'center' })
  });
  defeatText.anchor.set(0.5);
  defeatText.position.set(480, 230);
  modalLayer.addChild(defeatText);

  const restartBtn = createUiButton(
    GameTextures.btnBlue,
    GameTextures.btnBluePressed,
    180, 44,
    'RETRY SIEGE',
    new TextStyle({ fontFamily: 'Lilita One', fill: '#ffffff', fontSize: 13 }),
    onRetry
  );
  restartBtn.position.set(380, 350);
  modalLayer.addChild(restartBtn);

  const menuBtn = createUiButton(
    GameTextures.btnBeige,
    GameTextures.btnBeigePressed,
    160, 44,
    'WAR ROOM',
    new TextStyle({ fontFamily: 'Lilita One', fill: '#78350f', fontSize: 13 }),
    onReturnMenu
  );
  menuBtn.position.set(580, 350);
  modalLayer.addChild(menuBtn);
}

export function showVictoryModal(
  modalLayer: Container,
  onAdvance: () => void,
  onReturnMenu: () => void
): void {
  state.isVictory = true;

  state.saveData.antimatter = Math.max(0, state.saveData.antimatter) + 2;
  const goldBounty = state.currentCampaignLevel * 80;
  state.saveData.sovereignDucats += goldBounty;

  if (state.currentCampaignLevel === state.saveData.unlockedLevel && state.currentCampaignLevel < 20) {
    state.saveData.unlockedLevel++;
  }
  writeSaveData(state.saveData);

  const overlay = new Graphics();
  overlay.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill({ color: 0x000000, alpha: 0.88 });
  modalLayer.addChild(overlay);

  const vicText = new Text({
    text: `REALM DEFENDED!\nStage ${state.currentCampaignLevel} Victorious`,
    style: new TextStyle({ fontFamily: 'Cinzel Decorative', fill: '#16a34a', fontSize: 24, fontWeight: 'bold', align: 'center' })
  });
  vicText.anchor.set(0.5);
  vicText.position.set(480, 200);
  modalLayer.addChild(vicText);

  const rewardText = new Text({
    text: `+${goldBounty} Sovereign Ducats  |  +2 Bonus Antimatter Crystals`,
    style: new TextStyle({ fontFamily: 'Lilita One', fill: '#facc15', fontSize: 15 })
  });
  rewardText.anchor.set(0.5);
  rewardText.position.set(480, 275);
  modalLayer.addChild(rewardText);

  const nextBtn = createUiButton(
    GameTextures.btnBlue,
    GameTextures.btnBluePressed,
    180, 44,
    'ADVANCE MARCH',
    new TextStyle({ fontFamily: 'Lilita One', fill: '#ffffff', fontSize: 13 }),
    onAdvance
  );
  nextBtn.position.set(380, 350);
  modalLayer.addChild(nextBtn);

  const menuBtn = createUiButton(
    GameTextures.btnBeige,
    GameTextures.btnBeigePressed,
    160, 44,
    'WAR ROOM',
    new TextStyle({ fontFamily: 'Lilita One', fill: '#78350f', fontSize: 13 }),
    onReturnMenu
  );
  menuBtn.position.set(580, 350);
  modalLayer.addChild(menuBtn);
}
