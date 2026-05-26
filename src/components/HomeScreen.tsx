import { useMemo, useState } from 'react';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react';
import type { Card, Category, StudyMode } from '../types';
import { CATEGORIES } from '../types';
import { categorize, isDue, isWeak, todayISO } from '../lib/srs';
import type { CardStatus } from '../lib/srs';
import Icon from './Icon';

type Props = {
  cards: Card[];
  caseProgress: { total: number; attempted: number };
  newsCount: number;
  readingsCount: number;
  onStart: (mode: StudyMode, category: Category | 'all') => void;
  onOpenCases: () => void;
  onOpenNews: () => void;
  onOpenReadings: () => void;
};

const STATUS_COLORS: Record<CardStatus, string> = {
  '未出題': 'var(--color-status-untouched)',
  'ミス': 'var(--color-status-miss)',
  'ヒット': 'var(--color-status-hit)',
  'コンボ': 'var(--color-status-combo)',
};
const STATUS_ORDER: CardStatus[] = ['未出題', 'ミス', 'ヒット', 'コンボ'];

const MODES: { value: StudyMode; label: string; help: string; icon: 'target' | 'sparkles' | 'pencil' }[] = [
  { value: 'due', label: '復習対象のみ', help: '今日が復習日のカード', icon: 'target' },
  { value: 'random', label: '全カードランダム', help: '全カードからシャッフル', icon: 'sparkles' },
  { value: 'weak', label: '苦手カードのみ', help: '間違えやすいカード', icon: 'pencil' },
];

