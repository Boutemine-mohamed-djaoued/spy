import { describe, expect, it } from 'vitest'
import type { WordCategory } from '../data/categories'
import { createRound, createSubmittedRound, type SubmittedWord } from './createRound'

const testCategories: WordCategory[] = [
  {
    id: 'places',
    title: 'Places',
    words: ['Airport', 'Cinema', 'Museum'],
  },
  {
    id: 'food',
    title: 'Food',
    words: ['Pizza', 'Sushi'],
  },
]

const submittedWords: SubmittedWord[] = [
  {
    playerNumber: 1,
    word: 'Train station',
    hint: 'Place',
  },
  {
    playerNumber: 2,
    word: 'Watermelon',
    hint: 'Food',
  },
  {
    playerNumber: 3,
    word: 'Headphones',
    hint: 'Object',
  },
  {
    playerNumber: 4,
    word: 'Dentist',
    hint: 'Job',
  },
]

function sequenceRandom(values: number[]) {
  let index = 0

  return () => values[index++ % values.length]
}

describe('createRound', () => {
  it('creates one role for each player', () => {
    const round = createRound({
      playerCount: 6,
      imposterCount: 2,
      categories: testCategories,
      random: sequenceRandom([0, 0, 0, 0.9]),
    })

    expect(round.roles).toHaveLength(6)
    expect(round.playerCount).toBe(6)
  })

  it('creates the requested number of imposters', () => {
    const round = createRound({
      playerCount: 5,
      imposterCount: 2,
      categories: testCategories,
      random: sequenceRandom([0, 0, 0, 0.99]),
    })

    expect(round.roles.filter((role) => role.kind === 'spy')).toHaveLength(2)
  })

  it('keeps imposter player numbers unique', () => {
    const round = createRound({
      playerCount: 5,
      imposterCount: 3,
      categories: testCategories,
      random: sequenceRandom([0, 0, 0.1, 0.1, 0.5, 0.9]),
    })
    const spyNumbers = round.roles
      .filter((role) => role.kind === 'spy')
      .map((role) => role.playerNumber)

    expect(new Set(spyNumbers).size).toBe(3)
  })

  it('does not assign the secret word to imposters', () => {
    const round = createRound({
      playerCount: 4,
      imposterCount: 1,
      categories: testCategories,
      random: sequenceRandom([0, 0.4, 0.25]),
    })
    const spy = round.roles.find((role) => role.kind === 'spy')

    expect(spy).toEqual({
      playerNumber: 2,
      kind: 'spy',
    })
  })

  it('exposes the selected category for spy reveals', () => {
    const round = createRound({
      playerCount: 4,
      imposterCount: 1,
      categories: testCategories,
      random: sequenceRandom([0.6, 0, 0]),
    })

    expect(round.category).toEqual({
      id: 'food',
      title: 'Food',
    })
  })

  it('rejects invalid player and imposter counts', () => {
    expect(() =>
      createRound({
        playerCount: 2,
        imposterCount: 1,
        categories: testCategories,
      }),
    ).toThrow('At least 3 players are required.')

    expect(() =>
      createRound({
        playerCount: 4,
        imposterCount: 0,
        categories: testCategories,
      }),
    ).toThrow('At least 1 imposter is required.')

    expect(() =>
      createRound({
        playerCount: 4,
        imposterCount: 4,
        categories: testCategories,
      }),
    ).toThrow('Imposters must be fewer than players.')
  })
})

describe('createSubmittedRound', () => {
  it('chooses one submitted word and exposes its hint as the clue', () => {
    const round = createSubmittedRound({
      playerCount: 4,
      imposterCount: 1,
      submissions: submittedWords,
      random: sequenceRandom([0.3, 0]),
    })

    expect(round.word).toBe('Watermelon')
    expect(round.clue).toEqual({
      label: 'Hint',
      value: 'Food',
    })
    expect(round.selectedWordPlayerNumber).toBe(2)
  })

  it('does not make the selected word owner a spy', () => {
    const round = createSubmittedRound({
      playerCount: 4,
      imposterCount: 3,
      submissions: submittedWords,
      random: sequenceRandom([0.3, 0, 0.5, 0.99]),
    })
    const selectedOwnerRole = round.roles.find(
      (role) => role.playerNumber === round.selectedWordPlayerNumber,
    )

    expect(selectedOwnerRole?.kind).toBe('player')
    expect(round.roles.filter((role) => role.kind === 'spy')).toHaveLength(3)
  })

  it('rejects missing or empty submissions', () => {
    expect(() =>
      createSubmittedRound({
        playerCount: 4,
        imposterCount: 1,
        submissions: submittedWords.slice(0, 3),
      }),
    ).toThrow('Every player must submit one word and hint.')

    expect(() =>
      createSubmittedRound({
        playerCount: 4,
        imposterCount: 1,
        submissions: [
          ...submittedWords.slice(0, 3),
          {
            playerNumber: 4,
            word: '   ',
            hint: 'Job',
          },
        ],
      }),
    ).toThrow('Every submission needs a word and hint.')
  })
})
