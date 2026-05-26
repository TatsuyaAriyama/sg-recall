import { useEffect, useMemo, useReducer } from 'react';
import type {
  Card,
  CaseProgress,
  CaseResult,
  CaseSession,
  CaseStudy,
  Category,
  Meta,
  MockExamHistory,
  MockExamResult,
  MockExamSession,
  MockMode,
  QuizResult,
  QuizSession,
  Screen,
  SessionResult,
  StudyMode,
  SyllabusTag,
} from './types';
import { loadCards, loadMeta, saveCards, saveMeta } from './lib/storage';
import { loadCaseProgress, recordResult, saveCaseProgress } from './lib/cases';
import { markCorrect, markWrong, isDue, isWeak, shuffle, todayISO } from './lib/srs';
import { updateStreak } from './lib/streak';
import { cases } from './data/cases';
import { additionalCases } from './data/cases_v2';
import { news } from './data/news';
import { readings } from './data/readings';
import { quizQuestions } from './data/quiz';
import {
  appendMockHistory,
  gradeMockSubjectA,
  gradeQuiz,
  loadMockHistory,
  selectMockSubjectA,
  selectQuizIds,
} from './lib/quiz';
import HomeScreen from './components/HomeScreen';
import StudyScreen from './components/StudyScreen';
import ResultScreen from './components/ResultScreen';
import CaseListScreen from './components/CaseListScreen';
import CaseStudyScreen from './components/CaseStudyScreen';
import CaseResultScreen from './components/CaseResultScreen';
import NewsScreen from './components/NewsScreen';
import ReadingsScreen from './components/ReadingsScreen';
import ReadingDetailScreen from './components/ReadingDetailScreen';
import QuizConfigScreen from './components/QuizConfigScreen';
import QuizScreen from './components/QuizScreen';
import QuizResultScreen from './components/QuizResultScreen';
import MockConfigScreen from './components/MockConfigScreen';
import MockExamScreen from './components/MockExamScreen';
import MockResultScreen from './components/MockResultScreen';
import SyllabusMapScreen from './components/SyllabusMapScreen';

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

  // 読み物
  readingId: string | null;

  // 科目A 四択演習
  quizSession: QuizSession | null;
  quizResult: QuizResult | null;
  lastQuizConfig: { syllabus: SyllabusTag | 'all'; count: number } | null;

  // 模擬試験
  mockSession: MockExamSession | null;
  mockResult: MockExamResult | null;
  mockHistory: MockExamHistory;
  lastMockMode: MockMode | null;
  // 結果画面で出題内訳を見せるため、最後の出題セットを保持
  lastMockIds: string[];
  lastMockAnswers: (number | null)[];
};

type Action =
  | { type: 'init'; cards: Card[]; meta: Meta; caseProgress: Record<string, CaseProgress>; mockHistory: MockExamHistory }
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
  | { type: 'closeCase' }
  | { type: 'openNews' }
  | { type: 'openReadings' }
  | { type: 'openReading'; readingId: string }
  | { type: 'closeReading' }
  // 科目A 四択
  | { type: 'openQuizConfig' }
  | { type: 'startQuiz'; ids: string[]; syllabus: SyllabusTag | 'all'; count: number }
  | { type: 'quizAnswer'; index: number; choice: number }
  | { type: 'finishQuiz' }
  | { type: 'closeQuizResult' }
  // 模擬試験
  | { type: 'openMockConfig' }
  | { type: 'startMock'; mode: MockMode; ids: string[]; durationSec: number }
  | { type: 'mockAnswer'; index: number; choice: number }
  | { type: 'finishMock' }
  | { type: 'closeMockResult' }
  // シラバスマップ
  | { type: 'openSyllabusMap' };

