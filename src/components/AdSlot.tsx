import { useEffect, useRef } from 'react';

/**
 * Google AdSense レスポンシブスロット。
 *
 * === 有効化手順 ===
 * 1. AdSense サイト審査に通る (https://www.google.com/adsense/)
 * 2. AdSense 管理画面で「広告ユニット」を作成し、`data-ad-client` と
 *    `data-ad-slot` を取得
 * 3. index.html の <head> に AdSense ローダースクリプトを追加 (要 client ID)
 *      <script async crossorigin="anonymous"
 *        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX">
 *      </script>
 * 4. .env.local に
 *      VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
 *      VITE_ADSENSE_SLOT_NEWS=XXXXXXXXXX
 *    を追加（GitHub Actions の secret にも同名で）
 *
 * client/slot が未設定の間は、占位プレースホルダのみ表示される。
 */
type AdSlotProps = {
  slotEnv: 'VITE_ADSENSE_SLOT_NEWS';
  className?: string;
};

const AD_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({ slotEnv, className = '' }: AdSlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const slotId = import.meta.env[slotEnv] as string | undefined;
  const enabled = Boolean(AD_CLIENT && slotId);

  useEffect(() => {
    if (!enabled) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignore
    }
  }, [enabled]);

  if (!enabled) {
    return (
      <div
        ref={ref}
        className={`rounded-2xl bg-[var(--color-surface-3)] flex items-center justify-center text-[10px] tracking-wider uppercase text-[var(--color-text-tertiary)] ${className}`}
        style={{ minHeight: 90 }}
        aria-hidden
      >
        広告枠 (準備中)
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
