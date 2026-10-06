import { Assets, Texture } from 'pixi.js';

function getAssetUrl(path: string): string {
  return new URL(path, import.meta.url).href;
}

export const GameTextures: Record<string, Texture> = {};

export const ASSET_MANIFEST: Record<string, string> = {
  // UI Panels & Buttons
  panelBeige: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/panel_beige.png'),
  panelBrown: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/panel_brown.png'),
  panelBlue: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/panel_blue.png'),
  panelInsetBeige: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/panelInset_beige.png'),
  panelInsetBrown: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/panelInset_brown.png'),
  panelInsetBlue: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/panelInset_blue.png'),

  btnBeige: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/buttonLong_beige.png'),
  btnBeigePressed: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/buttonLong_beige_pressed.png'),
  btnBrown: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/buttonLong_brown.png'),
  btnBrownPressed: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/buttonLong_brown_pressed.png'),
  btnBlue: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/buttonLong_blue.png'),
  btnBluePressed: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/buttonLong_blue_pressed.png'),
  btnSquareBrown: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/buttonSquare_brown.png'),
  btnSquareBeige: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/buttonSquare_beige.png'),

  cursorSword: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/cursorSword_gold.png'),

  barBackMid: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/barBack_horizontalMid.png'),
  barRedMid: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/barRed_horizontalMid.png'),
  barBlueMid: getAssetUrl('./assets/kenney_ui-pack-rpg-expansion/PNG/barBlue_horizontalMid.png'),

  // Environment
  grassTile1: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Tile/medievalTile_01.png'),
  grassTile2: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Tile/medievalTile_02.png'),
  roadTile: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Tile/medievalTile_19.png'),
  stoneWall: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Structure/medievalStructure_01.png'),
  castleKeep: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Structure/medievalStructure_05.png'),
  treeProp: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Environment/medievalEnvironment_01.png'),
  rockProp: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Environment/medievalEnvironment_11.png'),

  // 15 Units
  unitRanger: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_02.png'),
  unitPaladin: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_01.png'),
  unitCavalry: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_03.png'),
  unitMage: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_06.png'),
  unitTrebuchet: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_14.png'),
  unitPyromancer: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_07.png'),
  unitBallista: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_15.png'),
  unitAlchemist: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_08.png'),
  unitAssassin: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_11.png'),
  unitFrostweaver: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_12.png'),
  unitCleric: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_04.png'),
  unitBerserker: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_17.png'),
  unitDruid: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_18.png'),
  unitBombardier: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_16.png'),
  unitNecromancer: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_19.png'),

  // Creeps
  creepGrunt: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_09.png'),
  creepScout: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_10.png'),
  creepTank: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_21.png'),
  creepBoss: getAssetUrl('./assets/kenney_medieval-rts(1)/PNG/Default size/Unit/medievalUnit_24.png'),

  // Projectiles
  projArrow: getAssetUrl('./assets/kenney_tower-defense-top-down/PNG/Default size/towerDefense_tile295.png'),
  projBoulder: getAssetUrl('./assets/kenney_tower-defense-top-down/PNG/Default size/towerDefense_tile296.png'),
  projMagic: getAssetUrl('./assets/kenney_tower-defense-top-down/PNG/Default size/towerDefense_tile297.png')
};

export async function loadAllGameAssets(): Promise<void> {
  const loadPromises = Object.entries(ASSET_MANIFEST).map(async ([key, url]) => {
    try {
      const tex = await Assets.load<Texture>(url);
      if (tex && tex.source) {
        tex.source.scaleMode = 'nearest';
      }
      GameTextures[key] = tex;
    } catch (err) {
      console.warn(`[KeyKeep] Failed to load "${key}" from ${url}. Using fallback.`, err);
      GameTextures[key] = Texture.WHITE;
    }
  });

  await Promise.all(loadPromises);
}