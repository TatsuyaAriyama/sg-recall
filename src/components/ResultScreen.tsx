import type { SessionResult } from '../types';

type Props = {
  result: SessionResult;
  onHome: () => void;
  onAgain: () => void;
};

export default function ResultScreen({ result, onHome, onAgain }: Props) {
  const { correct, wrong, total, prevStreak, newStreak, streakIncreased } = result;
  const rate = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <div className="mx-auto max-w-md px-4 py-8 pb-12 flex flex-col min-h-full">
      <header className="mb-6 fade-in">
        <h2 className="text-lg font-semibold text-black">セッション終了</h2>
        <p className="text-xs text-black/60 mt-1">お疲れさまでした</p>
      </header>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 mb-4 fade-in">
        <div className="text-[10px] text-black/60 mb-1">正答率</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-semibold tabular-nums text-[var(--color-accent)]">{rate}</span>
          <span className="text-sm text-black/60">%</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Cell label="できた" value={correct} accent />
          <Cell label="復習行き" value={wrong} />
          <Cell label="合計" value={total} />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 mb-6 fade-in">
        <div className="text-[10px] text-black/60 mb-1">ストリーク</div>
        <div className="flex items-baseline gap-2">
          {streakIncreased && prevStreak !== newStreak ? (
            <>
              <span className="text-sm text-black/60 tabular-nums">{prevStreak}</span>
              <span className="text-black/60">→</span>
              <span className="text-3xl font-semibold tabular-nums text-[var(--color-accent)] pop">{newStreak}</span>
              <span className="text-xs text-black/60">日</span>
            </>
          ) : (
            <>
              <span className="text-3xl font-semibold tabular-nums text-black">{newStreak}</span>
              <span className="text-xs text-black/60">日</span>
            </>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        <button
          onClick={onHome}
          className="rounded-xl border border-[var(--color-border)] bg-white text-black hover:bg-black/5 font-semibold py-3 transition-colors"
        >
          ホームに戻る
        </button>
        <button
          onClick={onAgain}
          className="rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-3 transition-colors"
        >
          もう一周
        </button>
      </div>
    </div>
  );
}

function Cell({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`rounded-lg border bg-white px-2 py-2 ${
        accent ? 'border-[var(--color-accent)] border-2' : 'border-[var(--color-border)]'
      }`}
    >
      <div className="text-[10px] text-black/60">{label}</div>
      <div className={`text-lg font-semibold tabular-nums ${accent ? 'text-[var(--color-accent)]' : 'text-black'}`}>{value}</div>
    </div>
  );
}
