import { useEffect, useMemo, useRef, useState } from 'react';
import type { Card } from '../types';
import { evaluate } from '../lib/evaluate';

type Props = {
  card: Card;
  index: number;
  total: number;
  onAnswer: (correct: boolean, userAnswer: string) => void;
  onQuit: () => void;
};

type Phase = 'input' | 'hint' | 'reveal';

export default function StudyScreen({ card, index, total, onAnswer, onQuit }: Props) {
  const [phase, setPhase] = useState<Phase>('input');
  const [input, setInput] = useState('');
  const [revision, setRevision] = useState('');
  const [wasPerfect, setWasPerfect] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // カードが変わったらリセット & フォーカス
  useEffect(() => {
    setPhase('input');
    setInput('');
    setRevision('');
    setWasPerfect(false);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [card.id]);

  // 評価結果（hint/reveal フェーズで参照）
  const evaluation = useMemo(() => evaluate(input, card.keywords), [input, card.keywords]);

  function check() {
    const ev = evaluate(input, card.keywords);
    if (ev.passed) {
      setWasPerfect(true);
      setPhase('reveal');
    } else {
      setWasPerfect(false);
      setRevision(input);
      setPhase('hint');
      // hint 表示時は revision テキストエリアにフォーカス
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }

  function reveal() {
    setPhase('reveal');
  }

  function next() {
    // 一発正解 → できた / ヒント経由 → もう一度
    // 保存する解答: 一発正解なら最初の入力、ヒント経由なら修正後の入力
    onAnswer(wasPerfect, wasPerfect ? input : revision);
  }

  // キーボードショートカット
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

  const progress = total === 0 ? 0 : Math.round((index / total) * 100);

  return (
    <div className="mx-auto max-w-md px-4 py-4 pb-6 flex flex-col min-h-full">
      {/* 進捗バー */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[11px] text-black/60 mb-1.5">
          <button onClick={onQuit} className="hover:text-black">← 中断</button>
          <span className="tabular-nums">{index + 1} / {total}</span>
        </div>
        <div className="h-1 rounded-full bg-white border border-[var(--color-border)] overflow-hidden">
          <div
            className="h-full bg-[var(--color-accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 用語 */}
      <div className="mb-4">
        <span className="inline-block text-[10px] tracking-wide rounded-full border border-[var(--color-border)] bg-white text-black px-2 py-0.5">
          {card.category}
        </span>
        <h2 className="mt-3 text-2xl font-semibold leading-snug break-words text-black">
          {card.term}
        </h2>
      </div>

      {phase === 'input' && (
        <>
          <div className="mb-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              placeholder="一行で説明を書く..."
              className="w-full rounded-lg border border-[var(--color-border)] bg-white text-black placeholder:text-black/40 focus:border-[var(--color-accent)] focus:border-2 outline-none px-3 py-2.5 text-sm resize-none transition-colors"
            />
          </div>
          <button
            onClick={check}
            disabled={input.trim().length === 0}
            className="w-full rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:bg-white disabled:text-black/40 disabled:border disabled:border-[var(--color-border)] text-white font-semibold py-3 transition-colors"
          >
            答え合わせ <span className="text-xs opacity-70 ml-1">(Ctrl+Enter)</span>
          </button>
        </>
      )}

      {phase === 'hint' && (
        <>
          {/* 評価 + ヒント */}
          <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-3 mb-3 fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-black/60">評価</span>
              <span className="text-xs tabular-nums text-black/80">
                {evaluation.matchedGroups} / {evaluation.totalGroups} 要素
              </span>
            </div>
            {evaluation.matched.length > 0 && (
              <div className="mb-2">
                <div className="text-[10px] text-black/60 mb-1">含まれている観点</div>
                <div className="flex flex-wrap gap-1">
                  {evaluation.matched.map((m) => (
                    <span
                      key={m}
                      className="text-[11px] rounded-full border border-[var(--color-border)] bg-white text-black px-2 py-0.5"
                    >
                      ✓ {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {evaluation.missing.length > 0 && (
              <div>
                <div className="text-[10px] text-[var(--color-accent)] font-semibold mb-1">ヒント: 抜けている観点</div>
                <div className="flex flex-wrap gap-1">
                  {evaluation.missing.map((m) => (
                    <span
                      key={m}
                      className="text-[11px] rounded-full border-2 border-[var(--color-accent)] bg-white text-[var(--color-accent)] font-medium px-2 py-0.5"
                    >
                      {m}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-black/60 mt-2 leading-relaxed">
                  上のキーワードを踏まえて回答を修正してみてください。
                </div>
              </div>
            )}
          </div>

          {/* あなたの最初の解答（参照用） */}
          <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 mb-3">
            <div className="text-[10px] text-black/60 mb-0.5">最初の解答</div>
            <div className="text-xs leading-relaxed whitespace-pre-wrap text-black/70">{input}</div>
          </div>

          {/* 修正解答 */}
          <div className="mb-3">
            <div className="text-[10px] text-black/60 mb-1">修正解答</div>
            <textarea
              ref={textareaRef}
              value={revision}
              onChange={(e) => setRevision(e.target.value)}
              rows={3}
              placeholder="ヒントを踏まえて書き直す..."
              className="w-full rounded-lg border border-[var(--color-border)] bg-white text-black placeholder:text-black/40 focus:border-[var(--color-accent)] focus:border-2 outline-none px-3 py-2.5 text-sm resize-none transition-colors"
            />
          </div>

          <button
            onClick={reveal}
            className="w-full rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-3 transition-colors"
          >
            解説を見る <span className="text-xs opacity-70 ml-1">(Ctrl+Enter)</span>
          </button>
        </>
      )}

      {phase === 'reveal' && (
        <>
          <div className="space-y-3 mb-4 fade-in">
            {/* 一発正解バッジ or ヒント経由バッジ */}
            <div
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2.5 py-1 ${
                wasPerfect
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'border border-[var(--color-border)] bg-white text-black/70'
              }`}
            >
              {wasPerfect ? '一発正解' : 'ヒント参照あり'}
            </div>

            {/* 解答（最終） */}
            {(wasPerfect ? input : revision).trim() && (
              <div className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5">
                <div className="text-[10px] text-black/60 mb-1">あなたの解答</div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-black">
                  {wasPerfect ? input : revision}
                </div>
              </div>
            )}

            {/* 解説 */}
            <div className="rounded-lg border-2 border-[var(--color-accent)] bg-white px-3 py-2.5">
              <div className="text-[10px] text-[var(--color-accent)] font-semibold mb-1">解説</div>
              <div className="text-sm leading-relaxed text-black">{card.answer}</div>
            </div>
          </div>

          <button
            onClick={next}
            className="w-full rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold py-3 transition-colors mt-auto"
          >
            次へ <span className="text-xs opacity-70 ml-1">(Enter)</span>
          </button>
        </>
      )}
    </div>
  );
}
