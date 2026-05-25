import { ClerkProvider } from '@clerk/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;

// AdSense loader を env 設定時のみ動的注入
if (ADSENSE_CLIENT && !document.querySelector('script[data-adsense-loader]')) {
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  s.dataset.adsenseLoader = 'true';
  document.head.appendChild(s);
}

const root = createRoot(document.getElementById('root')!);

// publishableKey が未設定の環境では Clerk を無効化して動作させる
// (HomeScreen 側の auth UI は ClerkProvider 配下でないと表示できないので、
//  キー未設定時は <App /> をそのままレンダー)
if (PUBLISHABLE_KEY) {
  root.render(
    <StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    </StrictMode>,
  );
} else {
  // dev で env が無い、または GH Pages の secret 未設定時のフォールバック
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      '[simple1] VITE_CLERK_PUBLISHABLE_KEY is not set. Auth UI will be hidden.',
    );
  }
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
