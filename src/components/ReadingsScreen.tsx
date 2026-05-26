import { useMemo, useState } from 'react';
import type { ReadingCategory, ReadingItem } from '../types';
import Icon from './Icon';

type Props = {
  readings: ReadingItem[];
  onSelect: (id: string) => void;
  onBack: () => void;
};

const CATEGORY_FILTERS: (ReadingCategory | 'all')[] = ['all', '実務', 'AI', '基礎'];
const CATEGORY_LABEL: Record<ReadingCategory | 'all', string> = {
  all: '全て',
  実務: '実務',
  AI: 'AI',
  基礎: '基礎',
};

export default function ReadingsScreen({ readings, onSelect, onBack }: Props) {
  const [filter, setFilter] = useState<ReadingCategory | 'all'>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? readings : readings.filter((r) => r.category === filter)),
    [readings, filter],
  );

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
            通勤時間で読む
          </div>
          <h1 className="text-[26px] font-bold tracking-tight text-[var(--color-text)] mb-1">
            セキュリティ読み物
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            実務とAI、いまの現場で効くトピックを 3〜5 分で
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {CATEGORY_FILTERS.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`text-[12px] rounded-full px-3 py-1.5 transition-all no-tap-highlight ${
                filter === c
                  ? 'bg-[var(--color-accent)] text-white shadow-primary-sm font-semibold'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] shadow-soft'
              }`}
            >
              {CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="w-full block text-left rounded-2xl bg-[var(--color-surface)] shadow-soft hover:shadow-card transition-all hover:scale-[1.005] active:scale-[0.995] no-tap-highlight px-4 py-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={item.category} />
                  <span className="text-[10px] text-[var(--color-text-tertiary)] tabular-nums flex items-center gap-1">
                    <Icon name="book" size={11} />
                    {item.readMinutes} 分
                  </span>
                </div>
                <Icon
                  name="chevron-right"
                  size={14}
                  className="text-[var(--color-text-tertiary)]"
                />
              </div>
              <div className="text-[15px] font-bold text-[var(--color-text)] leading-snug mb-1.5">
                {item.title}
              </div>
              <div className="text-[12.5px] text-[var(--color-text-secondary)] leading-relaxed">
                {item.subtitle}
              </div>
              <div className="mt-2.5">
                <span className="text-[10px] rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] px-2 py-0.5">
                  #{item.tag}
                </span>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-[13px] text-[var(--color-text-tertiary)] mt-10">
            このカテゴリの読み物はまだありません。
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category: ReadingCategory }) {
  const colors: Record<ReadingCategory, { bg: string; text: string }> = {
    実務: {
      bg: 'var(--color-accent-soft)',
      text: 'var(--color-accent)',
    },
    AI: {
      bg: 'rgba(52, 199, 89, 0.12)',
      text: 'var(--color-success)',
    },
    基礎: {
      bg: 'var(--color-surface-3)',
      text: 'var(--color-text-secondary)',
    },
  };
  const c = colors[category];
  return (
    <span
      className="text-[10px] font-semibold tracking-wider uppercase rounded-full px-2.5 py-1"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {category}
    </span>
  );
}
