import { Application, Container, Graphics, Sprite, Text, TextStyle, Texture } from 'pixi.js';
import { GameTextures, loadAllGameAssets } from '../gameAssets';
import { getHeroTexture } from '../sprites';
import { sound } from '../audio';
import { HERO_SIZE, KEY_LABELS, TARGET_MODES, VIRTUAL_HEIGHT, VIRTUAL_WIDTH, WAYPOINTS } from '../constants';
import type { Enemy, EnemyId, GridHero, Projectile, LaneHazard, FloatingText, Particle } from '../types';
import { state, writeSaveData, getEquippedHeroDeck } from '../state/gameState';
import { renderStartMenu } from '../ui/warRoomMenu';
import { createBattleHud, type BattleHud } from '../ui/hud';
import { showDefeatModal, showVictoryModal } from '../ui/modals';
import { installInputSystem } from './inputSystem';

export async function run(): Promise<void> {
  const app = new Application();

  await app.init({
    resizeTo: window,
    backgroundColor: 0x070b14,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: true
  });

  const appContainer = document.getElementById('app') || document.body;
  appContainer.appendChild(app.canvas);

  await loadAllGameAssets();

  const battleRoot = new Container();
  const menuRoot = new Container();
  app.stage.addChild(battleRoot, menuRoot);

  function screenToStage(clientX: number, clientY: number): { x: number; y: number } {
    const rect = app.canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - app.stage.position.x) / app.stage.scale.x,
      y: (clientY - rect.top - app.stage.position.y) / app.stage.scale.y
    };
  }

  function resizeGameView(): void {
    const winW = window.innerWidth || VIRTUAL_WIDTH;
    const winH = window.innerHeight || VIRTUAL_HEIGHT;
    const scale = Math.max(0.1, Math.min(winW / VIRTUAL_WIDTH, winH / VIRTUAL_HEIGHT));
    app.stage.scale.set(scale);
    app.stage.position.set((winW - VIRTUAL_WIDTH * scale) / 2, (winH - VIRTUAL_HEIGHT * scale) / 2);
  }
  window.addEventListener('resize', resizeGameView);
  resizeGameView();

  function toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
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
    backgroundLayer, trackLayer, hazardLayer, enemyLayer,
    battlementLayer, gridLayer, projectileLayer, floatLayer,
    uiLayer, modalLayer
  );

  let enemies: Enemy[] = [];
  let projectiles: Projectile[] = [];
  let hazards: LaneHazard[] = [];
  let floatingTexts: FloatingText[] = [];
  let particles: Particle[] = [];
  let nextEnemyId = 1;

  function triggerScreenShake(magnitude = 4, duration = 0.15): void {
    state.screenShakeMagnitude = magnitude;
    state.screenShakeTimer = duration;
  }

  function spawnImpactParticles(x: number, y: number, color: number, count = 6): void {
    for (let i = 0; i < count; i++) {
      const gfx = new Graphics();
      const size = 2.5 + Math.random() * 3.0;
      gfx.circle(0, 0, size).fill(color);
      gfx.position.set(x, y);
      projectileLayer.addChild(gfx);
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 110;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: 0.25 + Math.random() * 0.15, maxLife: 0.4, color, size, gfx
      });
    }
  }

  function spawnFloatingText(msg: string, x: number, y: number, color = '#ffffff'): void {
    const txt = new Text({ text: msg, style: new TextStyle({ fontFamily: 'Lilita One', fill: color, fontSize: 13 }) });
    txt.anchor.set(0.5);
    txt.position.set(x, y);
    floatLayer.addChild(txt);
    floatingTexts.push({ text: txt, x, y, vy: -35, life: 0.65, maxLife: 0.65 });
  }

  // Battlefield Background
  const terrain = new Graphics();
  terrain.rect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT).fill(0x1e3a1f);
  backgroundLayer.addChild(terrain);

  const roadBase = new Graphics();
  roadBase.moveTo(WAYPOINTS[0].x, WAYPOINTS[0].y);
  roadBase.lineTo(WAYPOINTS[1].x, WAYPOINTS[1].y);
  roadBase.lineTo(WAYPOINTS[2].x, WAYPOINTS[2].y);
  roadBase.lineTo(WAYPOINTS[3].x, WAYPOINTS[3].y);
  roadBase.stroke({ width: 72, color: 0x451a03, cap: 'round', join: 'round' });
  roadBase.moveTo(WAYPOINTS[0].x, WAYPOINTS[0].y);
  roadBase.lineTo(WAYPOINTS[1].x, WAYPOINTS[1].y);
  roadBase.lineTo(WAYPOINTS[2].x, WAYPOINTS[2].y);
  roadBase.lineTo(WAYPOINTS[3].x, WAYPOINTS[3].y);
  roadBase.stroke({ width: 58, color: 0xb45309, cap: 'round', join: 'round' });
  trackLayer.addChild(roadBase);

  [ { x: 40, y: 240 }, { x: 45, y: 330 }, { x: 900, y: 240 } ].forEach(pos => {
    const tree = new Sprite(GameTextures.treeProp);
    tree.position.set(pos.x, pos.y);
    tree.width = 48; tree.height = 48;
    backgroundLayer.addChild(tree);
  });

  const castleSprite = new Sprite(GameTextures.castleKeep);
  castleSprite.anchor.set(0.5);
  castleSprite.position.set(785, 480);
  castleSprite.width = 110; castleSprite.height = 110;
  trackLayer.addChild(castleSprite);

  // Battlement Platform
  const cellW = 86;
  const cellH = 86;
  const gridW = cellW * 5;
  const gridH = cellH * 3;
  const wallPad = 12;
  const fX = 265;
  const fY = 156;

  const platform = new Graphics();
  platform.roundRect(fX - wallPad, fY - wallPad, gridW + wallPad * 2, gridH + wallPad * 2, 14)
    .fill(0x334155).stroke({ width: 3, color: 0x1e293b });
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
    const bg = new Graphics();
    bg.rect(0, 0, cellW, cellH).fill(isLightGreen ? 0x22543d : 0x1c4532)
      .stroke({ width: 1, color: 0x143425, alpha: 0.5 });
    tile.addChild(bg);

    const keyBadge = new Graphics();
    keyBadge.roundRect(4, 4, 18, 18, 4).fill({ color: 0x0f172a, alpha: 0.7 });
    tile.addChild(keyBadge);

    const keyTxt = new Text({ text: KEY_LABELS[i], style: new TextStyle({ fontFamily: 'Lilita One', fill: '#fef08a', fontSize: 10 }) });
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
    chargeBar.rect(8, cellH - 7, cellW - 16, 3).fill(0x0f172a);
    tile.addChild(chargeBar);
    tileChargeBars.push(chargeBar);

    const restText = new Text({ text: '', style: new TextStyle({ fontFamily: 'Lilita One', fill: '#ef4444', fontSize: 11, align: 'center' }) });
    restText.anchor.set(0.5);
    restText.position.set(cellW / 2, cellH / 2);
    tile.addChild(restText);
    tileRestTexts.push(restText);

    tile.eventMode = 'static';
    tile.cursor = 'pointer';

    tile.on('pointerdown', (e) => {
      if (state.grid[i] && !state.grid[i]?.isOverheated && !state.isGameOver) {
        draggedIndex = i;
        const tex = getHeroTexture(state.grid[i]!.type.id);
        dragGhost = new Sprite(tex);
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

  function renderHeroPedestal(gfx: Graphics, hero: GridHero, cx: number, cy: number): void {
    gfx.clear();
    const color = hero.type.pedestalColor;
    const tier = hero.tier;

    if (tier === 1) {
      gfx.circle(cx, cy, 34).fill({ color, alpha: 0.85 }).stroke({ width: 2.5, color: 0xffffff });
    } else if (tier === 2) {
      gfx.moveTo(cx - 32, cy + 32).quadraticCurveTo(cx - 16, cy - 16, cx + 32, cy - 32)
        .quadraticCurveTo(cx + 16, cy + 16, cx - 32, cy + 32).fill({ color, alpha: 0.9 }).stroke({ width: 2.5, color: 0xffffff });
    } else if (tier === 3) {
      gfx.poly([cx, cy - 34, cx + 32, cy + 26, cx - 32, cy + 26]).fill({ color, alpha: 0.9 }).stroke({ width: 2.5, color: 0xffffff });
    } else {
      gfx.roundRect(cx - 30, cy - 30, 60, 60, 10).fill({ color, alpha: 0.9 }).stroke({ width: 3, color: 0xfacc15 });
    }
  }

  function updateTileVisual(idx: number): void {
    const hero = state.grid[idx];
    const pedestal = tilePedestals[idx];
    const sprite = tileHeroSprites[idx];
    const charge = tileChargeBars[idx];
    const restText = tileRestTexts[idx];

    pedestal.clear();
    charge.clear();

    if (!hero) {
      sprite.visible = false;
      restText.text = '';
      charge.rect(8, cellH - 7, cellW - 16, 3).fill(0x0f172a);
    } else {
      sprite.texture = getHeroTexture(hero.type.id);
      sprite.width = HERO_SIZE;
      sprite.height = HERO_SIZE;
      sprite.visible = true;
      sprite.rotation = 0;

      if (hero.isOverheated) {
        sprite.alpha = 0.3;
        restText.text = `REST\n${hero.overheatCooldown.toFixed(1)}s`;
      } else {
        sprite.alpha = 1.0;
        restText.text = '';
        renderHeroPedestal(pedestal, hero, cellW / 2, cellH / 2);
        const progress = (10 - hero.attacksRemainingForAbility) / 10;
        charge.rect(8, cellH - 7, (cellW - 16) * progress, 3).fill(0xfacc15);
      }
    }
  }

  function updateAllGridVisuals(): void {
    for (let i = 0; i < 15; i++) updateTileVisual(i);
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

      if (targetIndex !== null && targetIndex !== draggedIndex && state.grid[targetIndex] && state.grid[draggedIndex]) {
        const src = state.grid[draggedIndex]!;
        const dest = state.grid[targetIndex]!;

        if (src.type.id === dest.type.id && src.tier === dest.tier) {
          dest.tier += 1;
          dest.attacksRemainingForAbility = 10;
          dest.isOverheated = false;
          dest.overheatCooldown = 0;
          state.grid[draggedIndex] = null;
          sound.playUpgrade();
          spawnFloatingText(`TIER ${dest.tier}!`, tileContainers[targetIndex].x + cellW / 2, tileContainers[targetIndex].y + 15, '#facc15');
          updateTileVisual(draggedIndex);
          updateTileVisual(targetIndex);
        }
      }
      draggedIndex = null;
    }
  });

  function summonHero(): void {
    if (state.gameState !== 'BATTLE' || state.isGameOver) return;
    if (state.mana < state.summonCost) {
      spawnFloatingText('Need Soul Aether!', 480, 440, '#ef4444');
      return;
    }

    const emptyIndices = state.grid.map((v, i) => (v === null ? i : null)).filter((v): v is number => v !== null);
    if (emptyIndices.length === 0) {
      spawnFloatingText('Battlement Full!', 480, 440, '#ef4444');
      return;
    }

    state.mana -= state.summonCost;
    state.summonCost += 10;
    if (hud.summonBtn && hud.summonBtn.children[1]) {
      (hud.summonBtn.children[1] as Text).text = `Summon (${state.summonCost}) [Space]`;
    }
    sound.playKeypress();

    const equipped = getEquippedHeroDeck();
    const randSlot = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const randType = equipped[Math.floor(Math.random() * equipped.length)];

    state.grid[randSlot] = {
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

  function getTargetEnemy(): Enemy | null {
    if (enemies.length === 0) return null;
    const mode = TARGET_MODES[state.currentTargetModeIndex];

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

  // --- UNIQUE ABILITY DEPLOYMENTS FOR ALL 15 HEROES ---
  function deployLaneHazard(hero: GridHero, target: Enemy | null): void {
    if (hazards.length >= 8) {
      const old = hazards.shift();
      if (old) {
        hazardLayer.removeChild(old.container);
        old.container.destroy({ children: true });
      }
    }

    const hazardX = target ? target.x : WAYPOINTS[1].x;
    const hazardY = target ? target.y : WAYPOINTS[1].y;

    const hazardGfx = new Graphics();
    const hazardContainer = new Container();
    hazardContainer.position.set(hazardX, hazardY);
    hazardContainer.addChild(hazardGfx);
    hazardLayer.addChild(hazardContainer);

    const hazardType = hero.type.id;
    const heroLevel = hero.type.level;
    let duration = 5.0;
    let radius = 26;
    let hp = 100;

    switch (hazardType) {
      case 'archer': // Caltrops
        radius = 28 + heroLevel * 4;
        duration = 5.5 + heroLevel * 1.0;
        hazardGfx.circle(0, 0, radius).fill({ color: 0x15803d, alpha: 0.4 }).stroke({ width: 2, color: 0x86efac });
        break;

      case 'knight': // Stone Barricade
        radius = 22;
        duration = 6.0 + heroLevel * 1.5;
        hp = (120 + heroLevel * 80) * hero.tier;
        hazardGfx.rect(-18, -18, 36, 36).fill(0x78350f).stroke({ width: 3, color: 0xfde047 });
        break;

      case 'horseman': // Burning Greek Fire
        radius = 30 + heroLevel * 6;
        duration = 4.5 + heroLevel * 1.0;
        hazardGfx.circle(0, 0, radius).fill({ color: 0xb45309, alpha: 0.5 }).stroke({ width: 2, color: 0xfde047 });
        break;

      case 'mage': // Runic Stasis Freeze
        radius = 26 + heroLevel * 5;
        duration = 4.5;
        hazardGfx.circle(0, 0, radius).fill({ color: 0x0284c7, alpha: 0.5 }).stroke({ width: 3, color: 0xe0f2fe });
        break;

      case 'trebuchet': // Molten Boulder Burst
      case 'bombardier': // Shrapnel Shells
        radius = 38 + heroLevel * 6;
        duration = 3.5;
        hazardGfx.circle(0, 0, radius).fill({ color: 0x6b21a8, alpha: 0.55 }).stroke({ width: 3, color: 0xd8b4fe });
        const burstDmg = (60 + heroLevel * 30) * hero.tier;
        enemies.forEach(e => {
          if (Math.hypot(e.x - hazardX, e.y - hazardY) <= radius + 16) {
            e.hp -= burstDmg;
            spawnFloatingText(`-${burstDmg}`, e.x, e.y - 15, '#c084fc');
          }
        });
        triggerScreenShake(7, 0.2);
        break;

      case 'pyromancer': // Magma Puddle
        radius = 32 + heroLevel * 5;
        duration = 6.0;
        hazardGfx.circle(0, 0, radius).fill({ color: 0xea580c, alpha: 0.55 }).stroke({ width: 2.5, color: 0xfef08a });
        break;

      case 'frostweaver': // Blizzard Hail
        radius = 34 + heroLevel * 5;
        duration = 5.0;
        hazardGfx.circle(0, 0, radius).fill({ color: 0x06b6d4, alpha: 0.45 }).stroke({ width: 3, color: 0xa5f3fc });
        break;

      case 'alchemist': // Corrosive Acid Flask
        radius = 28 + heroLevel * 4;
        duration = 5.5;
        hazardGfx.circle(0, 0, radius).fill({ color: 0x10b981, alpha: 0.5 }).stroke({ width: 2.5, color: 0xa7f3d0 });
        break;

      case 'druid': // Entangling Roots
        radius = 30 + heroLevel * 5;
        duration = 5.0;
        hazardGfx.circle(0, 0, radius).fill({ color: 0x166534, alpha: 0.45 }).stroke({ width: 2.5, color: 0x4ade80 });
        break;

      case 'cleric': // Sun Sanctuary (Keep Shield & Creep Smite)
        radius = 36;
        duration = 4.0;
        hazardGfx.circle(0, 0, radius).fill({ color: 0xfacc15, alpha: 0.4 }).stroke({ width: 3, color: 0xffffff });
        state.castleHp = Math.min(100, state.castleHp + 6);
        hud.updateCastleHp();
        spawnFloatingText('+6 KEEP HP!', 785, 430, '#4ade80');
        break;

      default:
        radius = 26;
        hazardGfx.circle(0, 0, radius).fill({ color: hero.type.pedestalColor, alpha: 0.4 }).stroke({ width: 2, color: 0xffffff });
        break;
    }

    hazards.push({
      id: Math.random().toString(),
      type: hazardType,
      x: hazardX,
      y: hazardY,
      radius, duration, hp,
      color: hero.type.pedestalColor,
      level: heroLevel,
      container: hazardContainer,
      gfx: hazardGfx
    });
  }

  // --- DISTINCT ATTACK MECHANICS FOR EVERY HERO ---
  function triggerHeroAttack(slotIndex: number): void {
    if (state.gameState !== 'BATTLE' || state.isGameOver) return;
    const hero = state.grid[slotIndex];
    if (!hero) return;

    if (hero.isOverheated) {
      sound.playKeypress();
      spawnFloatingText('Resting!', tileContainers[slotIndex].x + cellW / 2, tileContainers[slotIndex].y + 15, '#94a3b8');
      return;
    }

    const tilePos = tileContainers[slotIndex].position;
    const heroLevel = hero.type.level;
    const dmgMultiplier = 1 + (heroLevel - 1) * 0.45;
    let finalDamage = Math.round(hero.type.baseDamage * hero.tier * dmgMultiplier);

    const startX = tilePos.x + cellW / 2;
    const startY = tilePos.y + cellH / 2;

    const target = getTargetEnemy();
    const targetX = target ? target.x : WAYPOINTS[1].x;
    const targetY = target ? target.y : WAYPOINTS[1].y;
    const aimAngle = Math.atan2(targetY - startY, targetX - startX);

    hero.aimAngle = aimAngle;
    hero.attackProgress = 1.0;

    sound.playKeypress();

    // 1. Assassin: 25% Chance for Critical Strike (300% Dmg)
    if (hero.type.id === 'assassin' && Math.random() < 0.28) {
      finalDamage = Math.round(finalDamage * 3.0);
      spawnFloatingText('CRITICAL!', startX, startY - 20, '#ef4444');
      sound.playSlash();
    }

    // 2. Melee Sweeping Slash (Paladin, Berserker)
    if (hero.type.id === 'knight' || hero.type.id === 'berserker') {
      sound.playSlash();
      const slashArc = new Graphics();
      slashArc.arc(startX, startY, 70, aimAngle - 0.7, aimAngle + 0.7);
      slashArc.stroke({ width: 7, color: hero.type.pedestalColor, alpha: 0.85 });
      projectileLayer.addChild(slashArc);
      setTimeout(() => slashArc.destroy(), 100);

      // Hit all enemies in front within range
      enemies.forEach(e => {
        if (Math.hypot(e.x - startX, e.y - startY) <= 85) {
          e.hp -= finalDamage;
          e.hitFlinchTimer = 0.12;
          spawnFloatingText(`-${finalDamage}`, e.x, e.y - 12, '#facc15');
          spawnImpactParticles(e.x, e.y, hero.type.pedestalColor, 6);
        }
      });
    } 
    // 3. Instant Magic Beam (Mage, Frostweaver)
    else if (hero.type.id === 'mage' || hero.type.id === 'frostweaver') {
      sound.playMagicBlast();
      const beam = new Graphics();
      beam.moveTo(startX, startY);
      beam.lineTo(targetX, targetY);
      beam.stroke({ width: 5, color: hero.type.pedestalColor, alpha: 0.9 });
      projectileLayer.addChild(beam);
      setTimeout(() => beam.destroy(), 120);

      if (target) {
        target.hp -= finalDamage;
        target.hitFlinchTimer = 0.14;
        if (hero.type.id === 'frostweaver') target.freezeTimer = 1.4;
        spawnFloatingText(`-${finalDamage}`, target.x, target.y - 14, '#38bdf8');
        spawnImpactParticles(target.x, target.y, hero.type.pedestalColor, 8);
      }
    } 
    // 4. Projectiles: Siege Boulders, Harpoons, Arrows, Fireballs
    else {
      if (hero.type.id === 'archer' || hero.type.id === 'ballista') sound.playArrowShoot();
      else if (hero.type.id === 'trebuchet' || hero.type.id === 'bombardier') sound.playImpact();
      else sound.playMagicBlast();

      const projTex = GameTextures[hero.type.projTextureKey] || Texture.WHITE;
      const projSprite = new Sprite(projTex);
      projSprite.anchor.set(0.5);
      projSprite.width = hero.type.projRadius * 2.2;
      projSprite.height = hero.type.projRadius * 2.2;
      projSprite.position.set(startX, startY);
      projSprite.rotation = aimAngle;
      projectileLayer.addChild(projSprite);

      projectiles.push({
        x: startX,
        y: startY,
        heroId: hero.type.id,
        tier: hero.tier,
        targetEnemy: target,
        targetX, targetY,
        damage: finalDamage,
        speed: hero.type.projSpeed,
        color: hero.type.pedestalColor,
        rotation: aimAngle,
        spinSpeed: (hero.type.id === 'trebuchet' || hero.type.id === 'bombardier') ? 8 : 0,
        isCleave: false,
        isSplashFreeze: false,
        sprite: projSprite
      });
    }

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

  function restartMatch(): void {
    modalLayer.removeChildren();
    state.screenShakeTimer = 0;
    state.screenShakeMagnitude = 0;
    resizeGameView();

    enemies.forEach((e) => e.container.destroy({ children: true }));
    projectiles.forEach((p) => p.sprite.destroy());
    hazards.forEach((h) => h.container.destroy({ children: true }));
    floatingTexts.forEach((f) => f.text.destroy());
    particles.forEach((p) => p.gfx.destroy());

    enemies = [];
    projectiles = [];
    hazards = [];
    floatingTexts = [];
    particles = [];

    for (let i = 0; i < 15; i++) {
      state.grid[i] = null;
      updateTileVisual(i);
    }

    state.castleHp = 100;
    hud.updateCastleHp();
    state.mana = 160;
    state.summonCost = 40;
    if (hud.summonBtn && hud.summonBtn.children[1]) {
      (hud.summonBtn.children[1] as Text).text = `Summon (${state.summonCost}) [Space]`;
    }
    state.currentWave = 1;
    state.maxWavesForLevel = 3 + Math.floor(state.currentCampaignLevel / 4);
    state.waveEnemiesSpawned = 0;
    state.waveEnemiesTotal = 8 + state.currentCampaignLevel * 2;
    state.bossSpawnedThisWave = false;
    state.isGameOver = false;
    state.isVictory = false;

    hud.goldBattleText.text = `🪙 Ducats: ${state.saveData.sovereignDucats}`;
    hud.levelWaveText.text = `STAGE ${state.currentCampaignLevel} - WAVE ${state.currentWave}/${state.maxWavesForLevel}`;
    hud.refreshDeckTray();
  }

  function startNextWave(): void {
    state.saveData.antimatter = Math.max(0, state.saveData.antimatter) + 1;
    writeSaveData(state.saveData);
    spawnFloatingText('+1 ANTIMATTER!', 480, 200, '#c084fc');

    state.currentWave++;
    state.waveEnemiesSpawned = 0;
    state.bossSpawnedThisWave = false;
    state.waveEnemiesTotal = 8 + state.currentWave * 3 + state.currentCampaignLevel * 2;
    state.waveSpawnInterval = Math.max(0.65, 1.5 - state.currentWave * 0.08);
    hud.levelWaveText.text = `STAGE ${state.currentCampaignLevel} - WAVE ${state.currentWave}/${state.maxWavesForLevel}`;
  }

  function spawnEnemy(forcedType?: EnemyId): void {
    const enemyContainer = new Container();

    let type: EnemyId = forcedType || 'grunt';
    if (!forcedType) {
      const roll = Math.random();
      if (roll < 0.3) type = 'scout';
      else if (roll < 0.55) type = 'tank';
      else type = 'grunt';
    }

    const lvlScalar = 1 + (state.currentCampaignLevel - 1) * 0.18 + (state.currentWave - 1) * 0.12;

    let baseHp = 65;
    let baseSpeed = 75;
    let spriteSize = 48;
    let texKey = 'creepGrunt';

    if (type === 'scout') {
      baseHp = 35;
      baseSpeed = 110;
      spriteSize = 40;
      texKey = 'creepScout';
    } else if (type === 'tank') {
      baseHp = 150;
      baseSpeed = 46;
      spriteSize = 56;
      texKey = 'creepTank';
    } else if (type === 'boss') {
      baseHp = 550;
      baseSpeed = 38;
      spriteSize = 72;
      texKey = 'creepBoss';
    }

    const maxHp = Math.round(baseHp * lvlScalar);

    const enemySprite = new Sprite(GameTextures[texKey] || Texture.WHITE);
    enemySprite.anchor.set(0.5);
    enemySprite.width = spriteSize;
    enemySprite.height = spriteSize;
    enemyContainer.addChild(enemySprite);

    const hpBar = new Graphics();
    hpBar.rect(-spriteSize / 2, -spriteSize / 2 - 8, spriteSize, 4).fill(0x16a34a);
    enemyContainer.addChild(hpBar);

    if (type === 'boss') {
      const bossTag = new Text({
        text: 'WARLORD',
        style: new TextStyle({ fontFamily: 'Lilita One', fill: '#facc15', fontSize: 10 })
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

  function startMatch(): void {
    state.gameState = 'BATTLE';
    menuRoot.visible = false;
    battleRoot.visible = true;
    restartMatch();
  }

  function returnToMenu(): void {
    state.gameState = 'MENU';
    modalLayer.removeChildren();
    menuRoot.visible = true;
    battleRoot.visible = false;
    renderStartMenu(menuRoot, modalLayer, app, startMatch, toggleFullscreen);
  }

  const hud: BattleHud = createBattleHud(
    uiLayer,
    summonHero,
    returnToMenu,
    spawnFloatingText,
    updateAllGridVisuals
  );

  installInputSystem({
    onHeroAttack: triggerHeroAttack,
    onCycleTargetMode: () => {
      state.currentTargetModeIndex = (state.currentTargetModeIndex + 1) % TARGET_MODES.length;
      if (hud.targetBtn && hud.targetBtn.children[1]) {
        (hud.targetBtn.children[1] as Text).text = `Priority: ${TARGET_MODES[state.currentTargetModeIndex]} [Tab]`;
      }
    },
    onSummonHero: summonHero,
    onUpgradeHeroCard: (idx) => {
      const equipped = getEquippedHeroDeck();
      const heroDef = equipped[idx];
      if (!heroDef || heroDef.level >= 4) return;
      const cost = [0, 150, 300, 600, 1200][heroDef.level] || 1200;
      if (state.mana >= cost) {
        state.mana -= cost;
        state.saveData.heroLevels[heroDef.id] = heroDef.level + 1;
        writeSaveData(state.saveData);
        sound.playUpgrade();
        hud.updateUpgradeCards();
        updateAllGridVisuals();
      }
    },
    onStartMatch: () => {
      sound.playWarHorn();
      startMatch();
    }
  });

  let lastTime = performance.now();

  app.ticker.add(() => {
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    if (state.gameState === 'MENU' || state.isGameOver || state.isVictory) return;

    if (state.screenShakeTimer > 0) {
      state.screenShakeTimer -= dt;
      app.stage.position.set(
        (window.innerWidth - VIRTUAL_WIDTH * app.stage.scale.x) / 2 + (Math.random() - 0.5) * state.screenShakeMagnitude * 2,
        (window.innerHeight - VIRTUAL_HEIGHT * app.stage.scale.y) / 2 + (Math.random() - 0.5) * state.screenShakeMagnitude * 2
      );
      if (state.screenShakeTimer <= 0) resizeGameView();
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

    state.mana += 3.8 * dt;
    hud.manaText.text = `⚡ Aether: ${Math.floor(state.mana)}`;
    hud.updateUpgradeCards();

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

    // Hero Idle, Throwing Spritesheet & Recoil Animation
    for (let i = 0; i < 15; i++) {
      const hero = state.grid[i];
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

        const facingLeft = Math.cos(hero.aimAngle) < 0;
        wrapper.scale.set(facingLeft ? -1 : 1, 1);
        sprite.width = HERO_SIZE;
        sprite.height = HERO_SIZE;

        if (hero.attackProgress > 0) {
          hero.attackProgress = Math.max(0, hero.attackProgress - dt * 4.5);
          const t = 1.0 - hero.attackProgress;
          let lunge = 0;
          let squashY = 1.0;
          let squashX = 1.0;

          if (t < 0.3) {
            lunge = -Math.sin((t / 0.3) * Math.PI * 0.5) * 6;
            squashY = 1.1;
            squashX = 0.95;
          } else if (t < 0.7) {
            const forwardT = (t - 0.3) / 0.4;
            lunge = Math.sin(forwardT * Math.PI) * 14;
            squashY = 0.9;
            squashX = 1.15;
          } else {
            const settleT = (t - 0.7) / 0.3;
            lunge = (1 - settleT) * 4;
          }

          wrapper.position.set(
            cellW / 2 + Math.cos(hero.aimAngle) * lunge,
            cellH / 2 + Math.sin(hero.aimAngle) * lunge
          );
          sprite.scale.set(squashX, squashY);
        } else {
          sprite.texture = getHeroTexture(hero.type.id);
          const idleBob = Math.sin(now * 0.003 + i) * 1.5;
          wrapper.position.set(cellW / 2, cellH / 2 + idleBob);
          sprite.scale.set(1, 1);
        }
      }
    }

    // Spawn Wave Timing
    if (state.waveEnemiesSpawned < state.waveEnemiesTotal) {
      state.spawnTimer += dt;
      if (state.spawnTimer >= state.waveSpawnInterval) {
        state.spawnTimer = 0;
        spawnEnemy();
        state.waveEnemiesSpawned++;
      }
    } else if (!state.bossSpawnedThisWave) {
      spawnEnemy('boss');
      state.bossSpawnedThisWave = true;
    } else if (enemies.length === 0) {
      state.waveIntermissionTimer += dt;
      if (state.waveIntermissionTimer >= 1.5) {
        state.waveIntermissionTimer = 0;
        if (state.currentWave >= state.maxWavesForLevel) {
          projectiles.forEach(p => p.sprite.destroy());
          projectiles = [];
          showVictoryModal(
            modalLayer,
            () => {
              if (state.currentCampaignLevel < 20) state.currentCampaignLevel++;
              restartMatch();
            },
            returnToMenu
          );
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
          } else if (h.type === 'horseman' || h.type === 'pyromancer') {
            e.hp -= (24 + h.level * 10) * dt;
          } else if (h.type === 'mage' || h.type === 'frostweaver') {
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
          state.castleHp = Math.max(0, state.castleHp - (e.isBoss ? 35 : 10));
          hud.updateCastleHp();
          triggerScreenShake(8, 0.25);
          sound.playImpact();
          enemyLayer.removeChild(e.container);
          e.container.destroy({ children: true });
          enemies.splice(i, 1);

          if (state.castleHp <= 0) {
            showDefeatModal(modalLayer, restartMatch, returnToMenu);
          }
          continue;
        }
      } else {
        const step = e.currentSpeed * dt;
        e.x += (dx / dist) * step;
        e.y += (dy / dist) * step;
        e.distanceProgress += step;
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
      e.hpBar.rect(-barW / 2, -barW / 2 - 8, barW * hpPercent, 4).fill(hpPercent > 0.4 ? 0x16a34a : 0xdc2626);
    }

    // Projectile Movement & Collision
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
        const hitRadius = (e.isBoss ? 32 : e.type === 'tank' ? 26 : 22) + p.tier * 2;
        if (Math.hypot(e.x - p.x, e.y - p.y) <= hitRadius) {
          hitEnemy = e;
          break;
        }
      }

      if (hitEnemy || dist <= step || dist < 12) {
        const victim = hitEnemy || target;
        if (victim) {
          victim.hp -= p.damage;
          victim.hitFlinchTimer = 0.12;
          const vdx = victim.x - p.x;
          const vdy = victim.y - p.y;
          const vdist = Math.hypot(vdx, vdy) || 1;
          victim.flinchX = (vdx / vdist) * 5;
          victim.flinchY = (vdy / vdist) * 5;

          sound.playImpact();
          spawnImpactParticles(victim.x, victim.y, p.color, 8);
          spawnFloatingText(`-${p.damage}`, victim.x, victim.y - 14, '#fef08a');

          if (p.heroId === 'trebuchet' || p.heroId === 'bombardier') {
            triggerScreenShake(6, 0.18);
          }

          if (p.isCleave) {
            enemies.forEach(other => {
              if (other !== victim && Math.hypot(other.x - victim.x, other.y - victim.y) <= 55) {
                other.hp -= Math.round(p.damage * 0.65);
                other.hitFlinchTimer = 0.1;
                spawnFloatingText(`-${Math.round(p.damage * 0.65)}`, other.x, other.y - 14, '#ef4444');
              }
            });
          }

          if (p.isSplashFreeze) {
            enemies.forEach(other => {
              if (Math.hypot(other.x - victim.x, other.y - victim.y) <= 50) {
                other.freezeTimer = 1.8;
              }
            });
          }

          if (victim.hp <= 0) {
            const rewardAether = victim.isBoss ? 75 : 18;
            state.mana += rewardAether;
            state.saveData.sovereignDucats += victim.isBoss ? 25 : 4;
            writeSaveData(state.saveData);
            spawnFloatingText(`+${rewardAether} Aether`, victim.x, victim.y - 26, '#38bdf8');

            const eIdx = enemies.indexOf(victim);
            if (eIdx !== -1) {
              enemyLayer.removeChild(victim.container);
              victim.container.destroy({ children: true });
              enemies.splice(eIdx, 1);
            }
          }
        } else {
          spawnImpactParticles(p.x, p.y, p.color, 4);
        }

        projectileLayer.removeChild(p.sprite);
        p.sprite.destroy();
        projectiles.splice(i, 1);
      } else {
        if (dist > 0.001) {
          p.x += (dx / dist) * step;
          p.y += (dy / dist) * step;
          p.sprite.position.set(p.x, p.y);

          if (p.spinSpeed) {
            p.rotation += p.spinSpeed * dt;
          } else {
            p.rotation = Math.atan2(dy, dx);
          }
          p.sprite.rotation = p.rotation;
        }
      }
    }
  });

  battleRoot.visible = false;
  menuRoot.visible = true;
  renderStartMenu(menuRoot, modalLayer, app, startMatch, toggleFullscreen);
}
