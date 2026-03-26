import { useState, useEffect } from 'react';

const INSTALL_DISMISSED_KEY = 'gs-pwa-install-dismissed';

// ── Styles injected once ────────────────────────────────────────────────────
const CSS = `
.pwa-toast {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: min(380px, calc(100vw - 32px));
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,175,55,0.25);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  font-family: 'Lexend', system-ui, sans-serif;
  animation: pwaSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes pwaSlideIn {
  from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.95); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1); }
}
@keyframes pwaSlideOut {
  from { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  to   { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.95); }
}
.pwa-toast.leaving {
  animation: pwaSlideOut 0.25s ease forwards;
}
.pwa-toast--update {
  bottom: 24px;
  background: linear-gradient(135deg, rgba(20,18,10,0.96), rgba(30,26,14,0.96));
  border: 1px solid rgba(212,175,55,0.4);
}
.pwa-toast--install {
  bottom: 24px;
  background: linear-gradient(135deg, rgba(20,18,10,0.96), rgba(28,22,8,0.96));
  border: 1px solid rgba(212,175,55,0.35);
}
.pwa-toast--offline {
  top: 16px;
  background: linear-gradient(135deg, rgba(30,15,10,0.97), rgba(40,20,10,0.97));
  border: 1px solid rgba(248,113,113,0.4);
}
.pwa-toast__icon {
  font-size: 22px;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 1px;
}
.pwa-toast__body {
  flex: 1;
  min-width: 0;
}
.pwa-toast__title {
  font-size: 13px;
  font-weight: 600;
  color: #f0e8d8;
  margin: 0 0 2px;
  letter-spacing: 0.01em;
}
.pwa-toast--offline .pwa-toast__title { color: #fca5a5; }
.pwa-toast__subtitle {
  font-size: 11.5px;
  color: #a89880;
  margin: 0;
  line-height: 1.4;
}
.pwa-toast__actions {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}
.pwa-btn {
  border: none;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: filter 0.15s, transform 0.1s;
}
.pwa-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }
.pwa-btn:active { transform: translateY(0); }
.pwa-btn--primary {
  background: linear-gradient(135deg, #debb50, #b8942e);
  color: #0c0b08;
}
.pwa-btn--ghost {
  background: rgba(255,255,255,0.07);
  color: #a89880;
  border: 1px solid rgba(255,255,255,0.08);
}
.pwa-toast__close {
  background: none;
  border: none;
  color: #6b5c42;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 1px;
  transition: color 0.15s;
}
.pwa-toast__close:hover { color: #a89880; }

/* Offline bar — full-width sticky at top */
.pwa-offline-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 9998;
  background: linear-gradient(90deg, #7f1d1d, #991b1b);
  color: #fecaca;
  font-family: 'Lexend', system-ui, sans-serif;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  padding: 6px 16px;
  letter-spacing: 0.03em;
  animation: pwaBarIn 0.3s ease both;
}
@keyframes pwaBarIn {
  from { transform: translateY(-100%); }
  to   { transform: translateY(0); }
}
`;

function injectPWAStyles() {
  if (document.getElementById('pwa-styles')) return;
  const el = document.createElement('style');
  el.id = 'pwa-styles';
  el.textContent = CSS;
  document.head.appendChild(el);
}

// ── Update Toast ─────────────────────────────────────────────────────────────
export function UpdateToast({ onUpdate, onDismiss }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => { injectPWAStyles(); }, []);

  const dismiss = (cb) => {
    setLeaving(true);
    setTimeout(cb, 260);
  };

  return (
    <div className={`pwa-toast pwa-toast--update${leaving ? ' leaving' : ''}`} role="alert">
      <span className="pwa-toast__icon">✦</span>
      <div className="pwa-toast__body">
        <p className="pwa-toast__title">Update available</p>
        <p className="pwa-toast__subtitle">A new version of GoldSync is ready.</p>
        <div className="pwa-toast__actions">
          <button className="pwa-btn pwa-btn--primary" onClick={() => dismiss(onUpdate)}>
            Update now
          </button>
          <button className="pwa-btn pwa-btn--ghost" onClick={() => dismiss(onDismiss)}>
            Later
          </button>
        </div>
      </div>
      <button className="pwa-toast__close" onClick={() => dismiss(onDismiss)} aria-label="Dismiss">✕</button>
    </div>
  );
}

// ── Install Toast ─────────────────────────────────────────────────────────────
export function InstallToast({ onInstall, onDismiss }) {
  const [leaving, setLeaving] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => !!sessionStorage.getItem(INSTALL_DISMISSED_KEY)
  );

  useEffect(() => { injectPWAStyles(); }, []);

  if (dismissed) return null;

  const dismiss = (cb) => {
    setLeaving(true);
    sessionStorage.setItem(INSTALL_DISMISSED_KEY, '1');
    setTimeout(() => { setDismissed(true); cb?.(); }, 260);
  };

  return (
    <div className={`pwa-toast pwa-toast--install${leaving ? ' leaving' : ''}`} role="complementary">
      <span className="pwa-toast__icon">📲</span>
      <div className="pwa-toast__body">
        <p className="pwa-toast__title">Install GoldSync</p>
        <p className="pwa-toast__subtitle">Add to your home screen for offline access and a faster experience.</p>
        <div className="pwa-toast__actions">
          <button className="pwa-btn pwa-btn--primary" onClick={() => dismiss(onInstall)}>
            Install
          </button>
          <button className="pwa-btn pwa-btn--ghost" onClick={() => dismiss()}>
            Not now
          </button>
        </div>
      </div>
      <button className="pwa-toast__close" onClick={() => dismiss()} aria-label="Dismiss">✕</button>
    </div>
  );
}

// ── Offline Bar ───────────────────────────────────────────────────────────────
export function OfflineBar() {
  useEffect(() => { injectPWAStyles(); }, []);

  return (
    <div className="pwa-offline-bar" role="status" aria-live="polite">
      You are offline — showing cached data
    </div>
  );
}
