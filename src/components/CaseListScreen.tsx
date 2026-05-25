import type { CaseProgress, CaseStudy } from '../types';
import Icon from './Icon';

type Props = {
  cases: CaseStudy[];
  progress: Record<string, CaseProgress>;
  onSelect: (caseId: string) => void;
  onBack: () => void;
};

export default function CaseListScreen({ cases, progress, onSelect, onBack }: Props) {
  const attempted = Object.keys(progress).length;

  return (
    <div className="mx-auto max-w-md min-h-full">
      <header className="glass sticky top-0 z-10 px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] no-tap-highlight"
        >
          <Icon name="chevron-left" size={16} />
          戻る
        </button>
      </header>

      <div className="px-4 pt-3 pb-10">
        <div className="mb-6">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-1">
            科目B 演習
          </div>
          <h1 className="text-[26px] font-bold tracking-tight text-[var(--color-text)] mb-1">
            ケーススタディ
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            <span className="font-semibold text-[var(--color-text)]">{attempted}</span>
            <span> / {cases.length} ケース挑戦済み</span>
          </p>
        </div>

        <div className="space-y-2.5">
          {cases.map((c) => {
            const p = progress[c.id];
            const passed = p && p.bestScore >= 0.6;
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className="w-full text-left rounded-2xl bg-[var(--color-surface)] shadow-soft hover:shadow-card transition-all hover:scale-[1.005] active:scale-[0.995] no-tap-highlight px-4 py-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-semibold tracking-wider uppercase rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] px-2.5 py-1">
                    {c.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {passed && (
                      <Icon name="check-circle" size={14} className="text-[var(--color-success)]" />
                    )}
                    <span className="text-[11px] text-[var(--color-text-tertiary)] tabular-nums">
                      {c.questions.length}問
                    </span>
                  </div>
                </div>
                <div className="text-[15px] font-bold text-[var(--color-text)] leading-snug mb-2">
                  {c.title}
                </div>
                {p ? (
                  <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-secondary)]">
                    <span>挑戦 {p.attemptCount}回</span>
                    <span className="opacity-50">·</span>
                    <span>
                      直近{' '}
                      <span className="font-semibold text-[var(--color-text)]">
                        {Math.round(p.lastScore * 100)}%
                      </span>
                    </span>
                    <span className="opacity-50">·</span>
                    <span>
                      最高{' '}
                      <span className="font-semibold text-[var(--color-accent)]">
                        {Math.round(p.bestScore * 100)}%
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-[var(--color-text-tertiary)] flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-[var(--color-text-tertiary)]" />
                    未挑戦
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
