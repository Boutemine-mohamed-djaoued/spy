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
  clue: {
    label: string
    value: string
  }
  word: string
  playerCount: number
  imposterCount: number
  roles: PlayerRole[]
  selectedWordPlayerNumber?: number
}

export type CreateRoundOptions = {
  playerCount: number
  imposterCount: number
  categories: WordCategory[]
  random?: () => number
}

export type SubmittedWord = {
  playerNumber: number
  word: string
  hint: string
}

export type CreateSubmittedRoundOptions = {
  playerCount: number
  imposterCount: number
  submissions: SubmittedWord[]
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

function validateCounts(playerCount: number, imposterCount: number) {
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
}

function createRoles({
  playerCount,
  imposterCount,
  word,
  random,
  excludedSpyPlayerNumber,
}: {
  playerCount: number
  imposterCount: number
  word: string
  random: () => number
  excludedSpyPlayerNumber?: number
}) {
  const eligibleSpyNumbers = Array.from({ length: playerCount }, (_, index) => index + 1).filter(
    (playerNumber) => playerNumber !== excludedSpyPlayerNumber,
  )
  const spyNumbers = new Set<number>()

  while (spyNumbers.size < imposterCount) {
    spyNumbers.add(eligibleSpyNumbers[randomIndex(eligibleSpyNumbers.length, random)])
  }

  return Array.from({ length: playerCount }, (_, index): PlayerRole => {
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
  })
}

export function createRound({
  playerCount,
  imposterCount,
  categories,
  random = Math.random,
}: CreateRoundOptions): GameRound {
  validateCounts(playerCount, imposterCount)

  const playableCategories = categories.filter((category) => category.words.length > 0)

  if (playableCategories.length === 0) {
    throw new Error('Add at least one category with words.')
  }

  const category = playableCategories[randomIndex(playableCategories.length, random)]
  const word = category.words[randomIndex(category.words.length, random)]

  return {
    category: {
      id: category.id,
      title: category.title,
    },
    clue: {
      label: 'Category',
      value: category.title,
    },
    word,
    playerCount,
    imposterCount,
    roles: createRoles({
      playerCount,
      imposterCount,
      word,
      random,
    }),
  }
}

export function createSubmittedRound({
  playerCount,
  imposterCount,
  submissions,
  random = Math.random,
}: CreateSubmittedRoundOptions): GameRound {
  validateCounts(playerCount, imposterCount)

  if (submissions.length !== playerCount) {
    throw new Error('Every player must submit one word and hint.')
  }

  const submissionsByPlayer = new Map<number, SubmittedWord>()

  for (const submission of submissions) {
    assertPositiveInteger(submission.playerNumber, 'Player number')

    if (submission.playerNumber < 1 || submission.playerNumber > playerCount) {
      throw new Error('Submission player number is out of range.')
    }

    const word = submission.word.trim()
    const hint = submission.hint.trim()

    if (!word || !hint) {
      throw new Error('Every submission needs a word and hint.')
    }

    if (submissionsByPlayer.has(submission.playerNumber)) {
      throw new Error('Each player can submit only one word.')
    }

    submissionsByPlayer.set(submission.playerNumber, {
      playerNumber: submission.playerNumber,
      word,
      hint,
    })
  }

  const normalizedSubmissions = Array.from({ length: playerCount }, (_, index) => {
    const submission = submissionsByPlayer.get(index + 1)

    if (!submission) {
      throw new Error('Every player must submit one word and hint.')
    }

    return submission
  })
  const selectedSubmission =
    normalizedSubmissions[randomIndex(normalizedSubmissions.length, random)]

  return {
    category: {
      id: 'player-submitted',
      title: 'Player words',
    },
    clue: {
      label: 'Hint',
      value: selectedSubmission.hint,
    },
    word: selectedSubmission.word,
    playerCount,
    imposterCount,
    roles: createRoles({
      playerCount,
      imposterCount,
      word: selectedSubmission.word,
      random,
      excludedSpyPlayerNumber: selectedSubmission.playerNumber,
    }),
    selectedWordPlayerNumber: selectedSubmission.playerNumber,
  }
}
