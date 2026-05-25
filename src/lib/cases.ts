import type { CaseProgress } from '../types';

const KEY = 'simple1-sg-case-progress-v1';

export function loadCaseProgress(): Record<string, CaseProgress> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Record<string, CaseProgress>;
  } catch {
    // ignore
  }
  return {};
}

export function saveCaseProgress(progress: Record<string, CaseProgress>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function recordResult(
  prev: Record<string, CaseProgress>,
  caseId: string,
  correct: number,
  total: number,
): Record<string, CaseProgress> {
  const score = total === 0 ? 0 : correct / total;
  const existing = prev[caseId];
  const next: CaseProgress = existing
    ? {
        caseId,
        attemptCount: existing.attemptCount + 1,
        lastScore: score,
        bestScore: Math.max(existing.bestScore, score),
      }
    : { caseId, attemptCount: 1, lastScore: score, bestScore: score };
  return { ...prev, [caseId]: next };
}
