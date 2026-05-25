import type { Card } from '../types';

export const INTERVAL_STEPS = [1, 3, 7, 14, 30, 60] as const;

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDaysISO(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function diffDays(fromISO: string, toISO: string): number {
  const [fy, fm, fd] = fromISO.split('-').map(Number);
  const [ty, tm, td] = toISO.split('-').map(Number);
  const a = new Date(fy, fm - 1, fd).getTime();
  const b = new Date(ty, tm - 1, td).getTime();
  return Math.round((b - a) / 86_400_000);
}

function nextIntervalCorrect(currentInterval: number): number {
  const idx = INTERVAL_STEPS.indexOf(currentInterval as (typeof INTERVAL_STEPS)[number]);
  if (idx === -1) {
    // 不正値: 直近のステップに丸めて1段進める
    const nextStep = INTERVAL_STEPS.find((s) => s > currentInterval);
    return nextStep ?? INTERVAL_STEPS[INTERVAL_STEPS.length - 1];
  }
  return INTERVAL_STEPS[Math.min(idx + 1, INTERVAL_STEPS.length - 1)];
}

export function markCorrect(card: Card): Card {
  const interval = nextIntervalCorrect(card.interval);
  return {
    ...card,
    interval,
    nextReview: addDaysISO(todayISO(), interval),
    correctCount: card.correctCount + 1,
  };
}

export function markWrong(card: Card): Card {
  return {
    ...card,
    interval: 1,
    nextReview: addDaysISO(todayISO(), 1),
    wrongCount: card.wrongCount + 1,
  };
}

export function isDue(card: Card, today: string = todayISO()): boolean {
  return card.nextReview <= today;
}

export function isWeak(card: Card): boolean {
  if (card.wrongCount >= 2) return true;
  if (card.correctCount === 0 && card.wrongCount >= 1) return true;
  return false;
}

export type CardStatus = '未出題' | 'ミス' | 'ヒット' | 'コンボ';

export function categorize(card: Card): CardStatus {
  const attempts = card.correctCount + card.wrongCount;
  if (attempts === 0) return '未出題';
  // interval が 1 のまま = 直近で間違えてリセットされた状態
  if (card.interval <= 1) return 'ミス';
  // 1回正解（interval 3）= ヒット
  if (card.interval < 7) return 'ヒット';
  // 2回以上連続正解（interval 7 以上）= コンボ
  return 'コンボ';
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
