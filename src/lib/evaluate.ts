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

/**
 * 用語名そのものに含まれる文字列を、ユーザー回答からも事前に除去する。
 * これで「リスク移転」の解答に「移転」と書いただけではヒット扱いにならない。
 * 用語名は丸ごと除去 + 括弧内表記も別途除去対象。
 */
function stripTermFromAnswer(answer: string, term: string): string {
  const variants: string[] = [];
  const stripped = term.replace(/[(（].*?[)）]/g, '').trim();
  if (stripped) variants.push(stripped);
  const inParens = [...term.matchAll(/[(（](.*?)[)）]/g)].map((m) => m[1].trim()).filter(Boolean);
  variants.push(...inParens);
  // 全部から取り除く
  let out = answer;
  for (const v of variants) {
    if (!v) continue;
    out = out.split(v).join('');
  }
  return out;
}

/**
 * 模範解答 (card.answer) のうち、ユーザーが触れられていない (= missing) キーワード群の
 * 出現箇所だけを `____` で伏字にして返す。
 *
 * 「形と分量」が見えて、「どの言葉を補えばよいか」も視覚的に伝わるヒント文を作る目的。
 * - matched 済みの観点はそのまま見せる（既に書けたことを肯定）
 * - 連続する ____ は1つに畳む（読みやすさのため）
 */
export function buildMaskedAnswer(
  answer: string,
  keywords: Keyword[],
  userAnswer: string,
  term: string = '',
): string {
  const cleaned = term ? stripTermFromAnswer(userAnswer, term) : userAnswer;
  const textNorm = normalize(cleaned);
  const termNorm = term ? normalize(term) : '';

  let masked = answer;
  for (const group of keywords) {
    const synonyms = Array.isArray(group) ? group : [group];
    const validSyns = termNorm
      ? synonyms.filter((s) => !termNorm.includes(normalize(s)))
      : synonyms;
    if (validSyns.length === 0) continue;

    const isMatched = validSyns.some((syn) => textNorm.includes(normalize(syn)));
    if (isMatched) continue;

    // 未ヒットのグループだけ模範解答の該当箇所を伏字に
    for (const syn of validSyns) {
      if (!syn) continue;
      masked = masked.split(syn).join('____');
    }
  }

  // 「____や____」のように隣接した伏字は読みづらいので1つに統合
  masked = masked.replace(/(____)(?:\s*\1)+/g, '____');
  return masked;
}

export function evaluate(userAnswer: string, keywords: Keyword[], term: string = ''): EvaluationResult {
  // 用語名はユーザー回答から事前に除去（用語そのものを書いただけで通らないように）
  const cleaned = term ? stripTermFromAnswer(userAnswer, term) : userAnswer;
  const text = normalize(cleaned);
  const termNorm = term ? normalize(term) : '';

  const matched: string[] = [];
  const missing: string[] = [];
  let hit = 0;
  let total = 0;

  for (const group of keywords) {
    const synonyms = Array.isArray(group) ? group : [group];
    // 用語名に含まれる同義語は「用語の写し」とみなして除外
    const validSyns = termNorm
      ? synonyms.filter((s) => !termNorm.includes(normalize(s)))
      : synonyms;
    if (validSyns.length === 0) {
      // グループ全体が用語のエコーだった場合は評価対象から外す
      continue;
    }
    total++;
    const found = validSyns.find((syn) => text.includes(normalize(syn)));
    if (found) {
      hit++;
      matched.push(found);
    } else {
      missing.push(validSyns[0]);
    }
  }

  const passed = total === 0 ? false : hit / total >= PASS_RATIO;

  return { matchedGroups: hit, totalGroups: total, matched, missing, passed };
}
