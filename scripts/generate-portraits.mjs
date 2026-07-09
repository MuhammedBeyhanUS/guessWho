import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../src/assets/characters')
mkdirSync(outDir, { recursive: true })

const SKIN = {
  light: '#F5D0A9',
  'medium-light': '#E8B88A',
  medium: '#D4A574',
  'medium-dark': '#C68642',
  dark: '#8D5524',
}

const HAIR = {
  blonde: '#F4C430',
  brown: '#6B3A2A',
  black: '#1A1A1A',
  red: '#C0392B',
  gray: '#9E9E9E',
  white: '#E8E8E8',
  bald: 'none',
}

const OUTLINE = '#2D2D2D'

const characters = [
  {
    id: 'eleni',
    skin: 'medium-light',
    hair: 'brown',
    glasses: false,
    hat: false,
    beard: false,
    feminine: true,
    hairStyle: 'long',
    shirt: '#E74C3C',
  },
  {
    id: 'marco',
    skin: 'medium',
    hair: 'black',
    glasses: true,
    hat: false,
    beard: false,
    feminine: false,
    hairStyle: 'short',
    shirt: '#3498DB',
  },
  {
    id: 'priya',
    skin: 'medium-dark',
    hair: 'black',
    glasses: false,
    hat: false,
    beard: false,
    feminine: true,
    hairStyle: 'long',
    shirt: '#9B59B6',
  },
  {
    id: 'theo',
    skin: 'light',
    hair: 'blonde',
    glasses: true,
    hat: true,
    beard: false,
    feminine: false,
    hairStyle: 'short',
    shirt: '#2ECC71',
    hatColor: '#E67E22',
  },
  {
    id: 'yuki',
    skin: 'medium-light',
    hair: 'black',
    glasses: false,
    hat: false,
    beard: false,
    feminine: false,
    hairStyle: 'short',
    shirt: '#1ABC9C',
  },
  {
    id: 'fatima',
    skin: 'medium',
    hair: 'brown',
    glasses: true,
    hat: false,
    beard: false,
    feminine: true,
    hairStyle: 'hijab',
    shirt: '#8E44AD',
    hijabColor: '#5DADE2',
  },
  {
    id: 'owen',
    skin: 'light',
    hair: 'red',
    glasses: false,
    hat: false,
    beard: true,
    feminine: false,
    hairStyle: 'short',
    shirt: '#27AE60',
  },
  {
    id: 'sofia',
    skin: 'medium',
    hair: 'blonde',
    glasses: false,
    hat: true,
    beard: false,
    feminine: true,
    hairStyle: 'long',
    shirt: '#E91E63',
    hatColor: '#F39C12',
  },
  {
    id: 'derek',
    skin: 'light',
    hair: 'gray',
    glasses: true,
    hat: false,
    beard: true,
    feminine: false,
    hairStyle: 'short',
    shirt: '#34495E',
  },
  {
    id: 'amina',
    skin: 'dark',
    hair: 'black',
    glasses: false,
    hat: false,
    beard: false,
    feminine: true,
    hairStyle: 'natural',
    shirt: '#FF5722',
  },
  {
    id: 'liam',
    skin: 'medium-light',
    hair: 'brown',
    glasses: false,
    hat: false,
    beard: false,
    feminine: false,
    hairStyle: 'short',
    shirt: '#2196F3',
  },
  {
    id: 'nora',
    skin: 'light',
    hair: 'red',
    glasses: true,
    hat: false,
    beard: false,
    feminine: true,
    hairStyle: 'curly',
    shirt: '#FF9800',
  },
  {
    id: 'victor',
    skin: 'medium-dark',
    hair: 'black',
    glasses: false,
    hat: true,
    beard: true,
    feminine: false,
    hairStyle: 'short',
    shirt: '#795548',
    hatColor: '#455A64',
  },
  {
    id: 'hana',
    skin: 'medium-light',
    hair: 'brown',
    glasses: false,
    hat: false,
    beard: false,
    feminine: true,
    hairStyle: 'bob',
    shirt: '#00BCD4',
  },
  {
    id: 'jorge',
    skin: 'medium-dark',
    hair: 'brown',
    glasses: true,
    hat: false,
    beard: false,
    feminine: false,
    hairStyle: 'short',
    shirt: '#607D8B',
  },
  {
    id: 'zara',
    skin: 'medium',
    hair: 'blonde',
    glasses: false,
    hat: false,
    beard: false,
    feminine: true,
    hairStyle: 'long',
    shirt: '#673AB7',
  },
  {
    id: 'raj',
    skin: 'medium-dark',
    hair: 'black',
    glasses: false,
    hat: false,
    beard: true,
    feminine: false,
    hairStyle: 'short',
    shirt: '#009688',
  },
  {
    id: 'chiara',
    skin: 'light',
    hair: 'gray',
    glasses: true,
    hat: false,
    beard: false,
    feminine: true,
    hairStyle: 'short',
    shirt: '#3F51B5',
  },
  {
    id: 'kenji',
    skin: 'medium-light',
    hair: 'black',
    glasses: false,
    hat: true,
    beard: false,
    feminine: false,
    hairStyle: 'short',
    shirt: '#FF4081',
    hatColor: '#212121',
  },
  {
    id: 'mira',
    skin: 'medium',
    hair: 'red',
    glasses: false,
    hat: false,
    beard: false,
    feminine: true,
    hairStyle: 'long',
    shirt: '#CDDC39',
  },
  {
    id: 'alexis',
    skin: 'medium-light',
    hair: 'blonde',
    glasses: true,
    hat: false,
    beard: false,
    feminine: false,
    hairStyle: 'short',
    shirt: '#FF7043',
  },
  {
    id: 'diego',
    skin: 'medium',
    hair: 'brown',
    glasses: false,
    hat: false,
    beard: false,
    feminine: false,
    hairStyle: 'short',
    shirt: '#4CAF50',
  },
  {
    id: 'iris',
    skin: 'light',
    hair: 'white',
    glasses: false,
    hat: true,
    beard: false,
    feminine: true,
    hairStyle: 'short',
    shirt: '#9C27B0',
    hatColor: '#7B1FA2',
  },
  {
    id: 'sam',
    skin: 'medium',
    hair: 'bald',
    glasses: true,
    hat: false,
    beard: false,
    feminine: false,
    hairStyle: 'bald',
    shirt: '#607D8B',
  },
]

