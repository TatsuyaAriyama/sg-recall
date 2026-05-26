import { useMemo } from 'react';
import type { MockExamResult, QuizQuestion, SyllabusTag } from '../types';
import Icon from './Icon';

type Props = {
  questions: QuizQuestion[];
  result: MockExamResult;
  ids: string[];
  answers: (number | null)[];
  onRetry: () => void;
  onHome: () => void;
};

/**
 * 模擬試験の結果画面。
 * - 合否バッジ (60% を 1000点満点換算の 600点ラインに見立てる)
 * - 経過時間
 * - シラバス別正答率バー
 * - 間違えた問題リスト (解説付き)
 */
export default function MockResultScreen({
  questions,
  result,
  ids,
  answers,
  onRetry,
  onHome,
}: Props) {
  const categoryRows = useMemo(() => {
    const entries = Object.entries(result.perCategory) as [
      SyllabusTag,
      { correct: number; total: number },
    ][];
    return entries
      .filter(([, v]) => v.total > 0)
      .map(([k, v]) => ({
        syllabus: k,
        correct: v.correct,
        total: v.total,
        percent: Math.round((v.correct / v.total) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [result.perCategory]);

  const wrongList = useMemo(() => {
    const items: { q: QuizQuestion; userAnswer: number | null }[] = [];
    for (let i = 0; i < ids.length; i++) {
      const q = questions.find((x) => x.id === ids[i]);
      if (!q) continue;
      const a = answers[i];
      if (a !== q.correct) items.push({ q, userAnswer: a });
    }
    return items;
  }, [questions, ids, answers]);

  const mins = Math.floor(result.elapsedSec / 60);
  const secs = result.elapsedSec % 60;

  return (
    <div className="mx-auto max-w-md min-h-full">
      <header className="glass sticky top-0 z-10 px-4 pt-4 pb-3" />

      <div className="px-4 pt-3 pb-10">
        <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-accent)]">
          <Icon name="target" size={12} />
          模擬試験 結果
        </div>
        <h1 className="text-[26px] font-bold tracking-tight text-[var(--color-text)] mb-5">
          採点
        </h1>

        <div className="rounded-2xl bg-[var(--color-surface)] shadow-soft px-5 py-5 mb-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-1">
                スコア
              </div>
              <div className="flex items-end gap-1">
                <div
                  className="text-[44px] font-bold tabular-nums leading-none"
                  style={{
                    color: result.passed ? 'var(--color-success)' : 'var(--color-text)',
                  }}
                >
                  {result.scorePercent}
                </div>
                <div className="text-[16px] font-semibold text-[var(--color-text-secondary)] mb-1">
                  %
                </div>
              </div>
            </div>
            <div
              className={`inline-flex items-center gap-1 text-[12px] font-bold tracking-wider uppercase rounded-full px-3 py-1.5 ${
                result.passed
                  ? 'bg-[rgba(52,199,89,0.12)] text-[var(--color-success)]'
                  : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]'
              }`}
            >
              <Icon name={result.passed ? 'check-circle' : 'x'} size={13} />
              {result.passed ? '合格ライン' : '不合格'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <Stat label="科目A" value={`${result.scoreA}/${result.totalA}`} />
            <Stat
              label="経過"
              value={`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`}
            />
            <Stat
              label="判定"
              value={result.passed ? 'PASS' : 'NG'}
              accent={result.passed}
            />
          </div>

          <div className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed">
            本試験は 1000点満点中 600点で合格。本画面のスコアは正答率を 1000点満点に換算した目安です。
          </div>
        </div>

        {categoryRows.length > 0 && (
          <section className="mb-5">
            <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-2 px-1">
              シラバス別 正答率
            </div>
            <div className="rounded-2xl bg-[var(--color-surface)] shadow-soft px-4 py-3 space-y-2.5">
              {categoryRows.map((row) => (
                <div key={row.syllabus}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="text-[var(--color-text)] truncate pr-2">
                      {row.syllabus}
                    </span>
                    <span className="tabular-nums text-[var(--color-text-secondary)]">
                      {row.correct}/{row.total}
                      <span className="ml-2 font-semibold text-[var(--color-text)]">
                        {row.percent}%
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.percent}%`,
                        backgroundColor:
                          row.percent >= 60
                            ? 'var(--color-success)'
                            : row.percent >= 40
                              ? 'var(--color-accent)'
                              : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
                  <div className="text-[11.5px] text-[var(--color-text-secondary)] space-y-0.5">
                    {userAnswer !== null && userAnswer !== undefined ? (
                      <div>
                        <span className="text-[#ef4444] font-semibold">あなた: </span>
                        {q.choices[userAnswer]}
                      </div>
                    ) : (
                      <div className="text-[var(--color-text-tertiary)]">未回答</div>
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
            onClick={onRetry}
            className="flex-1 btn-primary rounded-2xl px-4 py-3 text-[13px] font-semibold flex items-center justify-center gap-1.5 no-tap-highlight"
          >
            <Icon name="refresh" size={14} />
            再挑戦
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-[var(--color-surface-3)] px-2 py-2 text-center">
      <div className="text-[9px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-0.5">
        {label}
      </div>
      <div
        className="text-[15px] font-bold tabular-nums leading-tight"
        style={{ color: accent ? 'var(--color-success)' : 'var(--color-text)' }}
      >
        {value}
      </div>
    </div>
  );
}
