import type { Meta } from '../types';
import { diffDays, todayISO } from './srs';

export function updateStreak(meta: Meta, today: string = todayISO()): { meta: Meta; increased: boolean } {
  if (meta.lastStudyDate === today) {
    return { meta, increased: false };
  }
  if (meta.lastStudyDate) {
    const diff = diffDays(meta.lastStudyDate, today);
    if (diff === 1) {
      return {
        meta: { ...meta, lastStudyDate: today, streak: meta.streak + 1 },
        increased: true,
      };
    }
    return {
      meta: { ...meta, lastStudyDate: today, streak: 1 },
      increased: true,
    };
  }
  return {
    meta: { ...meta, lastStudyDate: today, streak: 1 },
    increased: true,
  };
}

export function isFirstStudyToday(meta: Meta, today: string = todayISO()): boolean {
  return meta.lastStudyDate !== today;
}
