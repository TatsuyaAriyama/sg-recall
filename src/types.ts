export type Category =
  | '基礎'
  | '脅威'
  | '脆弱性と攻撃'
  | '暗号'
  | '認証'
  | 'アクセス制御'
  | 'ネットワーク'
  | 'クラウド・最新動向'
  | '開発・実装'
  | 'インシデント対応'
  | 'ISMS管理'
  | '組織と人的対策'
  | 'データ保護'
  | '物理的対策'
  | '監査・統制'
  | '法令・規格';

export const CATEGORIES: Category[] = [
  '基礎',
  '脅威',
  '脆弱性と攻撃',
  '暗号',
  '認証',
  'アクセス制御',
  'ネットワーク',
  'クラウド・最新動向',
  '開発・実装',
  'インシデント対応',
  'ISMS管理',
  '組織と人的対策',
  'データ保護',
  '物理的対策',
  '監査・統制',
  '法令・規格',
];

// 単語1つ or 同義語グループ（いずれか1つが含まれていればヒット扱い）
export type Keyword = string | string[];

export type Card = {
  id: string;
  term: string;
  answer: string;
  category: Category;
  keywords: Keyword[];
  interval: number;
  nextReview: string; // YYYY-MM-DD
  correctCount: number;
  wrongCount: number;
  lastUserAnswer?: string;
};

export type StudyMode = 'due' | 'random' | 'weak';

export type Meta = {
  lastStudyDate?: string;
  streak: number;
  totalStudied: number;
};

export type Screen =
  | 'home'
  | 'study'
  | 'result'
  | 'caseList'
  | 'caseStudy'
  | 'caseResult'
  | 'news'
  | 'readings'
  | 'readingDetail'
  | 'quizConfig'
  | 'quiz'
  | 'quizResult'
  | 'mockConfig'
  | 'mockExam'
  | 'mockResult'
  | 'syllabusMap';

// ===== 科目A 四択問題 (IPA 過去問形式) =====

/**
 * シラバス Ver.4.1 ベースの大分類タグ。
 * SyllabusMapScreen / フィルタ / 進捗集計に使う。
 */
export type SyllabusTag =
  | 'セキュリティ全般'         // CIA, 脅威, 攻撃の概要
  | '攻撃手法'                 // SQLi/XSS/CSRF/フィッシング 等
  | '暗号技術'                 // 共通鍵/公開鍵/ハッシュ/PKI
  | '認証技術'                 // 多要素/SSO/生体/FIDO
  | 'アクセス制御'             // RBAC/ABAC/最小権限
  | 'ネットワークセキュリティ' // FW/IDS/VPN/TLS/プロキシ
  | 'クラウド/最新動向'        // ゼロトラスト/CASB/IaC/AI
  | 'セキュアな開発'           // SDL/OWASP/脆弱性管理
  | 'インシデント対応'         // CSIRT/フォレンジック
  | 'ISMS/リスク管理'          // ISO27001/リスクアセス
  | '組織と人的対策'           // 教育/委託管理/規程
  | 'データ保護/物理対策'      // 暗号化/廃棄/入退室
  | '監査・統制'               // システム監査/内部統制
  | '法令・標準'               // 個情法/不正アクセス禁止法/基本法
  | 'その他テクノロジ'         // DB/OS/SC など科目A余白
  | 'ストラテジ/マネジメント'; // 戦略/サービスマネジメント等

export type QuizQuestion = {
  id: string;
  syllabus: SyllabusTag;
  prompt: string;        // 問題文
  choices: string[];     // 4択
  correct: number;       // 0..3
  explanation: string;   // 解説 (なぜ正解か / 他がなぜ違うか)
  difficulty?: 1 | 2 | 3; // 1=易 / 2=中 / 3=難 (任意)
};

/**
 * Quiz セッション (科目A 練習モード)。1問ごとに answer を入れていく。
 */
export type QuizSession = {
  ids: string[];
  index: number;
  answers: (number | null)[];
  syllabusFilter: SyllabusTag | 'all';
};

export type QuizResult = {
  ids: string[];
  answers: (number | null)[];
  correct: number;
  total: number;
};

// ===== 模擬試験 (Mock Exam) =====
// 本番: 科目A 48問 + 科目B 12問 / 120分 / 60点合格
// 短縮: 科目A 20問 / 30分 (時短セット)

export type MockMode = 'full' | 'subjectA' | 'short';

export type MockExamSession = {
  mode: MockMode;
  questionIds: string[];           // 科目A QuizQuestion の id
  caseIds: string[];               // 科目B CaseStudy の id (full のみ)
  answers: (number | null)[];      // questionIds に対応
  caseAnswers: Record<string, (number | null)[]>; // caseId -> 各設問の答え
  startedAt: number;               // unix ms
  durationSec: number;             // 制限時間 (秒)
};

export type MockExamResult = {
  mode: MockMode;
  scoreA: number;                  // 科目A の正答数
  totalA: number;
  scoreB: number;                  // 科目B の正答数 (full のみ)
  totalB: number;
  scorePercent: number;            // 全体正答率 (%)
  passed: boolean;                 // 60% 以上で合格扱い
  elapsedSec: number;
  perCategory: Record<SyllabusTag, { correct: number; total: number }>;
};

/** 累計の模擬試験スコア履歴 (LocalStorage 永続化) */
export type MockExamHistory = {
  mode: MockMode;
  scorePercent: number;
  passed: boolean;
  takenAt: string; // YYYY-MM-DD HH:mm
}[];

// ===== 読み物 (コラム) =====
export type ReadingCategory = '実務' | 'AI' | '基礎';

export type ReadingSection = {
  heading?: string; // 省略時は見出しなしの本文ブロック
  body: string;     // 改行で段落分割
};

export type ReadingItem = {
  id: string;
  title: string;
  subtitle: string;       // 一覧用の1行要約
  category: ReadingCategory;
  tag: string;            // 主題タグ (例: 'ゼロトラスト')
  readMinutes: number;    // 読了目安 (分)
  sections: ReadingSection[];
  takeaway?: string;      // 末尾の「持ち帰り」 (任意)
};

// ===== セキュリティ事例 (ニュース) =====
export type NewsItem = {
  id: string;
  title: string;
  year: number;
  category: string;       // ランサムウェア / 標的型 / 内部不正 など
  summary: string;        // 50〜100文字
  terms: string[];        // 関連用語 (本アプリの用語と紐付け)
  source: string;         // 'Wikipedia' / 'IPA' など
  url: string;            // 外部リンク
};

export type SessionResult = {
  correct: number;
  wrong: number;
  total: number;
  prevStreak: number;
  newStreak: number;
  streakIncreased: boolean;
};

// ===== 科目B (ケーススタディ) =====

export type CaseQuestion = {
  id: string;
  prompt: string;
  choices: string[]; // 4択
  correct: number;   // 正解インデックス 0..3
  explanation: string;
};

export type CaseStudy = {
  id: string;
  title: string;
  category: string;
  scenario: string;  // 長文。改行は \n
  questions: CaseQuestion[];
};

export type CaseProgress = {
  caseId: string;
  attemptCount: number;
  lastScore: number;   // 直近正答率 0..1
  bestScore: number;   // 最高正答率 0..1
};

export type CaseSession = {
  caseId: string;
  index: number;
  answers: (number | null)[]; // 各設問で選んだインデックス
};

export type CaseResult = {
  caseId: string;
  correct: number;
  total: number;
  answers: { questionId: string; chosen: number; correct: number; isCorrect: boolean }[];
};