function hairLayer(c) {
  const color = HAIR[c.hair]
  if (c.hair === 'bald') return ''

  if (c.hairStyle === 'hijab') {
    return `<path d="M22 42 Q50 18 78 42 L78 68 Q50 58 22 68 Z" fill="${c.hijabColor}" stroke="${OUTLINE}" stroke-width="2"/>
<ellipse cx="50" cy="52" rx="26" ry="28" fill="${SKIN[c.skin]}" stroke="${OUTLINE}" stroke-width="2"/>`
  }

  const styles = {
    long: `<path d="M24 38 Q50 8 76 38 L82 78 Q50 70 18 78 Z" fill="${color}" stroke="${OUTLINE}" stroke-width="2"/>`,
    short: `<path d="M26 36 Q50 10 74 36 L72 52 Q50 44 28 52 Z" fill="${color}" stroke="${OUTLINE}" stroke-width="2"/>`,
    curly: `<path d="M22 40 Q30 12 50 18 Q70 12 78 40 Q84 55 72 58 Q50 48 28 58 Q16 55 22 40 Z" fill="${color}" stroke="${OUTLINE}" stroke-width="2"/>`,
    bob: `<path d="M24 36 Q50 12 76 36 L78 62 Q50 56 22 62 Z" fill="${color}" stroke="${OUTLINE}" stroke-width="2"/>`,
    natural: `<path d="M20 42 Q28 14 50 16 Q72 14 80 42 Q86 58 74 62 Q50 52 26 62 Q14 58 20 42 Z" fill="${color}" stroke="${OUTLINE}" stroke-width="2"/>`,
  }

  return styles[c.hairStyle] || styles.short
}

function faceLayer(c) {
  if (c.hairStyle === 'hijab') return ''
  const rx = c.feminine ? 24 : 26
  const ry = c.feminine ? 28 : 26
  return `<ellipse cx="50" cy="52" rx="${rx}" ry="${ry}" fill="${SKIN[c.skin]}" stroke="${OUTLINE}" stroke-width="2"/>`
}

