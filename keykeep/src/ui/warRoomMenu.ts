import { Container, Graphics, Sprite, Text, TextStyle, Application } from 'pixi.js';
import type { MenuTab } from '../types';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, ALL_HEROES } from '../constants';
import { GameTextures } from '../gameAssets';
import { getHeroTexture } from '../sprites';
import { state, writeSaveData, getEquippedHeroDeck } from '../state/gameState';
import { createPanel, createUiButton } from './uiHelpers';
import { sound } from '../audio';
import { openHeroProfileModal, triggerSummonAnimation } from './modals';

export function renderStartMenu(
  menuRoot: Container,
  modalLayer: Container,
  app: Application,
  onStartMatch: () => void,
  onToggleFullscreen: () => void
): void {
  menuRoot.removeChildren();

  const tableBg = new Graphics();
  tableBg.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill(0x1a0f0a);
  menuRoot.addChild(tableBg);

  const parchment = createPanel(GameTextures.panelBeige, 36, 76, 888, 480, 24);
  menuRoot.addChild(parchment);

  const headerPanel = createPanel(GameTextures.panelBrown, 16, 12, 928, 56, 16);
  menuRoot.addChild(headerPanel);

  const ducatText = new Text({
    text: `🪙 ${state.saveData.sovereignDucats} Ducats`,
    style: new TextStyle({ fontFamily: 'Lilita One', fill: '#fef08a', fontSize: 16 })
  });
  ducatText.position.set(40, 28);
  menuRoot.addChild(ducatText);

  const amCount = Math.max(0, state.saveData.antimatter);
  const amText = new Text({
    text: `🌀 ${amCount} Antimatter`,
    style: new TextStyle({ fontFamily: 'Lilita One', fill: '#e9d5ff', fontSize: 16 })
  });
  amText.position.set(240, 28);
  menuRoot.addChild(amText);

  const fsBtn = createUiButton(
    GameTextures.btnBeige,
    GameTextures.btnBeigePressed,
    135, 40,
    '⛶ Fullscreen',
    new TextStyle({ fontFamily: 'Lilita One', fill: '#78350f', fontSize: 13 }),
    onToggleFullscreen
  );
  fsBtn.position.set(790, 20);
  menuRoot.addChild(fsBtn);

  const tabContainer = new Container();
  tabContainer.position.set(0, 80);
  menuRoot.addChild(tabContainer);

  const refreshMenu = () => renderStartMenu(menuRoot, modalLayer, app, onStartMatch, onToggleFullscreen);

  if (state.currentMenuTab === 'HOME') {
    renderWarRoomHomeTab(tabContainer, modalLayer, refreshMenu, onStartMatch);
  } else if (state.currentMenuTab === 'CARDS') {
    renderGarrisonCardsTab(tabContainer, modalLayer, refreshMenu);
  } else if (state.currentMenuTab === 'PORTALS') {
    renderAntimatterPortalsTab(tabContainer, modalLayer, app, refreshMenu);
  }

  const bottomNav = new Graphics();
  bottomNav.rect(0, 565, VIRTUAL_WIDTH, 75).fill(0x0e0906).stroke({ width: 2, color: 0x6e3c0f });
  menuRoot.addChild(bottomNav);

  const tabs: { id: MenuTab; title: string; crest: string }[] = [
    { id: 'HOME', title: 'War Room', crest: '⚔' },
    { id: 'CARDS', title: 'Cards & Deck', crest: '🛡' },
    { id: 'PORTALS', title: 'Antimatter Portals', crest: '🌀' }
  ];

  tabs.forEach((tab, idx) => {
    const bx = 160 + idx * 240;
    const isActive = state.currentMenuTab === tab.id;

    const btn = createUiButton(
      isActive ? GameTextures.btnBrown : GameTextures.btnBeige,
      isActive ? GameTextures.btnBrownPressed : GameTextures.btnBeigePressed,
      200, 54,
      `${tab.crest} ${tab.title}`,
      new TextStyle({
        fontFamily: 'Cinzel Decorative',
        fill: isActive ? '#fef08a' : '#451a03',
        fontSize: 13,
        fontWeight: 'bold'
      }),
      () => {
        state.currentMenuTab = tab.id;
        refreshMenu();
      }
    );
    btn.position.set(bx, 570);
    menuRoot.addChild(btn);
  });
}

