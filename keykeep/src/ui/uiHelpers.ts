import { Container, NineSliceSprite, Text, TextStyle, Texture } from 'pixi.js';
import { sound } from '../audio';

export function createUiButton(
  normalTexture: Texture,
  pressedTexture: Texture,
  width: number,
  height: number,
  label: string,
  textStyle: TextStyle,
  onClick: () => void
): Container {
  const container = new Container();
  container.eventMode = 'static';
  container.cursor = 'pointer';

  const slice = new NineSliceSprite({
    texture: normalTexture,
    leftWidth: 16,
    topHeight: 16,
    rightWidth: 16,
    bottomHeight: 16,
    width,
    height
  });
  container.addChild(slice);

  const txt = new Text({ text: label, style: textStyle });
  txt.anchor.set(0.5);
  txt.position.set(width / 2, height / 2);
  container.addChild(txt);

  container.on('pointerdown', () => {
    slice.texture = pressedTexture;
    sound.playKeypress();
    onClick();
  });

  container.on('pointerup', () => { slice.texture = normalTexture; });
  container.on('pointerupoutside', () => { slice.texture = normalTexture; });

  return container;
}

export function createPanel(
  texture: Texture,
  x: number,
  y: number,
  width: number,
  height: number,
  inset = 16
): NineSliceSprite {
  const slice = new NineSliceSprite({
    texture,
    leftWidth: inset,
    topHeight: inset,
    rightWidth: inset,
    bottomHeight: inset,
    width,
    height
  });
  slice.position.set(x, y);
  return slice;
}