function eyesLayer(_c) {
  const y = 48
  return `<circle cx="40" cy="${y}" r="3" fill="${OUTLINE}"/>
<circle cx="60" cy="${y}" r="3" fill="${OUTLINE}"/>`
}

function glassesLayer(c) {
  if (!c.glasses) return ''
  return `<rect x="30" y="42" width="18" height="14" rx="3" fill="none" stroke="${OUTLINE}" stroke-width="2"/>
<rect x="52" y="42" width="18" height="14" rx="3" fill="none" stroke="${OUTLINE}" stroke-width="2"/>
<line x1="48" y1="49" x2="52" y2="49" stroke="${OUTLINE}" stroke-width="2"/>`
}

function noseLayer() {
  return `<path d="M50 52 L47 58 L53 58 Z" fill="${OUTLINE}" opacity="0.6"/>`
}

function mouthLayer(c) {
  const y = c.feminine ? 64 : 63
  if (c.feminine) {
    return `<path d="M42 ${y} Q50 ${y + 5} 58 ${y}" fill="none" stroke="${OUTLINE}" stroke-width="2" stroke-linecap="round"/>`
  }
  return `<line x1="43" y1="${y}" x2="57" y2="${y}" stroke="${OUTLINE}" stroke-width="2" stroke-linecap="round"/>`
}

function beardLayer(c) {
  if (!c.beard) return ''
  return `<path d="M32 58 Q50 78 68 58 L68 72 Q50 82 32 72 Z" fill="${HAIR[c.hair === 'bald' ? 'black' : c.hair]}" stroke="${OUTLINE}" stroke-width="2"/>`
}

function hatLayer(c) {
  if (!c.hat) return ''
  const color = c.hatColor || '#455A64'
  return `<rect x="22" y="22" width="56" height="14" rx="4" fill="${color}" stroke="${OUTLINE}" stroke-width="2"/>
<rect x="30" y="10" width="40" height="18" rx="6" fill="${color}" stroke="${OUTLINE}" stroke-width="2"/>`
}

function shirtLayer(c) {
  return `<path d="M28 78 Q50 88 72 78 L76 98 L24 98 Z" fill="${c.shirt}" stroke="${OUTLINE}" stroke-width="2"/>`
}

function portrait(c) {
  const hijabFirst = c.hairStyle === 'hijab'
  const layers = hijabFirst
    ? [
        hairLayer(c),
        eyesLayer(c),
        glassesLayer(c),
        noseLayer(),
        mouthLayer(c),
        shirtLayer(c),
      ]
    : [
        shirtLayer(c),
        faceLayer(c),
        hairLayer(c),
        hatLayer(c),
        eyesLayer(c),
        glassesLayer(c),
        noseLayer(),
        mouthLayer(c),
        beardLayer(c),
      ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="${c.id} portrait">
  <rect width="100" height="100" fill="#FFF8E7" rx="6"/>
  ${layers.join('\n  ')}
</svg>`
}

function cardBack() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="Card back">
  <rect width="100" height="100" fill="#4A6741" rx="6"/>
  <rect x="8" y="8" width="84" height="84" fill="#5C7A52" rx="4" stroke="#2D2D2D" stroke-width="2"/>
  <circle cx="50" cy="50" r="18" fill="none" stroke="#FFF8E7" stroke-width="3" opacity="0.7"/>
  <circle cx="50" cy="50" r="10" fill="#FFF8E7" opacity="0.5"/>
  <path d="M20 20 L80 80 M80 20 L20 80" stroke="#FFF8E7" stroke-width="1.5" opacity="0.25"/>
  <path d="M50 14 L50 86 M14 50 L86 50" stroke="#FFF8E7" stroke-width="1.5" opacity="0.25"/>
</svg>`
}

for (const c of characters) {
  writeFileSync(join(outDir, `${c.id}.svg`), portrait(c))
}

writeFileSync(join(outDir, 'card-back.svg'), cardBack())
console.log(`Generated ${characters.length} portraits + card-back.svg`)
