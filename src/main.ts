import { Application, Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { getHeroAnimationFrames, getEnemyWalkFrames, getSpriteTexture } from './sprites';
import type { HeroId, EnemyId } from './sprites';
import { sound } from './audio';

document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';
document.body.style.backgroundColor = '#070b14';

const VIRTUAL_WIDTH = 960;
const VIRTUAL_HEIGHT = 640;

const KEY_MAP: Record<string, number> = {
  KeyE: 0, KeyR: 1, KeyT: 2, KeyY: 3, KeyU: 4,
  KeyD: 5, KeyF: 6, KeyG: 7, KeyH: 8, KeyJ: 9,
  KeyC: 10, KeyV: 11, KeyB: 12, KeyN: 13, KeyM: 14,

  e: 0, E: 0, r: 1, R: 1, t: 2, T: 2, y: 3, Y: 3, u: 4, U: 4,
  d: 5, D: 5, f: 6, F: 6, g: 7, G: 7, h: 8, H: 8, j: 9, J: 9,
  c: 10, C: 10, v: 11, V: 11, b: 12, B: 12, n: 13, N: 13, m: 14, M: 14
};

const KEY_LABELS = ['E', 'R', 'T', 'Y', 'U', 'D', 'F', 'G', 'H', 'J', 'C', 'V', 'B', 'N', 'M'];
const HERO_SIZE = 50;

export interface HeroDef {
  id: HeroId;
  name: string;
  title: string;
  unlocked: boolean;
  level: number;
  baseDamage: number;
  vitalityHp: number;
  armorDefense: number;
  projSpeed: number;
  projRadius: number;
  themeColor: number;
  pedestalColor: number;
  abilityName: string;
  description: string;
}

const ALL_HEROES: HeroDef[] = [
  { id: 'archer', name: 'Ranger', title: 'Longbow Marksman', unlocked: true, level: 1, baseDamage: 14, vitalityHp: 180, armorDefense: 10, projSpeed: 18, projRadius: 4, themeColor: 0x15803d, pedestalColor: 0x22c55e, abilityName: 'Iron Caltrops', description: 'Deploys sharp steel caltrops that lacerate and slow the lane by 50%.' },
  { id: 'knight', name: 'Paladin', title: 'Order of the Sun', unlocked: true, level: 1, baseDamage: 26, vitalityHp: 420, armorDefense: 28, projSpeed: 14, projRadius: 6, themeColor: 0xb91c1c, pedestalColor: 0xef4444, abilityName: 'Stone Barricade', description: 'Erects fortified masonry that physically blocks all creep advance.' },
  { id: 'horseman', name: 'Cavalry', title: 'Winged Vanguard', unlocked: true, level: 1, baseDamage: 20, vitalityHp: 290, armorDefense: 18, projSpeed: 12, projRadius: 5, themeColor: 0xb45309, pedestalColor: 0xf59e0b, abilityName: 'Greek Fire Trap', description: 'Ignites persistent naphtha flames dealing rapid burning ticks.' },
  { id: 'mage', name: 'Arcanist', title: 'Grand Theurgist', unlocked: true, level: 1, baseDamage: 18, vitalityHp: 160, armorDefense: 8, projSpeed: 9, projRadius: 7, themeColor: 0x1d4ed8, pedestalColor: 0x3b82f6, abilityName: 'Runic Stasis', description: 'Etches frost circles that freeze all approaching units solid.' },
  { id: 'trebuchet', name: 'Trebuchet', title: 'Siege Engine', unlocked: true, level: 1, baseDamage: 42, vitalityHp: 350, armorDefense: 22, projSpeed: 5.0, projRadius: 11, themeColor: 0x6b21a8, pedestalColor: 0xa855f7, abilityName: 'Molten Bomb', description: 'Launches a shattered fiery boulder for devastating area explosion.' },
  
  { id: 'pyromancer', name: 'Pyromancer', title: 'Flame Weaver', unlocked: false, level: 1, baseDamage: 24, vitalityHp: 170, armorDefense: 10, projSpeed: 11, projRadius: 6, themeColor: 0xc2410c, pedestalColor: 0xf97316, abilityName: 'Lava Puddle', description: 'Scorches the lane with boiling magma dealing heavy damage over time.' },
  { id: 'ballista', name: 'Ballista', title: 'Crossbow Sentry', unlocked: false, level: 1, baseDamage: 32, vitalityHp: 260, armorDefense: 16, projSpeed: 20, projRadius: 5, themeColor: 0x78350f, pedestalColor: 0xd97706, abilityName: 'Piercing Bolt', description: 'Launches heavy harpoons that pierce clean through multiple creeps in a line.' },
  { id: 'alchemist', name: 'Alchemist', title: 'Plague Doctor', unlocked: false, level: 1, baseDamage: 16, vitalityHp: 190, armorDefense: 12, projSpeed: 10, projRadius: 5, themeColor: 0x14532d, pedestalColor: 0x22c55e, abilityName: 'Corrosive Acid', description: 'Shatters acid flasks on the road that strip creep armor and inflict corrosion.' },
  { id: 'assassin', name: 'Assassin', title: 'Shadow Stalker', unlocked: false, level: 1, baseDamage: 28, vitalityHp: 180, armorDefense: 10, projSpeed: 22, projRadius: 4, themeColor: 0x1e1b4b, pedestalColor: 0x6366f1, abilityName: 'Shadow Flurry', description: 'Throws poisoned shurikens that inflict 2x critical strikes.' },
  { id: 'frostweaver', name: 'Frostweaver', title: 'Ice Sovereign', unlocked: false, level: 1, baseDamage: 19, vitalityHp: 190, armorDefense: 12, projSpeed: 12, projRadius: 6, themeColor: 0x082f49, pedestalColor: 0x06b6d4, abilityName: 'Blizzard Hail', description: 'Summons a field of falling icicles that perpetually chills all creeps.' },
  { id: 'cleric', name: 'High Cleric', title: 'Sun Prelate', unlocked: false, level: 1, baseDamage: 17, vitalityHp: 320, armorDefense: 24, projSpeed: 13, projRadius: 6, themeColor: 0x854d0e, pedestalColor: 0xfacc15, abilityName: 'Holy Beacon', description: 'Focuses a pillar of divine light that smites creeps and shields the keep.' },
  { id: 'berserker', name: 'Berserker', title: 'War Chieftain', unlocked: false, level: 1, baseDamage: 30, vitalityHp: 380, armorDefense: 20, projSpeed: 12, projRadius: 6, themeColor: 0x3f1a04, pedestalColor: 0xef4444, abilityName: 'Blood Frenzy', description: 'Hurls spinning dual bearded axes that shred through monster armor.' },
  { id: 'druid', name: 'Forest Druid', title: 'Keeper of Oaks', unlocked: false, level: 1, baseDamage: 18, vitalityHp: 240, armorDefense: 14, projSpeed: 10, projRadius: 6, themeColor: 0x14532d, pedestalColor: 0x4ade80, abilityName: 'Bramble Roots', description: 'Grows creeping thorn vines directly on the path that entangle and root units.' },
  { id: 'bombardier', name: 'Bombardier', title: 'Dwarf Mortar', unlocked: false, level: 1, baseDamage: 38, vitalityHp: 340, armorDefense: 22, projSpeed: 7.0, projRadius: 9, themeColor: 0x27272a, pedestalColor: 0x52525b, abilityName: 'Shrapnel Blast', description: 'Detonates black-powder charges that send shrapnel tearing across the road.' },
  { id: 'necromancer', name: 'Necromancer', title: 'Lich of Despair', unlocked: false, level: 1, baseDamage: 22, vitalityHp: 210, armorDefense: 14, projSpeed: 8.5, projRadius: 7, themeColor: 0x3b0764, pedestalColor: 0x7e22ce, abilityName: 'Soul Curse', description: 'Sends screaming spectral skulls that curse creeps to take 40% increased damage.' }
];

const UPGRADE_COSTS: Record<number, number> = { 1: 150, 2: 300, 3: 600, 4: 1200 };

interface GridHero {
  type: HeroDef;
  tier: number;
  attacksRemainingForAbility: number;
  abilityUses: number;
  isOverheated: boolean;
  overheatCooldown: number;
  aimAngle: number;
  attackProgress: number;
}

interface Projectile {
  x: number;
  y: number;
  heroId: HeroId;
  tier: number;
  targetEnemy: Enemy | null;
  targetX: number;
  targetY: number;
  damage: number;
  speed: number;
  color: number;
  rotation: number;
  spinSpeed?: number;
  isCleave?: boolean;
  isSplashFreeze?: boolean;
  gfx: Graphics;
}

interface Enemy {
  id: number;
  type: EnemyId;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  currentSpeed: number;
  distanceProgress: number;
  waypointIndex: number;
  isBoss: boolean;
  freezeTimer: number;
  hitFlinchTimer: number;
  flinchX: number;
  flinchY: number;
  walkCycleTimer: number;
  container: Container;
  sprite: Sprite;
  hpBar: Graphics;
}

interface LaneHazard {
  id: string;
  type: string;
  x: number;
  y: number;
  radius: number;
  duration: number;
  hp?: number;
  color: number;
  level: number;
  container: Container;
  gfx: Graphics;
}

interface FloatingText {
  text: Text;
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: number;
  size: number;
  gfx: Graphics;
}

type TargetMode = 'FIRST' | 'LAST' | 'STRONGEST' | 'WEAKEST';
const TARGET_MODES: TargetMode[] = ['FIRST', 'LAST', 'STRONGEST', 'WEAKEST'];
let currentTargetModeIndex = 0;

const WAYPOINTS = [
  { x: 175, y: 485 },
  { x: 175, y: 100 },
  { x: 785, y: 100 },
  { x: 785, y: 470 }
];

interface SaveData {
  unlockedLevel: number;
  sovereignDucats: number;
  antimatter: number;
  equippedDeckIds: HeroId[];
  unlockedHeroIds: HeroId[];
  heroLevels: Record<string, number>;
  stars: Record<number, number>;
}

function loadSaveData(): SaveData {
  const defaultData: SaveData = {
    unlockedLevel: 1,
    sovereignDucats: 800,
    antimatter: 15,
    equippedDeckIds: ['archer', 'knight', 'horseman', 'mage', 'trebuchet'],
    unlockedHeroIds: ['archer', 'knight', 'horseman', 'mage', 'trebuchet'],
    heroLevels: { archer: 1, knight: 1, horseman: 1, mage: 1, trebuchet: 1 },
    stars: {}
  };

  const raw = localStorage.getItem('keykeep_medieval_v5');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        ...defaultData,
        ...parsed,
        equippedDeckIds: Array.isArray(parsed.equippedDeckIds) && parsed.equippedDeckIds.length === 5 ? parsed.equippedDeckIds : defaultData.equippedDeckIds,
        unlockedHeroIds: Array.isArray(parsed.unlockedHeroIds) ? parsed.unlockedHeroIds : defaultData.unlockedHeroIds,
        heroLevels: typeof parsed.heroLevels === 'object' && parsed.heroLevels ? parsed.heroLevels : defaultData.heroLevels
      };
    } catch (_) {}
  }
  return defaultData;
}

function writeSaveData(data: SaveData) {
  localStorage.setItem('keykeep_medieval_v5', JSON.stringify(data));
}

let saveData = loadSaveData();
let currentCampaignLevel = 1;
const TOTAL_CAMPAIGN_LEVELS = 20;

type GameState = 'MENU' | 'BATTLE';
type MenuTab = 'HOME' | 'CARDS' | 'PORTALS';
let gameState: GameState = 'MENU';
let currentMenuTab: MenuTab = 'HOME';

let mana = 160;
let summonCost = 40;
let castleHp = 100;
let isGameOver = false;
let isVictory = false;
let endlessMode = false;

let currentWave = 1;
let maxWavesForLevel = 4;
let waveEnemiesSpawned = 0;
let waveEnemiesTotal = 10;
let waveSpawnInterval = 1.5;
let spawnTimer = 0;
let bossSpawnedThisWave = false;
let waveIntermissionTimer = 0;

