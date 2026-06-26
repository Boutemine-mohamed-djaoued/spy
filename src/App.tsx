import { useState, type FormEvent } from 'react'
import {
  Eye,
  EyeOff,
  Minus,
  PencilLine,
  Play,
  Plus,
  RotateCcw,
  Send,
  ShieldQuestion,
  Users,
} from 'lucide-react'
import './App.css'
import { categories } from './data/categories'
import {
  createRound,
  createSubmittedRound,
  type GameRound,
  type PlayerRole,
} from './game/createRound'

type GameStage = 'setup' | 'word-handoff' | 'word-entry' | 'handoff' | 'revealed'

type SubmissionDraft = {
  word: string
  hint: string
}

const minPlayers = 3

function clampImposters(imposterCount: number, playerCount: number) {
  return Math.min(Math.max(1, imposterCount), playerCount - 1)
}

function createEmptySubmissionDrafts(playerCount: number) {
  return Array.from({ length: playerCount }, () => ({
    word: '',
    hint: '',
  }))
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

function RoleBadge({ role, clue }: { role: PlayerRole; clue: GameRound['clue'] }) {
  if (role.kind === 'spy') {
    return (
      <div className="role-badge spy">
        <ShieldQuestion size={34} strokeWidth={2.3} />
        <span>SPY</span>
        <small>
          {clue.label}: {clue.value}
        </small>
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
  const [submissionDrafts, setSubmissionDrafts] = useState<SubmissionDraft[]>([])
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0)
  const [formError, setFormError] = useState('')

  const currentRole = round?.roles[currentRoleIndex]
  const currentPlayerNumber = currentRoleIndex + 1
  const currentSubmissionPlayerNumber = currentSubmissionIndex + 1
  const currentDraft = submissionDrafts[currentSubmissionIndex] ?? {
    word: '',
    hint: '',
  }
  const isLastSubmission = currentSubmissionIndex === playerCount - 1

  function updatePlayerCount(nextPlayerCount: number) {
    const safePlayerCount = Math.max(minPlayers, nextPlayerCount)

    setPlayerCount(safePlayerCount)
    setImposterCount((currentImposters) => clampImposters(currentImposters, safePlayerCount))
  }

  function updateImposterCount(nextImposterCount: number) {
    setImposterCount(clampImposters(nextImposterCount, playerCount))
  }

  function resetToSetup() {
    setRound(null)
    setCurrentRoleIndex(0)
    setSubmissionDrafts([])
    setCurrentSubmissionIndex(0)
    setFormError('')
    setStage('setup')
  }

  function startRandomRound() {
    const nextRound = createRound({
      playerCount,
      imposterCount,
      categories,
    })

    setRound(nextRound)
    setCurrentRoleIndex(0)
    setStage('handoff')
  }

  function startSubmittedWordMode() {
    setSubmissionDrafts(createEmptySubmissionDrafts(playerCount))
    setCurrentSubmissionIndex(0)
    setFormError('')
    setRound(null)
    setStage('word-handoff')
  }

  function updateSubmissionDraft(field: keyof SubmissionDraft, value: string) {
    setSubmissionDrafts((drafts) =>
      drafts.map((draft, index) =>
        index === currentSubmissionIndex
          ? {
              ...draft,
              [field]: value,
            }
          : draft,
      ),
    )
  }

  function submitPlayerWord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedDraft = {
      word: currentDraft.word.trim(),
      hint: currentDraft.hint.trim(),
    }

    if (!trimmedDraft.word || !trimmedDraft.hint) {
      setFormError('Enter both a word and a hint.')
      return
    }

    const nextDrafts = submissionDrafts.map((draft, index) =>
      index === currentSubmissionIndex ? trimmedDraft : draft,
    )

    setSubmissionDrafts(nextDrafts)
    setFormError('')

    if (!isLastSubmission) {
      setCurrentSubmissionIndex((index) => index + 1)
      setStage('word-handoff')
      return
    }

    try {
      const nextRound = createSubmittedRound({
        playerCount,
        imposterCount,
        submissions: nextDrafts.map((draft, index) => ({
          playerNumber: index + 1,
          word: draft.word,
          hint: draft.hint,
        })),
      })

      setRound(nextRound)
      setSubmissionDrafts([])
      setCurrentSubmissionIndex(0)
      setCurrentRoleIndex(0)
      setStage('handoff')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not start the round.')
    }
  }

  function hideAndContinue() {
    if (!round) {
      setStage('setup')
      return
    }

    const nextIndex = currentRoleIndex + 1

    if (nextIndex >= round.roles.length) {
      resetToSetup()
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
              <p>Use the dataset, or collect one secret word and hint from every player.</p>
            </div>

            <div className="action-stack">
              <button type="button" className="primary-action" onClick={startRandomRound}>
                <Play size={21} fill="currentColor" strokeWidth={2.4} />
                Random word
              </button>
              <button type="button" className="secondary-action" onClick={startSubmittedWordMode}>
                <PencilLine size={21} strokeWidth={2.4} />
                Player words
              </button>
            </div>
          </>
        )}

        {stage === 'word-handoff' && (
          <>
            <header className="player-header">
              <p className="eyebrow">Player {currentSubmissionPlayerNumber}</p>
              <h1>Your word turn</h1>
            </header>

            <button type="button" className="reveal-button" onClick={() => setStage('word-entry')}>
              <PencilLine size={42} strokeWidth={2.1} />
              Enter word and hint
            </button>

            <p className="privacy-note">Keep your word secret while typing.</p>

            <button type="button" className="text-action" onClick={resetToSetup}>
              Back to setup
            </button>
          </>
        )}

        {stage === 'word-entry' && (
          <>
            <header className="player-header">
              <p className="eyebrow">Player {currentSubmissionPlayerNumber}</p>
              <h1>Add your word</h1>
            </header>

            <form className="entry-form" onSubmit={submitPlayerWord}>
              <label>
                <span>Word</span>
                <input
                  value={currentDraft.word}
                  onChange={(event) => updateSubmissionDraft('word', event.target.value)}
                  maxLength={40}
                  autoFocus
                />
              </label>

              <label>
                <span>Hint</span>
                <input
                  value={currentDraft.hint}
                  onChange={(event) => updateSubmissionDraft('hint', event.target.value)}
                  maxLength={40}
                />
              </label>

              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}

              <button type="submit" className="primary-action">
                <Send size={21} strokeWidth={2.4} />
                {isLastSubmission ? 'Start reveal pass' : 'Save and pass'}
              </button>

              <button type="button" className="secondary-action" onClick={resetToSetup}>
                Cancel round
              </button>
            </form>
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

            <RoleBadge role={currentRole} clue={round.clue} />

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
