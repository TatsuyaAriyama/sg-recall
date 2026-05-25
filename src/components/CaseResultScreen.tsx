import type { CaseResult, CaseStudy } from '../types';

type Props = {
  result: CaseResult;
  caseStudy: CaseStudy;
  onAgain: () => void;
  onList: () => void;
};

export default function CaseResultScreen({ result, caseStudy, onAgain, onList }: Props) {
  const rate = result.total === 0 ? 0 : Math.round((result.correct / result.total) * 100);
  const passed = rate >= 60;

  return (
    <div className="mx-auto max-w-md px-4 py-6 pb-12 flex flex-col min-h-full">
      <header className="mb-5 fade-in">
        <div className="text-[10px] text-black/60 mb-1">{caseStudy.category}</div>
        <h2 className="text-lg font-semibold text-black">{caseStudy.title}</h2>
      </header>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 mb-4 fade-in">
        <div className="text-[10px] text-black/60 mb-1">正答率</div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold tabular-nums text-[var(--color-accent)]">{rate}</span>
          <span className="text-sm text-black/60">%</span>
          <span className="ml-2 text-[11px] font-semibold tracking-wide text-black/70">
            {passed ? '合格レベル (60%以上)' : '要復習'}
          </span>
        </div>
        <div className="mt-2 text-xs text-black/60 tabular-nums">
          {result.correct} / {result.total} 問正解
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-white p-4 mb-6 fade-in">
        <div className="text-[10px] text-black/60 mb-2">設問別</div>
        <div className="grid grid-cols-5 gap-1.5">
          {result.answers.map((a, i) => (
            <div
              key={a.questionId}
              className={`aspect-square rounded-md border flex items-center justify-center text-xs font-semibold ${
                a.isCorrect
                  ? 'border-[var(--color-accent)] border-2 text-[var(--color-accent)] bg-white'
                  : 'border-[var(--color-border)] text-black/40 bg-white'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        <button
          onClick={onList}
          className="rounded-xl border border-[var(--color-border)] bg-white text-black hover:bg-black/5 font-semibold py-3 transition-colors"
        >
          ケース一覧へ
        </button>
        <button
          onClick={onAgain}
          className="rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-3 transition-colors"
        >
          もう一度
        </button>
      </div>
    </div>
  );
}
