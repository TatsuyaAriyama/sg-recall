import { useEffect, useState } from 'react';
import type { CaseStudy } from '../types';
import Icon from './Icon';

type Props = {
  caseStudy: CaseStudy;
  index: number;
  onAnswer: (chosen: number) => void;
  onQuit: () => void;
};

export default function CaseStudyScreen({ caseStudy, index, onAnswer, onQuit }: Props) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [scenarioOpen, setScenarioOpen] = useState(true);

  useEffect(() => {
    setChosen(null);
    setRevealed(false);
    if (index > 0) setScenarioOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [index, caseStudy.id]);

  const q = caseStudy.questions[index];
  const total = caseStudy.questions.length;
  const progress = (index / total) * 100;
  const isLast = index === total - 1;

  function check() {
    if (chosen === null) return;
    setRevealed(true);
  }

  function next() {
    if (chosen === null) return;
    onAnswer(chosen);
  }

  return (
    <div className="mx-auto max-w-md min-h-full flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-10 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onQuit}
            className="flex items-center gap-1 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] no-tap-highlight"
          >
            <Icon name="chevron-left" size={16} />
            中断
          </button>
          <span className="text-[11px] font-semibold tabular-nums text-[var(--color-text-secondary)]">
            設問 {index + 1} <span className="opacity-50">/ {total}</span>
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundImage:
                'linear-gradient(90deg, var(--color-accent) 0%, #7375e2 100%)',
            }}
          />
        </div>
      </header>

      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col">
        {/* タイトル */}
        <div className="mb-4">
          <span className="inline-block text-[10px] font-semibold tracking-wider uppercase rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] px-2.5 py-1">
            {caseStudy.category}
          </span>
          <h2 className="mt-2 text-[20px] font-bold leading-snug tracking-tight text-[var(--color-text)]">
            {caseStudy.title}
          </h2>
        </div>

        {/* シナリオ */}
        <div className="mb-5 rounded-2xl bg-[var(--color-surface)] shadow-soft overflow-hidden">
          <button
            onClick={() => setScenarioOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-[12px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-colors no-tap-highlight"
          >
            <span className="flex items-center gap-1.5">
              <Icon name="doc" size={14} />
              ケース概要
            </span>
            <Icon name={scenarioOpen ? 'chevron-up' : 'chevron-down'} size={14} />
          </button>
          {scenarioOpen && (
            <div className="px-4 pb-4 pt-1 text-[13px] leading-relaxed text-[var(--color-text)] whitespace-pre-wrap fade-in">
              {caseStudy.scenario}
            </div>
          )}
        </div>

        {/* 設問 */}
        <div className="rounded-2xl bg-[var(--color-surface)] shadow-soft px-4 py-4 mb-4">
          <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-1.5">
            設問 {index + 1}
          </div>
          <div className="text-[15px] font-semibold leading-relaxed text-[var(--color-text)]">
            {q.prompt}
          </div>
        </div>

        {/* 選択肢 */}
        <div className="space-y-2 mb-4">
          {q.choices.map((c, i) => {
            const isChosen = chosen === i;
            const isCorrect = i === q.correct;
            let cls =
              'bg-[var(--color-surface)] shadow-soft hover:bg-[var(--color-surface-2)]';
            if (revealed) {
              if (isCorrect)
                cls =
                  'bg-[color:rgba(52,199,89,0.08)] ring-2 ring-[var(--color-success)] shadow-soft';
              else if (isChosen)
                cls =
                  'bg-[color:rgba(255,59,48,0.06)] ring-1 ring-[var(--color-error)]/40 shadow-soft';
              else cls = 'bg-[var(--color-surface)] opacity-50 shadow-soft';
            } else if (isChosen) {
              cls = 'bg-[var(--color-accent-soft)] ring-2 ring-[var(--color-accent)] shadow-soft';
            }
            return (
              <button
                key={i}
                disabled={revealed}
                onClick={() => setChosen(i)}
                className={`w-full text-left rounded-xl px-4 py-3 text-[14px] leading-relaxed text-[var(--color-text)] transition-all no-tap-highlight ${cls}`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold flex-shrink-0 ${
                      revealed && isCorrect
                        ? 'bg-[var(--color-success)] text-white'
                        : revealed && isChosen
                          ? 'bg-[var(--color-error)] text-white'
                          : isChosen
                            ? 'bg-[var(--color-accent)] text-white'
                            : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {['ア', 'イ', 'ウ', 'エ'][i]}
                  </span>
                  <span className="flex-1">{c}</span>
                  {revealed && isCorrect && (
                    <Icon
                      name="check"
                      size={16}
                      className="text-[var(--color-success)] mt-0.5 flex-shrink-0"
                    />
                  )}
                  {revealed && isChosen && !isCorrect && (
                    <Icon
                      name="x"
                      size={16}
                      className="text-[var(--color-error)] mt-0.5 flex-shrink-0"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 解説 */}
        {revealed && (
          <div className="rounded-2xl bg-[var(--color-accent-soft)] ring-1 ring-[var(--color-accent-border)] px-4 py-3 mb-4 fade-in">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-accent)] mb-1">
              <Icon name="book" size={11} />
              解説
            </div>
            <div className="text-[13px] leading-relaxed text-[var(--color-text)]">{q.explanation}</div>
          </div>
        )}

        {!revealed ? (
          <button
            onClick={check}
            disabled={chosen === null}
            className="btn-primary w-full rounded-2xl font-semibold py-3.5 text-[15px] shadow-primary disabled:shadow-none flex items-center justify-center gap-2 mt-auto no-tap-highlight"
          >
            <Icon name="check-circle" size={16} />
            回答する
          </button>
        ) : (
          <button
            onClick={next}
            className="btn-primary w-full rounded-2xl font-semibold py-3.5 text-[15px] shadow-primary flex items-center justify-center gap-2 mt-auto no-tap-highlight"
          >
            {isLast ? '結果を見る' : '次の設問へ'}
            <Icon name="arrow-right" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