function renderWarRoomHomeTab(
  parent: Container,
  modalLayer: Container,
  refreshMenu: () => void,
  onStartMatch: () => void
): void {
  const title = new Text({
    text: `CAMPAIGN STAGE ${state.currentCampaignLevel}`,
    style: new TextStyle({ fontFamily: 'Cinzel Decorative', fill: '#451a03', fontSize: 24, fontWeight: 'bold' })
  });
  title.anchor.set(0.5);
  title.position.set(480, 24);
  parent.addChild(title);

  const deckLabel = new Text({
    text: 'ACTIVE 5-HERO WAR FORMATION (Click Hero to Inspect / Change)',
    style: new TextStyle({ fontFamily: 'Lilita One', fill: '#78350f', fontSize: 13 })
  });
  deckLabel.anchor.set(0.5);
  deckLabel.position.set(480, 56);
  parent.addChild(deckLabel);

  const activeDeck = getEquippedHeroDeck();
  const cStartX = 145;
  const cY = 75;
  const cW = 120;
  const cH = 160;
  const gap = 16;

  activeDeck.forEach((hero, idx) => {
    const card = new Container();
    card.position.set(cStartX + idx * (cW + gap), cY);

    const cardFrame = createPanel(GameTextures.panelInsetBrown, 0, 0, cW, cH, 14);
    card.addChild(cardFrame);

    const slotBadge = new Text({
      text: `SLOT ${idx + 1}`,
      style: new TextStyle({ fontFamily: 'Lilita One', fill: '#facc15', fontSize: 10 })
    });
    slotBadge.position.set(8, 6);
    card.addChild(slotBadge);

    const unitSprite = new Sprite(getHeroTexture(hero.id));
    unitSprite.anchor.set(0.5);
    unitSprite.position.set(cW / 2, 58);
    unitSprite.width = 68;
    unitSprite.height = 68;
    card.addChild(unitSprite);

    const name = new Text({
      text: hero.name,
      style: new TextStyle({ fontFamily: 'Lilita One', fill: '#fef08a', fontSize: 14 })
    });
    name.anchor.set(0.5);
    name.position.set(cW / 2, 108);
    card.addChild(name);

    const lvl = new Text({
      text: `Lvl ${hero.level}`,
      style: new TextStyle({ fontFamily: 'Lilita One', fill: '#38bdf8', fontSize: 12 })
    });
    lvl.anchor.set(0.5);
    lvl.position.set(cW / 2, 132);
    card.addChild(lvl);

    card.eventMode = 'static';
    card.cursor = 'pointer';
    card.on('pointerdown', () => {
      sound.playKeypress();
      openHeroProfileModal(hero, modalLayer, refreshMenu);
    });

    parent.addChild(card);
  });

  const marchBtn = createUiButton(
    GameTextures.btnBlue,
    GameTextures.btnBluePressed,
    320, 72,
    '⚔ MARCH TO WAR',
    new TextStyle({ fontFamily: 'Cinzel Decorative', fill: '#ffffff', fontSize: 18, fontWeight: 'bold' }),
    () => {
      sound.playWarHorn();
      setTimeout(onStartMatch, 150);
    }
  );
  marchBtn.position.set(320, 276);
  parent.addChild(marchBtn);

  const guideFrame = createPanel(GameTextures.panelInsetBeige, 180, 365, 600, 95, 14);
  parent.addChild(guideFrame);

  const guideText = new Text({
    text: 'WARROOM TACTICS & COMMANDS:\n• Press [Space] in battle to summon heroes using Soul Aether.\n• Strike [E, R, T, Y, U, D, F, G, H, J, C, V, B, N, M] to attack.\n• Drag matching heroes of the same tier together to merge.\n• Every completed wave awards +1 Antimatter for Portals!',
    style: new TextStyle({ fontFamily: 'Lilita One', fill: '#451a03', fontSize: 13, lineHeight: 18 })
  });
  guideText.position.set(200, 375);
  parent.addChild(guideText);
}

