import { useEffect, useMemo, useState } from 'react';
import type { QuizQuestion } from '../types';
import Icon from './Icon';

type Props = {
  questions: QuizQuestion[];
  ids: string[];
  initialIndex?: number;
  onAnswer: (index: number, choice: number) => void;
  onFinish: () => void;
  onQuit: () => void;
  answers: (number | null)[]; // 状態は親が持つ (途中保存・復習用)
};

/**
 * 練習モードの四択画面。1問ずつ表示し、選択肢を押すと即フィードバック (○×) 表示。
 * 「次へ」で次の問題、最終問題なら「結果へ」で onFinish。
 */
export default function QuizScreen({
  questions,
  ids,
  initialIndex = 0,
  onAnswer,
  onFinish,
  onQuit,
  answers,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const total = ids.length;

  const current = useMemo(() => {
    return questions.find((q) => q.id === ids[index]) ?? null;
  }, [questions, ids, index]);

  const userAnswer = answers[index];
  const revealed = userAnswer !== null && userAnswer !== undefined;

  // 問題切替時は最上部へスクロール (長文問題のため)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [index]);

  function pick(choice: number) {
    if (revealed) return;
    onAnswer(index, choice);
  }

  function goNext() {
    if (index >= total - 1) {
      onFinish();
    } else {
      setIndex((i) => i + 1);
    }
  }

  function goPrev() {
    if (index > 0) setIndex((i) => i - 1);
  }

  if (!current) {
    return (
      <div className="min-h-full flex items-center justify-center text-[var(--color-text-secondary)]">
        問題が見つかりません
      </div>
    );
  }

  const progress = total === 0 ? 0 : ((index + 1) / total) * 100;

  return (
    <div className="mx-auto max-w-md min-h-full flex flex-col">
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
            {index + 1} <span className="opacity-50">/ {total}</span>
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundImage:
                'linear-gradient(90deg, var(--color-accent) 0%, #7375e2 100%)',
            }}
          />
        </div>
      </header>

      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-wider uppercase rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] px-2.5 py-1">
            {current.syllabus}
          </span>
          {current.difficulty && (
            <span className="text-[10px] text-[var(--color-text-tertiary)]">
              {'★'.repeat(current.difficulty)}
              {'☆'.repeat(3 - current.difficulty)}
            </span>
          )}
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] shadow-soft px-4 py-4 mb-4">
          <p className="text-[15px] leading-relaxed text-[var(--color-text)] whitespace-pre-wrap">
            {current.prompt}
          </p>
        </div>

        <div className="space-y-2 mb-4">
          {current.choices.map((c, i) => {
            const isCorrect = i === current.correct;
            const isPicked = userAnswer === i;
            let cls =
              'w-full text-left rounded-2xl px-4 py-3 text-[14px] leading-relaxed transition-all no-tap-highlight border';
            if (!revealed) {
              cls +=
                ' bg-[var(--color-surface)] shadow-soft border-transparent hover:scale-[1.005] active:scale-[0.995] text-[var(--color-text)]';
            } else if (isCorrect) {
              cls += ' bg-[rgba(52,199,89,0.10)] border-[var(--color-success)] text-[var(--color-text)]';
            } else if (isPicked) {
              cls += ' bg-[rgba(239,68,68,0.08)] border-[#ef4444] text-[var(--color-text)]';
            } else {
              cls += ' bg-[var(--color-surface)] border-transparent text-[var(--color-text-secondary)] opacity-70';
            }
            return (
              <button key={i} onClick={() => pick(i)} className={cls} disabled={revealed}>
                <div className="flex items-start gap-3">
                  <span
                    className={`flex-shrink-0 mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-bold ${
                      revealed && isCorrect
                        ? 'bg-[var(--color-success)] text-white'
                        : revealed && isPicked
                          ? 'bg-[#ef4444] text-white'
                          : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {String.fromCharCode(0x30a2 + i) /* ア, イ, ウ, エ */}
                  </span>
                  <span className="flex-1">{c}</span>
                  {revealed && isCorrect && (
                    <Icon
                      name="check"
                      size={16}
                      className="text-[var(--color-success)] flex-shrink-0 mt-0.5"
                    />
                  )}
                  {revealed && isPicked && !isCorrect && (
                    <Icon name="x" size={16} className="text-[#ef4444] flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {revealed && (
          <div className="rounded-2xl bg-[var(--color-accent-soft)] ring-1 ring-[var(--color-accent-border)] px-4 py-3 mb-4 fade-in">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-accent)] mb-1">
              <Icon name="book" size={11} />
              解説
            </div>
            <p className="text-[13.5px] leading-relaxed text-[var(--color-text)] whitespace-pre-wrap">
              {current.explanation}
            </p>
          </div>
        )}

        <div className="mt-auto flex gap-2">
          <button
            onClick={goPrev}
            disabled={index === 0}
            className="rounded-2xl bg-[var(--color-surface)] shadow-soft px-4 py-3 text-[13px] font-semibold text-[var(--color-text)] disabled:opacity-40 flex items-center justify-center gap-1 no-tap-highlight"
          >
            <Icon name="chevron-left" size={14} />
            前へ
          </button>
          <button
            onClick={goNext}
            disabled={!revealed}
            className="btn-primary flex-1 rounded-2xl py-3 text-[14px] font-semibold flex items-center justify-center gap-1.5 no-tap-highlight disabled:opacity-50 disabled:shadow-none"
          >
            {index >= total - 1 ? '結果へ' : '次へ'}
            <Icon name="arrow-right" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
