import { useMemo, useState } from 'react';
import type { Card, Category, StudyMode } from '../types';
import { CATEGORIES } from '../types';
import { categorize, isDue, isWeak, todayISO } from '../lib/srs';
import type { CardStatus } from '../lib/srs';

type Props = {
  cards: Card[];
  caseProgress: { total: number; attempted: number };
  onStart: (mode: StudyMode, category: Category | 'all') => void;
  onOpenCases: () => void;
};

const STATUS_COLORS: Record<CardStatus, string> = {
  '未出題': '#9aa3a8',
  'ミス': '#e85a6a',
  'ヒット': '#4cc6e6',
  'コンボ': '#9bd24c',
};
const STATUS_ORDER: CardStatus[] = ['未出題', 'ミス', 'ヒット', 'コンボ'];

const MODES: { value: StudyMode; label: string; help: string }[] = [
  { value: 'due', label: '復習対象のみ', help: '今日が復習日のカード' },
  { value: 'random', label: '全カードランダム', help: '全カードからシャッフル' },
  { value: 'weak', label: '苦手カードのみ', help: '間違えやすいカード' },
];

export default function HomeScreen({ cards, caseProgress, onStart, onOpenCases }: Props) {
  const [mode, setMode] = useState<StudyMode>('due');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const today = todayISO();

  const filtered = useMemo(() => {
    let pool = cards;
    if (category !== 'all') pool = pool.filter((c) => c.category === category);
    if (mode === 'due') pool = pool.filter((c) => isDue(c, today));
    else if (mode === 'weak') pool = pool.filter((c) => isWeak(c));
    return pool;
  }, [cards, category, mode, today]);

  const statusCounts = useMemo(() => {
    const counts: Record<CardStatus, number> = { '未出題': 0, 'ミス': 0, 'ヒット': 0, 'コンボ': 0 };
    for (const c of cards) counts[categorize(c)]++;
    return counts;
  }, [cards]);

  return (
    <div className="mx-auto max-w-md px-4 py-6 pb-24">
      <header className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight text-black">SG用語フラッシュカード</h1>
        <p className="text-xs text-black/60 mt-1">情報セキュリティマネジメント試験</p>
      </header>

      {/* 科目B(ケース演習)エントリ */}
      <button
        onClick={onOpenCases}
        className="w-full mb-5 rounded-xl border-2 border-[var(--color-accent)] bg-white hover:bg-black/5 px-4 py-3 transition-colors text-left flex items-center justify-between"
      >
        <div>
          <div className="text-sm font-semibold text-[var(--color-accent)]">科目B 演習 (ケーススタディ)</div>
          <div className="text-[11px] text-black/60 mt-0.5">
            長文ケース → 4択で実践演習
          </div>
        </div>
        <div className="text-[11px] text-black/60 tabular-nums whitespace-nowrap ml-3">
          {caseProgress.attempted} / {caseProgress.total}
        </div>
      </button>

      <div className="text-xs text-black/60 mb-2">科目A(用語暗記)</div>

      <section className="mb-6">
        <ProgressBar counts={statusCounts} total={cards.length} />
      </section>

      <section className="mb-5">
        <Label>カテゴリ</Label>
        <div className="flex flex-wrap gap-1.5">
          <Pill active={category === 'all'} onClick={() => setCategory('all')}>
            全て
          </Pill>
          {CATEGORIES.map((c) => (
            <Pill key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </Pill>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <Label>学習モード</Label>
        <div className="grid grid-cols-1 gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`text-left rounded-lg border px-3 py-2.5 transition-colors bg-white ${
                mode === m.value
                  ? 'border-[var(--color-accent)] border-2'
                  : 'border-[var(--color-border)] hover:bg-black/5'
              }`}
            >
              <div className="text-sm font-medium text-black">{m.label}</div>
              <div className="text-xs text-black/60 mt-0.5">{m.help}</div>
            </button>
          ))}
        </div>
      </section>

      <button
        disabled={filtered.length === 0}
        onClick={() => onStart(mode, category)}
        className="w-full rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:bg-white disabled:text-black/40 disabled:border disabled:border-[var(--color-border)] text-white font-semibold py-3.5 transition-colors"
      >
        {filtered.length > 0 ? `学習開始（${filtered.length}枚）` : '対象カードがありません'}
      </button>
    </div>
  );
}

function ProgressBar({ counts, total }: { counts: Record<CardStatus, number>; total: number }) {
  const denom = total === 0 ? 1 : total;
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {STATUS_ORDER.map((s) => (
          <div key={s} className="text-center">
            <div className="text-[11px] font-medium tracking-wide" style={{ color: STATUS_COLORS[s] }}>
              {s}
            </div>
            <div className="text-2xl font-semibold tabular-nums" style={{ color: STATUS_COLORS[s] }}>
              {counts[s]}
            </div>
          </div>
        ))}
      </div>
      <div className="h-2.5 rounded-full bg-white border border-[var(--color-border)] overflow-hidden flex">
        {STATUS_ORDER.map((s) =>
          counts[s] > 0 ? (
            <div
              key={s}
              style={{
                width: `${(counts[s] / denom) * 100}%`,
                backgroundColor: STATUS_COLORS[s],
              }}
            />
          ) : null,
        )}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-black/60 mb-2">{children}</div>;
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
        active
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white'
          : 'border-[var(--color-border)] bg-white text-black hover:bg-black/5'
      }`}
    >
      {children}
    </button>
  );
}
