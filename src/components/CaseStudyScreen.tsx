import { useEffect, useState } from 'react';
import type { CaseStudy } from '../types';

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

  // 設問が変わったらリセット
  useEffect(() => {
    setChosen(null);
    setRevealed(false);
    // 設問2問目以降はシナリオを折りたたんで設問に集中させる
    if (index > 0) setScenarioOpen(false);
  }, [index, caseStudy.id]);

  const q = caseStudy.questions[index];
  const total = caseStudy.questions.length;
  const progress = Math.round((index / total) * 100);
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
    <div className="mx-auto max-w-md px-4 py-4 pb-6 flex flex-col min-h-full">
      <div className="mb-3">
        <div className="flex items-center justify-between text-[11px] text-black/60 mb-1.5">
          <button onClick={onQuit} className="hover:text-black">← 中断</button>
          <span className="tabular-nums">設問 {index + 1} / {total}</span>
        </div>
        <div className="h-1 rounded-full bg-white border border-[var(--color-border)] overflow-hidden">
          <div
            className="h-full bg-[var(--color-accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-3">
        <span className="inline-block text-[10px] tracking-wide rounded-full border border-[var(--color-border)] bg-white text-black px-2 py-0.5">
          {caseStudy.category}
        </span>
        <h2 className="mt-2 text-lg font-semibold leading-snug text-black">{caseStudy.title}</h2>
      </div>

      {/* シナリオ(折りたたみ可能) */}
      <div className="mb-4 rounded-lg border border-[var(--color-border)] bg-white">
        <button
          onClick={() => setScenarioOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-black/70"
        >
          <span>ケース概要</span>
          <span>{scenarioOpen ? '▲ 隠す' : '▼ 表示'}</span>
        </button>
        {scenarioOpen && (
          <div className="px-3 pb-3 text-xs leading-relaxed text-black whitespace-pre-wrap">
            {caseStudy.scenario}
          </div>
        )}
      </div>

      {/* 設問 */}
      <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-3 mb-3">
        <div className="text-[10px] text-black/60 mb-1">設問 {index + 1}</div>
        <div className="text-sm font-semibold text-black leading-relaxed">{q.prompt}</div>
      </div>

      {/* 選択肢 */}
      <div className="space-y-2 mb-3">
        {q.choices.map((c, i) => {
          const isChosen = chosen === i;
          const isCorrect = i === q.correct;
          let cls = 'border-[var(--color-border)] bg-white hover:bg-black/5';
          if (revealed) {
            if (isCorrect) cls = 'border-[var(--color-accent)] border-2 bg-white';
            else if (isChosen) cls = 'border-[var(--color-border)] bg-black/5';
            else cls = 'border-[var(--color-border)] bg-white opacity-60';
          } else if (isChosen) {
            cls = 'border-[var(--color-accent)] border-2 bg-white';
          }
          return (
            <button
              key={i}
              disabled={revealed}
              onClick={() => setChosen(i)}
              className={`w-full text-left rounded-lg border px-3 py-2.5 text-sm leading-relaxed text-black transition-colors ${cls}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold text-black/60 mt-0.5">
                  {['ア', 'イ', 'ウ', 'エ'][i]}
                </span>
                <span className="flex-1">{c}</span>
                {revealed && isCorrect && (
                  <span className="text-[10px] font-bold text-[var(--color-accent)]">正解</span>
                )}
                {revealed && isChosen && !isCorrect && (
                  <span className="text-[10px] font-bold text-black/70">あなたの選択</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 解説 */}
      {revealed && (
        <div className="rounded-lg border-2 border-[var(--color-accent)] bg-white px-3 py-2.5 mb-3 fade-in">
          <div className="text-[10px] text-[var(--color-accent)] font-semibold mb-1">解説</div>
          <div className="text-sm leading-relaxed text-black">{q.explanation}</div>
        </div>
      )}

      {/* ボタン */}
      {!revealed ? (
        <button
          onClick={check}
          disabled={chosen === null}
          className="w-full rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:bg-white disabled:text-black/40 disabled:border disabled:border-[var(--color-border)] text-white font-semibold py-3 transition-colors mt-auto"
        >
          回答する
        </button>
      ) : (
        <button
          onClick={next}
          className="w-full rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-3 transition-colors mt-auto"
        >
          {isLast ? '結果を見る' : '次の設問へ'}
        </button>
      )}
    </div>
  );
}
