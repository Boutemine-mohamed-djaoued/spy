# Spy Game

A mobile-first React party game for passing one phone around the group. Pick the number of players and spies, start a round, and each player taps once to secretly reveal either the shared word or `SPY`.

## Commands

```bash
npm install
npm run dev
npm test
npm run build
```

## Editing words

Update the placeholder categories in `src/data/categories.ts`:

```ts
export const categories = [
  {
    id: 'places',
    title: 'Places',
    words: ['Airport', 'Cinema', 'Hospital'],
  },
]
```

Vercel can deploy this as a standard Vite static app.
