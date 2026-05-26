import { useMemo } from 'react';
import type { Card, Category, QuizQuestion, SyllabusTag } from '../types';
import Icon from './Icon';

type Props = {
  cards: Card[];
  quiz: QuizQuestion[];
  onBack: () => void;
};

// 用語のカテゴリ (Category) → シラバスタグ (SyllabusTag) への対応表
const CATEGORY_TO_SYLLABUS: Record<Category, SyllabusTag> = {
  '基礎': 'セキュリティ全般',
  '脅威': '攻撃手法',
  '脆弱性と攻撃': '攻撃手法',
  '暗号': '暗号技術',
  '認証': '認証技術',
  'アクセス制御': 'アクセス制御',
  'ネットワーク': 'ネットワークセキュリティ',
  'クラウド・最新動向': 'クラウド/最新動向',
  '開発・実装': 'セキュアな開発',
  'インシデント対応': 'インシデント対応',
  'ISMS管理': 'ISMS/リスク管理',
  '組織と人的対策': '組織と人的対策',
  'データ保護': 'データ保護/物理対策',
  '物理的対策': 'データ保護/物理対策',
  '監査・統制': '監査・統制',
  '法令・規格': '法令・標準',
};

const SYLLABUS_ORDER: SyllabusTag[] = [
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

/**
 * シラバス分野別の俯瞰画面。
 * - 各タグごとに「用語カード数」「四択問題数」「カードのこれまでの正答率」を表示
 * - 弱点把握 → 用語復習 or 四択演習 へジャンプの起点として使う想定
 */
export default function SyllabusMapScreen({ cards, quiz, onBack }: Props) {
  const rows = useMemo(() => {
    // カードを syllabus タグに集計
    const cardStats: Record<SyllabusTag, { count: number; correct: number; wrong: number }> = {} as any;
    for (const c of cards) {
      const tag = CATEGORY_TO_SYLLABUS[c.category] ?? 'セキュリティ全般';
      const cell = cardStats[tag] ?? { count: 0, correct: 0, wrong: 0 };
      cell.count++;
      cell.correct += c.correctCount;
      cell.wrong += c.wrongCount;
      cardStats[tag] = cell;
    }
    // クイズを syllabus タグに集計
    const quizStats: Record<SyllabusTag, number> = {} as any;
    for (const q of quiz) {
      quizStats[q.syllabus] = (quizStats[q.syllabus] ?? 0) + 1;
    }
    return SYLLABUS_ORDER.map((tag) => {
      const cs = cardStats[tag] ?? { count: 0, correct: 0, wrong: 0 };
      const attempts = cs.correct + cs.wrong;
      const accuracy = attempts === 0 ? null : Math.round((cs.correct / attempts) * 100);
      return {
        tag,
        cardCount: cs.count,
        quizCount: quizStats[tag] ?? 0,
        attempts,
        accuracy,
      };
    });
  }, [cards, quiz]);

  const totalCards = cards.length;
  const totalQuiz = quiz.length;
  const overall = useMemo(() => {
    let c = 0;
    let w = 0;
    for (const card of cards) {
      c += card.correctCount;
      w += card.wrongCount;
    }
    const att = c + w;
    return { attempts: att, accuracy: att === 0 ? null : Math.round((c / att) * 100) };
  }, [cards]);

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
        <div className="mb-5">
          <div className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-1">
            シラバスマップ
          </div>
          <h1 className="text-[26px] font-bold tracking-tight text-[var(--color-text)] mb-1">
            分野で俯瞰、弱点で攻める
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            IPA シラバスの 16 分野ごとに用語と四択問題の量、これまでの正答率を一覧
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--color-surface)] shadow-soft px-4 py-4 mb-5">
          <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-2">
            全体
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="用語" value={`${totalCards}`} />
            <Stat label="四択" value={`${totalQuiz}`} />
            <Stat
              label="正答率"
              value={overall.accuracy === null ? '—' : `${overall.accuracy}%`}
              accent={overall.accuracy !== null && overall.accuracy >= 60}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          {rows.map((row) => (
            <div
              key={row.tag}
              className="rounded-2xl bg-[var(--color-surface)] shadow-soft px-4 py-3"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[13.5px] font-semibold text-[var(--color-text)] truncate pr-2">
                  {row.tag}
                </div>
                <div className="text-[11px] tabular-nums text-[var(--color-text-tertiary)] flex items-center gap-2 flex-shrink-0">
                  <span className="flex items-center gap-0.5">
                    <Icon name="cards" size={11} />
                    {row.cardCount}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Icon name="list" size={11} />
                    {row.quizCount}
                  </span>
                </div>
              </div>

              {row.attempts === 0 ? (
                <div className="text-[10.5px] text-[var(--color-text-tertiary)]">
                  まだ学習履歴がありません
                </div>
              ) : (
                <>
                  <div className="h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${row.accuracy ?? 0}%`,
                        backgroundColor:
                          (row.accuracy ?? 0) >= 60
                            ? 'var(--color-success)'
                            : (row.accuracy ?? 0) >= 40
                              ? 'var(--color-accent)'
                              : '#ef4444',
                      }}
                    />
                  </div>
                  <div className="mt-1 text-[10.5px] tabular-nums text-[var(--color-text-secondary)]">
                    正答率 {row.accuracy}% ({row.attempts} 回)
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-[var(--color-surface-3)] px-4 py-3 text-[11.5px] leading-relaxed text-[var(--color-text-secondary)]">
          正答率が低い分野は四択演習でその分野だけを集中対策できます。
          用語カードは「苦手のみ」モードで反復するのが効果的です。
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
