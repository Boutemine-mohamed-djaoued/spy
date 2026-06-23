import type { WordCategory } from '../data/categories'

export type PlayerRole =
  | {
      playerNumber: number
      kind: 'player'
      word: string
    }
  | {
      playerNumber: number
      kind: 'spy'
    }

export type GameRound = {
  category: {
    id: string
    title: string
  }
  word: string
  playerCount: number
  imposterCount: number
  roles: PlayerRole[]
}

export type CreateRoundOptions = {
  playerCount: number
  imposterCount: number
  categories: WordCategory[]
  random?: () => number
}

function assertPositiveInteger(value: number, label: string) {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be a whole number.`)
  }
}

function randomIndex(length: number, random: () => number) {
  return Math.min(Math.floor(random() * length), length - 1)
}

export function createRound({
  playerCount,
  imposterCount,
  categories,
  random = Math.random,
}: CreateRoundOptions): GameRound {
  assertPositiveInteger(playerCount, 'Player count')
  assertPositiveInteger(imposterCount, 'Imposter count')

  if (playerCount < 3) {
    throw new Error('At least 3 players are required.')
  }

  if (imposterCount < 1) {
    throw new Error('At least 1 imposter is required.')
  }

  if (imposterCount >= playerCount) {
    throw new Error('Imposters must be fewer than players.')
  }

  const playableCategories = categories.filter((category) => category.words.length > 0)

  if (playableCategories.length === 0) {
    throw new Error('Add at least one category with words.')
  }

  const category = playableCategories[randomIndex(playableCategories.length, random)]
  const word = category.words[randomIndex(category.words.length, random)]
  const spyNumbers = new Set<number>()

  while (spyNumbers.size < imposterCount) {
    spyNumbers.add(randomIndex(playerCount, random) + 1)
  }

  return {
    category: {
      id: category.id,
      title: category.title,
    },
    word,
    playerCount,
    imposterCount,
    roles: Array.from({ length: playerCount }, (_, index) => {
      const playerNumber = index + 1

      if (spyNumbers.has(playerNumber)) {
        return {
          playerNumber,
          kind: 'spy',
        }
      }

      return {
        playerNumber,
        kind: 'player',
        word,
      }
    }),
  }
}
