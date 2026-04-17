import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { LayoutDashboard, Scale, User, ClipboardList, BadgeCheck, Sun, Moon, Gem } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from './lib/supabaseClient.js';
import CustomerForm    from './components/CustomerForm.jsx';
import GoldCalculation from './components/GoldCalculation.jsx';
import Records         from './components/Records.jsx';
import Dashboard       from './components/Dashboard.jsx';
import XRFCertificate  from './components/XRFCertificate.jsx';
import AuthPage        from './components/AuthPage.jsx';
import { UpdateToast, InstallToast, OfflineBar } from './components/PWAPrompts.jsx';
import { usePWA } from './hooks/usePWA.js';

//This App Version Works With the AuthPage.jsx File

/* ─── Inject global design system ────────────────────────────────────────── */
const injectAppStyles = () => {
  const existing = document.getElementById('app-design-system');
  if (existing) existing.remove();
  const el = document.createElement('style');
  el.id = 'app-design-system';
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap');

    :root {
      --font:'Lexend',sans-serif;
      --bg:#0c0b08; --bg-surface:#111009; --bg-card:#181610;
      --bg-nav:rgba(14,13,10,.88); --bg-input:#1e1c14; --bg-raised:#201e16;
      --border-xs:rgba(212,175,55,.05); --border-sm:rgba(212,175,55,.10);
      --border-md:rgba(212,175,55,.18); --border-lg:rgba(212,175,55,.32);
      --gold:#d4af37; --gold-lt:#f0dea0; --gold-br:#debb50; --gold-dk:#8a6c1a;
      --gold-glow:rgba(212,175,55,.12);
      --green:#4ade80; --red:#f87171; --orange:#fbbf24; --blue:#60a5fa;
      --t1:#f0e8d8; --t2:#c4b699; --t3:#9a8c74; --t4:#7c6f59; --t5:#5f5444;
      --sh-md:0 3px 14px rgba(0,0,0,.55),0 1px 4px rgba(0,0,0,.4);
      --sh-lg:0 8px 32px rgba(0,0,0,.6),0 3px 10px rgba(0,0,0,.45);
      --sh-gold:0 6px 28px rgba(212,175,55,.16);
      --ease:cubic-bezier(.16,1,.3,1);
    }
    [data-theme="light"] {
      --bg:#f5f0e6; --bg-surface:#ede8da; --bg-card:#ffffff;
      --bg-nav:rgba(245,240,230,.92); --bg-input:#f0ebe0; --bg-raised:#eae4d6;
      --border-xs:rgba(0,0,0,.04); --border-sm:rgba(0,0,0,.08); --border-md:rgba(0,0,0,.13);
      --border-lg:rgba(184,134,11,.30);
      --gold:#b8860b; --gold-lt:#d4af37; --gold-br:#c9a432; --gold-dk:#7a5c0a;
      --gold-glow:rgba(184,134,11,.09);
      --green:#15803d; --red:#dc2626; --orange:#d97706; --blue:#2563eb;
      --t1:#1a1510; --t2:#3d3325; --t3:#7a6b55; --t4:#a89880; --t5:#c9b99a;
      --sh-md:0 1px 8px rgba(0,0,0,.07),0 0 0 1px rgba(0,0,0,.03);
      --sh-lg:0 4px 20px rgba(0,0,0,.10); --sh-gold:0 6px 28px rgba(184,134,11,.12);
    }

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{-webkit-font-smoothing:antialiased;font-size:16px}
    body{font-family:var(--font);background:var(--bg);color:var(--t1);min-height:100vh;transition:background .4s var(--ease),color .3s}
    ::selection{background:rgba(212,175,55,.26);color:var(--gold-lt)}

    @keyframes spin      {to{transform:rotate(360deg)}}
    @keyframes fadeUp    {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
    @keyframes shimmer   {0%{background-position:-200% center}100%{background-position:200% center}}
    @keyframes pulse-s   {0%,100%{opacity:.55}50%{opacity:1}}
    @keyframes orb-a     {0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(28px,-18px) scale(1.08)}}
    @keyframes orb-b     {0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-18px,24px) scale(1.05)}}
    @keyframes orb-c     {0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.1)}}
    @keyframes tab-slide {from{transform:scaleX(0)}to{transform:scaleX(1)}}
    @keyframes app-in    {from{opacity:0;transform:scale(1.015)}to{opacity:1;transform:scale(1)}}

    ::-webkit-scrollbar{width:7px;height:7px}
    ::-webkit-scrollbar-track{background:var(--bg)}
    ::-webkit-scrollbar-thumb{background:var(--border-md);border-radius:4px}
    ::-webkit-scrollbar-thumb:hover{background:var(--t4)}

    .Toastify__toast{font-family:var(--font)!important;background:var(--bg-card)!important;border:1px solid var(--border-sm)!important;border-radius:12px!important;color:var(--t1)!important;box-shadow:var(--sh-lg)!important}
    .Toastify__progress-bar{background:var(--gold)!important}
    .Toastify__close-button{color:var(--t3)!important}

    .app-shell{min-height:100vh;display:flex;flex-direction:column;position:relative;overflow-x:hidden;animation:app-in .45s var(--ease)}
    .app-orb{position:fixed;border-radius:50%;pointer-events:none;z-index:0}
    .app-orb-a{top:-8%;right:-4%;width:420px;height:420px;background:radial-gradient(circle,rgba(212,175,55,.07) 0%,transparent 68%);animation:orb-a 9s ease-in-out infinite}
    .app-orb-b{bottom:-8%;left:-4%;width:360px;height:360px;background:radial-gradient(circle,rgba(212,175,55,.05) 0%,transparent 68%);animation:orb-b 11s ease-in-out infinite}
    .app-orb-c{top:50%;left:50%;transform:translate(-50%,-50%);width:340px;height:340px;background:radial-gradient(circle,rgba(212,175,55,.025) 0%,transparent 68%);animation:orb-c 14s ease-in-out infinite}

    .app-header{position:fixed;top:0;left:0;right:0;z-index:200;background:var(--bg-nav);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid var(--border-sm);transition:background .4s,border-color .3s}
    .app-header-inner{max-width:1200px;margin:0 auto;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
    .app-header-left{display:flex;align-items:center;gap:14px;min-width:0}
    .app-logo{width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,var(--gold-dk),var(--gold));display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0;box-shadow:0 4px 20px rgba(212,175,55,.3),inset 0 1px 0 rgba(255,255,255,.18);cursor:pointer;transition:box-shadow .3s,transform .3s}
    .app-logo:hover{box-shadow:0 6px 28px rgba(212,175,55,.5),0 0 0 3px rgba(212,175,55,.14);transform:scale(1.06) rotate(-4deg)}
    .app-header-title{font-size:1.4rem;font-weight:900;letter-spacing:-.03em;line-height:1.15;text-align:left;background:linear-gradient(120deg,var(--gold) 0%,var(--gold-lt) 45%,var(--gold-br) 70%,var(--gold) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4.5s linear infinite}
    .app-header-sub{font-size:.68rem;font-weight:300;color:var(--t4);margin-top:3px;letter-spacing:.02em}
    .app-header-right{display:flex;align-items:center;gap:6px;flex-shrink:0}
    .app-header-sep{width:1px;height:22px;background:var(--border-sm);margin:0 3px;flex-shrink:0}
    .app-header-accent{position:absolute;bottom:0;left:24px;right:24px;height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,.32),transparent)}

    .app-user-pill{display:flex;align-items:center;gap:9px;background:var(--bg-raised);border:1px solid var(--border-sm);border-radius:100px;padding:4px 13px 4px 5px;cursor:default;transition:border-color .25s,box-shadow .25s}
    .app-user-pill:hover{border-color:var(--border-md);box-shadow:0 2px 12px rgba(212,175,55,.08)}
    .app-avatar-wrap{position:relative;flex-shrink:0}
    .app-avatar{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--gold-dk),var(--gold));display:flex;align-items:center;justify-content:center;font-size:.78rem;font-weight:800;color:#1a1000;border:2px solid rgba(212,175,55,.25)}
    .app-avatar-status{position:absolute;bottom:0;right:0;width:9px;height:9px;border-radius:50%;background:var(--green);border:2px solid var(--bg-raised)}
    .app-user-name{font-size:.74rem;font-weight:600;color:var(--t2);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .app-user-role{font-size:.61rem;font-weight:300;color:var(--t5);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

    .app-theme-btn{display:flex;align-items:center;gap:8px;background:var(--bg-raised);border:1px solid var(--border-sm);border-radius:100px;padding:7px 13px 7px 9px;cursor:pointer;font-family:var(--font);font-size:.74rem;font-weight:600;color:var(--t3);transition:all .28s var(--ease);white-space:nowrap;flex-shrink:0;outline:none}
    .app-theme-btn:hover{border-color:var(--border-md);color:var(--t1);box-shadow:var(--sh-gold);transform:translateY(-1px)}
    .app-theme-icon{font-size:.95rem;line-height:1;display:inline-block;transition:transform .4s var(--ease)}
    .app-theme-btn:hover .app-theme-icon{transform:rotate(22deg) scale(1.1)}
    .app-theme-track{width:30px;height:17px;background:var(--bg-input);border:1px solid var(--border-md);border-radius:100px;position:relative;transition:background .3s;flex-shrink:0}
    [data-theme="light"] .app-theme-track{background:rgba(184,134,11,.14);border-color:rgba(184,134,11,.32)}
    .app-theme-thumb{position:absolute;top:2px;left:2px;width:11px;height:11px;border-radius:50%;background:var(--gold);transition:transform .3s var(--ease);box-shadow:0 1px 6px rgba(212,175,55,.5)}
    [data-theme="light"] .app-theme-thumb{transform:translateX(13px)}
    .app-theme-label{font-size:.74rem}

    .app-signout{display:flex;align-items:center;gap:6px;background:none;border:1px solid var(--border-xs);border-radius:9px;padding:7px 12px;cursor:pointer;font-family:var(--font);font-size:.72rem;font-weight:500;color:var(--t4);transition:all .25s var(--ease);outline:none;white-space:nowrap}
    .app-signout:hover{border-color:rgba(248,113,113,.4);color:var(--red);background:rgba(248,113,113,.07);transform:translateY(-1px);box-shadow:0 4px 12px rgba(248,113,113,.1)}
    .app-signout svg{transition:transform .25s var(--ease)}
    .app-signout:hover svg{transform:translateX(2px)}

    .app-nav{position:fixed;top:70px;left:0;right:0;z-index:199;background:var(--bg-nav);border-bottom:1px solid var(--border-xs);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);transition:background .4s,border-color .3s}
    .app-nav-inner{max-width:1200px;margin:0 auto;padding:6px 24px;display:flex;gap:4px;overflow-x:auto;scrollbar-width:none}
    .app-nav-inner::-webkit-scrollbar{display:none}
    .app-tab{position:relative;display:flex;align-items:center;gap:8px;padding:10px 17px;border:1px solid transparent;border-radius:11px;background:transparent;color:var(--t4);font-family:var(--font);font-size:.84rem;font-weight:500;cursor:pointer;transition:all .25s var(--ease);white-space:nowrap;outline:none}
    .app-tab:hover:not(.on){background:var(--gold-glow);color:var(--t2);border-color:var(--border-xs);transform:translateY(-1px)}
    .app-tab.on{background:linear-gradient(135deg,rgba(212,175,55,.13),rgba(212,175,55,.07));color:var(--gold-br);border-color:var(--border-md);font-weight:700;box-shadow:0 2px 10px rgba(212,175,55,.12),inset 0 1px 0 rgba(255,255,255,.04)}
    .app-tab-ico{font-size:1rem;line-height:1}
    .app-tab-ul{position:absolute;bottom:-1px;left:18%;right:18%;height:2px;background:linear-gradient(90deg,transparent,var(--gold),transparent);border-radius:1px;transform-origin:center;animation:tab-slide .3s var(--ease)}
    .app-badge{display:inline-flex;align-items:center;justify-content:center;min-width:20px;padding:1px 7px;border-radius:100px;font-family:var(--font);font-size:.67rem;font-weight:700;transition:all .25s}
    .app-badge-off{background:rgba(212,175,55,.1);color:var(--t4)}
    .app-badge-on{background:linear-gradient(135deg,var(--gold-dk),var(--gold));color:#1a1000}

    .app-main{position:relative;z-index:1;flex:1;width:100%;padding:0;margin-top:122px;animation:fadeUp .38s var(--ease)}
    .app-content{padding:28px 32px;min-height:calc(100vh - 200px);transition:background .4s}

    .app-loader{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 20px;gap:20px}
    .app-spinner{width:42px;height:42px;border:3px solid var(--border-sm);border-top-color:var(--gold);border-radius:50%;animation:spin .75s linear infinite}
    .app-loader-text{font-size:.85rem;font-weight:400;color:var(--t4);animation:pulse-s 1.5s ease-in-out infinite}

    .app-init{position:fixed;inset:0;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:22px}
    .app-init-emblem{width:62px;height:62px;border-radius:19px;background:linear-gradient(135deg,var(--gold-dk),var(--gold));display:flex;align-items:center;justify-content:center;font-size:1.55rem;box-shadow:0 6px 28px rgba(212,175,55,.3);animation:pulse-s 1.5s ease-in-out infinite}
    .app-init-text{font-size:.78rem;font-weight:300;color:var(--t5)}

    .app-footer{position:relative;z-index:1;padding:0 24px 22px}
    .app-footer-inner{max-width:1200px;margin:0 auto}
    .app-footer-rule{height:1px;background:linear-gradient(90deg,transparent,var(--border-sm),transparent);margin-bottom:16px}
    .app-footer-text{text-align:center;font-size:.69rem;font-weight:400;color:var(--t5);letter-spacing:.8px;text-transform:uppercase}

    @media(max-width:640px){
      .app-header-inner{padding:8px 14px;gap:8px}
      .app-header-title{font-size:1.15rem}
      .app-header-sub{display:none}
      .app-nav{top:58px}
      .app-nav-inner{padding:5px 10px;overflow-x:auto;scrollbar-width:none}
      .app-nav-inner::-webkit-scrollbar{display:none}
      .app-tab{padding:8px 10px;font-size:.78rem}
      .app-main{margin-top:106px;padding:0}
      .app-content{padding:12px 14px}
      .app-user-name,.app-user-role,.app-theme-label,.app-header-sep{display:none}
      .app-header-right{gap:5px}
      .app-theme-btn{padding:7px 9px}
      .app-signout{padding:7px 10px}
      .app-signout span{display:none}
    }
  `;
  document.head.appendChild(el);
};

/* ─── App ─────────────────────────────────────────────────────────────────── */
export default function App() {
  useEffect(() => { injectAppStyles(); }, []);

  const { needsUpdate, installPrompt, isInstalled, isOnline,
          triggerUpdate, triggerInstall, dismissUpdate } = usePWA();

  const [theme, setTheme] = useState(() => localStorage.getItem('gc-theme') || 'dark');
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('gc-theme', theme);
  }, [theme]);

  // undefined = checking, null = logged out, object = logged in
  const [session, setSession] = useState(undefined);
  const [user,    setUser]    = useState(null);

  // Track whether we've already done the initial data load for this session.
  // This prevents the data-load effect from re-firing every time the browser
  // fires onAuthStateChange (which happens on tab-switch / focus-restore).
  const dataLoadedForSession = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((evt, session) => {
      // TOKEN_REFRESHED and USER_UPDATED fire on tab-switch — only update state
      // for events that represent a real session change (sign-in / sign-out).
      if (evt === 'SIGNED_IN' || evt === 'SIGNED_OUT' || evt === 'INITIAL_SESSION') {
        setSession(session ?? null);
        setUser(session?.user ?? null);
      }
      // Always keep the user object current (e.g. after profile updates).
      if (session?.user) setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  };

  const [activeTab,   setActiveTab]   = useState('calculate');
  const [customers,   setCustomers]   = useState([]);
  const [recordCount, setRecordCount] = useState(0);
  const [appLoading,  setAppLoading]  = useState(true);

  // Stable fetch functions — no deps means they never change identity.
  const fetchCustomers = useCallback(async () => {
    const { data, error } = await supabase
      .from('customers').select('*').order('created_at', { ascending: false });
    if (!error) setCustomers(data || []);
  }, []);

  const fetchRecordCount = useCallback(async () => {
    const { count, error } = await supabase
      .from('gold_calculations').select('*', { count: 'exact', head: true });
    if (!error) setRecordCount(count || 0);
  }, []);

  useEffect(() => {
    if (!session) return;

    // Guard: only load once per unique session (identified by access_token).
    // This prevents re-loading when the component re-renders or when Supabase
    // fires auth events on tab-visibility-change / token-refresh.
    const sessionKey = session.access_token;
    if (dataLoadedForSession.current === sessionKey) return;
    dataLoadedForSession.current = sessionKey;

    (async () => {
      setAppLoading(true);
      await Promise.all([fetchCustomers(), fetchRecordCount()]);
      setAppLoading(false);
    })();
  // fetchCustomers and fetchRecordCount are stable (empty deps useCallback),
  // so listing them here is safe and satisfies the exhaustive-deps rule.
  }, [session, fetchCustomers, fetchRecordCount]);

  /* ── Auth checking ── */
  if (session === undefined) {
    return (
      <div className="app-init" data-theme={theme}>
        <div className="app-init-emblem"><Gem size={28} /></div>
        <p className="app-init-text">Loading…</p>
      </div>
    );
  }

  /* ── No session → show Auth ── */
  if (!session) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} theme="dark"/>
        {!isOnline && <OfflineBar />}
        <AuthPage />
      </>
    );
  }

  /* ── Authenticated ── */
  const displayName = user?.user_metadata?.full_name
    || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const TABS = [
    { id:'dashboard',   label:'Dashboard',   ico:<LayoutDashboard size={16} /> },
    { id:'calculate',   label:'Calculate',   ico:<Scale size={16} /> },
    { id:'customers',   label:'Customers',   ico:<User size={16} /> },
    { id:'records',     label:'Records',     ico:<ClipboardList size={16} />, badge: recordCount },
    { id:'certificate', label:'Certificate', ico:<BadgeCheck size={16} /> },
  ];

  const renderContent = () => {
    if (appLoading) return (
      <div className="app-loader">
        <div className="app-spinner"/>
        <p className="app-loader-text">Loading your data…</p>
      </div>
    );
    switch (activeTab) {
      case 'dashboard':   return <Dashboard />;
      case 'customers':   return <CustomerForm customers={customers} onCustomerAdded={fetchCustomers} />;
      case 'records':     return <Records onRecordChange={fetchRecordCount} setRecordCount={setRecordCount} />;
      case 'certificate': return <XRFCertificate />;
      default:            return <GoldCalculation customers={customers} onCalculationSaved={fetchRecordCount} />;
    }
  };

  return (
    <div className="app-shell" data-theme={theme}>
      <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} newestOnTop closeOnClick
        pauseOnFocusLoss draggable pauseOnHover
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
      <div className="app-orb app-orb-a"/>
      <div className="app-orb app-orb-b"/>
      <div className="app-orb app-orb-c"/>

      {/* Header */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-header-left">
            <div className="app-logo" onClick={() => setActiveTab('dashboard')} title="Go to Dashboard"><Gem size={22} /></div>
            <div>
              <div className="app-header-title">GoldSync</div>
              <div className="app-header-sub">Gold purity &amp; fine gold balance tracking</div>
            </div>
          </div>
          <div className="app-header-right">
            <div className="app-user-pill" title={user?.email}>
              <div className="app-avatar-wrap">
                <div className="app-avatar">{initial}</div>
                <div className="app-avatar-status"/>
              </div>
              <div>
                <div className="app-user-name">{displayName}</div>
                <div className="app-user-role">{user?.email}</div>
              </div>
            </div>
            <div className="app-header-sep"/>
            <button className="app-theme-btn" onClick={() => setTheme(p => p==='dark'?'light':'dark')}
              title={theme==='dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}>
              <span className="app-theme-icon">{theme==='dark' ? <Sun size={15}/> : <Moon size={15}/>}</span>
              <div className="app-theme-track"><div className="app-theme-thumb"/></div>
              <span className="app-theme-label">{theme==='dark'?'Light':'Dark'}</span>
            </button>
            <button className="app-signout" onClick={signOut} title="Sign out">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
        <div className="app-header-accent"/>
      </header>

      {/* Nav */}
      <nav className="app-nav">
        <div className="app-nav-inner">
          {TABS.map(t => (
            <button key={t.id}
              className={`app-tab${activeTab===t.id?' on':''}`}
              onClick={() => { setActiveTab(t.id); if (t.id==='records') fetchRecordCount(); }}
            >
              <span className="app-tab-ico">{t.ico}</span>
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span className={`app-badge ${activeTab===t.id?'app-badge-on':'app-badge-off'}`}>{t.badge}</span>
              )}
              {activeTab===t.id && <span className="app-tab-ul"/>}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="app-main">
        <div className="app-content">{renderContent()}</div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="app-footer-inner">
          <div className="app-footer-rule"/>
          <p className="app-footer-text">
            &nbsp;© {new Date().getFullYear()} GoldSync &nbsp;·&nbsp; Developed by TeamR.
          </p>
        </div>
      </footer>

      {/* PWA prompts */}
      {!isOnline && <OfflineBar />}
      {needsUpdate && <UpdateToast onUpdate={triggerUpdate} onDismiss={dismissUpdate} />}
      {installPrompt && !isInstalled && <InstallToast onInstall={triggerInstall} onDismiss={() => {}} />}
    </div>
  );
}
