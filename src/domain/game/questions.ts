import { CHARACTERS, getCharacterTrait, hasTrait } from '../characters'
import type { BooleanTraitKey, CharacterTraits, HairColor } from '../characters'
import type { YesNo } from './types'

export type ParsedQuestion =
  | { kind: 'boolean'; trait: BooleanTraitKey }
  | { kind: 'hairColor'; value: HairColor }
  | { kind: 'gender'; value: CharacterTraits['genderPresentation'] }

const BOOLEAN_PATTERNS: { trait: BooleanTraitKey; patterns: RegExp[] }[] = [
  {
    trait: 'glasses',
    patterns: [/\bglasses\b/, /\bspectacles\b/],
  },
  {
    trait: 'hat',
    patterns: [/\bhat\b/, /\bcap\b/, /\bheadwear\b/],
  },
  {
    trait: 'facialHair',
    patterns: [
      /\bfacial\s+hair\b/,
      /\bbeard\b/,
      /\bmustache\b/,
      /\bmoustache\b/,
    ],
  },
]

const HAIR_COLOR_PATTERNS: { value: HairColor; patterns: RegExp[] }[] = [
  { value: 'blonde', patterns: [/\bblonde\b/, /\bblond\b/] },
  { value: 'brown', patterns: [/\bbrown\b/] },
  { value: 'black', patterns: [/\bblack\b/] },
  { value: 'red', patterns: [/\bred\b/, /\bredhead\b/] },
  { value: 'gray', patterns: [/\bgray\b/, /\bgrey\b/] },
  { value: 'white', patterns: [/\bwhite\b/] },
  { value: 'bald', patterns: [/\bbald\b/] },
]

const GENDER_PATTERNS: {
  value: CharacterTraits['genderPresentation']
  patterns: RegExp[]
}[] = [
  {
    value: 'masculine',
    patterns: [/\bman\b/, /\bmale\b/, /\bboy\b/, /\bmasculine\b/, /\bhe\b/],
  },
  {
    value: 'feminine',
    patterns: [
      /\bwoman\b/,
      /\bfemale\b/,
      /\bgirl\b/,
      /\bfeminine\b/,
      /\bshe\b/,
    ],
  },
  {
    value: 'neutral',
    patterns: [/\bneutral\b/, /\bnonbinary\b/, /\bnon-binary\b/],
  },
]

function normalizeQuestion(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text))
}

export function parseQuestion(text: string): ParsedQuestion | null {
  const normalized = normalizeQuestion(text)
  if (normalized.length === 0) {
    return null
  }

  for (const { trait, patterns } of BOOLEAN_PATTERNS) {
    if (matchesAny(normalized, patterns)) {
      return { kind: 'boolean', trait }
    }
  }

  for (const { value, patterns } of HAIR_COLOR_PATTERNS) {
    if (matchesAny(normalized, patterns)) {
      return { kind: 'hairColor', value }
    }
  }

  for (const { value, patterns } of GENDER_PATTERNS) {
    if (matchesAny(normalized, patterns)) {
      return { kind: 'gender', value }
    }
  }

  return null
}

export function answerFromMystery(
  parsed: ParsedQuestion,
  mysteryCharacterId: string,
): YesNo | null {
  switch (parsed.kind) {
    case 'boolean':
      return hasTrait(mysteryCharacterId, parsed.trait) ? 'yes' : 'no'
    case 'hairColor':
      return getCharacterTrait(mysteryCharacterId, 'hairColor') === parsed.value
        ? 'yes'
        : 'no'
    case 'gender':
      return getCharacterTrait(mysteryCharacterId, 'genderPresentation') ===
        parsed.value
        ? 'yes'
        : 'no'
    default:
      return null
  }
}

export function deriveAnswer(
  text: string,
  mysteryCharacterId: string,
): YesNo | null {
  const parsed = parseQuestion(text)
  if (parsed === null) {
    return null
  }
  return answerFromMystery(parsed, mysteryCharacterId)
}

function characterMatchesParsed(
  characterId: string,
  parsed: ParsedQuestion,
): boolean {
  switch (parsed.kind) {
    case 'boolean':
      return hasTrait(characterId, parsed.trait)
    case 'hairColor':
      return getCharacterTrait(characterId, 'hairColor') === parsed.value
    case 'gender':
      return (
        getCharacterTrait(characterId, 'genderPresentation') === parsed.value
      )
    default:
      return false
  }
}

export function suggestEliminations(
  questionText: string,
  answer: YesNo,
  characterIds: readonly string[] = CHARACTERS.map((character) => character.id),
): string[] {
  const parsed = parseQuestion(questionText)
  if (parsed === null) {
    return []
  }

  return characterIds.filter((characterId) => {
    const matches = characterMatchesParsed(characterId, parsed)
    return answer === 'yes' ? !matches : matches
  })
}
