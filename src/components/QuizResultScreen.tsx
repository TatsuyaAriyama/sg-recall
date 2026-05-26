import { useMemo } from 'react';
import type { QuizQuestion, QuizResult } from '../types';
import Icon from './Icon';

type Props = {
  questions: QuizQuestion[];
  result: QuizResult;
  onAgain: () => void;
  onHome: () => void;
};

export default function QuizResultScreen({ questions, result, onAgain, onHome }: Props) {
  const percent = result.total === 0 ? 0 : Math.round((result.correct / result.total) * 100);

  const wrongList = useMemo(() => {
    const items: { q: QuizQuestion; userAnswer: number | null }[] = [];
    for (let i = 0; i < result.ids.length; i++) {
      const q = questions.find((x) => x.id === result.ids[i]);
      if (!q) continue;
      const a = result.answers[i];
      if (a !== q.correct) items.push({ q, userAnswer: a });
    }
    return items;
  }, [questions, result]);

  return (
    <div className="mx-auto max-w-md min-h-full">
      <header className="glass sticky top-0 z-10 px-4 pt-4 pb-3" />

      <div className="px-4 pt-3 pb-10">
        <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-accent)]">
          <Icon name="sparkles" size={12} />
          演習完了
        </div>
        <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-text)] mb-5">
          結果
        </h1>

        <div className="rounded-2xl bg-[var(--color-surface)] shadow-soft px-5 py-5 mb-5">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-1">
            正答率
          </div>
          <div className="flex items-end gap-1 mb-3">
            <div
              className="text-[44px] font-bold tabular-nums leading-none"
              style={{
                color: percent >= 60 ? 'var(--color-accent)' : 'var(--color-text)',
              }}
            >
              {percent}
            </div>
            <div className="text-[16px] font-semibold text-[var(--color-text-secondary)] mb-1">
              %
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="正解" value={result.correct} accent />
            <Stat label="不正解" value={result.total - result.correct} />
            <Stat label="合計" value={result.total} />
          </div>
        </div>

        {wrongList.length > 0 && (
          <section className="mb-6">
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-2 px-1">
              間違えた問題 ({wrongList.length})
            </div>
            <div className="space-y-2">
              {wrongList.map(({ q, userAnswer }) => (
                <div
                  key={q.id}
                  className="rounded-2xl bg-[var(--color-surface)] shadow-soft px-4 py-3"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-semibold tracking-wider uppercase rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] px-2 py-0.5">
                      {q.syllabus}
                    </span>
                  </div>
                  <div className="text-[13px] font-semibold text-[var(--color-text)] mb-2 leading-snug">
                    {q.prompt}
                  </div>
                  <div className="text-[11px] text-[var(--color-text-secondary)] space-y-0.5">
                    {userAnswer !== null && userAnswer !== undefined ? (
                      <div>
                        <span className="text-[#ef4444] font-semibold">あなた: </span>
                        {q.choices[userAnswer]}
                      </div>
                    ) : (
                      <div className="text-[var(--color-text-tertiary)]">
                        未回答
                      </div>
                    )}
                    <div>
                      <span className="text-[var(--color-success)] font-semibold">正解: </span>
                      {q.choices[q.correct]}
                    </div>
                  </div>
                  <div className="mt-2 text-[11.5px] leading-relaxed text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-surface-3)]">
                    {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex gap-2">
          <button
            onClick={onHome}
            className="flex-1 rounded-2xl bg-[var(--color-surface)] shadow-soft hover:shadow-card px-4 py-3 text-[13px] font-semibold text-[var(--color-text)] flex items-center justify-center gap-1.5 no-tap-highlight"
          >
            <Icon name="arrow-left" size={14} />
            ホーム
          </button>
          <button
            onClick={onAgain}
            className="flex-1 btn-primary rounded-2xl px-4 py-3 text-[13px] font-semibold flex items-center justify-center gap-1.5 no-tap-highlight"
          >
            もう一周
            <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-[var(--color-surface-3)] px-2 py-2 text-center">
      <div className="text-[9px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-0.5">
        {label}
      </div>
      <div
        className="text-[18px] font-bold tabular-nums leading-none"
        style={{ color: accent ? 'var(--color-accent)' : 'var(--color-text)' }}
      >
        {value}
      </div>
    </div>
  );
}
