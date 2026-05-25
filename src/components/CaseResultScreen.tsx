import type { CaseResult, CaseStudy } from '../types';
import Icon from './Icon';

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
    <div className="mx-auto max-w-md min-h-full px-4 pt-8 pb-10 flex flex-col">
      <header className="mb-6 fade-in">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`rounded-lg p-1.5 ${
              passed
                ? 'bg-[color:rgba(52,199,89,0.12)] text-[var(--color-success)]'
                : 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
            }`}
          >
            <Icon name={passed ? 'sparkles' : 'lightbulb'} size={14} />
          </div>
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)]">
            {caseStudy.category}
          </span>
        </div>
        <h2 className="text-[22px] font-bold tracking-tight text-[var(--color-text)] leading-snug">
          {caseStudy.title}
        </h2>
      </header>

      <section className="rounded-3xl bg-[var(--color-surface)] shadow-card p-6 mb-4 slide-up">
        <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-2">
          正答率
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span
            className={`text-[56px] font-bold tabular-nums leading-none ${
              passed ? 'text-[var(--color-success)]' : 'text-[var(--color-accent)]'
            }`}
          >
            {rate}
          </span>
          <span className="text-[18px] font-semibold text-[var(--color-text-secondary)]">%</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] font-semibold tracking-wider uppercase rounded-full px-2.5 py-1 ${
              passed
                ? 'bg-[color:rgba(52,199,89,0.12)] text-[var(--color-success)]'
                : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]'
            }`}
          >
            {passed ? '合格レベル' : '要復習'}
          </span>
          <span className="text-[12px] text-[var(--color-text-secondary)] tabular-nums">
            {result.correct} / {result.total} 問正解
          </span>
        </div>
      </section>

      <section className="rounded-3xl bg-[var(--color-surface)] shadow-card p-5 mb-6 slide-up">
        <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-3">
          設問別
        </div>
        <div className="grid grid-cols-5 gap-2">
          {result.answers.map((a, i) => (
            <div
              key={a.questionId}
              className={`aspect-square rounded-xl flex items-center justify-center text-[14px] font-bold ${
                a.isCorrect
                  ? 'bg-[color:rgba(52,199,89,0.12)] text-[var(--color-success)]'
                  : 'bg-[color:rgba(255,59,48,0.08)] text-[var(--color-error)]'
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
          className="rounded-2xl bg-[var(--color-surface)] shadow-soft text-[var(--color-text)] font-semibold py-3.5 text-[14px] hover:bg-[var(--color-surface-2)] transition-colors no-tap-highlight flex items-center justify-center gap-1.5"
        >
          <Icon name="list" size={15} />
          ケース一覧
        </button>
        <button
          onClick={onAgain}
          className="btn-primary rounded-2xl font-semibold py-3.5 text-[14px] shadow-primary flex items-center justify-center gap-1.5 no-tap-highlight"
        >
          もう一度
          <Icon name="arrow-right" size={15} />
        </button>
      </div>
    </div>
  );
}
