import type { Keyword } from '../types';

export type EvaluationResult = {
  matchedGroups: number;
  totalGroups: number;
  matched: string[];   // ヒットしたキーワード（同義語のうち最初に当たった表記）
  missing: string[];   // 抜けているキーワードグループの代表表記
  passed: boolean;
};

// 合格しきい値: 2/3 以上ヒット (rounding しても 2/3, 3/4, 3/5, 4/6 など実用域)
const PASS_RATIO = 2 / 3;

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '')
    // 全角→半角の簡易マッピング（数字・英字のみ）
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
}

export function evaluate(userAnswer: string, keywords: Keyword[]): EvaluationResult {
  const text = normalize(userAnswer);
  const matched: string[] = [];
  const missing: string[] = [];
  let hit = 0;

  for (const group of keywords) {
    const synonyms = Array.isArray(group) ? group : [group];
    const found = synonyms.find((syn) => text.includes(normalize(syn)));
    if (found) {
      hit++;
      matched.push(found);
    } else {
      missing.push(synonyms[0]);
    }
  }

  const total = keywords.length;
  const passed = total === 0 ? true : hit / total >= PASS_RATIO;

  return { matchedGroups: hit, totalGroups: total, matched, missing, passed };
}
