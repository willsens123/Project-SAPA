import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Tier 1: Global Google Maps Platform SDK Quota / Auth Failure Defense
if (typeof window !== 'undefined') {
  const dispatchQuotaExceeded = () => {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  };

  (window as unknown as {gm_authFailure?: () => void}).gm_authFailure = () => {
    dispatchQuotaExceeded();
  };

  const origConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = args.map((a) => String(a ?? '')).join(' ');
    if (
      msg.includes('OverQuotaMapError') ||
      msg.includes('QuotaExceededError') ||
      msg.includes('OVER_QUERY_LIMIT') ||
      msg.includes('RESOURCE_EXHAUSTED')
    ) {
      dispatchQuotaExceeded();
    }
    origConsoleError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
