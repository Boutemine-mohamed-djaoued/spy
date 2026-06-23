import { useState } from 'react'
import { Eye, EyeOff, Minus, Play, Plus, RotateCcw, ShieldQuestion, Users } from 'lucide-react'
import './App.css'
import { categories } from './data/categories'
import { createRound, type GameRound, type PlayerRole } from './game/createRound'

type GameStage = 'setup' | 'handoff' | 'revealed'

const minPlayers = 3

function clampImposters(imposterCount: number, playerCount: number) {
  return Math.min(Math.max(1, imposterCount), playerCount - 1)
}

function Stepper({
  label,
  value,
  minimum,
  maximum,
  onChange,
}: {
  label: string
  value: number
  minimum: number
  maximum?: number
  onChange: (value: number) => void
}) {
  const decreaseDisabled = value <= minimum
  const increaseDisabled = maximum !== undefined && value >= maximum

  return (
    <div className="stepper">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="stepper-actions">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(value - 1)}
          disabled={decreaseDisabled}
        >
          <Minus size={20} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
          disabled={increaseDisabled}
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

function RoleBadge({ role, categoryTitle }: { role: PlayerRole; categoryTitle: string }) {
  if (role.kind === 'spy') {
    return (
      <div className="role-badge spy">
        <ShieldQuestion size={34} strokeWidth={2.3} />
        <span>SPY</span>
        <small>Category: {categoryTitle}</small>
      </div>
    )
  }

  return (
    <div className="role-badge player">
      <Eye size={34} strokeWidth={2.3} />
      <span>{role.word}</span>
    </div>
  )
}

function App() {
  const [playerCount, setPlayerCount] = useState(5)
  const [imposterCount, setImposterCount] = useState(1)
  const [round, setRound] = useState<GameRound | null>(null)
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0)
  const [stage, setStage] = useState<GameStage>('setup')

  const currentRole = round?.roles[currentRoleIndex]
  const currentPlayerNumber = currentRoleIndex + 1

  function updatePlayerCount(nextPlayerCount: number) {
    const safePlayerCount = Math.max(minPlayers, nextPlayerCount)

    setPlayerCount(safePlayerCount)
    setImposterCount((currentImposters) => clampImposters(currentImposters, safePlayerCount))
  }

  function updateImposterCount(nextImposterCount: number) {
    setImposterCount(clampImposters(nextImposterCount, playerCount))
  }

  function startRound() {
    const nextRound = createRound({
      playerCount,
      imposterCount,
      categories,
    })

    setRound(nextRound)
    setCurrentRoleIndex(0)
    setStage('handoff')
  }

  function hideAndContinue() {
    if (!round) {
      setStage('setup')
      return
    }

    const nextIndex = currentRoleIndex + 1

    if (nextIndex >= round.roles.length) {
      setRound(null)
      setCurrentRoleIndex(0)
      setStage('setup')
      return
    }

    setCurrentRoleIndex(nextIndex)
    setStage('handoff')
  }

  return (
    <main className="app-shell">
      <section className="game-panel" aria-live="polite">
        {stage === 'setup' && (
          <>
            <header className="app-header">
              <div className="brand-mark">
                <EyeOff size={28} strokeWidth={2.4} />
              </div>
              <div>
                <p className="eyebrow">Pass and reveal</p>
                <h1>Spy</h1>
              </div>
            </header>

            <div className="setup-stack">
              <Stepper
                label="Players"
                value={playerCount}
                minimum={minPlayers}
                onChange={updatePlayerCount}
              />
              <Stepper
                label="Spies"
                value={imposterCount}
                minimum={1}
                maximum={playerCount - 1}
                onChange={updateImposterCount}
              />
            </div>

            <div className="round-summary">
              <div>
                <Users size={20} strokeWidth={2.4} />
                <span>
                  {playerCount} players · {imposterCount} {imposterCount === 1 ? 'spy' : 'spies'}
                </span>
              </div>
              <p>Category and word are picked randomly every round.</p>
            </div>

            <button type="button" className="primary-action" onClick={startRound}>
              <Play size={21} fill="currentColor" strokeWidth={2.4} />
              Start round
            </button>
          </>
        )}

        {stage === 'handoff' && round && (
          <>
            <header className="player-header">
              <p className="eyebrow">Player {currentPlayerNumber}</p>
              <h1>Take the phone</h1>
            </header>

            <button type="button" className="reveal-button" onClick={() => setStage('revealed')}>
              <Eye size={42} strokeWidth={2.1} />
              Tap once to reveal
            </button>

            <p className="privacy-note">Keep the screen covered from other players.</p>
          </>
        )}

        {stage === 'revealed' && round && currentRole && (
          <>
            <header className="player-header">
              <p className="eyebrow">Player {currentPlayerNumber}</p>
              <h1>Your role</h1>
            </header>

            <RoleBadge role={currentRole} categoryTitle={round.category.title} />

            <button type="button" className="primary-action" onClick={hideAndContinue}>
              <RotateCcw size={21} strokeWidth={2.4} />
              Hide and pass
            </button>
          </>
        )}
      </section>
    </main>
  )
}

export default App
