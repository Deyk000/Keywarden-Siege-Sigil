import { Texture } from 'pixi.js';

export type HeroId = 
  | 'archer' | 'knight' | 'horseman' | 'mage' | 'trebuchet'
  | 'pyromancer' | 'ballista' | 'alchemist' | 'assassin' | 'frostweaver'
  | 'cleric' | 'berserker' | 'druid' | 'bombardier' | 'necromancer';

export type EnemyId = 'grunt' | 'scout' | 'tank' | 'boss';

const HERO_SVGS: Record<HeroId, string> = {
  archer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="54" rx="32" ry="26" fill="#142e1b"/>
    <path d="M26 38 Q50 18 74 38 L68 70 Q50 82 26 70 Z" fill="#1c4728" stroke="#0e2414" stroke-width="2.5"/>
    <path d="M66 22 Q92 48 66 74" fill="none" stroke="#633512" stroke-width="5.5" stroke-linecap="round"/>
    <circle cx="44" cy="48" r="18" fill="#15803d" stroke="#0e2414" stroke-width="3"/>
    <line x1="42" y1="48" x2="80" y2="48" stroke="#facc15" stroke-width="3.5" stroke-linecap="round"/>
    <polygon points="86,48 76,44 76,52" fill="#e2e8f0"/>
  </svg>`,

  knight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="52" rx="36" ry="30" fill="#0f172a"/>
    <ellipse cx="44" cy="50" rx="30" ry="24" fill="#991b1b" stroke="#450a0a" stroke-width="2"/>
    <circle cx="46" cy="50" r="19" fill="#cbd5e1" stroke="#334155" stroke-width="3"/>
    <rect x="42" y="33" width="6" height="34" fill="#facc15"/>
    <rect x="33" y="47" width="24" height="6" fill="#facc15"/>
    <line x1="46" y1="62" x2="84" y2="62" stroke="#f8fafc" stroke-width="5.5" stroke-linecap="round"/>
    <polygon points="90,62 82,57 82,67" fill="#f8fafc"/>
  </svg>`,

  horseman: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="52" rx="36" ry="30" fill="#2e1405"/>
    <ellipse cx="44" cy="50" rx="28" ry="22" fill="#b45309" stroke="#582404" stroke-width="2.5"/>
    <circle cx="44" cy="50" r="19" fill="#e2e8f0" stroke="#475569" stroke-width="3"/>
    <path d="M30 34 Q16 22 20 14 Q28 24 32 30 Z" fill="#facc15"/>
    <line x1="32" y1="36" x2="88" y2="36" stroke="#78350f" stroke-width="6.5" stroke-linecap="round"/>
    <polygon points="94,36 84,30 84,42" fill="#facc15"/>
  </svg>`,

  mage: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="52" rx="34" ry="30" fill="#080d1a"/>
    <ellipse cx="44" cy="50" rx="28" ry="22" fill="#1e3a8a"/>
    <circle cx="44" cy="50" r="22" fill="#1d4ed8" stroke="#172554" stroke-width="3"/>
    <line x1="40" y1="70" x2="76" y2="70" stroke="#633512" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="78" cy="70" r="10" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
  </svg>`,

  trebuchet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="24" y="28" width="48" height="44" rx="4" fill="#582404" stroke="#2e1405" stroke-width="3.5"/>
    <circle cx="24" cy="24" r="8.5" fill="#334155"/>
    <circle cx="72" cy="24" r="8.5" fill="#334155"/>
    <circle cx="24" cy="76" r="8.5" fill="#334155"/>
    <circle cx="72" cy="76" r="8.5" fill="#334155"/>
    <line x1="28" y1="50" x2="76" y2="50" stroke="#a16207" stroke-width="5.5" stroke-linecap="round"/>
    <circle cx="80" cy="50" r="9.5" fill="#7e22ce" stroke="#facc15" stroke-width="2.5"/>
  </svg>`,

  pyromancer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="52" rx="34" ry="28" fill="#450a0a"/>
    <circle cx="46" cy="50" r="20" fill="#ea580c" stroke="#7c2d12" stroke-width="3"/>
    <circle cx="74" cy="50" r="12" fill="#f97316" stroke="#fef08a" stroke-width="2.5"/>
  </svg>`,

  ballista: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect x="24" y="32" width="44" height="36" rx="4" fill="#451a03" stroke="#260f02" stroke-width="3"/>
    <path d="M50 16 Q86 50 50 84" fill="none" stroke="#78350f" stroke-width="6" stroke-linecap="round"/>
    <line x1="30" y1="50" x2="88" y2="50" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round"/>
  </svg>`,

  alchemist: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="52" rx="34" ry="28" fill="#14532d"/>
    <circle cx="46" cy="50" r="19" fill="#1f2937" stroke="#111827" stroke-width="3"/>
    <path d="M46 50 L72 56 L46 62 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="2"/>
    <circle cx="76" cy="40" r="9" fill="#22c55e" stroke="#a7f3d0" stroke-width="2"/>
  </svg>`,

  assassin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="52" rx="32" ry="26" fill="#020617"/>
    <circle cx="46" cy="50" r="18" fill="#1e1b4b" stroke="#09090b" stroke-width="3"/>
    <polygon points="82,34 76,46 72,44 76,34" fill="#cbd5e1" stroke="#475569"/>
  </svg>`,

  frostweaver: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="52" rx="34" ry="28" fill="#082f49"/>
    <circle cx="46" cy="50" r="19" fill="#0284c7" stroke="#0369a1" stroke-width="3"/>
    <line x1="38" y1="62" x2="88" y2="62" stroke="#67e8f9" stroke-width="4.5" stroke-linecap="round"/>
  </svg>`,

  cleric: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="52" rx="34" ry="28" fill="#451a03"/>
    <circle cx="46" cy="50" r="19" fill="#f8fafc" stroke="#e2e8f0" stroke-width="3"/>
    <line x1="42" y1="68" x2="76" y2="68" stroke="#ca8a04" stroke-width="4.5"/>
    <circle cx="80" cy="68" r="9" fill="#facc15" stroke="#ffffff" stroke-width="2"/>
  </svg>`,

  berserker: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="52" rx="36" ry="30" fill="#3f1a04"/>
    <circle cx="46" cy="50" r="20" fill="#78350f" stroke="#451a03" stroke-width="3"/>
    <line x1="44" y1="64" x2="82" y2="64" stroke="#475569" stroke-width="4.5"/>
    <path d="M78 52 Q90 64 78 76 Z" fill="#94a3b8" stroke="#334155" stroke-width="2"/>
  </svg>`,

  druid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="52" rx="34" ry="28" fill="#14532d"/>
    <circle cx="46" cy="50" r="19" fill="#166534" stroke="#052e16" stroke-width="3"/>
    <line x1="40" y1="68" x2="80" y2="68" stroke="#451a03" stroke-width="4.5"/>
    <circle cx="82" cy="68" r="7" fill="#4ade80"/>
  </svg>`,

  bombardier: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="52" rx="36" ry="30" fill="#18181b"/>
    <rect x="30" y="38" width="46" height="24" rx="4" fill="#3f3f46" stroke="#18181b" stroke-width="3"/>
    <circle cx="76" cy="50" r="12" fill="#18181b"/>
  </svg>`,

  necromancer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <ellipse cx="50" cy="52" rx="34" ry="28" fill="#030712"/>
    <circle cx="46" cy="50" r="18" fill="#3b0764" stroke="#1e1b4b" stroke-width="3"/>
    <circle cx="78" cy="56" r="9" fill="#10b981" stroke="#a7f3d0" stroke-width="2"/>
  </svg>`
};

const ENEMY_WALK_SVGS: Record<EnemyId, string[]> = {
  grunt: [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <ellipse cx="50" cy="52" rx="26" ry="20" fill="rgba(0,0,0,0.35)"/>
      <circle cx="48" cy="46" r="20" fill="#4d7c0f" stroke="#1f2937" stroke-width="3"/>
      <circle cx="41" cy="42" r="3.5" fill="#dc2626"/>
      <circle cx="55" cy="42" r="3.5" fill="#dc2626"/>
      <line x1="62" y1="58" x2="84" y2="30" stroke="#475569" stroke-width="6.5" stroke-linecap="round"/>
    </svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <ellipse cx="50" cy="52" rx="26" ry="20" fill="rgba(0,0,0,0.35)"/>
      <circle cx="50" cy="48" r="20" fill="#4d7c0f" stroke="#1f2937" stroke-width="3"/>
      <circle cx="43" cy="44" r="3.5" fill="#dc2626"/>
      <circle cx="57" cy="44" r="3.5" fill="#dc2626"/>
      <line x1="65" y1="60" x2="82" y2="36" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
    </svg>`
  ],
  scout: [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <ellipse cx="50" cy="52" rx="30" ry="18" fill="rgba(0,0,0,0.35)"/>
      <ellipse cx="44" cy="48" rx="24" ry="15" fill="#0f172a" stroke="#0284c7" stroke-width="3"/>
      <circle cx="36" cy="42" r="3" fill="#facc15"/>
      <circle cx="52" cy="42" r="3" fill="#facc15"/>
    </svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <ellipse cx="50" cy="52" rx="28" ry="18" fill="rgba(0,0,0,0.35)"/>
      <ellipse cx="46" cy="50" rx="24" ry="16" fill="#0f172a" stroke="#0284c7" stroke-width="3"/>
      <circle cx="38" cy="44" r="3" fill="#facc15"/>
      <circle cx="54" cy="44" r="3" fill="#facc15"/>
    </svg>`
  ],
  tank: [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <ellipse cx="50" cy="52" rx="36" ry="28" fill="rgba(0,0,0,0.45)"/>
      <rect x="20" y="24" width="58" height="50" rx="6" fill="#1c1917" stroke="#44403c" stroke-width="4"/>
      <rect x="38" y="42" width="20" height="4.5" rx="1.5" fill="#ef4444"/>
    </svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <ellipse cx="50" cy="52" rx="36" ry="28" fill="rgba(0,0,0,0.45)"/>
      <rect x="22" y="26" width="58" height="50" rx="6" fill="#1c1917" stroke="#44403c" stroke-width="4"/>
      <rect x="40" y="44" width="20" height="4.5" rx="1.5" fill="#ef4444"/>
    </svg>`
  ],
  boss: [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <ellipse cx="50" cy="52" rx="40" ry="32" fill="rgba(0,0,0,0.5)"/>
      <circle cx="48" cy="48" r="26" fill="#7f1d1d" stroke="#450a0a" stroke-width="4"/>
      <polygon points="34,20 40,8 46,16 48,6 50,16 56,8 62,20" fill="#facc15" stroke="#78350f" stroke-width="1.5"/>
      <ellipse cx="40" cy="43" rx="5" ry="3" fill="#fef08a"/>
      <ellipse cx="56" cy="43" rx="5" ry="3" fill="#fef08a"/>
    </svg>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <ellipse cx="50" cy="52" rx="40" ry="32" fill="rgba(0,0,0,0.5)"/>
      <circle cx="50" cy="50" r="26" fill="#7f1d1d" stroke="#450a0a" stroke-width="4"/>
      <polygon points="36,22 42,10 48,18 50,8 52,18 58,10 64,22" fill="#facc15" stroke="#78350f" stroke-width="1.5"/>
      <ellipse cx="42" cy="45" rx="5" ry="3" fill="#fef08a"/>
      <ellipse cx="58" cy="45" rx="5" ry="3" fill="#fef08a"/>
    </svg>`
  ]
};

const STATIC_SVGS = {
  castle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 110">
    <rect x="10" y="20" width="120" height="90" rx="4" fill="#334155" stroke="#1e293b" stroke-width="3"/>
    <rect x="6" y="8" width="34" height="95" fill="#475569" stroke="#1e293b" stroke-width="3"/>
    <rect x="100" y="8" width="34" height="95" fill="#475569" stroke="#1e293b" stroke-width="3"/>
    <polygon points="12,35 28,35 28,68 20,60 12,68" fill="#1d4ed8"/>
    <polygon points="106,35 122,35 122,68 114,60 106,68" fill="#1d4ed8"/>
    <path d="M48 105 L48 55 Q70 40 92 55 L92 105 Z" fill="#090d16" stroke="#1e293b" stroke-width="3"/>
    <line x1="56" y1="52" x2="56" y2="105" stroke="#94a3b8" stroke-width="3.5"/>
    <line x1="65" y1="46" x2="65" y2="105" stroke="#94a3b8" stroke-width="3.5"/>
    <line x1="75" y1="46" x2="75" y2="105" stroke="#94a3b8" stroke-width="3.5"/>
    <line x1="84" y1="52" x2="84" y2="105" stroke="#94a3b8" stroke-width="3.5"/>
  </svg>`
};

