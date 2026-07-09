export type HairColor =
  'blonde' | 'brown' | 'black' | 'red' | 'gray' | 'white' | 'bald'

export type GenderPresentation = 'feminine' | 'masculine' | 'neutral'

export type SkinTone =
  'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'

export interface CharacterTraits {
  hairColor: HairColor
  glasses: boolean
  hat: boolean
  facialHair: boolean
  genderPresentation: GenderPresentation
  skinTone: SkinTone
}

export interface Character {
  id: string
  name: string
  traits: CharacterTraits
}

export const CHARACTERS: Character[] = [
  {
    id: 'eleni',
    name: 'Eleni',
    traits: {
      hairColor: 'brown',
      glasses: false,
      hat: false,
      facialHair: false,
      genderPresentation: 'feminine',
      skinTone: 'medium-light',
    },
  },
  {
    id: 'marco',
    name: 'Marco',
    traits: {
      hairColor: 'black',
      glasses: true,
      hat: false,
      facialHair: false,
      genderPresentation: 'masculine',
      skinTone: 'medium',
    },
  },
  {
    id: 'priya',
    name: 'Priya',
    traits: {
      hairColor: 'black',
      glasses: false,
      hat: false,
      facialHair: false,
      genderPresentation: 'feminine',
      skinTone: 'medium-dark',
    },
  },
  {
    id: 'theo',
    name: 'Theo',
    traits: {
      hairColor: 'blonde',
      glasses: true,
      hat: true,
      facialHair: false,
      genderPresentation: 'masculine',
      skinTone: 'light',
    },
  },
  {
    id: 'yuki',
    name: 'Yuki',
    traits: {
      hairColor: 'black',
      glasses: false,
      hat: false,
      facialHair: false,
      genderPresentation: 'neutral',
      skinTone: 'medium-light',
    },
  },
  {
    id: 'fatima',
    name: 'Fatima',
    traits: {
      hairColor: 'brown',
      glasses: true,
      hat: false,
      facialHair: false,
      genderPresentation: 'feminine',
      skinTone: 'medium',
    },
  },
  {
    id: 'owen',
    name: 'Owen',
    traits: {
      hairColor: 'red',
      glasses: false,
      hat: false,
      facialHair: true,
      genderPresentation: 'masculine',
      skinTone: 'light',
    },
  },
  {
    id: 'sofia',
    name: 'Sofia',
    traits: {
      hairColor: 'blonde',
      glasses: false,
      hat: true,
      facialHair: false,
      genderPresentation: 'feminine',
      skinTone: 'medium',
    },
  },
  {
    id: 'derek',
    name: 'Derek',
    traits: {
      hairColor: 'gray',
      glasses: true,
      hat: false,
      facialHair: true,
      genderPresentation: 'masculine',
      skinTone: 'light',
    },
  },
  {
    id: 'amina',
    name: 'Amina',
    traits: {
      hairColor: 'black',
      glasses: false,
      hat: false,
      facialHair: false,
      genderPresentation: 'feminine',
      skinTone: 'dark',
    },
  },
  {
    id: 'liam',
    name: 'Liam',
    traits: {
      hairColor: 'brown',
      glasses: false,
      hat: false,
      facialHair: false,
      genderPresentation: 'masculine',
      skinTone: 'medium-light',
    },
  },
  {
    id: 'nora',
    name: 'Nora',
    traits: {
      hairColor: 'red',
      glasses: true,
      hat: false,
      facialHair: false,
      genderPresentation: 'feminine',
      skinTone: 'light',
    },
  },
  {
    id: 'victor',
    name: 'Victor',
    traits: {
      hairColor: 'black',
      glasses: false,
      hat: true,
      facialHair: true,
      genderPresentation: 'masculine',
      skinTone: 'medium-dark',
    },
  },
  {
    id: 'hana',
    name: 'Hana',
    traits: {
      hairColor: 'brown',
      glasses: false,
      hat: false,
      facialHair: false,
      genderPresentation: 'feminine',
      skinTone: 'medium-light',
    },
  },
  {
    id: 'jorge',
    name: 'Jorge',
    traits: {
      hairColor: 'brown',
      glasses: true,
      hat: false,
      facialHair: false,
      genderPresentation: 'masculine',
      skinTone: 'medium-dark',
    },
  },
  {
    id: 'zara',
    name: 'Zara',
    traits: {
      hairColor: 'blonde',
      glasses: false,
      hat: false,
      facialHair: false,
      genderPresentation: 'feminine',
      skinTone: 'medium',
    },
  },
  {
    id: 'raj',
    name: 'Raj',
    traits: {
      hairColor: 'black',
      glasses: false,
      hat: false,
      facialHair: true,
      genderPresentation: 'masculine',
      skinTone: 'medium-dark',
    },
  },
  {
    id: 'chiara',
    name: 'Chiara',
    traits: {
      hairColor: 'gray',
      glasses: true,
      hat: false,
      facialHair: false,
      genderPresentation: 'feminine',
      skinTone: 'light',
    },
  },
  {
    id: 'kenji',
    name: 'Kenji',
    traits: {
      hairColor: 'black',
      glasses: false,
      hat: true,
      facialHair: false,
      genderPresentation: 'masculine',
      skinTone: 'medium-light',
    },
  },
  {
    id: 'mira',
    name: 'Mira',
    traits: {
      hairColor: 'red',
      glasses: false,
      hat: false,
      facialHair: false,
      genderPresentation: 'feminine',
      skinTone: 'medium',
    },
  },
  {
    id: 'alexis',
    name: 'Alexis',
    traits: {
      hairColor: 'blonde',
      glasses: true,
      hat: false,
      facialHair: false,
      genderPresentation: 'neutral',
      skinTone: 'medium-light',
    },
  },
  {
    id: 'diego',
    name: 'Diego',
    traits: {
      hairColor: 'brown',
      glasses: false,
      hat: false,
      facialHair: false,
      genderPresentation: 'masculine',
      skinTone: 'medium',
    },
  },
  {
    id: 'iris',
    name: 'Iris',
    traits: {
      hairColor: 'white',
      glasses: false,
      hat: true,
      facialHair: false,
      genderPresentation: 'feminine',
      skinTone: 'light',
    },
  },
  {
    id: 'sam',
    name: 'Sam',
    traits: {
      hairColor: 'bald',
      glasses: true,
      hat: false,
      facialHair: false,
      genderPresentation: 'neutral',
      skinTone: 'medium',
    },
  },
]

export function getCharacterById(id: string): Character | undefined {
  return CHARACTERS.find((character) => character.id === id)
}

export function getCharacterTrait<K extends keyof CharacterTraits>(
  id: string,
  trait: K,
): CharacterTraits[K] | undefined {
  return getCharacterById(id)?.traits[trait]
}

export type BooleanTraitKey = {
  [K in keyof CharacterTraits]: CharacterTraits[K] extends boolean ? K : never
}[keyof CharacterTraits]

export function hasTrait(id: string, trait: BooleanTraitKey): boolean {
  return getCharacterTrait(id, trait) === true
}
