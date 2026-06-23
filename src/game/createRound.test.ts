import { describe, expect, it } from 'vitest'
import type { WordCategory } from '../data/categories'
import { createRound } from './createRound'

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
