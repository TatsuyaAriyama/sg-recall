import { useEffect, useMemo, useRef, useState } from 'react';
import type { Card } from '../types';
import { buildMaskedAnswer, evaluate } from '../lib/evaluate';
import Icon from './Icon';

type Props = {
  card: Card;
  index: number;
  total: number;
  onMark: (correct: boolean, userAnswer: string) => void;
  onNext: () => void;
  onQuit: () => void;
};

type Phase = 'input' | 'hint' | 'reveal';

export default function StudyScreen({ card, index, total, onMark, onNext, onQuit }: Props) {
  const [phase, setPhase] = useState<Phase>('input');
  const [input, setInput] = useState('');
  const [revision, setRevision] = useState('');
  const [wasPerfect, setWasPerfect] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setPhase('input');
    setInput('');
    setRevision('');
    setWasPerfect(false);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [card.id]);

  const evaluation = useMemo(() => evaluate(input, card.keywords, card.term), [input, card.keywords]);
  const maskedAnswer = useMemo(
    () => buildMaskedAnswer(card.answer, card.keywords, input, card.term),
    [card.answer, card.keywords, input, card.term],
  );

  function check() {
    // 入力ゼロのときは評価せず、いきなりヒント画面へ
    if (input.trim().length === 0) {
      setWasPerfect(false);
      setRevision('');
      setPhase('hint');
      requestAnimationFrame(() => textareaRef.current?.focus());
      return;
    }
    const ev = evaluate(input, card.keywords, card.term);
    if (ev.passed) {
      setWasPerfect(true);
      setPhase('reveal');
      // 解説表示時点で SRS に「できた」として反映
      onMark(true, input);
    } else {
      setWasPerfect(false);
      setRevision(input);
      setPhase('hint');
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }

  function reveal() {
    setPhase('reveal');
    // 解説表示時点で SRS に「もう一度」として反映
    onMark(false, revision);
  }

  function next() {
    onNext();
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isSubmit = (e.ctrlKey || e.metaKey) && e.key === 'Enter';
      if (phase === 'input' && isSubmit) {
        e.preventDefault();
        check();
        return;
      }
      if (phase === 'hint' && isSubmit) {
        e.preventDefault();
        reveal();
        return;
      }
      if (phase === 'reveal' && (e.key === 'Enter' || isSubmit)) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, input, revision, wasPerfect]);

  const progress = total === 0 ? 0 : (index / total) * 100;

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
            {index + 1} <span className="opacity-50">/ {total}</span>
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

      <div className="flex-1 px-4 pt-6 pb-6 flex flex-col">
        {/* 用語 */}
        <div className="mb-5">
          <span className="inline-block text-[10px] font-semibold tracking-wider uppercase rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] px-2.5 py-1">
            {card.category}
          </span>
          <h2 className="mt-3 text-[26px] font-bold leading-tight tracking-tight text-[var(--color-text)] break-words">
            {card.term}
          </h2>
        </div>

        {phase === 'input' && (
          <>
            <div className="mb-4">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={3}
                placeholder="一行で説明を書く..."
                className="focus-ring w-full rounded-xl bg-[var(--color-surface)] shadow-soft text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none px-4 py-3 text-[15px] leading-relaxed resize-none transition-all"
              />
            </div>
            <button
              onClick={check}
              className="btn-primary w-full rounded-2xl font-semibold py-3.5 text-[15px] shadow-primary flex items-center justify-center gap-2 no-tap-highlight"
            >
              {input.trim().length === 0 ? (
                <>
                  <Icon name="lightbulb" size={16} />
                  ヒントを見る <span className="text-[11px] opacity-75 ml-1">⌘↵</span>
                </>
              ) : (
                <>
                  <Icon name="check-circle" size={16} />
                  答え合わせ <span className="text-[11px] opacity-75 ml-1">⌘↵</span>
                </>
              )}
            </button>
          </>
        )}

        {phase === 'hint' && (
          <>
            <div className="rounded-2xl bg-[var(--color-surface)] shadow-soft px-4 py-4 mb-3 slide-up">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-accent)]">
                  <Icon name="lightbulb" size={14} />
                  解答の骨組み
                </div>
                <span className="text-[11px] tabular-nums text-[var(--color-text-secondary)]">
                  {evaluation.matchedGroups} / {evaluation.totalGroups} 要素
                </span>
              </div>

              {/* 模範解答の骨組み（未ヒットのキーワードだけ伏字） */}
              <div className="text-[14px] leading-[1.85] text-[var(--color-text)] mb-3">
                <MaskedAnswer text={maskedAnswer} />
              </div>

              {evaluation.missing.length > 0 && (
                <div className="pt-3 border-t border-[var(--color-surface-3)]">
                  <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-accent)] mb-1.5">
                    <span className="font-mono">____</span> に入れたい言葉
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.missing.map((m) => (
                      <span
                        key={m}
                        className="text-[12px] font-semibold rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] px-2.5 py-1"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  <div className="text-[12px] text-[var(--color-text-secondary)] mt-3 leading-relaxed">
                    骨組みの <span className="font-mono text-[var(--color-accent)]">____</span> を上の言葉で埋めるイメージで、自分の文として書き直してみましょう。
                  </div>
                </div>
              )}

              {evaluation.missing.length === 0 && evaluation.matched.length > 0 && (
                <div className="pt-3 border-t border-[var(--color-surface-3)] text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
                  必要な観点は揃っています。表現を整えて書き直してみましょう。
                </div>
              )}

              {evaluation.matched.length > 0 && (
                <div className="pt-3 mt-3 border-t border-[var(--color-surface-3)]">
                  <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-1.5">
                    含まれていた観点
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.matched.map((m) => (
                      <span
                        key={m}
                        className="text-[11px] rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] px-2.5 py-1 flex items-center gap-1"
                      >
                        <Icon name="check" size={11} className="text-[var(--color-success)]" />
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {input.trim().length > 0 && (
              <div className="rounded-xl bg-[var(--color-surface-3)] px-3 py-2.5 mb-3">
                <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-0.5">
                  最初の解答
                </div>
                <div className="text-[12px] leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap">
                  {input}
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-1.5 px-1">
                修正解答
              </div>
              <textarea
                ref={textareaRef}
                value={revision}
                onChange={(e) => setRevision(e.target.value)}
                rows={3}
                placeholder="ヒントを踏まえて書き直す..."
                className="focus-ring w-full rounded-xl bg-[var(--color-surface)] shadow-soft text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] outline-none px-4 py-3 text-[15px] leading-relaxed resize-none transition-all"
              />
            </div>

            <button
              onClick={reveal}
              className="btn-primary w-full rounded-2xl font-semibold py-3.5 text-[15px] shadow-primary flex items-center justify-center gap-2 no-tap-highlight"
            >
              <Icon name="book" size={16} />
              解説を見る <span className="text-[11px] opacity-75 ml-1">⌘↵</span>
            </button>
          </>
        )}

        {phase === 'reveal' && (
          <>
            <div className="space-y-3 mb-4 fade-in">
              {/* バッジ */}
              <div
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-3 py-1.5 ${
                  wasPerfect
                    ? 'bg-[var(--color-success)] text-white shadow-primary-sm'
                    : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]'
                }`}
                style={
                  wasPerfect
                    ? { boxShadow: '0 4px 12px rgba(52, 199, 89, 0.28)' }
                    : undefined
                }
              >
                {wasPerfect ? (
                  <>
                    <Icon name="sparkles" size={12} />
                    一発正解
                  </>
                ) : (
                  <>
                    <Icon name="lightbulb" size={12} />
                    ヒント参照あり
                  </>
                )}
              </div>

              {(wasPerfect ? input : revision).trim() && (
                <div className="rounded-2xl bg-[var(--color-surface)] shadow-soft px-4 py-3">
                  <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-1">
                    あなたの解答
                  </div>
                  <div className="text-[14px] leading-relaxed text-[var(--color-text)] whitespace-pre-wrap">
                    {wasPerfect ? input : revision}
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-[var(--color-accent-soft)] px-4 py-3 ring-1 ring-[var(--color-accent-border)]">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-accent)] mb-1">
                  <Icon name="book" size={11} />
                  解説
                </div>
                <div className="text-[14px] leading-relaxed text-[var(--color-text)]">
                  {card.answer}
                </div>
              </div>
            </div>

            <button
              onClick={next}
              className="btn-primary w-full rounded-2xl font-semibold py-3.5 text-[15px] shadow-primary flex items-center justify-center gap-2 no-tap-highlight mt-auto"
            >
              次へ
              <Icon name="arrow-right" size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * 模範解答内の `____` を「下線付きの空欄」として描画する。
 * 「形が見える + どこに何を入れるか分かる」ヒントとして機能。
 */
function MaskedAnswer({ text }: { text: string }) {
  const parts = text.split(/(____+)/);
  return (
    <>
      {parts.map((p, i) =>
        /^____+$/.test(p) ? (
          <span
            key={i}
            className="inline-block align-baseline mx-0.5 px-2 text-transparent select-none border-b-2 border-[var(--color-accent)] bg-[var(--color-accent-soft)] rounded-sm"
            aria-label="空欄"
          >
            ____
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}
