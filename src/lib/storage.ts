import type { Card, Keyword, Meta } from '../types';
import { initialCards } from '../data/cards';
import { keywordsById } from '../data/keywords';
import { todayISO } from './srs';

const CARDS_KEY = 'simple1-sg-cards-v1';
const META_KEY = 'simple1-sg-meta-v1';

type StoredCard = Pick<Card, 'id' | 'interval' | 'nextReview' | 'correctCount' | 'wrongCount' | 'lastUserAnswer'>;

export function loadCards(): Card[] {
  let stored: Record<string, StoredCard> = {};
  try {
    const raw = localStorage.getItem(CARDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredCard[];
      for (const c of parsed) stored[c.id] = c;
    }
  } catch {
    stored = {};
  }

  return initialCards.map((seed) => {
    const keywords: Keyword[] = keywordsById[seed.id] ?? [];
    const s = stored[seed.id];
    if (!s) {
      return {
        ...seed,
        keywords,
        interval: 1,
        nextReview: todayISO(),
        correctCount: 0,
        wrongCount: 0,
      };
    }
    return {
      ...seed,
      keywords,
      interval: s.interval,
      nextReview: s.nextReview,
      correctCount: s.correctCount,
      wrongCount: s.wrongCount,
      lastUserAnswer: s.lastUserAnswer,
    };
  });
}

export function saveCards(cards: Card[]): void {
  const slim: StoredCard[] = cards.map((c) => ({
    id: c.id,
    interval: c.interval,
    nextReview: c.nextReview,
    correctCount: c.correctCount,
    wrongCount: c.wrongCount,
    lastUserAnswer: c.lastUserAnswer,
  }));
  try {
    localStorage.setItem(CARDS_KEY, JSON.stringify(slim));
  } catch {
    // ignore
  }
}

export function loadMeta(): Meta {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (raw) return JSON.parse(raw) as Meta;
  } catch {
    // fall through
  }
  return { streak: 0, totalStudied: 0 };
}

export function saveMeta(meta: Meta): void {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // ignore
  }
}