function renderGarrisonCardsTab(
  parent: Container,
  modalLayer: Container,
  refreshMenu: () => void
): void {
  const title = new Text({
    text: 'ROYAL GARRISON & DECK BUILDER',
    style: new TextStyle({ fontFamily: 'Cinzel Decorative', fill: '#451a03', fontSize: 20, fontWeight: 'bold' })
  });
  title.anchor.set(0.5);
  title.position.set(480, 18);
  parent.addChild(title);

  const cW = 96;
  const cH = 142;
  const startX = 64;
  const gap = 12;

  ALL_HEROES.forEach((hero, idx) => {
    const isEquipped = state.saveData.equippedDeckIds.includes(hero.id);
    const isUnlocked = state.saveData.unlockedHeroIds.includes(hero.id);
    const level = state.saveData.heroLevels[hero.id] || 1;

    const col = idx % 8;
    const row = Math.floor(idx / 8);

    const card = new Container();
    card.position.set(startX + col * (cW + gap), 44 + row * (cH + gap));

    const frame = createPanel(isEquipped ? GameTextures.panelBrown : GameTextures.panelInsetBrown, 0, 0, cW, cH, 12);
    card.addChild(frame);

    if (isEquipped) {
      const slotIdx = state.saveData.equippedDeckIds.indexOf(hero.id) + 1;
      const badgeContainer = new Container();
      const badgeBg = new Graphics();
      badgeBg.roundRect(0, 0, 52, 16, 4).fill(0xfacc15);
      badgeContainer.addChild(badgeBg);

      const bText = new Text({ text: `DECK #${slotIdx}`, style: new TextStyle({ fontFamily: 'Lilita One', fill: '#000000', fontSize: 9 }) });
      bText.anchor.set(0.5);
      bText.position.set(26, 8);
      badgeContainer.addChild(bText);

      badgeContainer.position.set(4, 4);
      card.addChild(badgeContainer);
    }

    const sprite = new Sprite(getHeroTexture(hero.id));
    sprite.anchor.set(0.5);
    sprite.position.set(cW / 2, 54);
    sprite.width = 58;
    sprite.height = 58;
    if (!isUnlocked) sprite.tint = 0x475569;
    card.addChild(sprite);

    const name = new Text({
      text: hero.name,
      style: new TextStyle({ fontFamily: 'Lilita One', fill: isUnlocked ? '#fef08a' : '#78716c', fontSize: 11 })
    });
    name.anchor.set(0.5);
    name.position.set(cW / 2, 96);
    card.addChild(name);

    const status = new Text({
      text: isUnlocked ? `Lvl ${level}` : 'LOCKED',
      style: new TextStyle({ fontFamily: 'Lilita One', fill: isUnlocked ? '#38bdf8' : '#ef4444', fontSize: 10 })
    });
    status.anchor.set(0.5);
    status.position.set(cW / 2, 118);
    card.addChild(status);

    card.eventMode = 'static';
    card.cursor = 'pointer';
    card.on('pointerdown', () => {
      sound.playKeypress();
      openHeroProfileModal(hero, modalLayer, refreshMenu);
    });

    parent.addChild(card);
  });
}

