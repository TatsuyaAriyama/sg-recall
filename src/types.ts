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

export type Screen = 'home' | 'study' | 'result';

export type SessionResult = {
  correct: number;
  wrong: number;
  total: number;
  prevStreak: number;
  newStreak: number;
  streakIncreased: boolean;
};
