import { useEffect, useMemo, useReducer } from 'react';
import type { Card, Meta, Screen, SessionResult, StudyMode, Category } from './types';
import { loadCards, loadMeta, saveCards, saveMeta } from './lib/storage';
import { markCorrect, markWrong, isDue, isWeak, shuffle, todayISO } from './lib/srs';
import { updateStreak } from './lib/streak';
import HomeScreen from './components/HomeScreen';
import StudyScreen from './components/StudyScreen';
import ResultScreen from './components/ResultScreen';

type Session = {
  queue: string[];
  index: number;
  correct: number;
  wrong: number;
  mode: StudyMode;
  category: Category | 'all';
};

type State = {
  cards: Card[];
  meta: Meta;
  screen: Screen;
  session: Session | null;
  result: SessionResult | null;
  lastConfig: { mode: StudyMode; category: Category | 'all' } | null;
};

type Action =
  | { type: 'init'; cards: Card[]; meta: Meta }
  | {
      type: 'start';
      ids: string[];
      mode: StudyMode;
      category: Category | 'all';
    }
  | { type: 'mark'; correct: boolean; userAnswer: string }
  | { type: 'finish' }
  | { type: 'home' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'init':
      return { ...state, cards: action.cards, meta: action.meta };

    case 'start':
      if (action.ids.length === 0) return state;
      return {
        ...state,
        screen: 'study',
        result: null,
        lastConfig: { mode: action.mode, category: action.category },
        session: {
          queue: action.ids,
          index: 0,
          correct: 0,
          wrong: 0,
          mode: action.mode,
          category: action.category,
        },
      };

    case 'mark': {
      if (!state.session) return state;
      const id = state.session.queue[state.session.index];
      const cards = state.cards.map((c) => {
        if (c.id !== id) return c;
        const updated = action.correct ? markCorrect(c) : markWrong(c);
        return { ...updated, lastUserAnswer: action.userAnswer };
      });
      const nextIndex = state.session.index + 1;
      const session: Session = {
        ...state.session,
        index: nextIndex,
        correct: state.session.correct + (action.correct ? 1 : 0),
        wrong: state.session.wrong + (action.correct ? 0 : 1),
      };
      return { ...state, cards, session };
    }

    case 'finish': {
      if (!state.session) return state;
      const prevStreak = state.meta.streak;
      const total = state.session.correct + state.session.wrong;
      let newMeta = state.meta;
      let streakIncreased = false;
      if (total > 0) {
        const r = updateStreak(state.meta, todayISO());
        newMeta = { ...r.meta, totalStudied: r.meta.totalStudied + total };
        streakIncreased = r.increased;
      }
      const result: SessionResult = {
        correct: state.session.correct,
        wrong: state.session.wrong,
        total,
        prevStreak,
        newStreak: newMeta.streak,
        streakIncreased,
      };
      return { ...state, meta: newMeta, screen: 'result', result, session: null };
    }

    case 'home':
      return { ...state, screen: 'home', session: null };

    default:
      return state;
  }
}

const INITIAL_STATE: State = {
  cards: [],
  meta: { streak: 0, totalStudied: 0 },
  screen: 'home',
  session: null,
  result: null,
  lastConfig: null,
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // 起動時ロード
  useEffect(() => {
    dispatch({ type: 'init', cards: loadCards(), meta: loadMeta() });
  }, []);

  // 永続化
  useEffect(() => {
    if (state.cards.length > 0) saveCards(state.cards);
  }, [state.cards]);
  useEffect(() => {
    saveMeta(state.meta);
  }, [state.meta]);

  // セッション中のカード
  const currentCard = useMemo<Card | null>(() => {
    if (!state.session) return null;
    if (state.session.index >= state.session.queue.length) return null;
    const id = state.session.queue[state.session.index];
    return state.cards.find((c) => c.id === id) ?? null;
  }, [state.session, state.cards]);

  // セッション終了の自動判定
  useEffect(() => {
    if (state.session && state.session.index >= state.session.queue.length) {
      dispatch({ type: 'finish' });
    }
  }, [state.session]);

  function start(mode: StudyMode, category: Category | 'all') {
    const today = todayISO();
    let pool = state.cards;
    if (category !== 'all') pool = pool.filter((c) => c.category === category);
    if (mode === 'due') pool = pool.filter((c) => isDue(c, today));
    else if (mode === 'weak') pool = pool.filter((c) => isWeak(c));
    const ids = shuffle(pool.map((c) => c.id));
    dispatch({ type: 'start', ids, mode, category });
  }

  function restart() {
    if (state.lastConfig) {
      start(state.lastConfig.mode, state.lastConfig.category);
    } else {
      dispatch({ type: 'home' });
    }
  }

  if (state.cards.length === 0) {
    return (
      <div className="min-h-full flex items-center justify-center text-black/60">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {state.screen === 'home' && (
        <HomeScreen cards={state.cards} onStart={start} />
      )}
      {state.screen === 'study' && currentCard && state.session && (
        <StudyScreen
          card={currentCard}
          index={state.session.index}
          total={state.session.queue.length}
          onAnswer={(correct, userAnswer) => dispatch({ type: 'mark', correct, userAnswer })}
          onQuit={() => dispatch({ type: 'finish' })}
        />
      )}
      {state.screen === 'result' && state.result && (
        <ResultScreen
          result={state.result}
          onHome={() => dispatch({ type: 'home' })}
          onAgain={restart}
        />
      )}
    </div>
  );
}
