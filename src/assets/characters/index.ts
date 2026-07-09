import eleni from './eleni.svg'
import marco from './marco.svg'
import priya from './priya.svg'
import theo from './theo.svg'
import yuki from './yuki.svg'
import fatima from './fatima.svg'
import owen from './owen.svg'
import sofia from './sofia.svg'
import derek from './derek.svg'
import amina from './amina.svg'
import liam from './liam.svg'
import nora from './nora.svg'
import victor from './victor.svg'
import hana from './hana.svg'
import jorge from './jorge.svg'
import zara from './zara.svg'
import raj from './raj.svg'
import chiara from './chiara.svg'
import kenji from './kenji.svg'
import mira from './mira.svg'
import alexis from './alexis.svg'
import diego from './diego.svg'
import iris from './iris.svg'
import sam from './sam.svg'
import cardBack from './card-back.svg'

export const characterPortraitUrls: Record<string, string> = {
  eleni,
  marco,
  priya,
  theo,
  yuki,
  fatima,
  owen,
  sofia,
  derek,
  amina,
  liam,
  nora,
  victor,
  hana,
  jorge,
  zara,
  raj,
  chiara,
  kenji,
  mira,
  alexis,
  diego,
  iris,
  sam,
}

export const cardBackUrl = cardBack

export function getCharacterPortraitUrl(characterId: string): string {
  return characterPortraitUrls[characterId] ?? ''
}