const grid: (GridHero | null)[] = new Array(15).fill(null);
let enemies: Enemy[] = [];
let projectiles: Projectile[] = [];
let hazards: LaneHazard[] = [];
let floatingTexts: FloatingText[] = [];
let particles: Particle[] = [];
let nextEnemyId = 1;

let screenShakeTimer = 0;
let screenShakeMagnitude = 0;

function triggerScreenShake(magnitude = 4, duration = 0.15) {
  screenShakeMagnitude = magnitude;
  screenShakeTimer = duration;
}

function spawnImpactParticles(container: Container, x: number, y: number, color: number, count = 6) {
  for (let i = 0; i < count; i++) {
    const pGfx = new Graphics();
    const size = 2 + Math.random() * 2.5;
    pGfx.circle(0, 0, size);
    pGfx.fill(color);
    pGfx.position.set(x, y);
    container.addChild(pGfx);

    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 90;

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.25 + Math.random() * 0.15,
      maxLife: 0.4,
      color,
      size,
      gfx: pGfx
    });
  }
}

async function run() {
  const app = new Application();
  
  if ('init' in app && typeof (app as any).init === 'function') {
    await (app as any).init({
      resizeTo: window,
      backgroundColor: 0x070b14,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true
    });
  }

  const appContainer = document.getElementById('app') || document.body;
  const canvasElement = (app as any).canvas || (app as any).view;
  if (canvasElement && !canvasElement.parentElement) {
    appContainer.appendChild(canvasElement);
  }

  const battleRoot = new Container();
  const menuRoot = new Container();
  app.stage.addChild(battleRoot, menuRoot);

  function screenToStage(clientX: number, clientY: number): { x: number; y: number } {
    const rect = (canvasElement || app.canvas).getBoundingClientRect();
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;
    return {
      x: (rawX - app.stage.position.x) / app.stage.scale.x,
      y: (rawY - app.stage.position.y) / app.stage.scale.y
    };
  }

  function resizeGameView() {
    const winW = window.innerWidth || VIRTUAL_WIDTH;
    const winH = window.innerHeight || VIRTUAL_HEIGHT;
    const scale = Math.max(0.1, Math.min(winW / VIRTUAL_WIDTH, winH / VIRTUAL_HEIGHT));

    app.stage.scale.set(scale);
    app.stage.position.set(
      (winW - VIRTUAL_WIDTH * scale) / 2,
      (winH - VIRTUAL_HEIGHT * scale) / 2
    );
  }
  window.addEventListener('resize', resizeGameView);
  resizeGameView();

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  function getEquippedHeroDeck(): HeroDef[] {
    return saveData.equippedDeckIds.map(id => {
      const def = ALL_HEROES.find(h => h.id === id);
      return def ? { ...def, level: saveData.heroLevels[id] || 1 } : ALL_HEROES[0];
    });
  }

  // Layers
  const backgroundLayer = new Container();
  const trackLayer = new Container();
  const hazardLayer = new Container();
  const enemyLayer = new Container();
  const battlementLayer = new Container();
  const gridLayer = new Container();
  const projectileLayer = new Container();
  const floatLayer = new Container();
  const uiLayer = new Container();
  const modalLayer = new Container();

  battleRoot.addChild(
    backgroundLayer,
    trackLayer,
    hazardLayer,
    enemyLayer,
    battlementLayer,
    gridLayer,
    projectileLayer,
    floatLayer,
    uiLayer,
    modalLayer
  );

  // --- WAR ROOM MENU ---
  function renderStartMenu() {
    menuRoot.removeChildren();

    const tableBg = new Graphics();
    tableBg.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    tableBg.fill(0x180f0a);
    tableBg.circle(480, 320, 360);
    tableBg.fill({ color: 0x271409, alpha: 0.5 });
    menuRoot.addChild(tableBg);

    const mapGfx = new Graphics();
    mapGfx.roundRect(40, 80, 880, 480, 10);
    mapGfx.fill({ color: 0x000000, alpha: 0.6 });
    mapGfx.roundRect(36, 76, 888, 480, 10);
    mapGfx.fill(0xd2b78b);
    mapGfx.stroke({ width: 3.5, color: 0x6e3c0f });

    mapGfx.circle(480, 300, 150);
    mapGfx.stroke({ width: 1.5, color: 0x854d0e, alpha: 0.25 });
    mapGfx.moveTo(480, 140); mapGfx.lineTo(480, 460);
    mapGfx.moveTo(320, 300); mapGfx.lineTo(640, 300);
    mapGfx.stroke({ width: 1, color: 0x854d0e, alpha: 0.25 });
    menuRoot.addChild(mapGfx);

    const topBar = new Graphics();
    topBar.roundRect(14, 10, 932, 54, 8);
    topBar.fill(0x181411);
    topBar.stroke({ width: 2.5, color: 0x78350f });
    menuRoot.addChild(topBar);

    // Ducats
    const goldPill = new Graphics();
    goldPill.roundRect(30, 18, 170, 38, 6);
    goldPill.fill(0x271a12);
    goldPill.stroke({ width: 1.5, color: 0xd97706 });
    goldPill.circle(48, 37, 10);
    goldPill.fill(0xfacc15);
    goldPill.stroke({ width: 2, color: 0x854d0e });
    menuRoot.addChild(goldPill);

    const goldText = new Text({
      text: `${saveData.sovereignDucats} Ducats`,
      style: new TextStyle({ fill: '#fef08a', fontSize: 13, fontWeight: 'bold' })
    });
    goldText.position.set(66, 28);
    menuRoot.addChild(goldText);

    // Antimatter
    const amPill = new Graphics();
    amPill.roundRect(220, 18, 190, 38, 6);
    amPill.fill(0x1e102e);
    amPill.stroke({ width: 1.5, color: 0xa855f7 });
    amPill.poly([236, 28, 244, 28, 248, 37, 240, 46, 232, 37]);
    amPill.fill(0xc084fc);
    menuRoot.addChild(amPill);

    const amText = new Text({
      text: `🌀 ${saveData.antimatter} Antimatter`,
      style: new TextStyle({ fill: '#e9d5ff', fontSize: 13, fontWeight: 'bold' })
    });
    amText.position.set(256, 28);
    menuRoot.addChild(amText);

    // Fullscreen Button
    const fsBtn = new Graphics();
    fsBtn.roundRect(0, 0, 115, 34, 6);
    fsBtn.fill(0x271a12);
    fsBtn.stroke({ width: 1.5, color: 0x92400e });
    fsBtn.position.set(810, 20);
    fsBtn.eventMode = 'static';
    fsBtn.cursor = 'pointer';

    const fsLabel = new Text({
      text: '⛶ Fullscreen',
      style: new TextStyle({ fill: '#fef08a', fontSize: 12, fontWeight: 'bold' })
    });
    fsLabel.anchor.set(0.5);
    fsLabel.position.set(57, 17);
    fsBtn.addChild(fsLabel);
    fsBtn.on('pointerdown', () => {
      sound.playKeypress();
      toggleFullscreen();
    });
    menuRoot.addChild(fsBtn);

    const tabContainer = new Container();
    tabContainer.position.set(0, 80);
    menuRoot.addChild(tabContainer);

    if (currentMenuTab === 'HOME') renderWarRoomHomeTab(tabContainer);
    else if (currentMenuTab === 'CARDS') renderGarrisonCardsTab(tabContainer);
    else if (currentMenuTab === 'PORTALS') renderAntimatterPortalsTab(tabContainer);

    // 3 Clean Tabs
    const bottomNav = new Graphics();
    bottomNav.rect(0, 565, VIRTUAL_WIDTH, 75);
    bottomNav.fill(0x0e0906);
    bottomNav.stroke({ width: 2, color: 0x6e3c0f });
    menuRoot.addChild(bottomNav);

    const tabs: { id: MenuTab; title: string; crest: string }[] = [
      { id: 'HOME', title: 'War Room', crest: '⚔️' },
      { id: 'CARDS', title: 'Cards & Deck', crest: '🛡️' },
      { id: 'PORTALS', title: 'Antimatter Portals', crest: '🌀' }
    ];

    tabs.forEach((tab, idx) => {
      const bx = 160 + idx * 240;
      const isActive = currentMenuTab === tab.id;

      const pennant = new Container();
      pennant.position.set(bx, 572);
      pennant.eventMode = 'static';
      pennant.cursor = 'pointer';

      const flag = new Graphics();
      flag.roundRect(0, 0, 200, 54, 6);
      flag.fill(isActive ? 0x7c2d12 : 0x1f140e);
      flag.stroke({ width: 2, color: isActive ? 0xfacc15 : 0x78350f });
      pennant.addChild(flag);

      const label = new Text({
        text: `${tab.crest} ${tab.title}`,
        style: new TextStyle({
          fill: isActive ? '#fef08a' : '#a8a29e',
          fontSize: 14,
          fontWeight: 'bold'
        })
      });
      label.anchor.set(0.5);
      label.position.set(100, 27);
      pennant.addChild(label);

      pennant.on('pointerdown', () => {
        sound.playKeypress();
        currentMenuTab = tab.id;
        renderStartMenu();
      });

      menuRoot.addChild(pennant);
    });
  }

  function renderWarRoomHomeTab(parent: Container) {
    const title = new Text({
      text: `CAMPAIGN STAGE ${currentCampaignLevel}: THE BATTLE REDOUBT`,
      style: new TextStyle({ fill: '#451a03', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 })
    });
    title.anchor.set(0.5);
    title.position.set(480, 24);
    parent.addChild(title);

    const deckLabel = new Text({
      text: 'ACTIVE 5-HERO BATTLE FORMATION (Click to Inspect Profile)',
      style: new TextStyle({ fill: '#78350f', fontSize: 12, fontWeight: 'bold' })
    });
    deckLabel.anchor.set(0.5);
    deckLabel.position.set(480, 58);
    parent.addChild(deckLabel);

    const activeDeck = getEquippedHeroDeck();
    const cStartX = 180;
    const cY = 80;
    const cW = 105;
    const cH = 145;
    const gap = 18;

    activeDeck.forEach((hero, idx) => {
      const card = new Container();
      card.position.set(cStartX + idx * (cW + gap), cY);

      const bg = new Graphics();
      bg.roundRect(0, 0, cW, cH, 8);
      bg.fill(0x1c120c);
      bg.stroke({ width: 2.5, color: hero.pedestalColor });
      card.addChild(bg);

      const sprite = new Sprite(getHeroAnimationFrames(hero.id)[0]);
      sprite.anchor.set(0.5);
      sprite.position.set(cW / 2, 48);
      sprite.width = 54;
      sprite.height = 54;
      card.addChild(sprite);

      const name = new Text({
        text: hero.name,
        style: new TextStyle({ fill: '#fef08a', fontSize: 13, fontWeight: 'bold' })
      });
      name.anchor.set(0.5);
      name.position.set(cW / 2, 92);
      card.addChild(name);

      const lvl = new Text({
        text: `Lvl ${hero.level}`,
        style: new TextStyle({ fill: '#bae6fd', fontSize: 11, fontWeight: 'bold' })
      });
      lvl.anchor.set(0.5);
      lvl.position.set(cW / 2, 114);
      card.addChild(lvl);

      card.eventMode = 'static';
      card.cursor = 'pointer';
      card.on('pointerdown', () => {
        sound.playKeypress();
        openHeroProfileModal(hero);
      });

      parent.addChild(card);
    });

    const marchBtn = new Container();
    marchBtn.position.set(480, 290);
    marchBtn.eventMode = 'static';
    marchBtn.cursor = 'pointer';

    const btnW = 320;
    const btnH = 74;

    const shadow = new Graphics();
    shadow.roundRect(-btnW / 2, -btnH / 2 + 8, btnW, btnH, 12);
    shadow.fill(0x271206);
    marchBtn.addChild(shadow);

    const plate = new Graphics();
    plate.roundRect(-btnW / 2, -btnH / 2, btnW, btnH - 6, 12);
    plate.fill(0x991b1b);
    plate.stroke({ width: 4, color: 0xfacc15 });
    marchBtn.addChild(plate);

    const marchText = new Text({
      text: '⚔️ MARCH TO WAR',
      style: new TextStyle({ fill: '#ffffff', fontSize: 26, fontWeight: 'bold', stroke: { width: 4, color: '#450a0a' } })
    });
    marchText.anchor.set(0.5);
    marchText.position.set(0, -6);
    marchBtn.addChild(marchText);

    const subText = new Text({
      text: `DEFEND KEEP • EARN +1 ANTIMATTER PER WAVE`,
      style: new TextStyle({ fill: '#fef08a', fontSize: 10, fontWeight: 'bold' })
    });
    subText.anchor.set(0.5);
    subText.position.set(0, 18);
    marchBtn.addChild(subText);

    marchBtn.on('pointerdown', () => {
      sound.playWarHorn();
      startMatch();
    });
    parent.addChild(marchBtn);

    const guideBox = new Graphics();
    guideBox.roundRect(180, 360, 600, 95, 8);
    guideBox.fill({ color: 0x78350f, alpha: 0.15 });
    guideBox.stroke({ width: 1.5, color: 0x854d0e });
    parent.addChild(guideBox);

    const guideText = new Text({
      text: 'WARROOM TACTICS & COMMANDS:\n• Press [Space] in battle to summon heroes using Soul Aether.\n• Strike [E, R, T, Y, U, D, F, G, H, J, C, V, B, N, M] to attack.\n• Drag matching heroes of the same tier together to merge.\n• Every completed wave awards +1 Antimatter for Portals!',
      style: new TextStyle({ fill: '#451a03', fontSize: 12, fontWeight: 'bold', leading: 4 })
    });
    guideText.position.set(200, 372);
    parent.addChild(guideText);
  }

  function renderGarrisonCardsTab(parent: Container) {
    const title = new Text({
      text: 'ROYAL GARRISON: INSPECT & CONFIGURE DECK',
      style: new TextStyle({ fill: '#451a03', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 })
    });
    title.anchor.set(0.5);
    title.position.set(480, 20);
    parent.addChild(title);

    const cW = 100;
    const cH = 140;
    const startX = 60;
    const gap = 12;

    ALL_HEROES.forEach((hero, idx) => {
      const isEquipped = saveData.equippedDeckIds.includes(hero.id);
      const isUnlocked = saveData.unlockedHeroIds.includes(hero.id);
      const level = saveData.heroLevels[hero.id] || 1;

      const col = idx % 8;
      const row = Math.floor(idx / 8);

      const card = new Container();
      card.position.set(startX + col * (cW + gap), 50 + row * (cH + gap));

      const bg = new Graphics();
      bg.roundRect(0, 0, cW, cH, 8);
      bg.fill(isUnlocked ? 0x1c120c : 0x090604);
      bg.stroke({ width: isEquipped ? 3 : 1.5, color: isEquipped ? 0xfacc15 : isUnlocked ? hero.pedestalColor : 0x57321a });
      card.addChild(bg);

      if (isEquipped) {
        const badge = new Graphics();
        badge.roundRect(4, 4, 48, 16, 4);
        badge.fill(0xfacc15);
        card.addChild(badge);

        const bText = new Text({
          text: 'DECK',
          style: new TextStyle({ fill: '#000000', fontSize: 9, fontWeight: 'bold' })
        });
        bText.anchor.set(0.5);
        bText.position.set(28, 12);
        badge.addChild(bText);
      }

      const sprite = new Sprite(getHeroAnimationFrames(hero.id)[0]);
      sprite.anchor.set(0.5);
      sprite.position.set(cW / 2, 52);
      sprite.width = 46;
      sprite.height = 46;
      if (!isUnlocked) sprite.tint = 0x475569;
      card.addChild(sprite);

      const name = new Text({
        text: hero.name,
        style: new TextStyle({ fill: isUnlocked ? '#fef08a' : '#78716c', fontSize: 12, fontWeight: 'bold' })
      });
      name.anchor.set(0.5);
      name.position.set(cW / 2, 92);
      card.addChild(name);

      const status = new Text({
        text: isUnlocked ? `Lvl ${level}` : 'LOCKED',
        style: new TextStyle({ fill: isUnlocked ? '#38bdf8' : '#ef4444', fontSize: 10, fontWeight: 'bold' })
      });
      status.anchor.set(0.5);
      status.position.set(cW / 2, 114);
      card.addChild(status);

      card.eventMode = 'static';
      card.cursor = 'pointer';
      card.on('pointerdown', () => {
        sound.playKeypress();
        openHeroProfileModal(hero);
      });

      parent.addChild(card);
    });

    const info = new Text({
      text: 'Click any hero card above to view full Damage, Health, Defense stats, Upgrade, or Equip to Deck.',
      style: new TextStyle({ fill: '#78350f', fontSize: 12, fontWeight: 'bold' })
    });
    info.anchor.set(0.5);
    info.position.set(480, 440);
    parent.addChild(info);
  }

  function openHeroProfileModal(heroDef: HeroDef) {
    modalLayer.removeChildren();

    const isUnlocked = saveData.unlockedHeroIds.includes(heroDef.id);
    const isEquipped = saveData.equippedDeckIds.includes(heroDef.id);
    const level = saveData.heroLevels[heroDef.id] || 1;
    const dmg = heroDef.baseDamage * level;
    const hp = heroDef.vitalityHp * level;
    const def = heroDef.armorDefense * level;

    const overlay = new Graphics();
    overlay.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    overlay.fill({ color: 0x000000, alpha: 0.85 });
    modalLayer.addChild(overlay);

    const scroll = new Graphics();
    scroll.roundRect(240, 60, 480, 500, 12);
    scroll.fill(0xd6be96);
    scroll.stroke({ width: 4, color: 0x6e3c0f });
    modalLayer.addChild(scroll);

    const sprite = new Sprite(getHeroAnimationFrames(heroDef.id)[0]);
    sprite.anchor.set(0.5);
    sprite.position.set(480, 140);
    sprite.width = 96;
    sprite.height = 96;
    if (!isUnlocked) sprite.tint = 0x57534e;
    modalLayer.addChild(sprite);

    const name = new Text({
      text: heroDef.name.toUpperCase(),
      style: new TextStyle({ fill: '#451a03', fontSize: 24, fontWeight: 'bold', letterSpacing: 2 })
    });
    name.anchor.set(0.5);
    name.position.set(480, 205);
    modalLayer.addChild(name);

    const title = new Text({
      text: `${heroDef.title} • Level ${level}`,
      style: new TextStyle({ fill: '#854d0e', fontSize: 13, fontWeight: 'bold' })
    });
    title.anchor.set(0.5);
    title.position.set(480, 230);
    modalLayer.addChild(title);

    const statBox = new Graphics();
    statBox.roundRect(270, 255, 420, 115, 8);
    statBox.fill({ color: 0x000000, alpha: 0.1 });
    statBox.stroke({ width: 1.5, color: 0x854d0e });
    modalLayer.addChild(statBox);

    const statsText = new Text({
      text: `⚔️ ATTACK DAMAGE: ${dmg} pts (Scales with merge tier)\n❤️ VITALITY (HP): ${hp} pts (Fortifies keep resistance)\n🛡️ ARMOR DEFENSE: ${def} rating (Reduces monster penetration)\n⚡ VELOCITY: ${heroDef.projSpeed} px/s  |  RADIUS: ${heroDef.projRadius}`,
      style: new TextStyle({ fill: '#271206', fontSize: 12, fontWeight: 'bold', leading: 6 })
    });
    statsText.position.set(285, 268);
    modalLayer.addChild(statsText);

    const abilityText = new Text({
      text: `EMPOWERED ABILITY: ${heroDef.abilityName}\n${heroDef.description}`,
      style: new TextStyle({ fill: '#78350f', fontSize: 12, fontWeight: 'bold', wordWrap: true, wordWrapWidth: 400 })
    });
    abilityText.position.set(280, 385);
    modalLayer.addChild(abilityText);

    if (isUnlocked) {
      const equipBtn = new Graphics();
      equipBtn.roundRect(270, 470, 190, 44, 8);
      equipBtn.fill(isEquipped ? 0x475569 : 0x16a34a);
      equipBtn.stroke({ width: 2, color: isEquipped ? 0x94a3b8 : 0x86efac });
      modalLayer.addChild(equipBtn);

      const equipLabel = new Text({
        text: isEquipped ? 'IN ACTIVE DECK' : 'EQUIP TO DECK',
        style: new TextStyle({ fill: '#ffffff', fontSize: 12, fontWeight: 'bold' })
      });
      equipLabel.anchor.set(0.5);
      equipLabel.position.set(365, 492);
      modalLayer.addChild(equipLabel);

      if (!isEquipped) {
        equipBtn.eventMode = 'static';
        equipBtn.cursor = 'pointer';
        equipBtn.on('pointerdown', () => {
          sound.playUpgrade();
          saveData.equippedDeckIds.shift();
          saveData.equippedDeckIds.push(heroDef.id);
          writeSaveData(saveData);
          openHeroProfileModal(heroDef);
        });
      }

      const upCost = UPGRADE_COSTS[level] || 1200;
      const canUpgrade = saveData.sovereignDucats >= upCost && level < 4;

      const upBtn = new Graphics();
      upBtn.roundRect(490, 470, 200, 44, 8);
      upBtn.fill(canUpgrade ? 0xb45309 : 0x271a12);
      upBtn.stroke({ width: 2, color: canUpgrade ? 0xfacc15 : 0x57321a });
      modalLayer.addChild(upBtn);

      const upLabel = new Text({
        text: level >= 4 ? 'MAX LEVEL' : `UPGRADE (${upCost} 🪙)`,
        style: new TextStyle({ fill: canUpgrade ? '#ffffff' : '#78716c', fontSize: 12, fontWeight: 'bold' })
      });
      upLabel.anchor.set(0.5);
      upLabel.position.set(590, 492);
      modalLayer.addChild(upLabel);

      if (canUpgrade) {
        upBtn.eventMode = 'static';
        upBtn.cursor = 'pointer';
        upBtn.on('pointerdown', () => {
          saveData.sovereignDucats -= upCost;
          saveData.heroLevels[heroDef.id] = (saveData.heroLevels[heroDef.id] || 1) + 1;
          sound.playUpgrade();
          writeSaveData(saveData);
          openHeroProfileModal(heroDef);
        });
      }
    } else {
      const lockNotice = new Text({
        text: 'LOCKED HERO: SUMMON FROM ANTIMATTER PORTALS TAB TO UNLOCK',
        style: new TextStyle({ fill: '#991b1b', fontSize: 11, fontWeight: 'bold' })
      });
      lockNotice.anchor.set(0.5);
      lockNotice.position.set(480, 485);
      modalLayer.addChild(lockNotice);
    }

    const closeBtn = new Graphics();
    closeBtn.circle(700, 80, 16);
    closeBtn.fill(0x7f1d1d);
    closeBtn.stroke({ width: 2, color: 0xfacc15 });
    modalLayer.addChild(closeBtn);

    const closeTxt = new Text({
      text: '✕',
      style: new TextStyle({ fill: '#ffffff', fontSize: 16, fontWeight: 'bold' })
    });
    closeTxt.anchor.set(0.5);
    closeTxt.position.set(700, 80);
    modalLayer.addChild(closeTxt);

    closeBtn.eventMode = 'static';
    closeBtn.cursor = 'pointer';
    closeBtn.on('pointerdown', () => {
      modalLayer.removeChildren();
      renderStartMenu();
    });
  }

  function renderAntimatterPortalsTab(parent: Container) {
    const title = new Text({
      text: 'ANTIMATTER SUMMONING SANCTUM',
      style: new TextStyle({ fill: '#451a03', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 })
    });
    title.anchor.set(0.5);
    title.position.set(480, 20);
    parent.addChild(title);

    const subtitle = new Text({
      text: 'Each wave completed in battle awards +1 Antimatter! Channel them to unlock all 10 heroes.',
      style: new TextStyle({ fill: '#78350f', fontSize: 12, fontWeight: 'bold' })
    });
    subtitle.anchor.set(0.5);
    subtitle.position.set(480, 45);
    parent.addChild(subtitle);

    const portals = [
      { name: 'Astral Portal', cost: 5, color: 0x38bdf8, desc: 'Summons 1 Hero. Unlocks locked heroes or levels up roster.' },
      { name: 'Void Singularity', cost: 12, color: 0xc084fc, desc: 'Guaranteed locked Hero Unlock + 300 Sovereign Ducats!' }
    ];

    portals.forEach((p, idx) => {
      const box = new Container();
      box.position.set(160 + idx * 340, 75);

      const bg = new Graphics();
      bg.roundRect(0, 0, 300, 340, 12);
      bg.fill(0x1a0f26);
      bg.stroke({ width: 3, color: p.color });
      box.addChild(bg);

      const vortex = new Graphics();
      vortex.circle(150, 110, 60);
      vortex.fill({ color: p.color, alpha: 0.25 });
      vortex.stroke({ width: 3, color: p.color });
      vortex.circle(150, 110, 35);
      vortex.fill({ color: 0xffffff, alpha: 0.8 });
      box.addChild(vortex);

      const pTitle = new Text({
        text: p.name,
        style: new TextStyle({ fill: '#ffffff', fontSize: 18, fontWeight: 'bold' })
      });
      pTitle.anchor.set(0.5);
      pTitle.position.set(150, 195);
      box.addChild(pTitle);

      const pDesc = new Text({
        text: p.desc,
        style: new TextStyle({ fill: '#cbd5e1', fontSize: 12, align: 'center', wordWrap: true, wordWrapWidth: 260 })
      });
      pDesc.anchor.set(0.5);
      pDesc.position.set(150, 235);
      box.addChild(pDesc);

      const canAfford = saveData.antimatter >= p.cost;

      const summonBtn = new Graphics();
      summonBtn.roundRect(30, 275, 240, 44, 8);
      summonBtn.fill(canAfford ? 0x7c3aed : 0x271a12);
      summonBtn.stroke({ width: 2, color: canAfford ? 0xfacc15 : 0x57321a });
      box.addChild(summonBtn);

      const btnText = new Text({
        text: `CHANNEL (${p.cost} 🌀)`,
        style: new TextStyle({ fill: canAfford ? '#ffffff' : '#78716c', fontSize: 14, fontWeight: 'bold' })
      });
      btnText.anchor.set(0.5);
      btnText.position.set(150, 297);
      box.addChild(btnText);

      if (canAfford) {
        summonBtn.eventMode = 'static';
        summonBtn.cursor = 'pointer';
        summonBtn.on('pointerdown', () => {
          saveData.antimatter -= p.cost;
          sound.playMagicBlast();

          const locked = ALL_HEROES.filter(h => !saveData.unlockedHeroIds.includes(h.id));
          if (locked.length > 0) {
            const unlockedHero = locked[Math.floor(Math.random() * locked.length)];
            saveData.unlockedHeroIds.push(unlockedHero.id);
            saveData.heroLevels[unlockedHero.id] = 1;
            writeSaveData(saveData);
            openHeroProfileModal(unlockedHero);
          } else {
            const randomHero = ALL_HEROES[Math.floor(Math.random() * ALL_HEROES.length)];
            saveData.heroLevels[randomHero.id] = (saveData.heroLevels[randomHero.id] || 1) + 1;
            saveData.sovereignDucats += 350;
            writeSaveData(saveData);
            openHeroProfileModal(randomHero);
          }
        });
      }

      parent.addChild(box);
    });
  }

  function startMatch() {
    gameState = 'BATTLE';
    menuRoot.visible = false;
    battleRoot.visible = true;
    restartMatch(false);
    app.render();
  }

  function returnToMenu() {
    gameState = 'MENU';
    modalLayer.removeChildren();
    menuRoot.visible = true;
    battleRoot.visible = false;
    renderStartMenu();
  }

  // --- BATTLEFIELD ENVIRONMENT ---
  const terrain = new Graphics();
  terrain.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
  terrain.fill(0x355e3b);
  terrain.ellipse(480, 280, 430, 260);
  terrain.fill({ color: 0x417048, alpha: 0.8 });

  terrain.roundRect(-24, -24, 140, 210, 24);
  terrain.fill(0x382c26);
  terrain.roundRect(-20, -20, 130, 200, 20);
  terrain.fill(0x54433a);
  terrain.roundRect(-22, -22, 118, 185, 18);
  terrain.fill(0x4a7a40);

  terrain.roundRect(844, -24, 140, 210, 24);
  terrain.fill(0x382c26);
  terrain.roundRect(850, -20, 130, 200, 20);
  terrain.fill(0x54433a);
  terrain.roundRect(862, -22, 120, 185, 18);
  terrain.fill(0x4a7a40);

  const trees = [
    { x: 50, y: 250, r: 24 }, { x: 45, y: 350, r: 26 },
    { x: 915, y: 250, r: 24 }, { x: 910, y: 350, r: 26 },
    { x: 65, y: 580, r: 22 }
  ];
  trees.forEach(t => {
    terrain.ellipse(t.x + 4, t.y + 7, t.r + 3, t.r * 0.6);
    terrain.fill({ color: 0x142012, alpha: 0.5 });
    terrain.circle(t.x, t.y, t.r);
    terrain.fill(0x1e461b);
    terrain.circle(t.x - 2, t.y - 3, t.r * 0.82);
    terrain.fill(0x2f6b2b);
  });
  backgroundLayer.addChild(terrain);

  const roadBase = new Graphics();
  roadBase.moveTo(WAYPOINTS[0].x, WAYPOINTS[0].y);
  roadBase.lineTo(WAYPOINTS[1].x, WAYPOINTS[1].y);
  roadBase.lineTo(WAYPOINTS[2].x, WAYPOINTS[2].y);
  roadBase.lineTo(WAYPOINTS[3].x, WAYPOINTS[3].y);
  roadBase.stroke({ width: 70, color: 0x24361e, cap: 'round', join: 'round' });

  roadBase.moveTo(WAYPOINTS[0].x, WAYPOINTS[0].y);
  roadBase.lineTo(WAYPOINTS[1].x, WAYPOINTS[1].y);
  roadBase.lineTo(WAYPOINTS[2].x, WAYPOINTS[2].y);
  roadBase.lineTo(WAYPOINTS[3].x, WAYPOINTS[3].y);
  roadBase.stroke({ width: 62, color: 0x61544a, cap: 'round', join: 'round' });

  roadBase.moveTo(WAYPOINTS[0].x, WAYPOINTS[0].y);
  roadBase.lineTo(WAYPOINTS[1].x, WAYPOINTS[1].y);
  roadBase.lineTo(WAYPOINTS[2].x, WAYPOINTS[2].y);
  roadBase.lineTo(WAYPOINTS[3].x, WAYPOINTS[3].y);
  roadBase.stroke({ width: 50, color: 0xab8e67, cap: 'round', join: 'round' });
  trackLayer.addChild(roadBase);

  const portalGfx = new Graphics();
  portalGfx.roundRect(140, 468, 20, 52, 4);
  portalGfx.roundRect(190, 468, 20, 52, 4);
  portalGfx.fill(0x3f3f46);
  portalGfx.stroke({ width: 2, color: 0x71717a });
  portalGfx.ellipse(175, 494, 16, 26);
  portalGfx.fill({ color: 0x581c87, alpha: 0.7 });
  portalGfx.stroke({ width: 2.5, color: 0xc084fc });
  trackLayer.addChild(portalGfx);

  const castleSprite = new Sprite(getSpriteTexture('castle'));
  castleSprite.anchor.set(0.5);
  castleSprite.position.set(785, 480);
  castleSprite.width = 126;
  castleSprite.height = 98;
  trackLayer.addChild(castleSprite);

  const castleHpBarBg = new Graphics();
  castleHpBarBg.roundRect(725, 535, 120, 16, 5);
  castleHpBarBg.fill(0x18181b);
  castleHpBarBg.stroke({ width: 2, color: 0x52525b });
  uiLayer.addChild(castleHpBarBg);

  const castleHpBarFill = new Graphics();
  uiLayer.addChild(castleHpBarFill);

  const castleHpText = new Text({
    text: `Keep: ${castleHp}/100`,
    style: new TextStyle({ fill: '#ffffff', fontSize: 11, fontWeight: 'bold' })
  });
  castleHpText.anchor.set(0.5);
  castleHpText.position.set(785, 543);
  uiLayer.addChild(castleHpText);

  function updateCastleHpVisual() {
    castleHpBarFill.clear();
    const pct = Math.max(0, castleHp / 100);
    castleHpBarFill.roundRect(727, 537, 116 * pct, 12, 4);
    castleHpBarFill.fill(pct > 0.4 ? 0x16a34a : 0xdc2626);
    castleHpText.text = `Keep: ${castleHp}/100`;
  }
  updateCastleHpVisual();

  const cellW = 86;
  const cellH = 86;
  const gridW = cellW * 5;
  const gridH = cellH * 3;
  const wallPad = 12;

  const fX = 265;
  const fY = 156;

  const platform = new Graphics();
  platform.roundRect(fX - wallPad + 4, fY - wallPad + 8, gridW + wallPad * 2, gridH + wallPad * 2, 14);
  platform.fill({ color: 0x142012, alpha: 0.6 });

  platform.roundRect(fX - wallPad, fY - wallPad, gridW + wallPad * 2, gridH + wallPad * 2, 14);
  platform.fill(0x94a3b8);
  platform.stroke({ width: 3.5, color: 0x475569 });

  const pillarRadius = 15;
  const pillars = [
    { x: fX - wallPad + 4, y: fY - wallPad + 4 },
    { x: fX + gridW + wallPad - 4, y: fY - wallPad + 4 },
    { x: fX - wallPad + 4, y: fY + gridH + wallPad - 4 },
    { x: fX + gridW + wallPad - 4, y: fY + gridH + wallPad - 4 }
  ];
  pillars.forEach(pil => {
    platform.circle(pil.x, pil.y, pillarRadius);
    platform.fill(0xcbd5e1);
    platform.stroke({ width: 2.5, color: 0x475569 });
    platform.circle(pil.x, pil.y, 4);
    platform.fill(0xfacc15);
  });

  platform.roundRect(fX + gridW / 2 - 36, fY - wallPad - 3, 72, 13, 3);
  platform.roundRect(fX + gridW / 2 - 36, fY + gridH + wallPad - 10, 72, 13, 3);
  platform.fill(0x1d4ed8);
  platform.stroke({ width: 1.5, color: 0xfacc15 });
  battlementLayer.addChild(platform);

  const tileContainers: Container[] = [];
  const tilePedestals: Graphics[] = [];
  const tileHeroWrappers: Container[] = [];
  const tileHeroSprites: Sprite[] = [];
  const tileChargeBars: Graphics[] = [];
  const tileRestTexts: Text[] = [];

  let draggedIndex: number | null = null;
  let dragGhost: Sprite | null = null;

  for (let i = 0; i < 15; i++) {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const x = fX + col * cellW;
    const y = fY + row * cellH;

    const tile = new Container();
    tile.position.set(x, y);

    const isLightGreen = (col + row) % 2 === 0;
    const lawnColor = isLightGreen ? 0x82b54b : 0x6e9f3d;

    const bg = new Graphics();
    bg.rect(0, 0, cellW, cellH);
    bg.fill(lawnColor);
    bg.stroke({ width: 1, color: 0x4f772d, alpha: 0.4 });
    tile.addChild(bg);

    const keyBadge = new Graphics();
    keyBadge.roundRect(4, 4, 18, 18, 4);
    keyBadge.fill({ color: 0x18181b, alpha: 0.6 });
    tile.addChild(keyBadge);

    const keyTxt = new Text({
      text: KEY_LABELS[i],
      style: new TextStyle({ fill: '#fef08a', fontSize: 10, fontWeight: 'bold' })
    });
    keyTxt.anchor.set(0.5);
    keyTxt.position.set(13, 13);
    tile.addChild(keyTxt);

    const pedestalGfx = new Graphics();
    tile.addChild(pedestalGfx);
    tilePedestals.push(pedestalGfx);

    const heroWrapper = new Container();
    heroWrapper.position.set(cellW / 2, cellH / 2);
    tile.addChild(heroWrapper);
    tileHeroWrappers.push(heroWrapper);

    const heroSprite = new Sprite();
    heroSprite.anchor.set(0.5);
    heroSprite.width = HERO_SIZE;
    heroSprite.height = HERO_SIZE;
    heroSprite.visible = false;
    heroWrapper.addChild(heroSprite);
    tileHeroSprites.push(heroSprite);

    const chargeBar = new Graphics();
    chargeBar.rect(8, cellH - 7, cellW - 16, 3);
    chargeBar.fill(0x0f172a);
    tile.addChild(chargeBar);
    tileChargeBars.push(chargeBar);

    const restText = new Text({
      text: '',
      style: new TextStyle({ fill: '#ef4444', fontSize: 11, fontWeight: 'bold', align: 'center' })
    });
    restText.anchor.set(0.5);
    restText.position.set(cellW / 2, cellH / 2);
    tile.addChild(restText);
    tileRestTexts.push(restText);

    tile.eventMode = 'static';
    tile.cursor = 'pointer';

    tile.on('pointerdown', (e) => {
      if (grid[i] !== null && !grid[i]?.isOverheated && !isGameOver) {
        draggedIndex = i;
        dragGhost = new Sprite(getHeroAnimationFrames(grid[i]!.type.id)[0]);
        dragGhost.anchor.set(0.5);
        dragGhost.width = HERO_SIZE;
        dragGhost.height = HERO_SIZE;
        dragGhost.alpha = 0.85;

        const stagePos = screenToStage(e.global.x, e.global.y);
        dragGhost.position.set(stagePos.x, stagePos.y);
        gridLayer.addChild(dragGhost);
      }
    });

    tileContainers.push(tile);
    gridLayer.addChild(tile);
  }

  const studsGfx = new Graphics();
  for (let c = 1; c < 5; c++) {
    for (let r = 1; r < 3; r++) {
      const sx = fX + c * cellW;
      const sy = fY + r * cellH;
      studsGfx.circle(sx, sy, 4.5);
      studsGfx.fill(0xf8fafc);
      studsGfx.stroke({ width: 1.5, color: 0x475569 });
    }
  }
  gridLayer.addChild(studsGfx);

  function renderHeroPedestal(gfx: Graphics, hero: GridHero, cx: number, cy: number) {
    gfx.clear();
    const color = hero.type.pedestalColor;
    const tier = hero.tier;

    if (tier === 1) {
      const r = 26;
      gfx.circle(cx, cy, r + 2);
      gfx.stroke({ width: 2.5, color: 0xffffff });
      gfx.circle(cx, cy, r);
      gfx.fill({ color, alpha: 0.85 });
      gfx.stroke({ width: 1.5, color: 0xffffff, alpha: 0.6 });
    } else if (tier === 2) {
      const len = 34;
      const w = 18;
      gfx.moveTo(cx - len * 0.7, cy + len * 0.7);
      gfx.quadraticCurveTo(cx - w * 0.8, cy - w * 0.8, cx + len * 0.7, cy - len * 0.7);
      gfx.quadraticCurveTo(cx + w * 0.8, cy + w * 0.8, cx - len * 0.7, cy + len * 0.7);
      gfx.fill({ color, alpha: 0.9 });
      gfx.stroke({ width: 2.5, color: 0xffffff });
    } else if (tier === 3) {
      const size = 30;
      const p1 = { x: cx, y: cy - size };
      const p2 = { x: cx + size * 0.95, y: cy + size * 0.75 };
      const p3 = { x: cx - size * 0.95, y: cy + size * 0.75 };
      gfx.poly([p1.x, p1.y, p2.x, p2.y, p3.x, p3.y]);
      gfx.fill({ color, alpha: 0.9 });
      gfx.stroke({ width: 2.5, color: 0xffffff });
    } else if (tier === 4) {
      const s = 25;
      gfx.roundRect(cx - s, cy - s, s * 2, s * 2, 6);
      gfx.fill({ color, alpha: 0.9 });
      gfx.stroke({ width: 2.5, color: 0xffffff });
    } else {
      const size = 30;
      const pts: number[] = [];
      for (let k = 0; k < 5; k++) {
        const ang = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
        pts.push(cx + Math.cos(ang) * size);
        pts.push(cy + Math.sin(ang) * size);
      }
      gfx.poly(pts);
      gfx.fill({ color, alpha: 0.95 });
      gfx.stroke({ width: 3, color: 0xfacc15 });
    }
  }

  window.addEventListener('pointermove', (e) => {
    if (dragGhost && draggedIndex !== null) {
      const { x, y } = screenToStage(e.clientX, e.clientY);
      dragGhost.position.set(x, y);
    }
  });

  window.addEventListener('pointerup', (e) => {
    if (dragGhost) {
      gridLayer.removeChild(dragGhost);
      dragGhost.destroy();
      dragGhost = null;
    }

    if (draggedIndex !== null) {
      const { x, y } = screenToStage(e.clientX, e.clientY);

      let targetIndex: number | null = null;
      for (let i = 0; i < 15; i++) {
        const tile = tileContainers[i];
        if (x >= tile.x && x <= tile.x + cellW && y >= tile.y && y <= tile.y + cellH) {
          targetIndex = i;
          break;
        }
      }

      if (
        targetIndex !== null &&
        targetIndex !== draggedIndex &&
        grid[targetIndex] &&
        grid[draggedIndex]
      ) {
        const src = grid[draggedIndex]!;
        const dest = grid[targetIndex]!;

        if (src.type.id === dest.type.id && src.tier === dest.tier) {
          dest.tier += 1;
          dest.attacksRemainingForAbility = 10;
          grid[draggedIndex] = null;
          sound.playUpgrade();
          spawnFloatingText(`TIER ${dest.tier}!`, tileContainers[targetIndex].x + cellW / 2, tileContainers[targetIndex].y + 15, '#facc15');
          updateTileVisual(draggedIndex);
          updateTileVisual(targetIndex);
        }
      }

      draggedIndex = null;
    }
  });

  function updateTileVisual(idx: number) {
    const hero = grid[idx];
    const pedestal = tilePedestals[idx];
    const sprite = tileHeroSprites[idx];
    const charge = tileChargeBars[idx];
    const restText = tileRestTexts[idx];

    pedestal.clear();
    charge.clear();

    if (!hero) {
      sprite.visible = false;
      restText.text = '';
      charge.rect(8, cellH - 7, cellW - 16, 3);
      charge.fill(0x0f172a);
    } else {
      sprite.texture = getHeroAnimationFrames(hero.type.id)[0];
      sprite.width = HERO_SIZE;
      sprite.height = HERO_SIZE;
      sprite.visible = true;

      if (hero.isOverheated) {
        sprite.alpha = 0.3;
        restText.text = `REST\n${hero.overheatCooldown.toFixed(1)}s`;
      } else {
        sprite.alpha = 1.0;
        restText.text = '';

        renderHeroPedestal(pedestal, hero, cellW / 2, cellH / 2);

        const progress = (10 - hero.attacksRemainingForAbility) / 10;
        charge.rect(8, cellH - 7, (cellW - 16) * progress, 3);
        charge.fill(0xfacc15);
      }
    }
  }

  function spawnFloatingText(msg: string, x: number, y: number, color = '#ffffff') {
    const txt = new Text({
      text: msg,
      style: new TextStyle({ fill: color, fontSize: 13, fontWeight: 'bold' })
    });
    txt.anchor.set(0.5);
    txt.position.set(x, y);
    floatLayer.addChild(txt);

    floatingTexts.push({
      text: txt,
      x,
      y,
      vy: -35,
      life: 0.65,
      maxLife: 0.65
    });
  }

  const hudPlate = new Graphics();
  hudPlate.roundRect(16, 12, 530, 64, 8);
  hudPlate.fill({ color: 0x181411, alpha: 0.95 });
  hudPlate.stroke({ width: 2, color: 0x78350f });
  uiLayer.addChild(hudPlate);

  const manaText = new Text({
    text: `Aether: ${mana}`,
    style: new TextStyle({ fill: '#38bdf8', fontSize: 16, fontWeight: 'bold' })
  });
  manaText.position.set(30, 20);
  uiLayer.addChild(manaText);

  const goldBattleText = new Text({
    text: `Ducats: ${saveData.sovereignDucats}`,
    style: new TextStyle({ fill: '#facc15', fontSize: 15, fontWeight: 'bold' })
  });
  goldBattleText.position.set(30, 46);
  uiLayer.addChild(goldBattleText);

  const levelWaveText = new Text({
    text: `Stage ${currentCampaignLevel} - Wave ${currentWave}/${maxWavesForLevel}`,
    style: new TextStyle({ fill: '#f8fafc', fontSize: 15, fontWeight: 'bold' })
  });
  levelWaveText.position.set(160, 20);
  uiLayer.addChild(levelWaveText);

  const targetBtn = new Graphics();
  targetBtn.roundRect(0, 0, 195, 26, 6);
  targetBtn.fill(0x271a12);
  targetBtn.stroke({ width: 1.5, color: 0x92400e });
  targetBtn.position.set(160, 44);
  targetBtn.eventMode = 'static';
  targetBtn.cursor = 'pointer';

  const targetBtnText = new Text({
    text: `Priority: ${TARGET_MODES[currentTargetModeIndex]} [Tab]`,
    style: new TextStyle({ fill: '#facc15', fontSize: 11, fontWeight: 'bold' })
  });
  targetBtnText.anchor.set(0.5);
  targetBtnText.position.set(97, 13);
  targetBtn.addChild(targetBtnText);
  uiLayer.addChild(targetBtn);

  function cycleTargetMode() {
    currentTargetModeIndex = (currentTargetModeIndex + 1) % TARGET_MODES.length;
    targetBtnText.text = `Priority: ${TARGET_MODES[currentTargetModeIndex]} [Tab]`;
  }
  targetBtn.on('pointerdown', cycleTargetMode);

  const returnBtn = new Graphics();
  returnBtn.roundRect(0, 0, 75, 48, 8);
  returnBtn.fill(0x271a12);
  returnBtn.stroke({ width: 2, color: 0x92400e });
  returnBtn.position.set(455, 20);
  returnBtn.eventMode = 'static';
  returnBtn.cursor = 'pointer';

  const returnBtnText = new Text({
    text: `WAR ROOM`,
    style: new TextStyle({ fill: '#ffffff', fontSize: 11, fontWeight: 'bold' })
  });
  returnBtnText.anchor.set(0.5);
  returnBtnText.position.set(37, 24);
  returnBtn.addChild(returnBtnText);
  uiLayer.addChild(returnBtn);

  returnBtn.on('pointerdown', returnToMenu);

  const summonBtn = new Graphics();
  summonBtn.roundRect(0, 0, 220, 42, 8);
  summonBtn.fill(0x991b1b);
  summonBtn.stroke({ width: 2.5, color: 0xfacc15 });
  summonBtn.position.set(370, 446);
  summonBtn.eventMode = 'static';
  summonBtn.cursor = 'pointer';

  const summonLabel = new Text({
    text: `Summon Hero (${summonCost}) [Space]`,
    style: new TextStyle({ fill: '#ffffff', fontSize: 13, fontWeight: 'bold' })
  });
  summonLabel.anchor.set(0.5);
  summonLabel.position.set(110, 21);
  summonBtn.addChild(summonLabel);
  uiLayer.addChild(summonBtn);

  const upgradeCards: Container[] = [];
  const upgradeCardBgs: Graphics[] = [];
  const upgradeCostTexts: Text[] = [];
  const upgradeLvlTexts: Text[] = [];

  const trayStartX = 236;
  const trayY = 502;
  const cardW = 92;
  const cardH = 96;
  const cardGap = 8;

  function refreshBottomDeckTray() {
    upgradeCards.forEach(c => uiLayer.removeChild(c));
    upgradeCards.length = 0;
    upgradeCardBgs.length = 0;
    upgradeCostTexts.length = 0;
    upgradeLvlTexts.length = 0;

    const equippedDeck = getEquippedHeroDeck();

    equippedDeck.forEach((heroDef, idx) => {
      const card = new Container();
      card.position.set(trayStartX + idx * (cardW + cardGap), trayY);

      const bg = new Graphics();
      bg.roundRect(0, 0, cardW, cardH, 8);
      bg.fill(0x181411);
      bg.stroke({ width: 2, color: heroDef.pedestalColor });
      card.addChild(bg);
      upgradeCardBgs.push(bg);

      const keyBadge = new Text({
        text: `[${idx + 1}]`,
        style: new TextStyle({ fill: '#facc15', fontSize: 11, fontWeight: 'bold' })
      });
      keyBadge.position.set(6, 4);
      card.addChild(keyBadge);

      const charIcon = new Sprite(getHeroAnimationFrames(heroDef.id)[0]);
      charIcon.anchor.set(0.5);
      charIcon.position.set(cardW / 2, 30);
      charIcon.width = 36;
      charIcon.height = 36;
      card.addChild(charIcon);

      const lvlText = new Text({
        text: `Lvl ${heroDef.level}`,
        style: new TextStyle({ fill: '#38bdf8', fontSize: 11, fontWeight: 'bold' })
      });
      lvlText.anchor.set(0.5);
      lvlText.position.set(cardW / 2, 54);
      card.addChild(lvlText);
      upgradeLvlTexts.push(lvlText);

      const costBtn = new Graphics();
      costBtn.roundRect(8, 66, cardW - 16, 24, 6);
      costBtn.fill(0x271a12);
      costBtn.stroke({ width: 1, color: 0x92400e });
      card.addChild(costBtn);

      const costText = new Text({
        text: `▲ 100`,
        style: new TextStyle({ fill: '#facc15', fontSize: 11, fontWeight: 'bold' })
      });
      costText.anchor.set(0.5);
      costText.position.set(cardW / 2, 78);
      card.addChild(costText);
      upgradeCostTexts.push(costText);

      card.eventMode = 'static';
      card.cursor = 'pointer';
      card.on('pointerdown', () => upgradeHeroCard(idx));

      upgradeCards.push(card);
      uiLayer.addChild(card);
    });
  }

  function upgradeHeroCard(deckIndex: number) {
    const equipped = getEquippedHeroDeck();
    const heroDef = equipped[deckIndex];
    if (!heroDef) return;

    const currentLvl = heroDef.level;
    if (currentLvl >= 4) return;

    const cost = UPGRADE_COSTS[currentLvl];
    if (mana >= cost) {
      mana -= cost;
      saveData.heroLevels[heroDef.id] = currentLvl + 1;
      writeSaveData(saveData);
      sound.playUpgrade();
      updateUpgradeCardsUI();

      spawnFloatingText(`UPGRADE!`, trayStartX + deckIndex * (cardW + cardGap) + cardW / 2, trayY, '#38bdf8');

      for (let g = 0; g < 15; g++) {
        if (grid[g]?.type.id === heroDef.id) {
          grid[g]!.type.level = currentLvl + 1;
          updateTileVisual(g);
        }
      }
    }
  }

  function updateUpgradeCardsUI() {
    const equipped = getEquippedHeroDeck();
    equipped.forEach((heroDef, idx) => {
      const lvl = heroDef.level;
      const bg = upgradeCardBgs[idx];
      const lvlText = upgradeLvlTexts[idx];
      const costText = upgradeCostTexts[idx];
      if (!bg || !lvlText || !costText) return;

      lvlText.text = lvl >= 4 ? 'MAX' : `Lvl ${lvl}`;

      if (lvl >= 4) {
        costText.text = 'MAX';
        costText.style.fill = '#94a3b8';
        bg.alpha = 0.6;
      } else {
        const cost = UPGRADE_COSTS[lvl];
        costText.text = `▲ ${cost}`;
        const canAfford = mana >= cost;
        costText.style.fill = canAfford ? '#facc15' : '#78716c';
        bg.alpha = canAfford ? 1.0 : 0.7;
      }
    });
  }

  function summonHero() {
    if (gameState !== 'BATTLE' || isGameOver) return;
    if (mana < summonCost) {
      spawnFloatingText('Need Soul Aether!', 480, 440, '#ef4444');
      return;
    }

    const emptyIndices = grid.map((v, i) => (v === null ? i : null)).filter((v): v is number => v !== null);
    if (emptyIndices.length === 0) {
      spawnFloatingText('Battlement Full!', 480, 440, '#ef4444');
      return;
    }

    mana -= summonCost;
    summonCost += 10;
    summonLabel.text = `Summon Hero (${summonCost}) [Space]`;
    sound.playKeypress();

    const equipped = getEquippedHeroDeck();
    const randSlot = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const randType = equipped[Math.floor(Math.random() * equipped.length)];

    grid[randSlot] = {
      type: randType,
      tier: 1,
      attacksRemainingForAbility: 10,
      abilityUses: 0,
      isOverheated: false,
      overheatCooldown: 0,
      aimAngle: -Math.PI / 4,
      attackProgress: 0
    };

    updateTileVisual(randSlot);
  }

  summonBtn.on('pointerdown', summonHero);

  function getTargetEnemy(): Enemy | null {
    if (enemies.length === 0) return null;
    const mode = TARGET_MODES[currentTargetModeIndex];

    if (mode === 'FIRST') {
      return enemies.reduce((prev, curr) => (curr.distanceProgress > prev.distanceProgress ? curr : prev));
    }
    if (mode === 'LAST') {
      return enemies.reduce((prev, curr) => (curr.distanceProgress < prev.distanceProgress ? curr : prev));
    }
    if (mode === 'STRONGEST') {
      return enemies.reduce((prev, curr) => (curr.hp > prev.hp ? curr : prev));
    }
    if (mode === 'WEAKEST') {
      return enemies.reduce((prev, curr) => (curr.hp < prev.hp ? curr : prev));
    }
    return enemies[0];
  }

  function deployLaneHazard(hero: GridHero, target: Enemy | null) {
    const hazardX = target ? target.x : WAYPOINTS[1].x;
    const hazardY = target ? target.y : WAYPOINTS[1].y;

    const hazardGfx = new Graphics();
    const hazardContainer = new Container();
    hazardContainer.position.set(hazardX, hazardY);
    hazardContainer.addChild(hazardGfx);
    hazardLayer.addChild(hazardContainer);

    const hazardType = hero.type.id;
    const heroLevel = hero.type.level;
    let duration = 6.0;
    let radius = 24;
    let hp = 100;

    if (hazardType === 'archer') {
      radius = 24 + heroLevel * 4;
      duration = 6.0 + heroLevel * 1.5;
      hazardGfx.circle(0, 0, radius);
      hazardGfx.fill({ color: 0x15803d, alpha: 0.45 });
      hazardGfx.stroke({ width: 2, color: 0x86efac });
    } else if (hazardType === 'knight') {
      radius = 20;
      duration = 8.0 + heroLevel * 2.0;
      hp = (100 + heroLevel * 75) * hero.tier;
      hazardGfx.rect(-16, -16, 32, 32);
      hazardGfx.fill(0x78350f);
      hazardGfx.stroke({ width: 3, color: 0xfde047 });
    } else if (hazardType === 'horseman') {
      radius = 26 + heroLevel * 6;
      duration = 5.0 + heroLevel * 1.0;
      hazardGfx.circle(0, 0, radius);
      hazardGfx.fill({ color: 0xb45309, alpha: 0.55 });
      hazardGfx.stroke({ width: 2, color: 0xfde047 });
    } else if (hazardType === 'mage') {
      radius = 24 + heroLevel * 5;
      duration = 5.0;
      hazardGfx.circle(0, 0, radius);
      hazardGfx.fill({ color: 0x0284c7, alpha: 0.55 });
      hazardGfx.stroke({ width: 3, color: 0xe0f2fe });
    } else if (hazardType === 'trebuchet') {
      radius = 34 + heroLevel * 6;
      duration = 5.0;
      hazardGfx.circle(0, 0, radius);
      hazardGfx.fill({ color: 0x6b21a8, alpha: 0.6 });
      hazardGfx.stroke({ width: 3, color: 0xd8b4fe });

      const burstDmg = (50 + heroLevel * 25) * hero.tier;
      enemies.forEach((e) => {
        if (Math.hypot(e.x - hazardX, e.y - hazardY) <= radius + 15) {
          e.hp -= burstDmg;
          spawnFloatingText(`-${burstDmg}`, e.x, e.y - 15, '#c084fc');
        }
      });
      triggerScreenShake(7, 0.22);
    }

    hazards.push({
      id: Math.random().toString(),
      type: hazardType,
      x: hazardX,
      y: hazardY,
      radius,
      duration,
      hp,
      color: hero.type.pedestalColor,
      level: heroLevel,
      container: hazardContainer,
      gfx: hazardGfx
    });
  }

  function drawCustomProjectile(gfx: Graphics, heroId: HeroId, tier: number) {
    gfx.clear();

    if (heroId === 'archer') {
      const len = 16 + tier * 2;
      gfx.moveTo(-len / 2, 0);
      gfx.lineTo(len / 2 - 4, 0);
      gfx.stroke({ width: 2.5, color: 0x633512 });
      gfx.poly([len / 2 + 3, 0, len / 2 - 3, -3.5, len / 2 - 3, 3.5]);
      gfx.fill(0xe2e8f0);
      gfx.stroke({ width: 1, color: 0x334155 });
    } else if (heroId === 'knight') {
      const r = 9 + tier * 2;
      gfx.arc(0, 0, r, -Math.PI * 0.45, Math.PI * 0.45);
      gfx.quadraticCurveTo(r * 0.3, 0, Math.cos(-Math.PI * 0.45) * r, Math.sin(-Math.PI * 0.45) * r);
      gfx.fill({ color: 0xfef08a, alpha: 0.9 });
      gfx.stroke({ width: 2.5, color: 0xdc2626 });
    } else if (heroId === 'horseman') {
      const len = 20 + tier * 2;
      gfx.moveTo(-len / 2, 0);
      gfx.lineTo(len / 2 - 5, 0);
      gfx.stroke({ width: 3, color: 0x582404 });
      gfx.poly([len / 2 + 5, 0, len / 2 - 4, -4, len / 2 - 4, 4]);
      gfx.fill(0xfacc15);
      gfx.stroke({ width: 1.5, color: 0xb45309 });
    } else if (heroId === 'mage') {
      const r = 7 + tier * 1.5;
      gfx.circle(0, 0, r * 1.4);
      gfx.fill({ color: 0x38bdf8, alpha: 0.35 });
      gfx.circle(0, 0, r);
      gfx.fill(0x1d4ed8);
      gfx.stroke({ width: 2, color: 0x93c5fd });
    } else if (heroId === 'trebuchet') {
      const r = 10 + tier * 2;
      gfx.poly([
        -r * 0.9, -r * 0.5,
        -r * 0.3, -r * 0.95,
        r * 0.6, -r * 0.8,
        r * 0.95, 0,
        r * 0.6, r * 0.9,
        -r * 0.4, r * 0.85,
        -r * 0.9, r * 0.4
      ]);
      gfx.fill(0x334155);
      gfx.stroke({ width: 2.5, color: 0x7c3aed });
    } else {
      const r = 8 + tier * 1.5;
      gfx.circle(0, 0, r);
      gfx.fill(0xf59e0b);
      gfx.stroke({ width: 2, color: 0xfacc15 });
    }
  }

  function triggerHeroAttack(slotIndex: number) {
    if (gameState !== 'BATTLE' || isGameOver) return;
    const hero = grid[slotIndex];
    if (!hero) return;

    if (hero.isOverheated) {
      sound.playKeypress();
      spawnFloatingText('Resting!', tileContainers[slotIndex].x + cellW / 2, tileContainers[slotIndex].y + 15, '#94a3b8');
      return;
    }

    const tilePos = tileContainers[slotIndex].position;
    const heroLevel = hero.type.level;
    const dmgMultiplier = 1 + (heroLevel - 1) * 0.45;
    const finalDamage = Math.round(hero.type.baseDamage * hero.tier * dmgMultiplier);

    const startX = tilePos.x + cellW / 2;
    const startY = tilePos.y + cellH / 2;

    const target = getTargetEnemy();
    const targetX = target ? target.x : WAYPOINTS[1].x;
    const targetY = target ? target.y : WAYPOINTS[1].y;
    const aimAngle = Math.atan2(targetY - startY, targetX - startX);

    hero.aimAngle = aimAngle;
    hero.attackProgress = 1.0;

    sound.playKeypress();
    if (hero.type.id === 'archer') sound.playArrowShoot();
    else if (hero.type.id === 'knight' || hero.type.id === 'horseman') sound.playSlash();
    else if (hero.type.id === 'mage') sound.playMagicBlast();
    else sound.playImpact();

    const projGfx = new Graphics();
    drawCustomProjectile(projGfx, hero.type.id, hero.tier);
    projGfx.position.set(startX, startY);
    projGfx.rotation = aimAngle;
    projectileLayer.addChild(projGfx);

    projectiles.push({
      x: startX,
      y: startY,
      heroId: hero.type.id,
      tier: hero.tier,
      targetEnemy: target,
      targetX,
      targetY,
      damage: finalDamage,
      speed: hero.type.projSpeed,
      color: hero.type.pedestalColor,
      rotation: aimAngle,
      spinSpeed: hero.type.id === 'knight' ? 14 : hero.type.id === 'trebuchet' ? 5 : 0,
      isCleave: hero.type.id === 'knight' && heroLevel >= 3,
      isSplashFreeze: hero.type.id === 'mage' && heroLevel >= 3,
      gfx: projGfx
    });

    hero.attacksRemainingForAbility--;
    if (hero.attacksRemainingForAbility <= 0) {
      deployLaneHazard(hero, target);
      hero.abilityUses++;
      hero.attacksRemainingForAbility = 10;

      if (hero.abilityUses >= 3) {
        hero.isOverheated = true;
        hero.overheatCooldown = Math.max(1.8, 4.0 - (heroLevel - 1) * 0.9);
        spawnFloatingText('REST!', tileContainers[slotIndex].x + cellW / 2, tileContainers[slotIndex].y + 10, '#ef4444');
      }
    }

    updateTileVisual(slotIndex);
  }

  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (gameState !== 'BATTLE') {
        if (e.code === 'Space' || e.code === 'Enter' || e.key === ' ' || e.key === 'Enter') {
          sound.playWarHorn();
          startMatch();
        }
        return;
      }

      if (e.code === 'Tab' || e.key === 'Tab') {
        e.preventDefault();
        cycleTargetMode();
        return;
      }

      const numMap: Record<string, number> = {
        Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4,
        '1': 0, '2': 1, '3': 2, '4': 3, '5': 4
      };
      if (numMap[e.code] !== undefined || numMap[e.key] !== undefined) {
        const idx = numMap[e.code] !== undefined ? numMap[e.code] : numMap[e.key];
        e.preventDefault();
        upgradeHeroCard(idx);
        return;
      }

      if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        summonHero();
        return;
      }

      const slotIndex = KEY_MAP[e.code] !== undefined ? KEY_MAP[e.code] : KEY_MAP[e.key];
      if (slotIndex !== undefined) {
        e.preventDefault();
        triggerHeroAttack(slotIndex);
      }
    },
    { capture: true, passive: false }
  );

  function restartMatch(keepEndless = false) {
    modalLayer.removeChildren();
    enemies.forEach((e) => e.container.destroy({ children: true }));
    projectiles.forEach((p) => p.gfx.destroy());
    hazards.forEach((h) => h.container.destroy({ children: true }));
    floatingTexts.forEach((f) => f.text.destroy());
    particles.forEach((p) => p.gfx.destroy());

    enemies = [];
    projectiles = [];
    hazards = [];
    floatingTexts = [];
    particles = [];

    for (let i = 0; i < 15; i++) {
      grid[i] = null;
      updateTileVisual(i);
    }

    castleHp = 100;
    updateCastleHpVisual();
    mana = 160;
    summonCost = 40;
    summonLabel.text = `Summon Hero (${summonCost}) [Space]`;
    currentWave = 1;
    maxWavesForLevel = 3 + Math.floor(currentCampaignLevel / 4);
    waveEnemiesSpawned = 0;
    waveEnemiesTotal = 8 + currentCampaignLevel * 2;
    bossSpawnedThisWave = false;
    isGameOver = false;
    isVictory = false;
    endlessMode = keepEndless;

    goldBattleText.text = `Ducats: ${saveData.sovereignDucats}`;
    levelWaveText.text = endlessMode ? `Endless Siege: Wave ${currentWave}` : `Stage ${currentCampaignLevel} - Wave ${currentWave}/${maxWavesForLevel}`;
    refreshBottomDeckTray();
  }

  function startNextWave() {
    saveData.antimatter += 1;
    writeSaveData(saveData);
    spawnFloatingText('+1 ANTIMATTER!', 480, 200, '#c084fc');

    currentWave++;
    waveEnemiesSpawned = 0;
    bossSpawnedThisWave = false;
    waveEnemiesTotal = 8 + currentWave * 3 + currentCampaignLevel * 2;
    waveSpawnInterval = Math.max(0.65, 1.5 - currentWave * 0.08);
    levelWaveText.text = endlessMode ? `Endless Siege: Wave ${currentWave}` : `Stage ${currentCampaignLevel} - Wave ${currentWave}/${maxWavesForLevel}`;
  }

  function spawnEnemy(forcedType?: EnemyId) {
    const enemyContainer = new Container();

    let type: EnemyId = forcedType || 'grunt';
    if (!forcedType) {
      const roll = Math.random();
      if (roll < 0.3) type = 'scout';
      else if (roll < 0.55) type = 'tank';
      else type = 'grunt';
    }

    const lvlScalar = 1 + (currentCampaignLevel - 1) * 0.18 + (currentWave - 1) * 0.12;

    let baseHp = 65;
    let baseSpeed = 75;
    let spriteSize = 36;

    if (type === 'scout') {
      baseHp = 35;
      baseSpeed = 110;
      spriteSize = 32;
    } else if (type === 'tank') {
      baseHp = 150;
      baseSpeed = 46;
      spriteSize = 42;
    } else if (type === 'boss') {
      baseHp = 550;
      baseSpeed = 38;
      spriteSize = 54;
    }

    const maxHp = Math.round(baseHp * lvlScalar);

    const frames = getEnemyWalkFrames(type);
    const enemySprite = new Sprite(frames[0]);
    enemySprite.anchor.set(0.5);
    enemySprite.width = spriteSize;
    enemySprite.height = spriteSize;
    enemyContainer.addChild(enemySprite);

    const hpBar = new Graphics();
    hpBar.rect(-spriteSize / 2, -spriteSize / 2 - 8, spriteSize, 4);
    hpBar.fill(0x16a34a);
    enemyContainer.addChild(hpBar);

    if (type === 'boss') {
      const bossTag = new Text({
        text: 'WARLORD',
        style: new TextStyle({ fill: '#facc15', fontSize: 10, fontWeight: 'bold' })
      });
      bossTag.anchor.set(0.5);
      bossTag.position.set(0, -spriteSize / 2 - 16);
      enemyContainer.addChild(bossTag);
    }

    enemyContainer.position.set(WAYPOINTS[0].x, WAYPOINTS[0].y);
    enemyLayer.addChild(enemyContainer);

    enemies.push({
      id: nextEnemyId++,
      type,
      x: WAYPOINTS[0].x,
      y: WAYPOINTS[0].y,
      hp: maxHp,
      maxHp,
      speed: baseSpeed,
      currentSpeed: baseSpeed,
      distanceProgress: 0,
      waypointIndex: 1,
      isBoss: type === 'boss',
      freezeTimer: 0,
      hitFlinchTimer: 0,
      flinchX: 0,
      flinchY: 0,
      walkCycleTimer: Math.random() * 10,
      container: enemyContainer,
      sprite: enemySprite,
      hpBar: hpBar
    });
  }

  function showDefeatModal() {
    isGameOver = true;

    const overlay = new Graphics();
    overlay.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    overlay.fill({ color: 0x000000, alpha: 0.88 });
    modalLayer.addChild(overlay);

    const defeatText = new Text({
      text: 'THE KEEP HAS FALLEN\nYour Treasury was pillaged!',
      style: new TextStyle({ fill: '#dc2626', fontSize: 26, fontWeight: 'bold', align: 'center', letterSpacing: 2 })
    });
    defeatText.anchor.set(0.5);
    defeatText.position.set(480, 230);
    modalLayer.addChild(defeatText);

    const restartBtn = new Graphics();
    restartBtn.roundRect(-90, -22, 180, 44, 8);
    restartBtn.fill(0x991b1b);
    restartBtn.stroke({ width: 2, color: 0xfacc15 });
    restartBtn.position.set(380, 350);
    restartBtn.eventMode = 'static';
    restartBtn.cursor = 'pointer';

    const restartLabel = new Text({
      text: 'RETRY SIEGE',
      style: new TextStyle({ fill: '#ffffff', fontSize: 13, fontWeight: 'bold' })
    });
    restartLabel.anchor.set(0.5);
    restartBtn.addChild(restartLabel);
    modalLayer.addChild(restartBtn);

    restartBtn.on('pointerdown', () => restartMatch(false));

    const menuBtn = new Graphics();
    menuBtn.roundRect(-80, -22, 160, 44, 8);
    menuBtn.fill(0x271a12);
    menuBtn.stroke({ width: 2, color: 0x92400e });
    menuBtn.position.set(570, 350);
    menuBtn.eventMode = 'static';
    menuBtn.cursor = 'pointer';

    const menuLabel = new Text({
      text: 'WAR ROOM',
      style: new TextStyle({ fill: '#ffffff', fontSize: 13, fontWeight: 'bold' })
    });
    menuLabel.anchor.set(0.5);
    menuBtn.addChild(menuLabel);
    modalLayer.addChild(menuBtn);

    menuBtn.on('pointerdown', returnToMenu);
  }

  function showVictoryModal() {
    isVictory = true;

    saveData.antimatter += 2;
    const goldBounty = currentCampaignLevel * 80;
    saveData.sovereignDucats += goldBounty;

    if (currentCampaignLevel === saveData.unlockedLevel && currentCampaignLevel < TOTAL_CAMPAIGN_LEVELS) {
      saveData.unlockedLevel++;
    }
    writeSaveData(saveData);

    const overlay = new Graphics();
    overlay.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
    overlay.fill({ color: 0x000000, alpha: 0.88 });
    modalLayer.addChild(overlay);

    const vicText = new Text({
      text: `REALM DEFENDED!\nStage ${currentCampaignLevel} Victorious`,
      style: new TextStyle({ fill: '#16a34a', fontSize: 26, fontWeight: 'bold', align: 'center', letterSpacing: 2 })
    });
    vicText.anchor.set(0.5);
    vicText.position.set(480, 200);
    modalLayer.addChild(vicText);

    const rewardText = new Text({
      text: `+${goldBounty} Sovereign Ducats  |  +2 Bonus Antimatter Crystals`,
      style: new TextStyle({ fill: '#facc15', fontSize: 15, fontWeight: 'bold' })
    });
    rewardText.anchor.set(0.5);
    rewardText.position.set(480, 275);
    modalLayer.addChild(rewardText);

    const nextBtn = new Graphics();
    nextBtn.roundRect(-90, -22, 180, 44, 8);
    nextBtn.fill(0x166534);
    nextBtn.stroke({ width: 2, color: 0x86efac });
    nextBtn.position.set(380, 350);
    nextBtn.eventMode = 'static';
    nextBtn.cursor = 'pointer';

    const nextLabel = new Text({
      text: 'ADVANCE MARCH',
      style: new TextStyle({ fill: '#ffffff', fontSize: 13, fontWeight: 'bold' })
    });
    nextLabel.anchor.set(0.5);
    nextBtn.addChild(nextLabel);
    modalLayer.addChild(nextBtn);

    nextBtn.on('pointerdown', () => {
      if (currentCampaignLevel < TOTAL_CAMPAIGN_LEVELS) currentCampaignLevel++;
      restartMatch(false);
    });

    const menuBtn = new Graphics();
    menuBtn.roundRect(-80, -22, 160, 44, 8);
    menuBtn.fill(0x271a12);
    menuBtn.stroke({ width: 2, color: 0x92400e });
    menuBtn.position.set(570, 350);
    menuBtn.eventMode = 'static';
    menuBtn.cursor = 'pointer';

    const menuLabel = new Text({
      text: 'WAR ROOM',
      style: new TextStyle({ fill: '#ffffff', fontSize: 13, fontWeight: 'bold' })
    });
    menuLabel.anchor.set(0.5);
    menuBtn.addChild(menuLabel);
    modalLayer.addChild(menuBtn);

    menuBtn.on('pointerdown', returnToMenu);
  }

  // --- CONTINUOUS TICK LOOP ---
  let lastTime = performance.now();

  app.ticker.add(() => {
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    if (gameState === 'MENU') return;
    if (isGameOver || isVictory) return;

    if (screenShakeTimer > 0) {
      screenShakeTimer -= dt;
      app.stage.position.set(
        (window.innerWidth - VIRTUAL_WIDTH * app.stage.scale.x) / 2 + (Math.random() - 0.5) * screenShakeMagnitude * 2,
        (window.innerHeight - VIRTUAL_HEIGHT * app.stage.scale.y) / 2 + (Math.random() - 0.5) * screenShakeMagnitude * 2
      );
      if (screenShakeTimer <= 0) resizeGameView();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.gfx.position.set(p.x, p.y);
      p.gfx.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        p.gfx.parent?.removeChild(p.gfx);
        p.gfx.destroy();
        particles.splice(i, 1);
      }
    }

    mana += 3.8 * dt;
    manaText.text = `Aether: ${Math.floor(mana)}`;
    updateUpgradeCardsUI();

    for (let f = floatingTexts.length - 1; f >= 0; f--) {
      const ft = floatingTexts[f];
      ft.life -= dt;
      ft.y += ft.vy * dt;
      ft.text.position.set(ft.x, ft.y);
      ft.text.alpha = Math.max(0, ft.life / ft.maxLife);
      if (ft.life <= 0) {
        floatLayer.removeChild(ft.text);
        ft.text.destroy();
        floatingTexts.splice(f, 1);
      }
    }

    // Hero Animations
    for (let i = 0; i < 15; i++) {
      const hero = grid[i];
      if (hero) {
        if (hero.isOverheated) {
          hero.overheatCooldown -= dt;
          if (hero.overheatCooldown <= 0) {
            hero.isOverheated = false;
            hero.abilityUses = 0;
            updateTileVisual(i);
          } else {
            tileRestTexts[i].text = `REST\n${hero.overheatCooldown.toFixed(1)}s`;
          }
        }

        const wrapper = tileHeroWrappers[i];
        const sprite = tileHeroSprites[i];
        const frames = getHeroAnimationFrames(hero.type.id);

        if (hero.attackProgress > 0) {
          hero.attackProgress = Math.max(0, hero.attackProgress - dt * 3.8);
          const t = 1.0 - hero.attackProgress;

          let frameIndex = 0;
          if (t < 0.25) frameIndex = 1;
          else if (t < 0.55) frameIndex = 2;
          else if (t < 0.85) frameIndex = 3;
          else frameIndex = 0;

          sprite.texture = frames[frameIndex % frames.length];
          sprite.width = HERO_SIZE;
          sprite.height = HERO_SIZE;

          const lunge = t < 0.5 ? Math.sin(t * Math.PI) * 7 : Math.sin(t * Math.PI) * 4;
          wrapper.position.set(
            cellW / 2 + Math.cos(hero.aimAngle) * lunge,
            cellH / 2 + Math.sin(hero.aimAngle) * lunge
          );
          wrapper.rotation = hero.aimAngle;
        } else {
          sprite.texture = frames[0];
          sprite.width = HERO_SIZE;
          sprite.height = HERO_SIZE;
          const idleBob = Math.sin(now * 0.003 + i) * 1.5;
          wrapper.position.set(cellW / 2, cellH / 2 + idleBob);
          wrapper.rotation = hero.aimAngle;
        }
      }
    }

    // Wave Spawner
    if (waveEnemiesSpawned < waveEnemiesTotal) {
      spawnTimer += dt;
      if (spawnTimer >= waveSpawnInterval) {
        spawnTimer = 0;
        spawnEnemy();
        waveEnemiesSpawned++;
      }
    } else if (!bossSpawnedThisWave) {
      spawnEnemy('boss');
      bossSpawnedThisWave = true;
    } else if (enemies.length === 0) {
      waveIntermissionTimer += dt;
      if (waveIntermissionTimer >= 2.0) {
        waveIntermissionTimer = 0;
        if (!endlessMode && currentWave >= maxWavesForLevel) {
          showVictoryModal();
        } else {
          startNextWave();
        }
      }
    }

    // Hazards
    for (let hIdx = hazards.length - 1; hIdx >= 0; hIdx--) {
      const h = hazards[hIdx];
      h.duration -= dt;

      if (h.duration <= 0 || (h.hp !== undefined && h.hp <= 0)) {
        hazardLayer.removeChild(h.container);
        h.container.destroy({ children: true });
        hazards.splice(hIdx, 1);
        continue;
      }

      for (const e of enemies) {
        const dist = Math.hypot(e.x - h.x, e.y - h.y);
        if (dist <= h.radius) {
          if (h.type === 'archer') {
            const slowFactor = h.level >= 2 ? 0.35 : 0.5;
            e.currentSpeed = e.speed * slowFactor;
            e.hp -= (10 + h.level * 4) * dt;
          } else if (h.type === 'horseman') {
            e.hp -= (24 + h.level * 10) * dt;
          } else if (h.type === 'mage') {
            e.freezeTimer = 1.6 + h.level * 0.5;
          } else if (h.type === 'knight' && h.hp !== undefined) {
            e.currentSpeed = 0;
            h.hp -= 35 * dt;
          }
        }
      }
    }

    // Move Creeps
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];

      if (e.freezeTimer > 0) {
        e.freezeTimer -= dt;
        continue;
      }

      const targetWp = WAYPOINTS[e.waypointIndex];
      const dx = targetWp.x - e.x;
      const dy = targetWp.y - e.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 6) {
        e.waypointIndex++;
        if (e.waypointIndex >= WAYPOINTS.length) {
          castleHp = Math.max(0, castleHp - (e.isBoss ? 35 : 10));
          updateCastleHpVisual();
          triggerScreenShake(8, 0.25);
          sound.playImpact();
          enemyLayer.removeChild(e.container);
          e.container.destroy({ children: true });
          enemies.splice(i, 1);

          if (castleHp <= 0) showDefeatModal();
          continue;
        }
      } else {
        const step = e.currentSpeed * dt;
        e.x += (dx / dist) * step;
        e.y += (dy / dist) * step;
        e.distanceProgress += step;

        e.walkCycleTimer += dt * 6.0;
        const walkFrames = getEnemyWalkFrames(e.type);
        const frameIdx = Math.floor(e.walkCycleTimer) % walkFrames.length;
        e.sprite.texture = walkFrames[frameIdx];
        e.sprite.rotation = Math.atan2(dy, dx) - Math.PI / 2;
      }

      e.currentSpeed = e.speed;

      if (e.hitFlinchTimer > 0) {
        e.hitFlinchTimer -= dt;
        const flinchRatio = e.hitFlinchTimer / 0.12;
        e.container.position.set(e.x + e.flinchX * flinchRatio, e.y + e.flinchY * flinchRatio);
        e.sprite.tint = 0xffe4e6;
      } else {
        e.container.position.set(e.x, e.y);
        e.sprite.tint = 0xffffff;
      }

      const hpPercent = Math.max(0, e.hp / e.maxHp);
      const barW = e.sprite.width;
      e.hpBar.clear();
      e.hpBar.rect(-barW / 2, -barW / 2 - 8, barW * hpPercent, 4);
      e.hpBar.fill(hpPercent > 0.4 ? 0x16a34a : 0xdc2626);
    }

    // Continuous Hit Collision
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      let target = (p.targetEnemy && enemies.includes(p.targetEnemy)) ? p.targetEnemy : null;

      if (!target && enemies.length > 0) {
        let closestDist = Infinity;
        for (const e of enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < closestDist) {
            closestDist = d;
            target = e;
          }
        }
      }

      const destX = target ? target.x : p.targetX;
      const destY = target ? target.y : p.targetY;
      const dx = destX - p.x;
      const dy = destY - p.y;
      const dist = Math.hypot(dx, dy);
      const step = p.speed * 60 * dt;

      let hitEnemy: Enemy | null = null;
      for (const e of enemies) {
        const hitRadius = (e.isBoss ? 26 : e.type === 'tank' ? 22 : 18) + p.tier * 2;
        if (Math.hypot(e.x - p.x, e.y - p.y) <= hitRadius) {
          hitEnemy = e;
          break;
        }
      }

      if (hitEnemy || dist <= step || dist < 20) {
        const victim = hitEnemy || target;
        if (victim) {
          victim.hp -= p.damage;
          victim.hitFlinchTimer = 0.12;
          const vdx = victim.x - p.x || 1;
          const vdy = victim.y - p.y || 1;
          const vdist = Math.hypot(vdx, vdy);
          victim.flinchX = (vdx / vdist) * 5;
          victim.flinchY = (vdy / vdist) * 5;

          sound.playImpact();
          spawnImpactParticles(projectileLayer, victim.x, victim.y, p.color, 8);
          spawnFloatingText(`-${p.damage}`, victim.x, victim.y - 14, '#fef08a');

          if (p.heroId === 'trebuchet') {
            triggerScreenShake(7, 0.22);
          }

          if (p.isCleave) {
            enemies.forEach(other => {
              if (other !== victim && Math.hypot(other.x - victim.x, other.y - victim.y) <= 50) {
                other.hp -= Math.round(p.damage * 0.6);
                other.hitFlinchTimer = 0.1;
                spawnFloatingText(`-${Math.round(p.damage * 0.6)}`, other.x, other.y - 14, '#ef4444');
              }
            });
          }

          if (p.isSplashFreeze) {
            enemies.forEach(other => {
              if (Math.hypot(other.x - victim.x, other.y - victim.y) <= 45) {
                other.freezeTimer = 1.8;
              }
            });
          }

          if (victim.hp <= 0) {
            const rewardAether = victim.isBoss ? 75 : 18;
            mana += rewardAether;
            saveData.sovereignDucats += victim.isBoss ? 25 : 4;
            writeSaveData(saveData);
            spawnFloatingText(`+${rewardAether} Aether`, victim.x, victim.y - 26, '#38bdf8');

            const eIdx = enemies.indexOf(victim);
            if (eIdx !== -1) {
              enemyLayer.removeChild(victim.container);
              victim.container.destroy({ children: true });
              enemies.splice(eIdx, 1);
            }
          }
        } else {
          spawnImpactParticles(projectileLayer, p.x, p.y, p.color, 4);
        }

        projectileLayer.removeChild(p.gfx);
        p.gfx.destroy();
        projectiles.splice(i, 1);
      } else {
        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;
        p.gfx.position.set(p.x, p.y);

        if (p.spinSpeed) {
          p.rotation += p.spinSpeed * dt;
          p.gfx.rotation = p.rotation;
        } else {
          p.rotation = Math.atan2(dy, dx);
          p.gfx.rotation = p.rotation;
        }
      }
    }
  });

  battleRoot.visible = false;
  menuRoot.visible = true;
  renderStartMenu();
}

run();