export default function HomeScreen({
  cards,
  caseProgress,
  newsCount,
  readingsCount,
  onStart,
  onOpenCases,
  onOpenNews,
  onOpenReadings,
}: Props) {
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
    <div className="mx-auto max-w-md px-4 pt-8 pb-28">
      {/* 上部 nav: auth コントロール (Clerk publishable key 未設定時は非表示) */}
      {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && (
        <div className="flex items-center justify-end gap-1.5 mb-5 min-h-[32px]">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-[12px] font-semibold whitespace-nowrap text-[var(--color-text-secondary)] hover:text-[var(--color-text)] px-2.5 py-1.5 rounded-lg no-tap-highlight">
                ログイン
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="text-[12px] font-semibold whitespace-nowrap text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-3 py-1.5 rounded-lg shadow-primary-sm no-tap-highlight">
                新規登録
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-8 h-8',
                },
              }}
            />
          </Show>
        </div>
      )}

      <header className="mb-7">
        <div className="text-[11px] font-medium tracking-[0.18em] text-[var(--color-text-tertiary)] uppercase mb-1.5">
          SG · Information Security
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-text)] leading-tight">
          SG用語フラッシュカード
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mt-1.5">
          科目A 用語 / 科目B ケース演習
        </p>
      </header>

      {/* 科目B ヒーローカード */}
      <button
        onClick={onOpenCases}
        className="w-full mb-7 rounded-2xl bg-[var(--color-accent)] text-white shadow-primary text-left transition-transform hover:scale-[1.01] active:scale-[0.99] no-tap-highlight overflow-hidden relative"
        style={{
          backgroundImage:
            'linear-gradient(135deg, #7375e2 0%, #5b5bd6 50%, #4f4fc4 100%)',
        }}
      >
        <div className="absolute -right-6 -top-6 opacity-20">
          <Icon name="cards" size={120} strokeWidth={1.4} />
        </div>
        <div className="px-5 py-5 relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="rounded-lg bg-white/20 p-1.5 backdrop-blur-sm">
              <Icon name="doc" size={16} strokeWidth={2.2} />
            </div>
            <span className="text-[11px] font-semibold tracking-wider uppercase opacity-90">
              科目B 演習
            </span>
          </div>
          <div className="text-[18px] font-bold leading-snug mb-1">
            ケーススタディで実践演習
          </div>
          <div className="text-[12px] opacity-85 leading-relaxed">
            長文を読んで4択で答える、実試験形式
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-[11px] opacity-80 tabular-nums">
              <span className="text-[16px] font-semibold">{caseProgress.attempted}</span>
              <span className="opacity-70"> / {caseProgress.total} ケース</span>
            </div>
            <div className="flex items-center gap-1 text-[12px] font-semibold opacity-95">
              開く <Icon name="chevron-right" size={14} />
            </div>
          </div>
        </div>
      </button>

      {/* 通勤時間で読む: 読み物 */}
      <button
        onClick={onOpenReadings}
        className="w-full mb-2.5 rounded-2xl bg-[var(--color-surface)] shadow-soft hover:shadow-card-hover transition-all hover:scale-[1.005] active:scale-[0.995] no-tap-highlight text-left px-4 py-3.5 flex items-center gap-3"
      >
        <div className="rounded-xl bg-[var(--color-accent-soft)] p-2 text-[var(--color-accent)] flex-shrink-0">
          <Icon name="lightbulb" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-[var(--color-text)] truncate">
            セキュリティ読み物
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
            実務とAIのトピックを 3〜5 分で · {readingsCount}本
          </div>
        </div>
        <Icon name="chevron-right" size={16} className="text-[var(--color-text-tertiary)]" />
      </button>

      {/* セキュリティ事例集 */}
      <button
        onClick={onOpenNews}
        className="w-full mb-7 rounded-2xl bg-[var(--color-surface)] shadow-soft hover:shadow-card-hover transition-all hover:scale-[1.005] active:scale-[0.995] no-tap-highlight text-left px-4 py-3.5 flex items-center gap-3"
      >
        <div className="rounded-xl bg-[var(--color-surface-3)] p-2 text-[var(--color-text-secondary)] flex-shrink-0">
          <Icon name="book" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-[var(--color-text)] truncate">
            セキュリティ事例集
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
            実際のインシデントから学ぶ {newsCount}件 · 暇つぶしに
          </div>
        </div>
        <Icon name="chevron-right" size={16} className="text-[var(--color-text-tertiary)]" />
      </button>

      {/* 科目A セクション */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)]">
          科目A · 用語暗記
        </div>
        <div className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums">
          {cards.length}語
        </div>
      </div>

      <section className="mb-7 rounded-2xl bg-[var(--color-surface)] shadow-soft px-5 py-5">
        <ProgressBar counts={statusCounts} total={cards.length} />
      </section>

      <section className="mb-6">
        <SectionLabel>カテゴリ</SectionLabel>
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

      <section className="mb-7">
        <SectionLabel>学習モード</SectionLabel>
        <div className="grid grid-cols-1 gap-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              className={`text-left rounded-xl px-4 py-3 transition-all no-tap-highlight flex items-center gap-3 ${
                mode === m.value
                  ? 'bg-[var(--color-accent-soft)] ring-1 ring-[var(--color-accent-border)]'
                  : 'bg-[var(--color-surface)] shadow-soft hover:bg-[var(--color-surface-2)]'
              }`}
            >
              <div
                className={`rounded-lg p-2 ${
                  mode === m.value
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]'
                }`}
              >
                <Icon name={m.icon} size={16} />
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-[var(--color-text)]">{m.label}</div>
                <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{m.help}</div>
              </div>
              {mode === m.value && (
                <Icon name="check" size={16} className="text-[var(--color-accent)]" />
              )}
            </button>
          ))}
        </div>
      </section>

      <button
        disabled={filtered.length === 0}
        onClick={() => onStart(mode, category)}
        className="btn-primary w-full rounded-2xl font-semibold py-4 text-[15px] shadow-primary disabled:shadow-none flex items-center justify-center gap-2 no-tap-highlight"
      >
        {filtered.length > 0 ? (
          <>
            <Icon name="play" size={15} />
            学習開始 <span className="opacity-80">（{filtered.length}枚）</span>
          </>
        ) : (
          <>対象カードがありません</>
        )}
      </button>
    </div>
  );
}

function ProgressBar({ counts, total }: { counts: Record<CardStatus, number>; total: number }) {
  const denom = total === 0 ? 1 : total;
  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {STATUS_ORDER.map((s) => (
          <div key={s} className="text-center">
            <div
              className="text-[10px] font-semibold tracking-wider uppercase mb-0.5"
              style={{ color: STATUS_COLORS[s] }}
            >
              {s}
            </div>
            <div
              className="text-[22px] font-bold tabular-nums leading-none"
              style={{ color: STATUS_COLORS[s] }}
            >
              {counts[s]}
            </div>
          </div>
        ))}
      </div>
      <div className="h-2 rounded-full bg-[var(--color-surface-3)] overflow-hidden flex shadow-inner-soft">
        {STATUS_ORDER.map((s) =>
          counts[s] > 0 ? (
            <div
              key={s}
              className="transition-all duration-500"
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-2 px-1">
      {children}
    </div>
  );
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
      className={`text-[12px] rounded-full px-3 py-1.5 transition-all no-tap-highlight ${
        active
          ? 'bg-[var(--color-accent)] text-white shadow-primary-sm font-semibold'
          : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] shadow-soft'
      }`}
    >
      {children}
    </button>
  );
}
