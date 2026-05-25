import { useEffect, useMemo, useReducer } from 'react';
import type {
  Card,
  CaseProgress,
  CaseResult,
  CaseSession,
  CaseStudy,
  Category,
  Meta,
  Screen,
  SessionResult,
  StudyMode,
} from './types';
import { loadCards, loadMeta, saveCards, saveMeta } from './lib/storage';
import { loadCaseProgress, recordResult, saveCaseProgress } from './lib/cases';
import { markCorrect, markWrong, isDue, isWeak, shuffle, todayISO } from './lib/srs';
import { updateStreak } from './lib/streak';
import { cases } from './data/cases';
import HomeScreen from './components/HomeScreen';
import StudyScreen from './components/StudyScreen';
import ResultScreen from './components/ResultScreen';
import CaseListScreen from './components/CaseListScreen';
import CaseStudyScreen from './components/CaseStudyScreen';
import CaseResultScreen from './components/CaseResultScreen';

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

  // 科目B
  caseProgress: Record<string, CaseProgress>;
  caseSession: CaseSession | null;
  caseResult: CaseResult | null;
};

type Action =
  | { type: 'init'; cards: Card[]; meta: Meta; caseProgress: Record<string, CaseProgress> }
  | { type: 'start'; ids: string[]; mode: StudyMode; category: Category | 'all' }
  | { type: 'mark'; correct: boolean; userAnswer: string }
  | { type: 'advance' }
  | { type: 'finish' }
  | { type: 'home' }
  // 科目B
  | { type: 'openCases' }
  | { type: 'startCase'; caseId: string }
  | { type: 'caseAnswer'; chosen: number }
  | { type: 'caseFinish' }
  | { type: 'closeCase' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'init':
      return { ...state, cards: action.cards, meta: action.meta, caseProgress: action.caseProgress };

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
      // 解説表示時点でカード状態 + セッション統計を更新（index は進めない）
      if (!state.session) return state;
      const id = state.session.queue[state.session.index];
      const cards = state.cards.map((c) => {
        if (c.id !== id) return c;
        const updated = action.correct ? markCorrect(c) : markWrong(c);
        return { ...updated, lastUserAnswer: action.userAnswer };
      });
      const session: Session = {
        ...state.session,
        correct: state.session.correct + (action.correct ? 1 : 0),
        wrong: state.session.wrong + (action.correct ? 0 : 1),
      };
      return { ...state, cards, session };
    }

    case 'advance': {
      // 「次へ」押下時。index を進めるだけ
      if (!state.session) return state;
      return {
        ...state,
        session: { ...state.session, index: state.session.index + 1 },
      };
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

    case 'openCases':
      return { ...state, screen: 'caseList', caseResult: null };

    case 'startCase': {
      const c = cases.find((x) => x.id === action.caseId);
      if (!c) return state;
      return {
        ...state,
        screen: 'caseStudy',
        caseSession: { caseId: c.id, index: 0, answers: new Array(c.questions.length).fill(null) },
        caseResult: null,
      };
    }

    case 'caseAnswer': {
      if (!state.caseSession) return state;
      const answers = state.caseSession.answers.slice();
      answers[state.caseSession.index] = action.chosen;
      return {
        ...state,
        caseSession: {
          ...state.caseSession,
          index: state.caseSession.index + 1,
          answers,
        },
      };
    }

    case 'caseFinish': {
      if (!state.caseSession) return state;
      const c = cases.find((x) => x.id === state.caseSession!.caseId);
      if (!c) return state;
      const answers = state.caseSession.answers;
      let correct = 0;
      const detailed: CaseResult['answers'] = c.questions.map((q, i) => {
        const chosen = answers[i] ?? -1;
        const isCorrect = chosen === q.correct;
        if (isCorrect) correct++;
        return { questionId: q.id, chosen, correct: q.correct, isCorrect };
      });
      const result: CaseResult = {
        caseId: c.id,
        correct,
        total: c.questions.length,
        answers: detailed,
      };
      const caseProgress = recordResult(state.caseProgress, c.id, correct, c.questions.length);
      return {
        ...state,
        screen: 'caseResult',
        caseSession: null,
        caseResult: result,
        caseProgress,
      };
    }

    case 'closeCase':
      return { ...state, screen: 'caseList', caseSession: null, caseResult: null };

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
  caseProgress: {},
  caseSession: null,
  caseResult: null,
};

export default function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // 起動時ロード
  useEffect(() => {
    dispatch({
      type: 'init',
      cards: loadCards(),
      meta: loadMeta(),
      caseProgress: loadCaseProgress(),
    });
  }, []);

  // 永続化
  useEffect(() => {
    if (state.cards.length > 0) saveCards(state.cards);
  }, [state.cards]);
  useEffect(() => {
    saveMeta(state.meta);
  }, [state.meta]);
  useEffect(() => {
    saveCaseProgress(state.caseProgress);
  }, [state.caseProgress]);

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

  // ケース演習: 設問終了で自動的に結果へ
  useEffect(() => {
    if (!state.caseSession) return;
    const c = cases.find((x) => x.id === state.caseSession!.caseId);
    if (!c) return;
    if (state.caseSession.index >= c.questions.length) {
      dispatch({ type: 'caseFinish' });
    }
  }, [state.caseSession]);

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

  // 現在のケース
  const currentCase: CaseStudy | null = useMemo(() => {
    const id = state.caseSession?.caseId ?? state.caseResult?.caseId;
    if (!id) return null;
    return cases.find((c) => c.id === id) ?? null;
  }, [state.caseSession, state.caseResult]);

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
        <HomeScreen
          cards={state.cards}
          caseProgress={{ total: cases.length, attempted: Object.keys(state.caseProgress).length }}
          onStart={start}
          onOpenCases={() => dispatch({ type: 'openCases' })}
        />
      )}
      {state.screen === 'study' && currentCard && state.session && (
        <StudyScreen
          card={currentCard}
          index={state.session.index}
          total={state.session.queue.length}
          onMark={(correct, userAnswer) => dispatch({ type: 'mark', correct, userAnswer })}
          onNext={() => dispatch({ type: 'advance' })}
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

      {state.screen === 'caseList' && (
        <CaseListScreen
          cases={cases}
          progress={state.caseProgress}
          onSelect={(id) => dispatch({ type: 'startCase', caseId: id })}
          onBack={() => dispatch({ type: 'home' })}
        />
      )}
      {state.screen === 'caseStudy' &&
        currentCase &&
        state.caseSession &&
        state.caseSession.index < currentCase.questions.length && (
          <CaseStudyScreen
            caseStudy={currentCase}
            index={state.caseSession.index}
            onAnswer={(chosen) => dispatch({ type: 'caseAnswer', chosen })}
            onQuit={() => dispatch({ type: 'caseFinish' })}
          />
        )}
      {state.screen === 'caseResult' && state.caseResult && currentCase && (
        <CaseResultScreen
          result={state.caseResult}
          caseStudy={currentCase}
          onAgain={() => dispatch({ type: 'startCase', caseId: currentCase.id })}
          onList={() => dispatch({ type: 'closeCase' })}
        />
      )}
    </div>
  );
}