const allCases = (() => {
  const seen = new Set<string>();
  const merged: CaseStudy[] = [];
  for (const c of [...cases, ...additionalCases]) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    merged.push(c);
  }
  return merged;
})();

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'init':
      return {
        ...state,
        cards: action.cards,
        meta: action.meta,
        caseProgress: action.caseProgress,
        mockHistory: action.mockHistory,
      };

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
      const session: Session = {
        ...state.session,
        correct: state.session.correct + (action.correct ? 1 : 0),
        wrong: state.session.wrong + (action.correct ? 0 : 1),
      };
      return { ...state, cards, session };
    }

    case 'advance': {
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
      return {
        ...state,
        screen: 'home',
        session: null,
        quizSession: null,
        mockSession: null,
      };

    case 'openCases':
      return { ...state, screen: 'caseList', caseResult: null };

    case 'startCase': {
      const c = allCases.find((x) => x.id === action.caseId);
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
      const c = allCases.find((x) => x.id === state.caseSession!.caseId);
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

    case 'openNews':
      return { ...state, screen: 'news' };

    case 'openReadings':
      return { ...state, screen: 'readings', readingId: null };

    case 'openReading':
      return { ...state, screen: 'readingDetail', readingId: action.readingId };

    case 'closeReading':
      return { ...state, screen: 'readings', readingId: null };

    // ===== 四択演習 =====
    case 'openQuizConfig':
      return { ...state, screen: 'quizConfig', quizResult: null };

    case 'startQuiz':
      if (action.ids.length === 0) return state;
      return {
        ...state,
        screen: 'quiz',
        quizResult: null,
        lastQuizConfig: { syllabus: action.syllabus, count: action.count },
        quizSession: {
          ids: action.ids,
          index: 0,
          answers: new Array(action.ids.length).fill(null),
          syllabusFilter: action.syllabus,
        },
      };

    case 'quizAnswer': {
      if (!state.quizSession) return state;
      const answers = state.quizSession.answers.slice();
      answers[action.index] = action.choice;
      return {
        ...state,
        quizSession: { ...state.quizSession, answers },
      };
    }

    case 'finishQuiz': {
      if (!state.quizSession) return state;
      const result = gradeQuiz(
        quizQuestions,
        state.quizSession.ids,
        state.quizSession.answers,
      );
      return { ...state, screen: 'quizResult', quizResult: result, quizSession: null };
    }

    case 'closeQuizResult':
      return { ...state, screen: 'quizConfig', quizResult: null };

    // ===== 模擬試験 =====
    case 'openMockConfig':
      return { ...state, screen: 'mockConfig', mockResult: null };

    case 'startMock':
      if (action.ids.length === 0) return state;
      return {
        ...state,
        screen: 'mockExam',
        mockResult: null,
        lastMockMode: action.mode,
        mockSession: {
          mode: action.mode,
          questionIds: action.ids,
          caseIds: [],
          answers: new Array(action.ids.length).fill(null),
          caseAnswers: {},
          startedAt: Date.now(),
          durationSec: action.durationSec,
        },
      };

    case 'mockAnswer': {
      if (!state.mockSession) return state;
      const answers = state.mockSession.answers.slice();
      answers[action.index] = action.choice;
      return { ...state, mockSession: { ...state.mockSession, answers } };
    }

    case 'finishMock': {
      if (!state.mockSession) return state;
      const elapsed = Math.floor((Date.now() - state.mockSession.startedAt) / 1000);
      const ids = state.mockSession.questionIds;
      const answers = state.mockSession.answers;
      const result = gradeMockSubjectA(quizQuestions, ids, answers, elapsed);
      const history = appendMockHistory(result);
      return {
        ...state,
        screen: 'mockResult',
        mockResult: result,
        mockSession: null,
        mockHistory: history,
        lastMockIds: ids,
        lastMockAnswers: answers,
      };
    }

    case 'closeMockResult':
      return { ...state, screen: 'mockConfig', mockResult: null };

    // ===== シラバスマップ =====
    case 'openSyllabusMap':
      return { ...state, screen: 'syllabusMap' };

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
  readingId: null,
  quizSession: null,
  quizResult: null,
  lastQuizConfig: null,
  mockSession: null,
  mockResult: null,
  mockHistory: [],
  lastMockMode: null,
  lastMockIds: [],
  lastMockAnswers: [],
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
      mockHistory: loadMockHistory(),
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
    const c = allCases.find((x) => x.id === state.caseSession!.caseId);
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

  function startQuiz(syllabus: SyllabusTag | 'all', count: number) {
    const ids = selectQuizIds(quizQuestions, syllabus, count);
    dispatch({ type: 'startQuiz', ids, syllabus, count });
  }

  function restartQuiz() {
    if (state.lastQuizConfig) {
      startQuiz(state.lastQuizConfig.syllabus, state.lastQuizConfig.count);
    } else {
      dispatch({ type: 'closeQuizResult' });
    }
  }

  function startMock(mode: MockMode) {
    // mode から問題数と制限時間を決定
    let count = 48;
    let duration = 60 * 60; // 60min
    if (mode === 'short') {
      count = 20;
      duration = 30 * 60;
    } else if (mode === 'subjectA') {
      count = 48;
      duration = 60 * 60;
    } else {
      // full は将来拡張 (現状は subjectA と同じ)
      count = 48;
      duration = 60 * 60;
    }
    const ids = selectMockSubjectA(quizQuestions, count);
    if (ids.length === 0) return;
    dispatch({ type: 'startMock', mode, ids, durationSec: duration });
  }

  function restartMock() {
    if (state.lastMockMode) startMock(state.lastMockMode);
    else dispatch({ type: 'closeMockResult' });
  }

  // 現在のケース
  const currentCase: CaseStudy | null = useMemo(() => {
    const id = state.caseSession?.caseId ?? state.caseResult?.caseId;
    if (!id) return null;
    return allCases.find((c) => c.id === id) ?? null;
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
          caseProgress={{ total: allCases.length, attempted: Object.keys(state.caseProgress).length }}
          newsCount={news.length}
          readingsCount={readings.length}
          quizCount={quizQuestions.length}
          onStart={start}
          onOpenCases={() => dispatch({ type: 'openCases' })}
          onOpenNews={() => dispatch({ type: 'openNews' })}
          onOpenReadings={() => dispatch({ type: 'openReadings' })}
          onOpenQuiz={() => dispatch({ type: 'openQuizConfig' })}
          onOpenMock={() => dispatch({ type: 'openMockConfig' })}
          onOpenSyllabusMap={() => dispatch({ type: 'openSyllabusMap' })}
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
          cases={allCases}
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

      {state.screen === 'news' && (
        <NewsScreen news={news} onBack={() => dispatch({ type: 'home' })} />
      )}

      {state.screen === 'readings' && (
        <ReadingsScreen
          readings={readings}
          onSelect={(id) => dispatch({ type: 'openReading', readingId: id })}
          onBack={() => dispatch({ type: 'home' })}
        />
      )}

      {state.screen === 'readingDetail' && state.readingId &&
        (() => {
          const r = readings.find((x) => x.id === state.readingId);
          if (!r) return null;
          const idx = readings.findIndex((x) => x.id === r.id);
          const nextItem = readings[(idx + 1) % readings.length];
          return (
            <ReadingDetailScreen
              reading={r}
              onBack={() => dispatch({ type: 'closeReading' })}
              onNext={() => dispatch({ type: 'openReading', readingId: nextItem.id })}
            />
          );
        })()}

      {/* 科目A 四択演習 */}
      {state.screen === 'quizConfig' && (
        <QuizConfigScreen
          questions={quizQuestions}
          onStart={startQuiz}
          onBack={() => dispatch({ type: 'home' })}
        />
      )}
      {state.screen === 'quiz' && state.quizSession && (
        <QuizScreen
          questions={quizQuestions}
          ids={state.quizSession.ids}
          answers={state.quizSession.answers}
          onAnswer={(index, choice) => dispatch({ type: 'quizAnswer', index, choice })}
          onFinish={() => dispatch({ type: 'finishQuiz' })}
          onQuit={() => dispatch({ type: 'home' })}
        />
      )}
      {state.screen === 'quizResult' && state.quizResult && (
        <QuizResultScreen
          questions={quizQuestions}
          result={state.quizResult}
          onAgain={restartQuiz}
          onHome={() => dispatch({ type: 'home' })}
        />
      )}

      {/* 模擬試験 */}
      {state.screen === 'mockConfig' && (
        <MockConfigScreen
          questions={quizQuestions}
          history={state.mockHistory}
          onStart={startMock}
          onBack={() => dispatch({ type: 'home' })}
        />
      )}
      {state.screen === 'mockExam' && state.mockSession && (
        <MockExamScreen
          questions={quizQuestions}
          session={state.mockSession}
          onAnswer={(index, choice) => dispatch({ type: 'mockAnswer', index, choice })}
          onFinish={() => dispatch({ type: 'finishMock' })}
          onQuit={() => dispatch({ type: 'home' })}
        />
      )}
      {state.screen === 'mockResult' && state.mockResult && (
        <MockResultScreen
          questions={quizQuestions}
          result={state.mockResult}
          ids={state.lastMockIds}
          answers={state.lastMockAnswers}
          onRetry={restartMock}
          onHome={() => dispatch({ type: 'home' })}
        />
      )}

      {/* シラバスマップ */}
      {state.screen === 'syllabusMap' && (
        <SyllabusMapScreen
          cards={state.cards}
          quiz={quizQuestions}
          onBack={() => dispatch({ type: 'home' })}
        />
      )}
    </div>
  );
}
