import type { CaseProgress, CaseStudy } from '../types';

type Props = {
  cases: CaseStudy[];
  progress: Record<string, CaseProgress>;
  onSelect: (caseId: string) => void;
  onBack: () => void;
};

export default function CaseListScreen({ cases, progress, onSelect, onBack }: Props) {
  const totalAttempted = Object.keys(progress).length;
  const totalCases = cases.length;

  return (
    <div className="mx-auto max-w-md px-4 py-6 pb-12">
      <header className="mb-5">
        <button onClick={onBack} className="text-xs text-black/60 hover:text-black mb-2">
          ← 戻る
        </button>
        <h1 className="text-xl font-semibold tracking-tight text-black">科目B 演習</h1>
        <p className="text-xs text-black/60 mt-1">
          長文ケースを読んで設問に答える。{totalAttempted} / {totalCases} ケース挑戦済み
        </p>
      </header>

      <div className="space-y-2">
        {cases.map((c) => {
          const p = progress[c.id];
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="w-full text-left rounded-xl border border-[var(--color-border)] bg-white hover:bg-black/5 px-4 py-3 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] tracking-wide rounded-full border border-[var(--color-border)] text-black px-2 py-0.5">
                  {c.category}
                </span>
                <span className="text-[10px] text-black/60 tabular-nums">{c.questions.length}問</span>
              </div>
              <div className="text-sm font-semibold text-black mb-1">{c.title}</div>
              {p ? (
                <div className="text-[11px] text-black/60 flex items-center gap-2">
                  <span>挑戦{p.attemptCount}回</span>
                  <span>直近 <span className="text-[var(--color-accent)] font-semibold">{Math.round(p.lastScore * 100)}%</span></span>
                  <span>最高 <span className="text-[var(--color-accent)] font-semibold">{Math.round(p.bestScore * 100)}%</span></span>
                </div>
              ) : (
                <div className="text-[11px] text-black/40">未挑戦</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
