import { useMemo, useState } from 'react';
import type { QuizQuestion, SyllabusTag } from '../types';
import Icon from './Icon';

type Props = {
  questions: QuizQuestion[];
  onStart: (syllabus: SyllabusTag | 'all', count: number) => void;
  onBack: () => void;
};

const SYLLABUS_OPTIONS: (SyllabusTag | 'all')[] = [
  'all',
  'セキュリティ全般',
  '攻撃手法',
  '暗号技術',
  '認証技術',
  'アクセス制御',
  'ネットワークセキュリティ',
  'クラウド/最新動向',
  'セキュアな開発',
  'インシデント対応',
  'ISMS/リスク管理',
  '組織と人的対策',
  'データ保護/物理対策',
  '監査・統制',
  '法令・標準',
  'その他テクノロジ',
  'ストラテジ/マネジメント',
];

const COUNT_OPTIONS = [10, 20, 30, 48];

export default function QuizConfigScreen({ questions, onStart, onBack }: Props) {
  const [syllabus, setSyllabus] = useState<SyllabusTag | 'all'>('all');
  const [count, setCount] = useState<number>(10);

  const available = useMemo(() => {
    return syllabus === 'all'
      ? questions.length
      : questions.filter((q) => q.syllabus === syllabus).length;
  }, [questions, syllabus]);

  const actualCount = Math.min(count, available);

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
            科目A · 四択問題演習
          </div>
          <h1 className="text-[26px] font-bold tracking-tight text-[var(--color-text)] mb-1">
            過去問形式で練習
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            IPA 過去問風の四択問題 {questions.length} 問から出題
          </p>
        </div>

        <section className="mb-6">
          <SectionLabel>分野</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {SYLLABUS_OPTIONS.map((s) => (
              <Pill key={s} active={syllabus === s} onClick={() => setSyllabus(s)}>
                {s === 'all' ? '全分野' : s}
              </Pill>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <SectionLabel>問題数</SectionLabel>
          <div className="grid grid-cols-4 gap-2">
            {COUNT_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setCount(c)}
                className={`rounded-xl py-3 text-[14px] font-semibold transition-all no-tap-highlight ${
                  count === c
                    ? 'bg-[var(--color-accent)] text-white shadow-primary-sm'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] shadow-soft hover:text-[var(--color-text)]'
                }`}
              >
                {c}問
              </button>
            ))}
          </div>
        </section>

        <div className="mb-6 rounded-xl bg-[var(--color-surface)] shadow-soft px-4 py-3 text-[12px] text-[var(--color-text-secondary)]">
          選択分野の在庫: <span className="text-[var(--color-text)] font-semibold tabular-nums">{available}</span> 問
          {actualCount < count && (
            <span className="ml-2 text-[var(--color-accent)]">
              (実出題は {actualCount} 問)
            </span>
          )}
        </div>

        <button
          disabled={available === 0}
          onClick={() => onStart(syllabus, count)}
          className="btn-primary w-full rounded-2xl font-semibold py-4 text-[15px] shadow-primary disabled:shadow-none flex items-center justify-center gap-2 no-tap-highlight"
        >
          {available > 0 ? (
            <>
              <Icon name="play" size={15} />
              四択問題 開始 <span className="opacity-80">（{actualCount}問）</span>
            </>
          ) : (
            <>この分野の在庫がありません</>
          )}
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-2 px-1">
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[12px] rounded-full px-3 py-1.5 transition-all no-tap-highlight ${
        active
          ? 'bg-[var(--color-accent)] text-white shadow-primary-sm font-semibold'
          : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] shadow-soft'
      }`}
    >
      {children}
    </button>
  );
}
