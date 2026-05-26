import { useMemo } from 'react';
import type { MockExamHistory, MockMode, QuizQuestion } from '../types';
import Icon from './Icon';

type Props = {
  questions: QuizQuestion[];
  history: MockExamHistory;
  onStart: (mode: MockMode) => void;
  onBack: () => void;
};

const MODES: {
  value: MockMode;
  label: string;
  desc: string;
  questions: number;
  minutes: number;
}[] = [
  {
    value: 'short',
    label: 'ミニ模試',
    desc: 'スキマ時間の腕試し',
    questions: 20,
    minutes: 30,
  },
  {
    value: 'subjectA',
    label: '科目A 模試',
    desc: '本番形式の四択 48問',
    questions: 48,
    minutes: 60,
  },
];

export default function MockConfigScreen({ questions, history, onStart, onBack }: Props) {
  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const last = history[history.length - 1];
    const best = history.reduce((a, b) => (b.scorePercent > a.scorePercent ? b : a));
    const passedCount = history.filter((h) => h.passed).length;
    return { last, best, passedCount, total: history.length };
  }, [history]);

  return (
    <div className="mx-auto max-w-md min-h-full">
      <header className="glass sticky top-0 z-10 px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] no-tap-highlight"
        >
          <Icon name="chevron-left" size={16} />
          戻る
        </button>
      </header>

      <div className="px-4 pt-3 pb-10">
        <div className="mb-6">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-1">
            模擬試験
          </div>
          <h1 className="text-[26px] font-bold tracking-tight text-[var(--color-text)] mb-1">
            本番形式で力試し
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            タイマー付き · 60% 以上で合格判定 · 解答中はフィードバック非表示
          </p>
        </div>

        {stats && (
          <div className="mb-6 rounded-2xl bg-[var(--color-surface)] shadow-soft px-4 py-3.5">
            <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-2">
              これまでのスコア
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="直近" value={`${stats.last.scorePercent}%`} accent={stats.last.passed} />
              <Stat label="最高" value={`${stats.best.scorePercent}%`} accent={stats.best.passed} />
              <Stat label="合格" value={`${stats.passedCount}/${stats.total}`} />
            </div>
          </div>
        )}

        <div className="space-y-2.5 mb-6">
          {MODES.map((m) => {
            const available = questions.length;
            const disabled = available < m.questions;
            return (
              <button
                key={m.value}
                onClick={() => !disabled && onStart(m.value)}
                disabled={disabled}
                className={`w-full text-left rounded-2xl px-4 py-4 transition-all no-tap-highlight ${
                  disabled
                    ? 'bg-[var(--color-surface)] opacity-50'
                    : 'bg-[var(--color-surface)] shadow-soft hover:shadow-card hover:scale-[1.005] active:scale-[0.995]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[15px] font-bold text-[var(--color-text)]">
                    {m.label}
                  </div>
                  <Icon name="chevron-right" size={16} className="text-[var(--color-text-tertiary)]" />
                </div>
                <div className="text-[12px] text-[var(--color-text-secondary)] mb-2">
                  {m.desc}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-tertiary)] tabular-nums">
                  <span className="flex items-center gap-1">
                    <Icon name="list" size={11} />
                    {m.questions} 問
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="target" size={11} />
                    {m.minutes} 分
                  </span>
                  {disabled && (
                    <span className="text-[var(--color-accent)] ml-auto">
                      問題不足 ({available})
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl bg-[var(--color-surface-3)] px-4 py-3 text-[11.5px] leading-relaxed text-[var(--color-text-secondary)]">
          模擬試験中は正誤フィードバックを表示しません。解答後の結果画面で
          シラバス分野別の正答率と間違えた問題を確認できます。
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-[var(--color-surface-3)] px-2 py-2 text-center">
      <div className="text-[9px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-0.5">
        {label}
      </div>
      <div
        className="text-[15px] font-bold tabular-nums leading-tight"
        style={{ color: accent ? 'var(--color-accent)' : 'var(--color-text)' }}
      >
        {value}
      </div>
    </div>
  );
}