const textureCache: Record<string, Texture[]> = {};
let castleTextureCache: Texture | null = null;

function renderSvg(svg: string, w = 100, h = 100): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = w * 2;
  canvas.height = h * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Texture.WHITE;

  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

  const texture = Texture.from(canvas);
  img.onload = () => {
    ctx.drawImage(img, 0, 0, w * 2, h * 2);
    try {
      if ((texture as any).source?.update) {
        (texture as any).source.update();
      } else if (typeof (texture as any).update === 'function') {
        (texture as any).update();
      }
    } catch (_) {}
  };
  return texture;
}

export function getHeroAnimationFrames(heroId: HeroId): Texture[] {
  if (textureCache[heroId]) return textureCache[heroId];
  const svg = HERO_SVGS[heroId] || HERO_SVGS.archer;
  const tex = renderSvg(svg);
  const list = [tex, tex, tex, tex];
  textureCache[heroId] = list;
  return list;
}

export function getEnemyWalkFrames(enemyId: EnemyId): Texture[] {
  if (textureCache[enemyId]) return textureCache[enemyId];
  const list = ENEMY_WALK_SVGS[enemyId].map(svg => renderSvg(svg));
  textureCache[enemyId] = list;
  return list;
}

export function getSpriteTexture(key: string): Texture {
  if (key === 'castle') {
    if (!castleTextureCache) {
      castleTextureCache = renderSvg(STATIC_SVGS.castle, 140, 110);
    }
    return castleTextureCache;
  }
  if (HERO_SVGS[key as HeroId]) {
    return getHeroAnimationFrames(key as HeroId)[0];
  }
  return Texture.WHITE;
}