function renderAntimatterPortalsTab(
  parent: Container,
  modalLayer: Container,
  app: Application,
  refreshMenu: () => void
): void {
  const title = new Text({
    text: 'ANTIMATTER SUMMONING SANCTUM',
    style: new TextStyle({ fontFamily: 'Cinzel Decorative', fill: '#451a03', fontSize: 20, fontWeight: 'bold' })
  });
  title.anchor.set(0.5);
  title.position.set(480, 20);
  parent.addChild(title);

  const subtitle = new Text({
    text: 'Each wave cleared in battle awards +1 Antimatter! Channel them to unlock all 10 heroes.',
    style: new TextStyle({ fontFamily: 'Lilita One', fill: '#78350f', fontSize: 12 })
  });
  subtitle.anchor.set(0.5);
  subtitle.position.set(480, 45);
  parent.addChild(subtitle);

  const portals = [
    { name: 'Astral Portal', cost: 5, color: 0x38bdf8, desc: 'Summons 1 Hero. Unlocks locked heroes or levels up roster.' },
    { name: 'Void Singularity', cost: 12, color: 0xc084fc, desc: 'Guaranteed locked Hero Unlock + 350 Sovereign Ducats!' }
  ];

  portals.forEach((p, idx) => {
    const box = new Container();
    box.position.set(160 + idx * 340, 75);

    const frame = createPanel(GameTextures.panelInsetBrown, 0, 0, 300, 340, 14);
    box.addChild(frame);

    const vortex = new Graphics();
    vortex.circle(150, 110, 56).fill({ color: p.color, alpha: 0.35 }).stroke({ width: 3, color: 0xc084fc });
    vortex.circle(150, 110, 36).fill({ color: 0xffffff, alpha: 0.8 });
    vortex.circle(150, 110, 18).fill(p.color);
    box.addChild(vortex);

    const pTitle = new Text({
      text: p.name,
      style: new TextStyle({ fontFamily: 'Cinzel Decorative', fill: '#ffffff', fontSize: 16, fontWeight: 'bold' })
    });
    pTitle.anchor.set(0.5);
    pTitle.position.set(150, 195);
    box.addChild(pTitle);

    const pDesc = new Text({
      text: p.desc,
      style: new TextStyle({ fontFamily: 'Lilita One', fill: '#cbd5e1', fontSize: 12, align: 'center', wordWrap: true, wordWrapWidth: 260 })
    });
    pDesc.anchor.set(0.5);
    pDesc.position.set(150, 235);
    box.addChild(pDesc);

    const canAfford = state.saveData.antimatter >= p.cost;

    const summonBtn = createUiButton(
      canAfford ? GameTextures.btnBlue : GameTextures.btnBrown,
      canAfford ? GameTextures.btnBluePressed : GameTextures.btnBrownPressed,
      240, 46,
      `CHANNEL (${p.cost} 🌀)`,
      new TextStyle({ fontFamily: 'Lilita One', fill: canAfford ? '#ffffff' : '#78716c', fontSize: 14 }),
      () => {
        if (state.saveData.antimatter < p.cost) return;

        state.saveData.antimatter = Math.max(0, state.saveData.antimatter - p.cost);
        writeSaveData(state.saveData);
        sound.playMagicBlast();

        const locked = ALL_HEROES.filter(h => !state.saveData.unlockedHeroIds.includes(h.id));
        if (locked.length > 0) {
          const unlockedHero = locked[Math.floor(Math.random() * locked.length)];
          state.saveData.unlockedHeroIds.push(unlockedHero.id);
          state.saveData.heroLevels[unlockedHero.id] = 1;
          writeSaveData(state.saveData);
          triggerSummonAnimation(unlockedHero, true, 0, app, modalLayer, refreshMenu);
        } else {
          const randomHero = ALL_HEROES[Math.floor(Math.random() * ALL_HEROES.length)];
          state.saveData.heroLevels[randomHero.id] = (state.saveData.heroLevels[randomHero.id] || 1) + 1;
          state.saveData.sovereignDucats += 350;
          writeSaveData(state.saveData);
          triggerSummonAnimation(randomHero, false, 350, app, modalLayer, refreshMenu);
        }
      }
    );
    summonBtn.position.set(30, 275);
    box.addChild(summonBtn);

    parent.addChild(box);
  });
}
