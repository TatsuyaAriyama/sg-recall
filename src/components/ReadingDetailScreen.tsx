import { useEffect } from 'react';
import type { ReadingItem } from '../types';
import Icon from './Icon';

type Props = {
  reading: ReadingItem;
  onBack: () => void;
  onNext?: () => void; // 同カテゴリ次記事への導線 (任意)
};

export default function ReadingDetailScreen({ reading, onBack, onNext }: Props) {
  // 記事切替時に最上部へスクロール
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [reading.id]);

  return (
    <div className="mx-auto max-w-md min-h-full">
      <header className="glass sticky top-0 z-10 px-4 pt-4 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] no-tap-highlight"
        >
          <Icon name="chevron-left" size={16} />
          一覧へ
        </button>
      </header>

      <article className="px-5 pt-4 pb-12">
        {/* メタ */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-semibold tracking-wider uppercase rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] px-2.5 py-1">
            {reading.category}
          </span>
          <span className="text-[10px] text-[var(--color-text-tertiary)] tabular-nums flex items-center gap-1">
            <Icon name="book" size={11} />
            {reading.readMinutes} 分で読める
          </span>
        </div>

        {/* タイトル */}
        <h1 className="text-[22px] font-bold tracking-tight text-[var(--color-text)] leading-tight mb-2">
          {reading.title}
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-6">
          {reading.subtitle}
        </p>

        {/* 本文 */}
        <div className="space-y-7">
          {reading.sections.map((section, i) => (
            <section key={i}>
              {section.heading && (
                <h2 className="text-[15px] font-bold text-[var(--color-text)] mb-2.5 leading-snug">
                  {section.heading}
                </h2>
              )}
              {renderBody(section.body)}
            </section>
          ))}
        </div>

        {/* Takeaway */}
        {reading.takeaway && (
          <div className="mt-8 rounded-2xl bg-[var(--color-accent-soft)] ring-1 ring-[var(--color-accent-border)] px-4 py-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-accent)] mb-1.5">
              <Icon name="sparkles" size={12} />
              持ち帰り
            </div>
            <p className="text-[13.5px] leading-relaxed text-[var(--color-text)]">
              {reading.takeaway}
            </p>
          </div>
        )}

        {/* フッターアクション */}
        <div className="mt-8 flex gap-2">
          <button
            onClick={onBack}
            className="flex-1 rounded-2xl bg-[var(--color-surface)] shadow-soft hover:shadow-card transition-all px-4 py-3 text-[13px] font-semibold text-[var(--color-text)] flex items-center justify-center gap-1.5 no-tap-highlight"
          >
            <Icon name="arrow-left" size={14} />
            一覧へ戻る
          </button>
          {onNext && (
            <button
              onClick={onNext}
              className="flex-1 btn-primary rounded-2xl px-4 py-3 text-[13px] font-semibold flex items-center justify-center gap-1.5 no-tap-highlight"
            >
              次の記事
              <Icon name="arrow-right" size={14} />
            </button>
          )}
        </div>
      </article>
    </div>
  );
}

/**
 * 本文を改行 (\n\n または \n) で段落 / 行に分割して描画。
 * 行頭が「・」「【…】」「数字.」のものはリスト的な見せ方にする。
 */
function renderBody(body: string) {
  const paragraphs = body.split(/\n{2,}/);
  return (
    <div className="space-y-3.5">
      {paragraphs.map((p, i) => (
        <Paragraph key={i} text={p} />
      ))}
    </div>
  );
}

function Paragraph({ text }: { text: string }) {
  const lines = text.split('\n');
  // すべての行が箇条書きっぽい場合はリスト風に
  const allBullets =
    lines.length > 1 && lines.every((l) => /^[・\-1-9]/.test(l.trim()));
  if (allBullets) {
    return (
      <ul className="space-y-2">
        {lines.map((l, i) => (
          <li
            key={i}
            className="text-[14px] leading-[1.85] text-[var(--color-text)] pl-1"
          >
            {l.trim()}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="text-[14px] leading-[1.85] text-[var(--color-text)] whitespace-pre-wrap">
      {text}
    </p>
  );
}
