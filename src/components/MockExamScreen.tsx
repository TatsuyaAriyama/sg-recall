import { useEffect, useMemo, useState } from 'react';
import type { MockExamSession, QuizQuestion } from '../types';
import Icon from './Icon';

type Props = {
  questions: QuizQuestion[];
  session: MockExamSession;
  onAnswer: (index: number, choice: number) => void;
  onFinish: () => void;
  onQuit: () => void;
};

/**
 * 模擬試験画面。
 * - 上部にカウントダウンタイマー (残り時間)
 * - 1問1画面で四択回答 (フィードバックなし)
 * - 「前へ/次へ」で問題切替、「一覧」で全問題のステータスマップ
 * - 全問解答完了 or 時間切れ で onFinish が呼ばれる
 */
export default function MockExamScreen({
  questions,
  session,
  onAnswer,
  onFinish,
  onQuit,
}: Props) {
  const [index, setIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [remaining, setRemaining] = useState(() => {
    const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
    return Math.max(0, session.durationSec - elapsed);
  });
  // 終了確認モーダル
  const [confirmFinish, setConfirmFinish] = useState(false);

  // 1秒ごとのタイマー
  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
      const left = Math.max(0, session.durationSec - elapsed);
      setRemaining(left);
      if (left === 0) {
        clearInterval(id);
        onFinish();
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.startedAt, session.durationSec]);

  const total = session.questionIds.length;
  const current = useMemo(
    () => questions.find((q) => q.id === session.questionIds[index]) ?? null,
    [questions, session.questionIds, index],
  );

  const answeredCount = session.answers.filter((a) => a !== null && a !== undefined).length;

  function pick(choice: number) {
    onAnswer(index, choice);
  }

  function goNext() {
    if (index < total - 1) setIndex((i) => i + 1);
  }
  function goPrev() {
    if (index > 0) setIndex((i) => i - 1);
  }

  // 問題切替時は最上部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [index]);

  if (!current) {
    return (
      <div className="min-h-full flex items-center justify-center text-[var(--color-text-secondary)]">
        問題が見つかりません
      </div>
    );
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timerLow = remaining < 60;
  const timerWarn = remaining < 300;
  const timerColor = timerLow
    ? '#ef4444'
    : timerWarn
      ? 'var(--color-accent)'
      : 'var(--color-text)';

  const userAnswer = session.answers[index];

  return (
    <div className="mx-auto max-w-md min-h-full flex flex-col">
      <header className="glass sticky top-0 z-10 px-4 pt-3 pb-2.5">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onQuit}
            className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center gap-1 no-tap-highlight"
          >
            <Icon name="x" size={14} />
            終了
          </button>
          <div
            className="text-[15px] font-bold tabular-nums leading-none flex items-center gap-1"
            style={{ color: timerColor }}
          >
            <Icon name="target" size={13} />
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <button
            onClick={() => setShowMap(true)}
            className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] flex items-center gap-1 no-tap-highlight"
          >
            <Icon name="list" size={14} />
            一覧
          </button>
        </div>
        <div className="text-center text-[11px] tabular-nums text-[var(--color-text-tertiary)]">
          問 {index + 1} / {total} · 解答済 {answeredCount}
        </div>
      </header>

      <div className="flex-1 px-4 pt-4 pb-6 flex flex-col">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-wider uppercase rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] px-2.5 py-1">
            {current.syllabus}
          </span>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] shadow-soft px-4 py-4 mb-4">
          <p className="text-[15px] leading-relaxed text-[var(--color-text)] whitespace-pre-wrap">
            {current.prompt}
          </p>
        </div>

        <div className="space-y-2 mb-4">
          {current.choices.map((c, i) => {
            const isPicked = userAnswer === i;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                className={`w-full text-left rounded-2xl px-4 py-3 text-[14px] leading-relaxed transition-all no-tap-highlight border ${
                  isPicked
                    ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-text)]'
                    : 'bg-[var(--color-surface)] shadow-soft border-transparent hover:scale-[1.005] active:scale-[0.995] text-[var(--color-text)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex-shrink-0 mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-bold ${
                      isPicked
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {String.fromCharCode(0x30a2 + i)}
                  </span>
                  <span className="flex-1">{c}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex gap-2">
          <button
            onClick={goPrev}
            disabled={index === 0}
            className="rounded-2xl bg-[var(--color-surface)] shadow-soft px-4 py-3 text-[13px] font-semibold text-[var(--color-text)] disabled:opacity-40 flex items-center justify-center gap-1 no-tap-highlight"
          >
            <Icon name="chevron-left" size={14} />
            前へ
          </button>
          {index < total - 1 ? (
            <button
              onClick={goNext}
              className="btn-primary flex-1 rounded-2xl py-3 text-[14px] font-semibold flex items-center justify-center gap-1.5 no-tap-highlight"
            >
              次へ
              <Icon name="arrow-right" size={14} />
            </button>
          ) : (
            <button
              onClick={() => setConfirmFinish(true)}
              className="flex-1 rounded-2xl bg-[var(--color-success)] text-white px-4 py-3 text-[14px] font-semibold flex items-center justify-center gap-1.5 no-tap-highlight"
              style={{ boxShadow: '0 4px 12px rgba(52,199,89,0.28)' }}
            >
              <Icon name="check-circle" size={15} />
              解答終了
            </button>
          )}
        </div>
      </div>

      {showMap && (
        <QuestionMapOverlay
          total={total}
          answers={session.answers}
          currentIndex={index}
          onJump={(i) => {
            setIndex(i);
            setShowMap(false);
          }}
          onClose={() => setShowMap(false)}
          onFinish={() => {
            setShowMap(false);
            setConfirmFinish(true);
          }}
        />
      )}

      {confirmFinish && (
        <ConfirmFinishOverlay
          answeredCount={answeredCount}
          total={total}
          onCancel={() => setConfirmFinish(false)}
          onConfirm={() => {
            setConfirmFinish(false);
            onFinish();
          }}
        />
      )}
    </div>
  );
}

function QuestionMapOverlay({
  total,
  answers,
  currentIndex,
  onJump,
  onClose,
  onFinish,
}: {
  total: number;
  answers: (number | null)[];
  currentIndex: number;
  onJump: (i: number) => void;
  onClose: () => void;
  onFinish: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-30 bg-black/40 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--color-surface)] rounded-t-3xl px-5 pt-5 pb-7 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-[var(--color-text)]">
            問題一覧
          </h2>
          <button onClick={onClose} className="text-[var(--color-text-tertiary)] no-tap-highlight">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="text-[11px] text-[var(--color-text-secondary)] mb-3 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-accent)]" />
            解答済
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-surface-3)]" />
            未解答
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm ring-2 ring-[var(--color-text)] bg-transparent" />
            現在
          </span>
        </div>

        <div className="grid grid-cols-8 gap-1.5 mb-5">
          {Array.from({ length: total }).map((_, i) => {
            const answered = answers[i] !== null && answers[i] !== undefined;
            const isCurrent = i === currentIndex;
            return (
              <button
                key={i}
                onClick={() => onJump(i)}
                className={`aspect-square rounded-md text-[11px] font-semibold tabular-nums transition-all no-tap-highlight ${
                  answered
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-surface-3)] text-[var(--color-text-secondary)]'
                } ${isCurrent ? 'ring-2 ring-[var(--color-text)]' : ''}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={onFinish}
          className="w-full rounded-2xl bg-[var(--color-success)] text-white px-4 py-3 text-[14px] font-semibold flex items-center justify-center gap-1.5 no-tap-highlight"
          style={{ boxShadow: '0 4px 12px rgba(52,199,89,0.28)' }}
        >
          <Icon name="check-circle" size={15} />
          解答終了
        </button>
      </div>
    </div>
  );
}

function ConfirmFinishOverlay({
  answeredCount,
  total,
  onCancel,
  onConfirm,
}: {
  answeredCount: number;
  total: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const unanswered = total - answeredCount;
  return (
    <div
      className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center px-5"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-[var(--color-surface)] rounded-2xl px-5 py-5 shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[16px] font-bold text-[var(--color-text)] mb-1.5">
          解答を終了しますか？
        </h2>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-4 leading-relaxed">
          {unanswered > 0
            ? `未解答が ${unanswered} 問あります。終了すると採点に進みます。`
            : `全 ${total} 問の解答が完了しています。採点に進みます。`}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl bg-[var(--color-surface-3)] py-2.5 text-[13px] font-semibold text-[var(--color-text)] no-tap-highlight"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[var(--color-accent)] text-white py-2.5 text-[13px] font-semibold no-tap-highlight"
          >
            終了して採点
          </button>
        </div>
      </div>
    </div>
  );
}
