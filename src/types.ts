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
  | 'readingDetail';

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
