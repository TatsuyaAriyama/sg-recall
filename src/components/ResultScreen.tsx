import type { SessionResult } from '../types';
import Icon from './Icon';

type Props = {
  result: SessionResult;
  onHome: () => void;
  onAgain: () => void;
};

export default function ResultScreen({ result, onHome, onAgain }: Props) {
  const { correct, wrong, total, prevStreak, newStreak, streakIncreased } = result;
  const rate = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <div className="mx-auto max-w-md min-h-full px-4 pt-8 pb-10 flex flex-col">
      <header className="mb-6 fade-in">
        <div className="flex items-center gap-2 mb-1">
          <div className="rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] p-1.5">
            <Icon name="sparkles" size={14} />
          </div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)]">
            セッション完了
          </span>
        </div>
        <h2 className="text-[24px] font-bold tracking-tight text-[var(--color-text)]">お疲れさまでした</h2>
      </header>

      <section className="rounded-3xl bg-[var(--color-surface)] shadow-card p-6 mb-4 slide-up">
        <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-2">
          正答率
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[56px] font-bold tabular-nums leading-none text-[var(--color-accent)]">
            {rate}
          </span>
          <span className="text-[18px] font-semibold text-[var(--color-text-secondary)]">%</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Cell label="できた" value={correct} accent />
          <Cell label="復習行き" value={wrong} />
          <Cell label="合計" value={total} />
        </div>
      </section>

      <section className="rounded-3xl bg-[var(--color-surface)] shadow-card p-6 mb-6 slide-up">
        <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-2">
          ストリーク
        </div>
        <div className="flex items-baseline gap-2.5">
          {streakIncreased && prevStreak !== newStreak ? (
            <>
              <span className="text-[18px] font-semibold tabular-nums text-[var(--color-text-tertiary)]">
                {prevStreak}
              </span>
              <Icon name="arrow-right" size={16} className="text-[var(--color-text-tertiary)]" />
              <span className="text-[44px] font-bold tabular-nums leading-none text-[var(--color-accent)] pop">
                {newStreak}
              </span>
              <span className="text-[13px] text-[var(--color-text-secondary)]">日</span>
            </>
          ) : (
            <>
              <span className="text-[44px] font-bold tabular-nums leading-none text-[var(--color-text)]">
                {newStreak}
              </span>
              <span className="text-[13px] text-[var(--color-text-secondary)]">日</span>
            </>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        <button
          onClick={onHome}
          className="rounded-2xl bg-[var(--color-surface)] shadow-soft text-[var(--color-text)] font-semibold py-3.5 text-[14px] hover:bg-[var(--color-surface-2)] transition-colors no-tap-highlight flex items-center justify-center gap-1.5"
        >
          <Icon name="chevron-left" size={15} />
          ホーム
        </button>
        <button
          onClick={onAgain}
          className="btn-primary rounded-2xl font-semibold py-3.5 text-[14px] shadow-primary flex items-center justify-center gap-1.5 no-tap-highlight"
        >
          もう一周
          <Icon name="arrow-right" size={15} />
        </button>
      </div>
    </div>
  );
}

function Cell({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl px-3 py-3 text-center ${
        accent ? 'bg-[var(--color-accent-soft)]' : 'bg-[var(--color-surface-3)]'
      }`}
    >
      <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)]">
        {label}
      </div>
      <div
        className={`text-[20px] font-bold tabular-nums mt-0.5 ${
          accent ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
