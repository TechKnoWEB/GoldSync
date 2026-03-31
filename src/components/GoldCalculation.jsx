import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient.js';
import {
  isBluetoothAvailable,
  printCurrentOrderBill,
} from '../lib/thermalPrinter.js';

// ============================================
// Inject Lexend font + keyframes + theme CSS
// ============================================
const injectStyles = () => {
  if (document.getElementById('gc-design-system')) return;
  const el = document.createElement('style');
  el.id = 'gc-design-system';
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap');

    /* ─── CSS Tokens ─── */
    :root {
      --font: 'Lexend', sans-serif;

      /* Dark theme (default) */
      --bg:          #0e0d0b;
      --bg-card:     #161410;
      --bg-input:    #1c1a15;
      --bg-raised:   #211f19;
      --bg-overlay:  rgba(6,5,3,0.88);

      --border-xs:   rgba(210,175,55,0.06);
      --border-sm:   rgba(210,175,55,0.11);
      --border-md:   rgba(210,175,55,0.20);
      --border-lg:   rgba(210,175,55,0.32);

      --gold:        #d4af37;
      --gold-lt:     #f0dea0;
      --gold-dk:     #8a6c1a;
      --gold-glow:   rgba(212,175,55,0.14);

      --green:       #4ade80;
      --green-bg:    rgba(74,222,128,0.07);
      --green-bd:    rgba(74,222,128,0.22);

      --red:         #f87171;
      --red-bg:      rgba(248,113,113,0.07);
      --red-bd:      rgba(248,113,113,0.22);

      --orange:      #fbbf24;
      --blue:        #60a5fa;

      --t1: #f0e8d8;
      --t2: #c4b699;
      --t3: #9a8c74;
      --t4: #6e6250;
      --t5: #3a3428;

      --r-sm: 8px;
      --r-md: 12px;
      --r-lg: 16px;
      --r-xl: 22px;
      --ease: cubic-bezier(0.16,1,0.3,1);

      --sh-card: 0 2px 16px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4);
      --sh-gold: 0 6px 28px rgba(212,175,55,0.16);
    }

    [data-theme="light"] {
      --bg:          #f8f4ec;
      --bg-card:     #ffffff;
      --bg-input:    #f2ede2;
      --bg-raised:   #ede7d9;
      --bg-overlay:  rgba(240,235,220,0.92);

      --border-xs:   rgba(0,0,0,0.04);
      --border-sm:   rgba(0,0,0,0.09);
      --border-md:   rgba(0,0,0,0.14);
      --border-lg:   rgba(184,134,11,0.30);

      --gold:        #b8860b;
      --gold-lt:     #d4af37;
      --gold-dk:     #7a5c0a;
      --gold-glow:   rgba(184,134,11,0.10);

      --green:       #15803d;
      --green-bg:    rgba(21,128,61,0.07);
      --green-bd:    rgba(21,128,61,0.22);

      --red:         #dc2626;
      --red-bg:      rgba(220,38,38,0.07);
      --red-bd:      rgba(220,38,38,0.22);

      --orange:      #d97706;
      --blue:        #2563eb;

      --t1: #1a1510;
      --t2: #3d3325;
      --t3: #7a6b55;
      --t4: #a89880;
      --t5: #c9b99a;

      --sh-card: 0 1px 8px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03);
      --sh-gold: 0 6px 28px rgba(184,134,11,0.12);
    }

    /* ─── Base ─── */
    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
    html { -webkit-font-smoothing: antialiased; }
    body { font-family: var(--font); background: var(--bg); color: var(--t1); transition: background 0.4s var(--ease), color 0.3s; }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
    input[type=number] { -moz-appearance: textfield; }
    ::selection { background: rgba(212,175,55,0.28); color: var(--gold-lt); }

    /* ─── Animations ─── */
    @keyframes pulse-dot {
      0%,100% { opacity:1; transform:scale(1); }
      50%      { opacity:0.35; transform:scale(0.7); }
    }
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes scaleIn {
      from { opacity:0; transform:scale(0.96); }
      to   { opacity:1; transform:scale(1); }
    }
    @keyframes shimmerSlide {
      0%   { background-position:-200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes slideDown {
      from { opacity:0; max-height:0; transform:translateY(-6px); }
      to   { opacity:1; max-height:3000px; transform:translateY(0); }
    }
    .gc-fadeUp    { animation: fadeUp  0.42s var(--ease) forwards; }
    .gc-scaleIn   { animation: scaleIn 0.32s var(--ease) forwards; }
    .gc-slideDown { animation: slideDown 0.4s var(--ease) forwards; overflow:hidden; }

    /* ─── Staggered rows ─── */
    .gc-row { animation: fadeUp 0.35s var(--ease) forwards; opacity:0; }
    .gc-row:nth-child(1)  { animation-delay:0.00s; }
    .gc-row:nth-child(2)  { animation-delay:0.04s; }
    .gc-row:nth-child(3)  { animation-delay:0.07s; }
    .gc-row:nth-child(4)  { animation-delay:0.10s; }
    .gc-row:nth-child(5)  { animation-delay:0.13s; }
    .gc-row:nth-child(6)  { animation-delay:0.16s; }
    .gc-row:nth-child(7)  { animation-delay:0.19s; }
    .gc-row:nth-child(8)  { animation-delay:0.22s; }
    .gc-row:nth-child(9)  { animation-delay:0.25s; }
    .gc-row:nth-child(10) { animation-delay:0.28s; }

    /* ─── Scrollbar ─── */
    ::-webkit-scrollbar { width:7px; height:7px; }
    ::-webkit-scrollbar-track { background:var(--bg); }
    ::-webkit-scrollbar-thumb { background:var(--border-md); border-radius:4px; }
    ::-webkit-scrollbar-thumb:hover { background:var(--t4); }

    /* ─── GC layout ─── */
    .gc-wrap {
      font-family: var(--font);
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-bottom: 60px;
    }

    /* ─── Hero banner ─── */
    .gc-hero {
      position: relative;
      background: var(--bg-card);
      border: 1px solid var(--border-sm);
      border-radius: var(--r-xl);
      padding: 28px 32px 24px;
      overflow: hidden;
      box-shadow: var(--sh-card);
    }
    .gc-hero::before {
      content:'';
      position:absolute; inset:0;
      background: radial-gradient(ellipse 70% 120% at 80% -20%, rgba(212,175,55,0.08) 0%, transparent 60%);
      pointer-events:none;
    }
    .gc-hero-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .gc-hero-brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .gc-hero-icon {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, var(--gold-dk), var(--gold));
      border-radius: 14px;
      display: flex; align-items:center; justify-content:center;
      font-size: 1.4rem;
      box-shadow: 0 4px 18px rgba(212,175,55,0.28);
      flex-shrink:0;
    }
    .gc-hero-title {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(120deg, var(--gold) 0%, var(--gold-lt) 50%, var(--gold) 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmerSlide 4s linear infinite;
      line-height: 1.2;
    }
    .gc-hero-sub {
      font-size: 0.78rem;
      font-weight: 400;
      color: var(--t4);
      margin-top: 3px;
      letter-spacing: 0.2px;
    }

    /* ─── Theme toggle (hero top-right) ─── */
    .gc-theme-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-raised);
      border: 1px solid var(--border-sm);
      border-radius: 100px;
      padding: 6px 14px 6px 8px;
      cursor: pointer;
      font-family: var(--font);
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--t2);
      transition: all 0.25s var(--ease);
      white-space: nowrap;
    }
    .gc-theme-toggle:hover {
      border-color: var(--border-md);
      color: var(--t1);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .gc-theme-toggle-knob {
      width: 28px; height: 16px;
      background: var(--bg-input);
      border: 1px solid var(--border-md);
      border-radius: 100px;
      position: relative;
      transition: background 0.3s;
    }
    .gc-theme-toggle-knob::after {
      content:'';
      position:absolute;
      top: 2px; left: 2px;
      width: 10px; height: 10px;
      border-radius: 50%;
      background: var(--gold);
      transition: transform 0.3s var(--ease);
    }
    [data-theme="light"] .gc-theme-toggle-knob::after {
      transform: translateX(12px);
    }

    /* ─── Step bar (below hero title) ─── */
    .gc-steps {
      display: flex;
      align-items: center;
      margin-top: 22px;
      padding-top: 20px;
      border-top: 1px solid var(--border-xs);
      gap: 0;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .gc-steps::-webkit-scrollbar { display:none; }
    .gc-step {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 14px;
      border-radius: 100px;
      font-size: 0.76rem;
      font-weight: 600;
      white-space: nowrap;
      flex-shrink: 0;
      transition: all 0.35s var(--ease);
    }
    .gc-step-num {
      width: 20px; height: 20px;
      border-radius: 50%;
      display:flex; align-items:center; justify-content:center;
      font-size: 0.65rem;
      font-weight: 800;
      transition: all 0.3s;
    }
    .gc-step--active  { background: rgba(212,175,55,0.1); color: var(--gold); border: 1px solid rgba(212,175,55,0.2); }
    .gc-step--done    { background: var(--green-bg); color: var(--green); border: 1px solid var(--green-bd); }
    .gc-step--idle    { color: var(--t4); border: 1px solid transparent; }
    .gc-step--active .gc-step-num { background: rgba(212,175,55,0.15); }
    .gc-step--done    .gc-step-num { background: var(--green-bg); }
    .gc-connector {
      flex: 1; min-width: 20px; height: 2px;
      border-radius: 1px;
      transition: background 0.4s;
    }
    .gc-connector--done { background: var(--green-bd); }
    .gc-connector--idle { background: var(--border-xs); }

    /* ─── Cards ─── */
    .gc-card {
      background: var(--bg-card);
      border: 1px solid var(--border-sm);
      border-radius: var(--r-lg);
      padding: 24px;
      box-shadow: var(--sh-card);
      transition: border-color 0.3s;
    }
    .gc-card:hover { border-color: var(--border-md); }
    .gc-card-head {
      display:flex; align-items:center; justify-content:space-between;
      gap:12px; flex-wrap:wrap;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-xs);
    }
    .gc-card-left { display:flex; align-items:center; gap:12px; min-width:0; }
    .gc-card-ico {
      width: 38px; height: 38px;
      border-radius: 11px;
      display:flex; align-items:center; justify-content:center;
      font-size: 1.05rem; flex-shrink:0;
    }
    .gc-card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--gold-lt);
      line-height: 1.3;
      letter-spacing: -0.01em;
    }
    .gc-card-sub {
      font-size: 0.72rem;
      color: var(--t4);
      font-weight: 400;
      margin-top:2px;
    }

    /* ─── Live badge ─── */
    .gc-live {
      display:inline-flex; align-items:center; gap:6px;
      font-size: 0.67rem; font-weight: 700; letter-spacing:0.8px;
      text-transform:uppercase;
      padding: 4px 11px;
      border-radius: 100px;
    }
    .gc-live--green { background: var(--green-bg); color: var(--green); border: 1px solid var(--green-bd); }
    .gc-live--gold  { background: var(--gold-glow); color: var(--gold);  border: 1px solid var(--border-md); }
    .gc-live-dot {
      width:6px; height:6px; border-radius:50%; flex-shrink:0;
      animation: pulse-dot 2s ease-in-out infinite;
    }
    .gc-live--green .gc-live-dot { background: var(--green); box-shadow: 0 0 7px rgba(74,222,128,0.5); }
    .gc-live--gold  .gc-live-dot { background: var(--gold);  box-shadow: 0 0 7px rgba(212,175,55,0.5); }

    /* ─── Search row ─── */
    .gc-search-row {
      display:flex; gap:12px; align-items:flex-end;
    }
    .gc-search-wrap {
      flex:1; position:relative;
    }
    .gc-label {
      display:block;
      font-size: 0.7rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1.3px;
      color: var(--t3);
      margin-bottom: 7px;
    }
    .gc-input-wrap { position:relative; }
    .gc-input-ico {
      position:absolute; left:13px; top:50%; transform:translateY(-50%);
      font-size:0.82rem; opacity:0.35; pointer-events:none; z-index:1;
    }
    .gc-input {
      width:100%;
      background: var(--bg-input);
      border: 1px solid var(--border-sm);
      border-radius: var(--r-sm);
      padding: 11px 14px 11px 38px;
      font-family: var(--font);
      font-size: 0.95rem;
      font-weight: 400;
      color: var(--t1);
      outline:none;
      transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    }
    .gc-input::placeholder { color: var(--t5); }
    .gc-input:hover:not(:disabled):not(:focus) { border-color: var(--border-md); }
    .gc-input:focus {
      border-color: var(--gold);
      box-shadow: 0 0 0 3px rgba(212,175,55,0.12);
      background: var(--bg-raised);
    }
    .gc-input:disabled { opacity:0.45; cursor:not-allowed; }
    .gc-input-no-ico { padding-left: 14px; }
    .gc-input--calc {
      background: var(--green-bg);
      border-color: var(--green-bd);
      color: var(--green);
      font-weight: 700;
      font-size: 1rem;
      cursor:default;
    }
    .gc-input--calc-bal {
      font-weight: 800;
      font-size: 1rem;
    }

    /* ─── Dropdown ─── */
    .gc-dropdown {
      position:absolute; top:calc(100% + 6px); left:0; right:0;
      z-index:9999;
      background: var(--bg-card);
      border: 1px solid var(--border-md);
      border-radius: var(--r-md);
      box-shadow: 0 18px 50px rgba(0,0,0,0.5), 0 4px 14px rgba(0,0,0,0.3);
      max-height: 290px; overflow-y:auto;
      animation: scaleIn 0.22s var(--ease);
    }
    .gc-dropdown-item {
      display:flex; align-items:center; justify-content:space-between;
      padding: 10px 14px; cursor:pointer;
      border-bottom: 1px solid var(--border-xs);
      transition: background 0.15s;
      gap:10px;
    }
    .gc-dropdown-item:last-child { border-bottom:none; }
    .gc-dropdown-item:hover, .gc-dropdown-item.sel { background: rgba(212,175,55,0.07); }
    .gc-dropdown-avatar {
      width:30px; height:30px; border-radius:9px;
      background: linear-gradient(135deg, var(--gold-dk), var(--gold));
      display:flex; align-items:center; justify-content:center;
      font-size:0.75rem; font-weight:800; color:#1a1400; flex-shrink:0;
    }
    .gc-dropdown-name { font-weight:600; color:var(--gold-lt); font-size:0.9rem; }
    .gc-dropdown-mobile { font-size:0.8rem; color:var(--t4); }

    /* ─── Selected customer card ─── */
    .gc-cust-card {
      display:flex; align-items:center; justify-content:space-between;
      flex-wrap:wrap; gap:14px;
      background: linear-gradient(135deg, rgba(212,175,55,0.05) 0%, rgba(212,175,55,0.01) 100%);
      border: 1px solid var(--border-sm);
      border-radius: var(--r-md);
      padding: 16px 18px;
      margin-top: 16px;
      animation: scaleIn 0.28s var(--ease);
    }
    .gc-cust-inner { display:flex; align-items:center; gap:13px; flex:1; min-width:0; }
    .gc-cust-avatar {
      width:44px; height:44px; border-radius:13px;
      background: linear-gradient(135deg, var(--gold-dk), var(--gold));
      display:flex; align-items:center; justify-content:center;
      font-size:1.05rem; font-weight:800; color:#1a1400;
      box-shadow: 0 3px 12px rgba(212,175,55,0.25);
      flex-shrink:0; transition: transform 0.25s;
    }
    .gc-cust-avatar:hover { transform: scale(1.06); }
    .gc-cust-name { font-size:1rem; font-weight:700; color:var(--gold-lt); }
    .gc-cust-meta { display:flex; gap:8px; flex-wrap:wrap; margin-top:5px; }
    .gc-chip {
      font-size:0.72rem; color:var(--t3);
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border-xs);
      border-radius:6px; padding: 2px 8px;
      display:inline-flex; align-items:center; gap:4px;
    }
    .gc-clear-btn {
      background:none; border: 1px solid var(--border-xs);
      color:var(--t4); cursor:pointer;
      font-family:var(--font); font-size:0.76rem;
      padding: 6px 12px; border-radius: 9px;
      display:inline-flex; align-items:center; gap:5px;
      transition: all 0.25s;
    }
    .gc-clear-btn:hover {
      border-color: rgba(248,113,113,0.3);
      color: var(--red);
      background: rgba(248,113,113,0.06);
      transform: translateY(-1px);
    }

    /* ─── Calculation grid ─── */
    .gc-grid {
      display:grid;
      grid-template-columns: 1fr 1fr;
      gap:16px;
      margin-bottom: 6px;
    }
    .gc-form-group { display:flex; flex-direction:column; gap:0; }
    .gc-hint {
      font-size:0.7rem; color:var(--t4);
      margin-top:5px; font-style:italic;
      font-weight:300;
    }
    .gc-auto-hint {
      display:flex; align-items:center; gap:6px;
      margin-top:5px; padding: 4px 10px;
      background: rgba(212,175,55,0.05);
      border: 1px solid var(--border-xs);
      border-radius:7px;
      font-size:0.7rem; color:var(--t4);
    }
    .gc-auto-hint-val { font-weight:700; color:var(--gold); }
    .gc-auto-hint-eq  { font-size:0.65rem; color:var(--t5); margin-left:auto; }
    .gc-reset-link {
      background:none; border:none; cursor:pointer;
      font-family:var(--font); font-size:0.68rem;
      color:var(--gold-dk); text-decoration:underline; opacity:0.7;
      padding:2px 0; margin-top:2px; transition:opacity 0.2s;
    }
    .gc-reset-link:hover { opacity:1; }

    /* ─── Calc preview bar ─── */
    .gc-preview {
      display:grid; grid-template-columns: 1fr auto 1fr auto 1fr;
      align-items:center; gap:8px;
      padding:15px 18px;
      background: rgba(212,175,55,0.03);
      border: 1px solid var(--border-xs);
      border-radius: var(--r-md);
      margin-top:14px;
      transition: all 0.3s;
      animation: scaleIn 0.3s var(--ease);
    }
    .gc-preview-cell { text-align:center; }
    .gc-preview-val {
      font-size:0.95rem; font-weight:700;
      color:var(--t1); font-variant-numeric:tabular-nums;
    }
    .gc-preview-lbl {
      font-size:0.62rem; text-transform:uppercase;
      letter-spacing:0.8px; color:var(--t4); margin-top:3px;
      font-weight:500;
    }
    .gc-preview-op { font-size:1.1rem; color:var(--gold-dk); font-weight:700; opacity:0.7; text-align:center; }

    /* ─── Result card ─── */
    .gc-result {
      text-align:center; padding:22px;
      border-radius: var(--r-lg);
      margin-top:14px;
      position:relative; overflow:hidden;
      animation: scaleIn 0.32s var(--ease);
    }
    .gc-result--pos { background: var(--green-bg); border: 1px solid var(--green-bd); }
    .gc-result--neg { background: var(--red-bg);   border: 1px solid var(--red-bd);   }
    .gc-result-lbl  { font-size:0.67rem; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:var(--t4); margin-bottom:7px; }
    .gc-result-val  { font-size:2rem; font-weight:900; font-variant-numeric:tabular-nums; line-height:1.1; }
    .gc-result-val span { font-size:0.9rem; font-weight:400; opacity:0.6; margin-left:2px; }
    .gc-result-sub  { font-size:0.75rem; color:var(--t3); margin-top:8px; font-weight:300; }

    /* ─── Section divider label ─── */
    .gc-sec-label {
      display:flex; align-items:center; gap:10px;
      font-size:0.68rem; font-weight:700;
      text-transform:uppercase; letter-spacing:1.5px;
      color:var(--t4); margin:22px 0 16px;
    }
    .gc-sec-line { flex:1; height:1px; background: linear-gradient(90deg, var(--border-xs), transparent); }

    /* ─── Stats row ─── */
    .gc-stats {
      display:grid;
      grid-template-columns: repeat(auto-fit, minmax(130px,1fr));
      gap:12px; margin-bottom:18px;
    }
    .gc-stat {
      background: var(--bg-raised);
      border: 1px solid var(--border-xs);
      border-radius: var(--r-md);
      padding: 15px 13px; text-align:center;
      transition: all 0.35s var(--ease); cursor:default;
    }
    .gc-stat:hover {
      border-color: var(--border-md);
      transform: translateY(-3px);
      box-shadow: var(--sh-gold);
    }
    .gc-stat-lbl { font-size:0.62rem; font-weight:700; text-transform:uppercase; letter-spacing:1.2px; color:var(--t4); margin-bottom:5px; }
    .gc-stat-val { font-size:1.18rem; font-weight:800; font-variant-numeric:tabular-nums; line-height:1.3; }
    .gc-stat-unit { font-size:0.65rem; font-weight:400; opacity:0.5; margin-left:2px; }

    /* ─── History section ─── */
    .gc-history {
      padding:18px 20px;
      background: rgba(212,175,55,0.02);
      border: 1px solid var(--border-xs);
      border-radius: var(--r-lg);
      margin-top:24px;
    }
    .gc-collapse-toggle {
      display:flex; align-items:center; justify-content:space-between;
      cursor:pointer; padding-bottom:16px; margin-bottom:4px;
      border-bottom: 1px solid var(--border-xs);
      user-select:none;
      transition: opacity 0.2s;
    }
    .gc-collapse-toggle:hover { opacity:0.8; }
    .gc-collapse-left { display:flex; align-items:center; gap:10px; }
    .gc-collapse-title { font-size:1rem; font-weight:700; color:var(--gold-lt); }
    .gc-badge-count {
      background: rgba(212,175,55,0.1);
      color:var(--gold);
      font-size:0.7rem; font-weight:700;
      padding:2px 10px; border-radius:100px;
      border: 1px solid var(--border-sm);
    }
    .gc-collapse-arrow {
      font-size:0.72rem; color:var(--t4);
      transition: transform 0.35s var(--ease);
    }

    /* ─── Table ─── */
    .gc-table-wrap {
      overflow-x:auto; -webkit-overflow-scrolling:touch;
      border-radius: var(--r-md);
      border: 1px solid var(--border-xs);
      margin-top:4px;
    }
    .gc-table { width:100%; border-collapse:collapse; white-space:nowrap; }
    .gc-table thead tr { background: rgba(212,175,55,0.05); border-bottom: 1px solid var(--border-md); }
    .gc-table th { text-align:left; padding:10px 12px; font-size:0.67rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:var(--gold); }
    .gc-table td { padding:10px 12px; font-size:0.82rem; color:var(--t2); border-bottom: 1px solid var(--border-xs); }
    .gc-table tbody tr:hover td { background: rgba(212,175,55,0.03); }
    .gc-table tfoot tr.gc-totals td { background: rgba(212,175,55,0.04); font-weight:700; color:var(--t1); border-top: 1.5px solid var(--border-md); font-size:0.85rem; }
    .gc-table tfoot tr.gc-net td { background: rgba(212,175,55,0.02); }
    .gc-row-num {
      display:inline-flex; align-items:center; justify-content:center;
      width:22px; height:22px; border-radius:6px;
      background: rgba(212,175,55,0.07); color:var(--gold-dk);
      font-size:0.68rem; font-weight:700; margin-right:4px;
    }
    .gc-bal-pos { color:var(--green) !important; font-weight:700; }
    .gc-bal-neg { color:var(--red)   !important; font-weight:700; }
    .gc-cash-c  { color:var(--blue)   !important; }
    .gc-paid-c  { color:var(--orange) !important; }
    .gc-calc-c  { color:var(--green)  !important; font-weight:600; }
    .gc-net-cell { font-size:1rem; font-weight:800; }
    .gc-net-cell small { font-size:0.72rem; font-weight:400; opacity:0.65; display:block; }

    /* ─── Edit input ─── */
    .gc-edit-input {
      background: var(--bg-input);
      border: 1px solid var(--border-md);
      border-radius: 6px; padding:4px 7px;
      font-family: var(--font); font-size:0.78rem;
      color:var(--t1); width:76px; outline:none;
      transition: border-color 0.18s, box-shadow 0.18s;
    }
    .gc-edit-input:focus { border-color:var(--gold); box-shadow: 0 0 0 2px rgba(212,175,55,0.1); }
    .gc-edit-auto { font-size:0.6rem; color:var(--gold-dk); opacity:0.7; margin-top:2px; white-space:nowrap; }

    /* ─── Action cell ─── */
    .gc-action-cell { display:flex; gap:4px; }
    .gc-btn-xs {
      padding:3px 7px; border-radius:6px;
      font-family:var(--font); font-size:0.78rem; font-weight:600;
      cursor:pointer; border:none; transition: all 0.2s; min-width:28px;
    }
    .gc-btn-xs--save   { background:var(--green-bg); color:var(--green); border:1px solid var(--green-bd); }
    .gc-btn-xs--cancel { background:var(--red-bg);   color:var(--red);   border:1px solid var(--red-bd);   }
    .gc-btn-xs--edit   { background:var(--gold-glow); color:var(--gold); border:1px solid var(--border-md); }
    .gc-btn-xs--save:hover   { background:rgba(74,222,128,0.14); }
    .gc-btn-xs--cancel:hover { background:rgba(248,113,113,0.14); }
    .gc-btn-xs--edit:hover   { background:rgba(212,175,55,0.16); }

    /* ─── Badge ─── */
    .gc-badge {
      display:inline-block; padding:2px 9px; border-radius:100px;
      font-size:0.66rem; font-weight:700; text-transform:uppercase; letter-spacing:0.4px;
    }
    .gc-badge--gold   { background:rgba(251,191,36,0.1);  color:var(--orange); border:1px solid rgba(251,191,36,0.25); }
    .gc-badge--cash   { background:rgba(96,165,250,0.1);  color:var(--blue);   border:1px solid rgba(96,165,250,0.25); }
    .gc-badge--both   { background:rgba(192,132,252,0.1); color:#c084fc;       border:1px solid rgba(192,132,252,0.25); }
    .gc-badge--none   { background:rgba(255,255,255,0.03); color:var(--t4);    border:1px solid var(--border-xs); }

    /* ─── Print options ─── */
    .gc-print-grid {
      display:grid; gap:13px; margin-top:4px;
    }
    .gc-print-opt {
      background: var(--bg-raised);
      border: 1px solid var(--border-sm);
      border-radius: var(--r-md);
      padding:18px 16px; text-align:center;
      cursor:pointer; transition: all 0.35s var(--ease);
      position:relative; overflow:hidden;
    }
    .gc-print-opt:hover {
      border-color: var(--border-lg);
      transform: translateY(-4px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    }
    .gc-print-ico { font-size:1.7rem; margin-bottom:8px; transition:transform 0.3s; display:block; }
    .gc-print-opt:hover .gc-print-ico { transform: translateY(-3px) scale(1.05); }
    .gc-print-title { font-size:0.84rem; font-weight:700; color:var(--t1); margin-bottom:4px; }
    .gc-print-desc  { font-size:0.7rem;  font-weight:400; color:var(--t4); line-height:1.5; }

    /* ─── Billing / Invoice ─── */
    .gc-billing-toggle {
      display:flex; align-items:center; gap:10px;
      padding:14px 18px;
      background: rgba(212,175,55,0.03);
      border: 1px solid var(--border-xs);
      border-radius: var(--r-md);
      cursor:pointer; margin-top:20px;
      transition: all 0.25s var(--ease);
      user-select:none;
    }
    .gc-billing-toggle:hover { border-color: var(--border-md); background: rgba(212,175,55,0.06); }
    .gc-billing-toggle-label { flex:1; font-size:0.88rem; font-weight:600; color:var(--t2); }
    .gc-billing-toggle-arrow { font-size:0.72rem; color:var(--t4); transition: transform 0.3s var(--ease); }

    .gc-billing-section {
      margin-top:4px;
      padding:20px;
      background: rgba(212,175,55,0.02);
      border: 1px solid var(--border-xs);
      border-radius: var(--r-md);
      animation: scaleIn 0.28s var(--ease);
    }

    .gc-status-group { display:flex; gap:8px; flex-wrap:wrap; margin-top:6px; }
    .gc-status-btn {
      padding:7px 16px; border-radius:100px; cursor:pointer;
      font-family:var(--font); font-size:0.76rem; font-weight:700;
      border:1px solid transparent; transition: all 0.22s var(--ease);
    }
    .gc-status-btn--draft    { background:rgba(107,114,128,0.12); color:#9ca3af; border-color:rgba(107,114,128,0.2); }
    .gc-status-btn--confirmed{ background:rgba(251,191,36,0.1);   color:var(--orange); border-color:rgba(251,191,36,0.25); }
    .gc-status-btn--paid     { background:var(--green-bg);        color:var(--green);  border-color:var(--green-bd); }
    .gc-status-btn.active-draft     { background:rgba(107,114,128,0.25); color:#e5e7eb;  border-color:#6b7280; box-shadow:0 0 0 2px rgba(107,114,128,0.15); }
    .gc-status-btn.active-confirmed { background:rgba(251,191,36,0.2);   color:var(--orange); border-color:var(--orange); box-shadow:0 0 0 2px rgba(251,191,36,0.12); }
    .gc-status-btn.active-paid      { background:rgba(74,222,128,0.18);  color:var(--green);  border-color:var(--green);  box-shadow:0 0 0 2px rgba(74,222,128,0.12); }

    .gc-metal-group { display:flex; gap:8px; flex-wrap:wrap; margin-top:6px; }
    .gc-metal-btn {
      padding:7px 16px; border-radius:100px; cursor:pointer;
      font-family:var(--font); font-size:0.76rem; font-weight:700;
      border:1px solid var(--border-sm); background:var(--bg-raised);
      color:var(--t4); transition: all 0.22s var(--ease);
    }
    .gc-metal-btn.active { border-color:var(--gold); color:var(--gold); background:rgba(212,175,55,0.1); box-shadow:0 0 0 2px rgba(212,175,55,0.1); }

    .gc-bill-summary {
      margin-top:16px; padding:16px;
      background: linear-gradient(135deg,rgba(212,175,55,0.05),rgba(212,175,55,0.02));
      border: 1px solid var(--border-sm); border-radius: var(--r-md);
    }
    .gc-bill-row {
      display:flex; justify-content:space-between; align-items:center;
      padding:5px 0; font-size:0.82rem;
    }
    .gc-bill-row + .gc-bill-row { border-top:1px solid var(--border-xs); }
    .gc-bill-row-lbl { color:var(--t3); }
    .gc-bill-row-val { font-weight:600; color:var(--t1); font-variant-numeric:tabular-nums; }
    .gc-bill-total-row {
      display:flex; justify-content:space-between; align-items:center;
      padding:10px 0 0; margin-top:6px; border-top:2px solid var(--border-md);
    }
    .gc-bill-total-lbl { font-size:0.85rem; font-weight:700; color:var(--gold-lt); }
    .gc-bill-total-val { font-size:1.1rem; font-weight:900; color:var(--gold); font-variant-numeric:tabular-nums; }

    /* Status badge in table */
    .gc-bill-status {
      display:inline-block; padding:2px 9px; border-radius:100px;
      font-size:0.63rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;
    }
    .gc-bill-status--draft     { background:rgba(107,114,128,0.15); color:#9ca3af; border:1px solid rgba(107,114,128,0.25); }
    .gc-bill-status--confirmed { background:rgba(251,191,36,0.12);  color:var(--orange); border:1px solid rgba(251,191,36,0.28); }
    .gc-bill-status--paid      { background:var(--green-bg); color:var(--green); border:1px solid var(--green-bd); }
    .gc-inv-num { font-size:0.72rem; color:var(--t4); font-weight:400; white-space:nowrap; }

    /* ─── Save / Print buttons ─── */
    .gc-save-wrap { display:flex; flex-direction:column; align-items:center; gap:10px; margin-top:28px; width:100%; }
    .gc-btn-print-last {
      background: transparent;
      color: var(--gold);
      font-family: var(--font); font-size:0.84rem; font-weight:600;
      letter-spacing:0.2px;
      padding:10px 28px; border:1px solid var(--border-md); border-radius: var(--r-md);
      cursor:pointer; width:100%; max-width:380px;
      transition: all 0.25s var(--ease);
    }
    .gc-btn-print-last:hover:not(:disabled) { background:var(--gold-glow); border-color:var(--border-lg); transform:translateY(-1px); }
    .gc-btn-print-last:active:not(:disabled) { transform:translateY(0); }
    .gc-btn-print-last:disabled { opacity:0.35; cursor:not-allowed; }
    .gc-btn-save {
      background: linear-gradient(135deg, var(--gold-dk) 0%, var(--gold) 100%);
      color: #1a1100;
      font-family: var(--font); font-size:1rem; font-weight:800;
      letter-spacing:0.3px;
      padding:14px 48px; border:none; border-radius: var(--r-md);
      cursor:pointer; width:100%; max-width:380px;
      box-shadow: var(--sh-gold);
      transition: all 0.32s var(--ease);
    }
    .gc-btn-save:hover:not(:disabled) { transform:translateY(-2px); box-shadow: 0 10px 36px rgba(212,175,55,0.28); }
    .gc-btn-save:active:not(:disabled) { transform:translateY(0); }
    .gc-btn-save:disabled { opacity:0.45; cursor:not-allowed; filter:grayscale(0.3); }

    /* ─── Empty / Loading ─── */
    .gc-empty { text-align:center; padding:44px 20px; color:var(--t4); }
    .gc-empty-ico { font-size:2.4rem; opacity:0.22; margin-bottom:12px; display:block; }
    .gc-empty-title { font-size:0.95rem; font-weight:600; color:var(--t3); margin-bottom:6px; }
    .gc-empty-desc  { font-size:0.82rem; color:var(--t4); max-width:320px; margin:0 auto; line-height:1.6; font-weight:300; }

    /* ─── Responsive ─── */
    @media(max-width:640px) {
      .gc-hero { padding:20px; }
      .gc-hero-title { font-size:1.2rem; }
      .gc-grid { grid-template-columns:1fr; }
      .gc-preview { grid-template-columns:1fr !important; gap:6px; text-align:center; }
      .gc-stats { grid-template-columns:1fr 1fr; }
      .gc-cust-card { flex-direction:column; align-items:flex-start; }
      .gc-search-row { flex-direction:column; }
      .gc-print-grid { grid-template-columns:1fr !important; }
    }
  `;
  document.head.appendChild(el);
};

// ============================================
// Component
// ============================================
function GoldCalculation({ customers, onCalculationSaved }) {
  useEffect(() => { injectStyles(); }, []);

  // ── Theme ──
  const [theme, setTheme] = useState(() => localStorage.getItem('gc-theme') || 'dark');
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('gc-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(p => p === 'dark' ? 'light' : 'dark');

  // ── Search ──
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [fetching, setFetching] = useState(false);
  const dropdownRef = useRef(null);

  // ── Calculation form ──
  const [goldInput, setGoldInput] = useState('');
  const [purityPercent, setPurityPercent] = useState('');
  const [customerFine, setCustomerFine] = useState('');
  const [paidGold, setPaidGold] = useState('');
  const [paidGoldManual, setPaidGoldManual] = useState(false);
  const [goldPrice, setGoldPrice] = useState('');
  const [cashPayment, setCashPayment] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Computed ──
  const [fineGold, setFineGold] = useState(0);
  const [balance, setBalance] = useState(0);
  const [finalBalance, setFinalBalance] = useState(0);
  const [autoPaidGold, setAutoPaidGold] = useState(0);

  // ── Billing ──
  const [discount,    setDiscount]    = useState('');
  const [taxRate,     setTaxRate]     = useState('');
  const [billStatus,  setBillStatus]  = useState('draft');   // draft | confirmed | paid
  const [metalType,   setMetalType]   = useState('gold');    // gold | silver | platinum
  const [showBilling, setShowBilling] = useState(true);

  // ── History ──
  const [customerRecords, setCustomerRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // ── UI ──
  const [printing, setPrinting]       = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(true);

  // ── Last saved snapshot — used by "Print Last" so re-clicking never creates a new record ──
  const [lastSavedData, setLastSavedData] = useState(null);

  // ── Step ──
  const step = !selectedCustomer ? 1 : (!goldInput || !purityPercent || !customerFine) ? 2 : 3;

  // ── Format helpers ──
  const G = 3, C = 1;
  const fmtG = n => Number(n).toFixed(G);
  const fmtC = n => Number(n).toFixed(C);
  const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

  // ── Billing computed ──
  const discountAmt  = parseFloat(discount) || 0;
  const taxableAmt   = Math.abs(balance) * (parseFloat(goldPrice) || 0) - discountAmt;
  const taxAmt       = ((parseFloat(taxRate) || 0) / 100) * taxableAmt;
  const grandTotal   = taxableAmt + taxAmt;

  // ── Calculations ──
  useEffect(() => {
    const g = parseFloat(goldInput) || 0;
    const p = parseFloat(purityPercent) || 0;
    const cf = parseFloat(customerFine) || 0;
    const fg = (p / 100) * g;
    setFineGold(fg);
    setBalance(fg - cf);
  }, [goldInput, purityPercent, customerFine]);

  useEffect(() => {
    const cash = parseFloat(cashPayment) || 0;
    const price = parseFloat(goldPrice) || 0;
    const auto = price > 0 ? cash / price : 0;
    setAutoPaidGold(auto);
    if (!paidGoldManual) setPaidGold(auto > 0 ? fmtG(auto) : '');
  }, [cashPayment, goldPrice, paidGoldManual]);

  useEffect(() => {
    const pg = parseFloat(paidGold) || 0;
    setFinalBalance(pg - balance);
  }, [paidGold, balance]);

  useEffect(() => {
    if (balance !== 0 && goldInput && purityPercent && customerFine) setShowPayment(true);
  }, [balance, goldInput, purityPercent, customerFine]);

  // ── Search filter ──
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); setShowDropdown(false); return; }
    const q = searchQuery.trim().toLowerCase();
    const f = customers.filter(c => c.name.toLowerCase().includes(q) || c.mobile.includes(q));
    setSearchResults(f);
    setShowDropdown(f.length > 0);
  }, [searchQuery, customers]);

  // ── Click outside dropdown ──
  useEffect(() => {
    const h = e => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Select customer ──
  const selectCustomer = async (c) => {
    setSelectedCustomer(c);
    setSearchQuery(`${c.name} (${c.mobile})`);
    setShowDropdown(false);
    setLastSavedData(null);
    await loadRecords(c);
  };

  const loadRecords = async (customer) => {
    if (!customer) return;
    setFetching(true); setLoadingRecords(true);
    try {
      const { data, error } = await supabase
        .from('gold_calculations').select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCustomerRecords(data || []);
      if (data?.length > 0) toast.success(`${data.length} record(s) found for ${customer.name}`);
      else toast.info(`No previous records for ${customer.name}`);
    } catch (e) { toast.error(`Fetch failed: ${e.message}`); }
    finally { setFetching(false); setLoadingRecords(false); }
  };

  // ── Edit record ──
  const startEditing = rec => {
    setEditingRecordId(rec.id);
    setEditForm({
      gold_input: rec.gold_input, purity_percent: rec.purity_percent,
      fine_gold: rec.fine_gold, customer_fine: rec.customer_fine,
      balance: rec.balance, gold_price: rec.gold_price || 0,
      paid_gold: rec.paid_gold || 0, paid_gold_manual: false,
      cash_payment: rec.cash_payment || 0, final_balance: rec.final_balance || 0,
      notes: rec.notes || '',
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => {
      const u = { ...prev, [field]: value };
      if (field === 'gold_input' || field === 'purity_percent') {
        const g = parseFloat(field === 'gold_input' ? value : u.gold_input) || 0;
        const p = parseFloat(field === 'purity_percent' ? value : u.purity_percent) || 0;
        u.fine_gold = ((p/100)*g).toFixed(G);
        u.balance = (parseFloat(u.fine_gold) - (parseFloat(u.customer_fine)||0)).toFixed(G);
      }
      if (field === 'customer_fine') u.balance = ((parseFloat(u.fine_gold)||0) - (parseFloat(value)||0)).toFixed(G);
      if (field === 'paid_gold') u.paid_gold_manual = true;
      if (field === 'cash_payment' || field === 'gold_price') {
        const cash = parseFloat(field === 'cash_payment' ? value : u.cash_payment) || 0;
        const price = parseFloat(field === 'gold_price' ? value : u.gold_price) || 0;
        const auto = price > 0 ? (cash/price).toFixed(G) : (0).toFixed(G);
        u._auto = auto;
        if (!u.paid_gold_manual) u.paid_gold = auto;
      }
      u.final_balance = ((parseFloat(u.paid_gold)||0) - parseFloat(u.balance)).toFixed(G);
      return u;
    });
  };

  const saveEdit = async (id) => {
    try {
      const pg = parseFloat(editForm.paid_gold) > 0;
      const ca = parseFloat(editForm.cash_payment) > 0;
      const mode = pg && ca ? 'both' : pg ? 'gold' : ca ? 'cash' : 'none';
      const { error } = await supabase.from('gold_calculations').update({
        gold_input: parseFloat(editForm.gold_input),
        purity_percent: parseFloat(editForm.purity_percent),
        fine_gold: parseFloat(editForm.fine_gold),
        customer_fine: parseFloat(editForm.customer_fine),
        balance: parseFloat(editForm.balance),
        gold_price: parseFloat(editForm.gold_price) || 0,
        paid_gold: parseFloat(editForm.paid_gold) || 0,
        cash_payment: parseFloat(editForm.cash_payment) || 0,
        final_balance: parseFloat(editForm.final_balance) || 0,
        payment_mode: mode, notes: editForm.notes || '',
      }).eq('id', id);
      if (error) throw error;
      toast.success('Record updated!');
      setEditingRecordId(null);
      await loadRecords(selectedCustomer);
      if (onCalculationSaved) onCalculationSaved();
    } catch (e) { toast.error(`Update failed: ${e.message}`); }
  };

  const cancelEdit = () => { setEditingRecordId(null); setEditForm({}); };

  // ── Reset ──
  const resetForm = () => {
    setGoldInput(''); setPurityPercent(''); setCustomerFine('');
    setPaidGold(''); setPaidGoldManual(false);
    setGoldPrice(''); setCashPayment(''); setNotes('');
    setDiscount(''); setTaxRate(''); setBillStatus('draft'); setMetalType('gold');
    setShowPayment(false); setShowBilling(true);
  };

  // ── Totals ──
  const totals = customerRecords.reduce((acc, r) => {
    acc.gold += parseFloat(r.gold_input) || 0;
    acc.fine += parseFloat(r.fine_gold) || 0;
    acc.custFine += parseFloat(r.customer_fine) || 0;
    acc.bal += parseFloat(r.balance) || 0;
    acc.paidGold += parseFloat(r.paid_gold) || 0;
    acc.cash += parseFloat(r.cash_payment) || 0;
    acc.finalBal += parseFloat(r.final_balance) || 0;
    return acc;
  }, { gold:0, fine:0, custFine:0, bal:0, paidGold:0, cash:0, finalBal:0 });
  totals.net = totals.bal - totals.paidGold;

  // ── Print & Save ──
  const handlePrintAndSave = async (e) => {
    e.preventDefault();

    // ── Validate (same as handleSave) ──
    if (!selectedCustomer) { toast.error('Please select a customer.'); return; }
    const g = parseFloat(goldInput);
    if (!goldInput || isNaN(g) || g <= 0) { toast.error('Enter valid gold weight.'); return; }
    const p = parseFloat(purityPercent);
    if (purityPercent === '' || isNaN(p) || p < 0 || p > 100) { toast.error('Purity must be 0–100.'); return; }
    const cf = parseFloat(customerFine);
    if (customerFine === '' || isNaN(cf)) { toast.error('Enter valid Customer Fine.'); return; }

    const pg   = parseFloat(paidGold)    || 0;
    const gp   = parseFloat(goldPrice)   || 0;
    const ca   = parseFloat(cashPayment) || 0;
    const disc = parseFloat(discount)    || 0;
    const tr   = parseFloat(taxRate)     || 0;
    const mode = pg > 0 && ca > 0 ? 'both' : pg > 0 ? 'gold' : ca > 0 ? 'cash' : 'none';

    setSaving(true);
    try {
      // 1. Save first
      const { data: saved, error } = await supabase.from('gold_calculations').insert([{
        customer_id:    selectedCustomer.id,
        customer_name:  selectedCustomer.name,
        gold_input:     parseFloat(fmtG(g)),
        purity_percent: parseFloat(Number(p).toFixed(2)),
        fine_gold:      parseFloat(fmtG(fineGold)),
        customer_fine:  parseFloat(fmtG(cf)),
        balance:        parseFloat(fmtG(balance)),
        gold_price:     parseFloat(fmtC(gp)),
        paid_gold:      parseFloat(fmtG(pg)),
        cash_payment:   parseFloat(fmtC(ca)),
        final_balance:  parseFloat(fmtG(finalBalance)),
        payment_mode:   mode,
        notes:          notes.trim(),
        discount:       disc,
        tax_rate:       tr,
        tax_amount:     parseFloat(taxAmt.toFixed(2)),
        bill_status:    billStatus,
        metal_type:     metalType,
      }]).select();
      if (error) throw error;

      // 2. Reload records so totals are fresh for net balance calc
      await loadRecords(selectedCustomer);
      if (onCalculationSaved) onCalculationSaved();

      // 3. Build currentOrder snapshot for the bill print
      // netBal uses the same formula as the on-screen Net Balance so receipt matches exactly
      const netBal = (customerRecords.length > 0 ? totals.net : 0) + balance - pg;

      const currentOrder = {
        metalType,
        goldInput:    parseFloat(fmtG(g)),
        purityPercent: parseFloat(Number(p).toFixed(2)),
        fineGold:     parseFloat(fmtG(fineGold)),
        customerFine: parseFloat(fmtG(cf)),
        balance:      parseFloat(fmtG(balance)),
        paidGold:     parseFloat(fmtG(pg)),
        goldPrice:    gp,
        cashPayment:  ca,
        discount:     disc,
        taxRate:      tr,
        taxAmt:       parseFloat(taxAmt.toFixed(2)),
        grandTotal,
        billStatus,
        notes:        notes.trim(),
        invoiceNumber: saved?.[0]?.invoice_number || '',
      };

      // 4. Store snapshot so "Print Last" can re-print without a new DB insert
      setLastSavedData({ customer: selectedCustomer, order: currentOrder, netBal });

      // 5. Print — sends to thermal printer first, opens preview window
      const result = await printCurrentOrderBill(selectedCustomer, currentOrder, netBal);
      toast.success(result.method === 'bluetooth'
        ? '✓ Saved & sent to thermal printer!'
        : '✓ Saved & print preview opened!');
      resetForm();
    } catch (e) { toast.error(`Failed: ${e.message}`); }
    finally { setSaving(false); }
  };

  // ── Print Last — re-prints the most recently saved record; never inserts a new row ──
  const handlePrintLast = async () => {
    if (!lastSavedData || printing) return;
    setPrinting(true);
    try {
      const { customer, order, netBal } = lastSavedData;
      const result = await printCurrentOrderBill(customer, order, netBal);
      toast.success(result.method === 'bluetooth'
        ? '✓ Re-sent to thermal printer!'
        : '✓ Print preview opened!');
    } catch (err) {
      toast.error(`Print failed: ${err.message}`);
    } finally {
      setPrinting(false);
    }
  };

  // ── Helpers ──
  const balClass = v => parseFloat(v) > 0 ? 'gc-bal-pos' : parseFloat(v) < 0 ? 'gc-bal-neg' : '';
  const balColor = v => parseFloat(v) > 0 ? 'var(--green)' : parseFloat(v) < 0 ? 'var(--red)' : 'var(--t4)';
  const payBadge = m => {
    const map = { gold: ['gc-badge--gold','Gold'], cash: ['gc-badge--cash','Cash'], both: ['gc-badge--both','Gold+Cash'] };
    const [cls, txt] = map[m] || ['gc-badge--none','—'];
    return <span className={`gc-badge ${cls}`}>{txt}</span>;
  };
  const editAuto = () => { const c = parseFloat(editForm.cash_payment)||0, p = parseFloat(editForm.gold_price)||0; return p > 0 ? c/p : 0; };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="gc-wrap">
      
      {/* ══════════════ CUSTOMER SEARCH ══════════════ */}
      <div className="gc-card" style={{ position:'relative', zIndex:20, overflow:'visible', animationDelay:'0.05s' }}>
        <div className="gc-card-head">
          <div className="gc-card-left">
            <div className="gc-card-ico" style={{ background:'rgba(212,175,55,0.08)', border:'1px solid rgba(212,175,55,0.12)' }}>👤</div>
            <div>
              <div className="gc-card-title">Select Customer</div>
              <div className="gc-card-sub">Search by name or mobile — history loads automatically</div>
            </div>
          </div>
          {selectedCustomer && (
            <div className="gc-live gc-live--green">
              <span className="gc-live-dot" /> Selected
            </div>
          )}
        </div>

        {/* Search field */}
        <div className="gc-search-row">
          <div className="gc-search-wrap" ref={dropdownRef} style={{ flex:1, position:'relative', zIndex:25 }}>
            <label className="gc-label">Search by Name or Mobile</label>
            <div className="gc-input-wrap">
              <span className="gc-input-ico">🔍</span>
              <input
                type="text" className="gc-input"
                placeholder="Type customer name or mobile…"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSelectedCustomer(null); setCustomerRecords([]); }}
                onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
              />
            </div>
            {showDropdown && (
              <div className="gc-dropdown">
                {searchResults.map((c, i) => (
                  <div key={c.id} className={`gc-dropdown-item${selectedCustomer?.id === c.id ? ' sel' : ''}`}
                    style={{ animationDelay:`${i*0.03}s` }} onClick={() => selectCustomer(c)}>
                    <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                      <div className="gc-dropdown-avatar">{c.name.charAt(0).toUpperCase()}</div>
                      <span className="gc-dropdown-name">{c.name}</span>
                    </div>
                    <span className="gc-dropdown-mobile">{c.mobile}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected customer info */}
        {selectedCustomer && (
          <div className="gc-cust-card">
            <div className="gc-cust-inner">
              <div className="gc-cust-avatar">{selectedCustomer.name.charAt(0).toUpperCase()}</div>
              <div>
                <div className="gc-cust-name">{selectedCustomer.name}</div>
                <div className="gc-cust-meta">
                  <span className="gc-chip">📱 {selectedCustomer.mobile}</span>
                  <span className="gc-chip">📅 Since {fmtDate(selectedCustomer.created_at)}</span>
                  {customerRecords.length > 0 && (
                    <span className="gc-chip">📊 {customerRecords.length} record{customerRecords.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            </div>
            <button className="gc-clear-btn" onClick={() => { setSelectedCustomer(null); setSearchQuery(''); setCustomerRecords([]); resetForm(); }}>✕ Clear</button>
          </div>
        )}
      </div>

      {/* ══════════════ CALCULATION FORM ══════════════ */}
      <div className="gc-card" style={{ position:'relative', zIndex:10, animationDelay:'0.1s' }}>
        <div className="gc-card-head">
          <div className="gc-card-left">
            <div className="gc-card-ico" style={{ background:'rgba(74,222,128,0.07)', border:'1px solid rgba(74,222,128,0.14)' }}>⚖️</div>
            <div>
              <div className="gc-card-title">New Calculation</div>
              <div className="gc-card-sub">Enter gold details for fine gold computation</div>
            </div>
          </div>
          {fineGold > 0 && (
            <div className="gc-live gc-live--gold">
              <span className="gc-live-dot" /> Live
            </div>
          )}
        </div>

        <form onSubmit={handlePrintAndSave}>
          {/* Core fields */}
          <div className="gc-grid">
            {/* Gold Weight */}
            <div className="gc-form-group">
              <label className="gc-label">Gold Weight <span style={{ textTransform:'none', fontWeight:400, fontSize:'0.68rem', color:'var(--t5)' }}>(grams)</span></label>
              <div className="gc-input-wrap">
                <span className="gc-input-ico">⚖️</span>
                <input type="number" className="gc-input" placeholder="Enter gold weight" value={goldInput} onChange={e => setGoldInput(e.target.value)} step="0.0001" min="0" disabled={saving} />
              </div>
            </div>
            {/* Purity */}
            <div className="gc-form-group">
              <label className="gc-label">Purity <span style={{ textTransform:'none', fontWeight:400, fontSize:'0.68rem', color:'var(--t5)' }}>(%)</span></label>
              <div className="gc-input-wrap">
                <span className="gc-input-ico">💎</span>
                <input type="number" className="gc-input" placeholder="0 — 100" value={purityPercent} onChange={e => setPurityPercent(e.target.value)} step="0.01" min="0" max="100" disabled={saving} />
              </div>
            </div>
            {/* Customer Fine */}
            <div className="gc-form-group">
              <label className="gc-label">Customer Fine <span style={{ textTransform:'none', fontWeight:400, fontSize:'0.68rem', color:'var(--t5)' }}>(grams)</span></label>
              <div className="gc-input-wrap">
                <span className="gc-input-ico">👤</span>
                <input type="number" className="gc-input" placeholder="Enter customer fine" value={customerFine} onChange={e => setCustomerFine(e.target.value)} step="0.0001" disabled={saving} />
              </div>
            </div>
            {/* Fine Gold */}
            <div className="gc-form-group">
              <label className="gc-label">Fine Gold <span style={{ textTransform:'none', fontWeight:400, fontSize:'0.68rem', color:'var(--t5)' }}>(auto)</span></label>
              <input type="text" className="gc-input gc-input--calc gc-input-no-ico" value={fmtG(fineGold)} readOnly />
              <span className="gc-hint">= (Purity ÷ 100) × Gold Weight</span>
            </div>
          </div>

          {/* Live preview */}

          {/*(goldInput || purityPercent) && (
            <div className="gc-preview">
              <div className="gc-preview-cell">
                <div className="gc-preview-val">{fmtG(fineGold)}</div>
                <div className="gc-preview-lbl">Fine Gold</div>
              </div>
              <div className="gc-preview-op">−</div>
              <div className="gc-preview-cell">
                <div className="gc-preview-val">{fmtG(parseFloat(customerFine)||0)}</div>
                <div className="gc-preview-lbl">Cust. Fine</div>
              </div>
              <div className="gc-preview-op">=</div>
              <div className="gc-preview-cell">
                <div className="gc-preview-val" style={{ color: balColor(balance) }}>{fmtG(balance)}</div>
                <div className="gc-preview-lbl">Balance</div>
              </div>
            </div>
          )}
          

          {/* Balance result */}
          {balance !== 0 && goldInput && customerFine && (
            <div className={`gc-result gc-result--${balance > 0 ? 'pos' : 'neg'}`}>
              <div className="gc-result-lbl">Balance</div>
              <div className="gc-result-val" style={{ color: balColor(balance) }}>{fmtG(balance)}<span>g</span></div>
              <div className="gc-result-sub">{balance > 0 ? '↑ Customer pays the amount' : '↓ Manufacturer pays to the customer'}</div>
            </div>
          )}

          {/* ══ Billing Section ══ */}
          {(goldInput && purityPercent && customerFine) && (
            <div style={{ marginTop:'20px' }}>
              <div className="gc-billing-toggle" onClick={() => setShowBilling(p => !p)}
                role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowBilling(p => !p); } }}>
                <span style={{ fontSize:'1rem' }}>🧾</span>
                <span className="gc-billing-toggle-label">Billing &amp; Invoice Details</span>
                <span style={{ fontSize:'0.72rem', color:'var(--t4)', marginRight:'6px' }}>{showBilling ? 'Hide' : 'Show'}</span>
                <span className="gc-billing-toggle-arrow" style={{ transform: showBilling ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
              </div>

              {showBilling && (
                <div className="gc-billing-section gc-slideDown">
                  <div className="gc-grid" style={{ marginBottom:'0' }}>
                    
                    {/* Gold Price */}
                    <div className="gc-form-group">
                      <label className="gc-label">Gold Price <span style={{ textTransform:'none', fontWeight:400, fontSize:'0.68rem', color:'var(--t5)' }}>— ₹ per gram</span></label>
                      <div className="gc-input-wrap">
                        <span className="gc-input-ico">💰</span>
                        <input type="number" className="gc-input" placeholder="e.g. 7500" value={goldPrice}
                          onChange={e => { setGoldPrice(e.target.value); setPaidGoldManual(false); }} step="0.01" min="0" disabled={saving} />
                      </div>
                    </div>
                    {/* Cash Paid */}
                    <div className="gc-form-group">
                      <label className="gc-label">Cash Paid <span style={{ textTransform:'none', fontWeight:400, fontSize:'0.68rem', color:'var(--t5)' }}>— ₹</span></label>
                      <div className="gc-input-wrap">
                        <span className="gc-input-ico">💵</span>
                        <input type="number" className="gc-input" placeholder="Amount received ₹" value={cashPayment}
                          onChange={e => { setCashPayment(e.target.value); setPaidGoldManual(false); }} step="0.01" min="0" disabled={saving} />
                      </div>
                    </div>
                    {/* Discount */}
                    <div className="gc-form-group">
                      <label className="gc-label">Discount <span style={{ textTransform:'none', fontWeight:400, fontSize:'0.68rem', color:'var(--t5)' }}>— ₹</span></label>
                      <div className="gc-input-wrap">
                        <span className="gc-input-ico">🏷️</span>
                        <input type="number" className="gc-input" placeholder="Amount e.g. 50" value={discount}
                          onChange={e => setDiscount(e.target.value)} step="0.01" min="0" disabled={saving} />
                      </div>
                    </div>
                    {/* Tax Rate */}
                    <div className="gc-form-group">
                      <label className="gc-label">GST / Tax Rate <span style={{ textTransform:'none', fontWeight:400, fontSize:'0.68rem', color:'var(--t5)' }}>(%)</span></label>
                      <div className="gc-input-wrap">
                        <span className="gc-input-ico">📊</span>
                        <input type="number" className="gc-input" placeholder="e.g. 3" value={taxRate}
                          onChange={e => setTaxRate(e.target.value)} step="0.01" min="0" max="100" disabled={saving} />
                      </div>
                    </div>
                    {/* Bill Status */}
                    <div className="gc-form-group" style={{ gridColumn:'1 / -1' }}>
                      <label className="gc-label">Bill Status</label>
                      
                    </div>
                  </div>

                  {/* ── Bill Summary ── */}
                  <div className="gc-bill-summary" style={{ marginTop:'18px' }}>
                    <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'1.2px', color:'var(--t4)', marginBottom:'12px' }}>
                      🧾 Current Order
                    </div>

                    {/* Current Order Details */}
                    
                    <div className="gc-bill-row">
                      <span className="gc-bill-row-lbl">Gold Weight</span>
                      <span className="gc-bill-row-val">{fmtG(parseFloat(goldInput)||0)} g</span>
                    </div>
                    <div className="gc-bill-row">
                      <span className="gc-bill-row-lbl">Purity</span>
                      <span className="gc-bill-row-val">{parseFloat(purityPercent)||0}%</span>
                    </div>
                    <div className="gc-bill-row">
                      <span className="gc-bill-row-lbl">Fine Gold</span>
                      <span className="gc-bill-row-val gc-calc-c">{fmtG(fineGold)} g</span>
                    </div>
                    <div className="gc-bill-row">
                      <span className="gc-bill-row-lbl">Customer Fine</span>
                      <span className="gc-bill-row-val">{fmtG(parseFloat(customerFine)||0)} g</span>
                    </div>

                    {/* Divider */}
                    <div style={{ height:'1px', background:'var(--border-md)', margin:'10px 0' }} />

                    {/* This order balance */}
                    <div className="gc-bill-row">
                      <span className="gc-bill-row-lbl">This Order Balance</span>
                      <span className="gc-bill-row-val" style={{ color: balColor(balance), fontWeight:800 }}>{fmtG(balance)} g</span>
                    </div>

                    {/* Cash & Price if entered */}
                    {parseFloat(goldPrice) > 0 && (
                      <div className="gc-bill-row">
                        <span className="gc-bill-row-lbl">Gold Price</span>
                        <span className="gc-bill-row-val">₹{fmtC(parseFloat(goldPrice))}/g</span>
                      </div>
                    )}
                    {parseFloat(cashPayment) > 0 && (
                      <div className="gc-bill-row">
                        <span className="gc-bill-row-lbl">Cash (Gold) Paid</span>
                        <span className="gc-bill-row-val" style={{ color:'var(--blue)' }}>₹{fmtC(parseFloat(cashPayment))}</span>
                      </div>
                    )}
                    {discountAmt > 0 && (
                      <div className="gc-bill-row">
                        <span className="gc-bill-row-lbl" style={{ color:'var(--green)' }}>Discount</span>
                        <span className="gc-bill-row-val" style={{ color:'var(--green)' }}>− ₹{discountAmt.toFixed(2)}</span>
                      </div>
                    )}
                    {parseFloat(taxRate) > 0 && (
                      <div className="gc-bill-row">
                        <span className="gc-bill-row-lbl">GST / Tax ({taxRate}%)</span>
                        <span className="gc-bill-row-val">+ ₹{taxAmt.toFixed(2)}</span>
                      </div>
                    )}
                    {parseFloat(goldPrice) > 0 && (
                      <div className="gc-bill-row">
                        <span className="gc-bill-row-lbl">Order Value</span>
                        <span className="gc-bill-row-val">₹{grandTotal.toFixed(1)}</span>
                      </div>
                    )}

                    {/* Divider before Net */}
                    <div style={{ height:'1px', background:'var(--border-md)', margin:'10px 0' }} />

                    {/* Net Balance across all orders */}
                    {customerRecords.length > 0 && (
                      <>
                        <div className="gc-bill-row">
                          <span className="gc-bill-row-lbl" style={{ fontSize:'0.7rem', color:'var(--t4)' }}>Previous Orders Net Balance</span>
                          <span className="gc-bill-row-val" style={{ color: balColor(totals.net) }}>{fmtG(totals.net)} g</span>
                        </div>
                        <div className="gc-bill-row">
                          <span className="gc-bill-row-lbl" style={{ fontSize:'0.7rem', color:'var(--t4)' }}>This Order Balance</span>
                          <span className="gc-bill-row-val" style={{ color: balColor(balance) }}>{fmtG(balance)} g</span>
                        </div>
                      </>
                    )}
                    <div className="gc-bill-total-row">
                      <span className="gc-bill-total-lbl">Net Balance</span>
                      {(() => {
                        const netDisplay = (customerRecords.length > 0 ? totals.net : 0) + balance - (parseFloat(paidGold) || 0);
                        return (
                          <>
                            <span className="gc-bill-total-val" style={{ color: balColor(netDisplay) }}>
                              {fmtG(netDisplay)} g
                            </span>
                            <div style={{ fontSize:'0.8rem', color:'var(--t4)', marginTop:'6px', fontStyle:'italic', fontWeight:300, textAlign:'center', width:'100%' }}>
                              {netDisplay >= 0 ? '↑ Customer pays the amount' : '↓ Manufacturer pays to the customer'}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* ══ Print & Save + Print Last ══ */}
                  <div className="gc-save-wrap" style={{ marginTop:'18px' }}>
                    <button type="submit" className="gc-btn-save" disabled={saving || !selectedCustomer}>
                      {saving ? '⏳ Saving & Printing…' : '🖨️ Print & Save'}
                    </button>
                    {lastSavedData && (
                      <button
                        type="button"
                        className="gc-btn-print-last"
                        onClick={handlePrintLast}
                        disabled={printing}
                        title="Re-print the last saved transaction without creating a new record"
                      >
                        {printing ? '⏳ Printing…' : '🔄 Print Last Transaction'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ History ══ */}
          {selectedCustomer && customerRecords.length > 0 && (
            <div className="gc-history gc-fadeUp">
              <div className="gc-collapse-toggle" onClick={() => setHistoryExpanded(p => !p)} role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setHistoryExpanded(p => !p); } }}>
                <div className="gc-collapse-left">
                  <span className="gc-collapse-title">📊 Transaction History</span>
                  <span className="gc-badge-count">{customerRecords.length}</span>
                </div>
                <span className="gc-collapse-arrow" style={{ transform: historyExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
              </div>

              {historyExpanded && (
                <div className="gc-slideDown">
                  {/* Stats — trimmed to Cash Gold, Cash Paid, Net Balance */}
                  <div className="gc-stats" style={{ marginTop:'16px' }}>
                    {[
                      { lbl:'Total Cash (Gold)', val:`₹${fmtC(totals.cash)}`, color:'var(--blue)', unit:'' },
                      { lbl:'Total Cash Paid',   val:fmtG(totals.paidGold),    color:'var(--orange)', unit:'g' },
                      { lbl:'Net Balance',        val:fmtG(totals.net),         color: balColor(totals.net), unit:'g', highlight: true },
                    ].map(({ lbl, val, color, unit, highlight }) => (
                      <div key={lbl} className="gc-stat" style={highlight ? {
                        borderColor: totals.net >= 0 ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)',
                        background: totals.net >= 0 ? 'var(--green-bg)' : 'var(--red-bg)',
                      } : {}}>
                        <div className="gc-stat-lbl">{lbl}</div>
                        <div className="gc-stat-val" style={{ color }}>{val}{unit && <span className="gc-stat-unit">{unit}</span>}</div>
                      </div>
                    ))}
                  </div>

                  {/* Per-order cards — replaces the old wide table */}
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginTop:'8px' }}>
                    {customerRecords.map((rec, i) => (
                      <div key={rec.id} className="gc-row" style={{
                        background:'var(--bg-raised)', border:'1px solid var(--border-xs)',
                        borderRadius:'var(--r-md)', padding:'14px 16px',
                      }}>
                        {editingRecordId === rec.id ? (
                          /* ── Inline Edit ── */
                          <div>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                              <span style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--gold)', textTransform:'uppercase', letterSpacing:'1px' }}>
                                Editing #{i+1}
                              </span>
                              <div className="gc-action-cell">
                                <button type="button" className="gc-btn-xs gc-btn-xs--save" onClick={() => saveEdit(rec.id)}>✓ Save</button>
                                <button type="button" className="gc-btn-xs gc-btn-xs--cancel" onClick={cancelEdit}>✕ Cancel</button>
                              </div>
                            </div>
                            <div className="gc-grid" style={{ gap:'10px' }}>
                              <div className="gc-form-group">
                                <label className="gc-label">Gold (g)</label>
                                <input className="gc-edit-input" style={{ width:'100%' }} type="number" value={editForm.gold_input} onChange={e => handleEditChange('gold_input', e.target.value)} step="0.0001" />
                              </div>
                              <div className="gc-form-group">
                                <label className="gc-label">Purity %</label>
                                <input className="gc-edit-input" style={{ width:'100%' }} type="number" value={editForm.purity_percent} onChange={e => handleEditChange('purity_percent', e.target.value)} step="0.01" min="0" max="100" />
                              </div>
                              <div className="gc-form-group">
                                <label className="gc-label">Cust. Fine (g)</label>
                                <input className="gc-edit-input" style={{ width:'100%' }} type="number" value={editForm.customer_fine} onChange={e => handleEditChange('customer_fine', e.target.value)} step="0.0001" />
                              </div>
                              <div className="gc-form-group">
                                <label className="gc-label">Cash Paid ₹</label>
                                <input className="gc-edit-input" style={{ width:'100%' }} type="number" value={editForm.cash_payment} onChange={e => handleEditChange('cash_payment', e.target.value)} step="0.01" />
                              </div>
                            </div>
                            <div style={{ marginTop:'10px', display:'flex', gap:'16px', fontSize:'0.78rem', color:'var(--t3)' }}>
                              <span>Fine Gold: <strong style={{ color:'var(--green)' }}>{fmtG(editForm.fine_gold)}g</strong></span>
                              <span>Balance: <strong className={balClass(editForm.balance)}>{fmtG(editForm.balance)}g</strong></span>
                            </div>
                          </div>
                        ) : (
                          /* ── View Mode ── */
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap' }}>
                            <div style={{ display:'flex', align:'center', gap:'12px', flexWrap:'wrap', flex:1 }}>
                              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', minWidth:'28px', height:'28px', borderRadius:'8px', background:'rgba(212,175,55,0.08)', color:'var(--gold-dk)', fontSize:'0.7rem', fontWeight:800, flexShrink:0 }}>{i+1}</span>
                              <div style={{ display:'flex', gap:'20px', flexWrap:'wrap', alignItems:'center' }}>
                                <div>
                                  <div style={{ fontSize:'0.62rem', color:'var(--t4)', textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700 }}>Date</div>
                                  <div style={{ fontSize:'0.82rem', color:'var(--t2)', fontWeight:500 }}>{fmtDate(rec.created_at)}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize:'0.62rem', color:'var(--t4)', textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700 }}>Balance</div>
                                  <div style={{ fontSize:'0.9rem', fontWeight:800 }} className={balClass(rec.balance)}>{fmtG(rec.balance)}g</div>
                                </div>
                                <div>
                                  <div style={{ fontSize:'0.62rem', color:'var(--t4)', textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700 }}>Cash (Gold)</div>
                                  <div style={{ fontSize:'0.82rem', color:'var(--blue)', fontWeight:600 }}>₹{fmtC(rec.cash_payment||0)}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize:'0.62rem', color:'var(--t4)', textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700 }}>Cash Paid</div>
                                  <div style={{ fontSize:'0.82rem', color:'var(--orange)', fontWeight:600 }}>{fmtG(rec.paid_gold||0)}g</div>
                                </div>
                                {rec.bill_status && rec.bill_status !== 'draft' && (
                                  <span className={`gc-bill-status gc-bill-status--${rec.bill_status}`}>{rec.bill_status}</span>
                                )}
                              </div>
                            </div>
                            <button type="button" className="gc-btn-xs gc-btn-xs--edit" onClick={() => startEditing(rec)}>✏️</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {loadingRecords && (
            <div className="gc-empty">
              <span className="gc-empty-ico" style={{ animation:'pulse-dot 1.5s ease infinite', opacity:0.35 }}>⏳</span>
              <div className="gc-empty-title">Loading Records</div>
              <div className="gc-empty-desc">Fetching transaction history…</div>
            </div>
          )}

          {/* No records */}
          {selectedCustomer && !loadingRecords && customerRecords.length === 0 && !fetching && (
            <div className="gc-empty gc-fadeUp">
              <span className="gc-empty-ico">📋</span>
              <div className="gc-empty-title">No Records Yet</div>
              <div className="gc-empty-desc">No existing records for this customer. Save a new calculation below to get started.</div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default GoldCalculation;