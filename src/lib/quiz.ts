import type {
  MockExamHistory,
  MockExamResult,
  QuizQuestion,
  QuizResult,
  SyllabusTag,
} from '../types';
import { shuffle } from './srs';

/**
 * シラバスタグでフィルタしてからシャッフル、count 件だけ取る。
 * count が在庫より大きい場合は在庫すべて返す。
 */
export function selectQuizIds(
  questions: QuizQuestion[],
  syllabusFilter: SyllabusTag | 'all',
  count: number,
): string[] {
  const pool =
    syllabusFilter === 'all'
      ? questions
      : questions.filter((q) => q.syllabus === syllabusFilter);
  const ids = shuffle(pool.map((q) => q.id));
  return ids.slice(0, count);
}

export function gradeQuiz(
  questions: QuizQuestion[],
  ids: string[],
  answers: (number | null)[],
): QuizResult {
  let correct = 0;
  for (let i = 0; i < ids.length; i++) {
    const q = questions.find((x) => x.id === ids[i]);
    if (!q) continue;
    if (answers[i] === q.correct) correct++;
  }
  return { ids, answers, correct, total: ids.length };
}

/**
 * シラバスタグ別の出題数と保有数。SyllabusMapScreen 用。
 */
export function aggregateBySyllabus(
  questions: QuizQuestion[],
): Record<SyllabusTag, number> {
  const out = {} as Record<SyllabusTag, number>;
  for (const q of questions) {
    out[q.syllabus] = (out[q.syllabus] ?? 0) + 1;
  }
  return out;
}

// ===== 模擬試験 =====

/**
 * 模擬試験用に「シラバス重点に従って」科目A 48問を抽出する。
 * 実試験のセキュリティ重点 30問 / その他 18問 の比率を反映。
 *
 * 不足カテゴリは在庫から補完する。
 */
const SECURITY_HEAVY: SyllabusTag[] = [
  'セキュリティ全般',
  '攻撃手法',
  '暗号技術',
  '認証技術',
  'アクセス制御',
  'ネットワークセキュリティ',
  'クラウド/最新動向',
  'セキュアな開発',
  'インシデント対応',
  'ISMS/リスク管理',
  '組織と人的対策',
  'データ保護/物理対策',
  '監査・統制',
];

const NON_SECURITY: SyllabusTag[] = [
  '法令・標準',
  'その他テクノロジ',
  'ストラテジ/マネジメント',
];

export function selectMockSubjectA(
  questions: QuizQuestion[],
  totalCount: number = 48,
): string[] {
  // セキュリティ重点とそれ以外の枠数を計算 (本番比率 30:18 を 適用)
  const securityRatio = 30 / 48;
  const securityCount = Math.round(totalCount * securityRatio);
  const otherCount = totalCount - securityCount;

  const securityPool = questions.filter((q) => SECURITY_HEAVY.includes(q.syllabus));
  const otherPool = questions.filter((q) => NON_SECURITY.includes(q.syllabus));

  const securityIds = shuffle(securityPool.map((q) => q.id)).slice(0, securityCount);
  const otherIds = shuffle(otherPool.map((q) => q.id)).slice(0, otherCount);

  // 不足分があれば反対側からも補う (在庫が偏っている場合の保険)
  let result = [...securityIds, ...otherIds];
  if (result.length < totalCount) {
    const used = new Set(result);
    const rest = shuffle(questions.filter((q) => !used.has(q.id)).map((q) => q.id));
    result = [...result, ...rest.slice(0, totalCount - result.length)];
  }

  // 最終シャッフル (出題順がカテゴリ偏らないように)
  return shuffle(result);
}

/**
 * 科目A の模擬試験結果を採点しカテゴリ別の正答率も出す。
 */
export function gradeMockSubjectA(
  questions: QuizQuestion[],
  ids: string[],
  answers: (number | null)[],
  elapsedSec: number,
  caseScore = { correct: 0, total: 0 },
): MockExamResult {
  const perCategory = {} as Record<SyllabusTag, { correct: number; total: number }>;
  let scoreA = 0;
  for (let i = 0; i < ids.length; i++) {
    const q = questions.find((x) => x.id === ids[i]);
    if (!q) continue;
    const cell = perCategory[q.syllabus] ?? { correct: 0, total: 0 };
    cell.total++;
    if (answers[i] === q.correct) {
      cell.correct++;
      scoreA++;
    }
    perCategory[q.syllabus] = cell;
  }
  const totalA = ids.length;
  const scoreB = caseScore.correct;
  const totalB = caseScore.total;
  const totalAll = totalA + totalB;
  const correctAll = scoreA + scoreB;
  const scorePercent = totalAll === 0 ? 0 : Math.round((correctAll / totalAll) * 100);
  return {
    mode: totalB > 0 ? 'full' : 'subjectA',
    scoreA,
    totalA,
    scoreB,
    totalB,
    scorePercent,
    passed: scorePercent >= 60,
    elapsedSec,
    perCategory,
  };
}

// ===== 模擬試験 履歴の LocalStorage 永続化 =====

const MOCK_HISTORY_KEY = 'simple1-sg-mock-history-v1';

export function loadMockHistory(): MockExamHistory {
  try {
    const raw = localStorage.getItem(MOCK_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-50); // 直近50件のみ
  } catch {
    return [];
  }
}

export function saveMockHistory(history: MockExamHistory) {
  try {
    localStorage.setItem(MOCK_HISTORY_KEY, JSON.stringify(history.slice(-50)));
  } catch {
    // quota など
  }
}

export function appendMockHistory(result: MockExamResult): MockExamHistory {
  const history = loadMockHistory();
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const next: MockExamHistory = [
    ...history,
    {
      mode: result.mode,
      scorePercent: result.scorePercent,
      passed: result.passed,
      takenAt: stamp,
    },
  ];
  saveMockHistory(next);
  return next;
}
