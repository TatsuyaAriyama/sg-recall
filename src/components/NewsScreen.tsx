import { Fragment } from 'react';
import type { NewsItem } from '../types';
import Icon from './Icon';
import AdSlot from './AdSlot';

type Props = {
  news: NewsItem[];
  onBack: () => void;
};

export default function NewsScreen({ news, onBack }: Props) {
  // 年降順で表示
  const sorted = [...news].sort((a, b) => b.year - a.year);

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
            暇つぶしで読む
          </div>
          <h1 className="text-[26px] font-bold tracking-tight text-[var(--color-text)] mb-1">
            セキュリティ事例集
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            実際に起きたインシデントから学ぶ {sorted.length} 件
          </p>
        </div>

        <div className="space-y-3">
          {sorted.map((item, i) => (
            <Fragment key={item.id}>
              <NewsCard item={item} />
              {/* 6件ごとに広告枠 */}
              {(i + 1) % 6 === 0 && i < sorted.length - 1 && (
                <AdSlot slotEnv="VITE_ADSENSE_SLOT_NEWS" />
              )}
            </Fragment>
          ))}
        </div>

        {/* リスト末尾の広告枠 */}
        <div className="mt-6">
          <AdSlot slotEnv="VITE_ADSENSE_SLOT_NEWS" />
        </div>
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl bg-[var(--color-surface)] shadow-soft hover:shadow-card transition-all hover:scale-[1.005] active:scale-[0.995] no-tap-highlight px-4 py-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tabular-nums text-[var(--color-accent)]">
            {item.year}
          </span>
          <span className="text-[10px] font-semibold tracking-wider uppercase rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] px-2.5 py-1">
            {item.category}
          </span>
        </div>
        <Icon
          name="arrow-right"
          size={14}
          className="text-[var(--color-text-tertiary)]"
        />
      </div>
      <div className="text-[15px] font-bold text-[var(--color-text)] leading-snug mb-2">
        {item.title}
      </div>
      <div className="text-[12.5px] text-[var(--color-text-secondary)] leading-relaxed mb-3">
        {item.summary}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {item.terms.map((t) => (
          <span
            key={t}
            className="text-[10px] rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] px-2 py-0.5"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="text-[10px] text-[var(--color-text-tertiary)] flex items-center gap-1">
        出典: {item.source}
      </div>
    </a>
  );
}
