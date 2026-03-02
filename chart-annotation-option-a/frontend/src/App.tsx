import React, { useEffect, useReducer } from 'react'
import { PAIRS } from './data/pairs'
import { QUESTIONS } from './data/questions'
import { reducer } from './state/reducer'
import { loadFromLocalStorage, saveToLocalStorage, makeParticipantId } from './state/storage'
import type { AppState } from './state/types'

import { ChartPair } from './components/ChartPair'
import { Questionnaire } from './components/Questionnaire'
import { NavButtons } from './components/NavButtons'
import { ProgressBar } from './components/ProgressBar'

const SUBMIT_ENDPOINT = import.meta.env.VITE_SUBMIT_ENDPOINT || 'http://127.0.0.1:8787/submit'

const initialState: AppState = {
  participantId: makeParticipantId(),
  currentIndex: 0,
  responses: {},
  submitted: false,
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const saved = loadFromLocalStorage<Partial<AppState>>()
    if (saved) dispatch({ type: 'LOAD', payload: saved })
  }, [])

  useEffect(() => {
    saveToLocalStorage({
      participantId: state.participantId,
      currentIndex: state.currentIndex,
      responses: state.responses,
      submitted: state.submitted,
    })
  }, [state.participantId, state.currentIndex, state.responses, state.submitted])

  const pair = PAIRS[state.currentIndex]
  const answersForPair = state.responses[pair.id] ?? {}
  const isLast = state.currentIndex === PAIRS.length - 1

  const pairComplete = QUESTIONS.every((q) => answersForPair[q.id] !== undefined)

  async function submitAll() {
    const payload = {
      participantId: state.participantId,
      submittedAt: new Date().toISOString(),
      pairs: PAIRS.map((p) => ({
        pairId: p.id,
        questionPrompt: p.questionPrompt,
        answers: state.responses[p.id] ?? {},
      })),
      userAgent: navigator.userAgent,
    }

    try {
      const res = await fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Submit failed: ${res.status}`)
      dispatch({ type: 'SUBMIT_SUCCESS' })
    } catch (e: any) {
      dispatch({ type: 'SUBMIT_ERROR', message: e?.message ?? 'Unknown error' })
    }
  }

  if (state.submitted) {
    return (
      <div className="container">
        <h1>Thanks!</h1>
        <p>Your responses were submitted successfully.</p>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="topBar">
        <div>
          <h1 className="title">Chart Pair Annotation</h1>
          <div className="subtle">
            Participant: <code>{state.participantId}</code>
          </div>
          <div className="subtle">
            Submitting to: <code>{SUBMIT_ENDPOINT}</code>
          </div>
        </div>
        <ProgressBar current={state.currentIndex} total={PAIRS.length} />
      </header>

      <div className="promptCard">
        <div className="promptTitle">Question the charts should answer</div>
        <div className="promptText">{pair.questionPrompt}</div>
      </div>

      <ChartPair
        leftSrc={pair.leftImage}
        rightSrc={pair.rightImage}
        leftLabel={pair.leftLabel}
        rightLabel={pair.rightLabel}
      />

      <Questionnaire
        pairId={pair.id}
        questions={QUESTIONS}
        answers={answersForPair}
        setAnswer={(qid, value) =>
          dispatch({ type: 'SET_ANSWER', pairId: pair.id, questionId: qid, value })
        }
      />

      {state.submitError && <div className="error">{state.submitError}</div>}

      <NavButtons
        onPrev={() => dispatch({ type: 'PREV' })}
        onNext={async () => {
          if (!pairComplete) return
          if (!isLast) dispatch({ type: 'NEXT' })
          else await submitAll()
        }}
        prevDisabled={state.currentIndex === 0}
        nextDisabled={!pairComplete}
        nextLabel={isLast ? 'Submit' : 'Next'}
      />
    </div>
  )
}
