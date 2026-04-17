import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Users, ClipboardList, Scale, Gem, TrendingUp, TrendingDown, Wallet, CalendarDays, BarChart2, Trophy, CreditCard, Clock, RefreshCw, Coins, Banknote, Handshake, Circle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';

// ─── Inject Dashboard Styles ──────────────────────────────────────────────────
const injectDashboardStyles = () => {
  if (document.getElementById('dashboard-styles')) return;
  const el = document.createElement('style');
  el.id = 'dashboard-styles';
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap');

    /* ── Keyframes ── */
    @keyframes db-fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes db-scaleIn {
      from { opacity: 0; transform: scale(0.94); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes db-shimmer {
      0%   { background-position: -300% center; }
      100% { background-position: 300% center; }
    }
    @keyframes db-count-up {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes db-bar-grow {
      from { width: 0; }
      to   { width: var(--bar-w); }
    }
    @keyframes db-ring-fill {
      from { stroke-dashoffset: var(--ring-total); }
      to   { stroke-dashoffset: var(--ring-offset); }
    }
    @keyframes db-pulse-dot {
      0%, 100% { opacity: 1;    transform: scale(1); }
      50%      { opacity: 0.35; transform: scale(0.7); }
    }
    @keyframes db-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes db-grain {
      0%, 100% { transform: translate(0, 0); }
      10%      { transform: translate(-2%, -2%); }
      30%      { transform: translate(2%, 1%); }
      50%      { transform: translate(-1%, 2%); }
      70%      { transform: translate(1%, -1%); }
      90%      { transform: translate(-2%, 1%); }
    }

    /* ── Staggered entry ── */
    .db-s1  { animation: db-fadeUp .42s cubic-bezier(.16,1,.3,1) .00s both; }
    .db-s2  { animation: db-fadeUp .42s cubic-bezier(.16,1,.3,1) .06s both; }
    .db-s3  { animation: db-fadeUp .42s cubic-bezier(.16,1,.3,1) .11s both; }
    .db-s4  { animation: db-fadeUp .42s cubic-bezier(.16,1,.3,1) .16s both; }
    .db-s5  { animation: db-fadeUp .42s cubic-bezier(.16,1,.3,1) .21s both; }
    .db-s6  { animation: db-fadeUp .42s cubic-bezier(.16,1,.3,1) .26s both; }
    .db-s7  { animation: db-fadeUp .42s cubic-bezier(.16,1,.3,1) .31s both; }
    .db-s8  { animation: db-fadeUp .42s cubic-bezier(.16,1,.3,1) .36s both; }

    /* ── Shell ── */
    .db-wrap {
      font-family: var(--font, 'Lexend', sans-serif);
      display: flex;
      flex-direction: column;
      gap: 22px;
      padding-bottom: 48px;
    }

    /* ── Page header row ── */
    .db-page-head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border-xs, rgba(212,175,55,.05));
    }
    .db-page-eyebrow {
      font-size: .68rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 2px;
      color: var(--gold, #d4af37);
      margin-bottom: 4px;
      display: flex; align-items: center; gap: 8px;
    }
    .db-page-eyebrow-line {
      width: 28px; height: 1px;
      background: var(--gold, #d4af37); opacity: .4;
    }
    .db-page-title {
      font-size: 1.75rem; font-weight: 900;
      letter-spacing: -.03em; line-height: 1.1;
      color: var(--t1, #f0e8d8);
    }
    .db-page-sub {
      font-size: .78rem; font-weight: 300;
      color: var(--t4, #7c6f59); margin-top: 5px;
    }
    .db-refresh-btn {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--bg-raised, #201e16);
      border: 1px solid var(--border-sm, rgba(212,175,55,.10));
      border-radius: 10px;
      padding: 9px 16px;
      font-family: var(--font, 'Lexend', sans-serif);
      font-size: .78rem; font-weight: 600;
      color: var(--t3, #9a8c74);
      cursor: pointer;
      transition: all .25s cubic-bezier(.16,1,.3,1);
      white-space: nowrap;
    }
    .db-refresh-btn:hover {
      border-color: var(--border-md, rgba(212,175,55,.18));
      color: var(--t1, #f0e8d8);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(212,175,55,.1);
    }
    .db-refresh-icon { font-size: .9rem; transition: transform .5s; }
    .db-refresh-btn:hover .db-refresh-icon { transform: rotate(180deg); }
    .db-refresh-btn.loading .db-refresh-icon { animation: db-spin .7s linear infinite; }

    /* ── KPI strip ── */
    .db-kpi-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 14px;
    }
    .db-kpi {
      background: var(--bg-card, #181610);
      border: 1px solid var(--border-sm, rgba(212,175,55,.10));
      border-radius: 16px;
      padding: 20px 18px 18px;
      position: relative; overflow: hidden;
      transition: all .35s cubic-bezier(.16,1,.3,1);
      cursor: default;
    }
    .db-kpi::before {
      content: '';
      position: absolute; inset: 0;
      background: var(--kpi-glow, transparent);
      opacity: 0; border-radius: inherit;
      transition: opacity .35s;
      pointer-events: none;
    }
    .db-kpi:hover { transform: translateY(-4px); box-shadow: 0 10px 32px rgba(0,0,0,.35); border-color: var(--border-md, rgba(212,175,55,.18)); }
    .db-kpi:hover::before { opacity: 1; }
    .db-kpi-icon-wrap {
      width: 38px; height: 38px; border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem; margin-bottom: 14px;
      transition: transform .3s;
    }
    .db-kpi:hover .db-kpi-icon-wrap { transform: scale(1.1) rotate(-3deg); }
    .db-kpi-label {
      font-size: .65rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1.3px;
      color: var(--t4, #7c6f59); margin-bottom: 6px;
    }
    .db-kpi-value {
      font-size: 1.55rem; font-weight: 900;
      letter-spacing: -.02em; line-height: 1.1;
      font-variant-numeric: tabular-nums;
      animation: db-count-up .45s cubic-bezier(.16,1,.3,1) both;
    }
    .db-kpi-unit {
      font-size: .7rem; font-weight: 400;
      opacity: .5; margin-left: 2px;
    }
    .db-kpi-trend {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: .68rem; font-weight: 600;
      margin-top: 6px; padding: 2px 7px;
      border-radius: 100px;
    }
    .db-kpi-trend--pos { background: rgba(74,222,128,.08); color: var(--green, #4ade80); }
    .db-kpi-trend--neg { background: rgba(248,113,113,.08); color: var(--red, #f87171); }
    .db-kpi-trend--neu { background: rgba(212,175,55,.08); color: var(--gold, #d4af37); }
    .db-kpi-corner {
      position: absolute; top: 14px; right: 14px;
      font-size: 1.4rem; opacity: .06;
      transition: opacity .35s, transform .35s;
    }
    .db-kpi:hover .db-kpi-corner { opacity: .12; transform: scale(1.15) rotate(10deg); }

    /* ── Two-col layout ── */
    .db-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }
    .db-row-3 {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 18px;
    }

    /* ── Panel base ── */
    .db-panel {
      background: var(--bg-card, #181610);
      border: 1px solid var(--border-sm, rgba(212,175,55,.10));
      border-radius: 18px;
      padding: 22px;
      transition: border-color .3s;
    }
    .db-panel:hover { border-color: var(--border-md, rgba(212,175,55,.18)); }
    .db-panel-head {
      display: flex; align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-xs, rgba(212,175,55,.05));
      gap: 12px; flex-wrap: wrap;
    }
    .db-panel-title-wrap { display: flex; align-items: center; gap: 10px; }
    .db-panel-ico {
      width: 34px; height: 34px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: .9rem; flex-shrink: 0;
    }
    .db-panel-title {
      font-size: .95rem; font-weight: 700;
      letter-spacing: -.01em;
      color: var(--gold-lt, #f0dea0);
    }
    .db-panel-sub {
      font-size: .7rem; font-weight: 300;
      color: var(--t4, #7c6f59); margin-top: 2px;
    }
    .db-panel-badge {
      font-size: .68rem; font-weight: 700;
      background: var(--gold-glow, rgba(212,175,55,.12));
      color: var(--gold, #d4af37);
      border: 1px solid var(--border-sm, rgba(212,175,55,.10));
      padding: 3px 10px; border-radius: 100px;
    }

    /* ── Balance ring ── */
    .db-ring-wrap {
      display: flex; flex-direction: column;
      align-items: center; gap: 18px;
    }
    .db-ring-svg { overflow: visible; }
    .db-ring-track { fill: none; }
    .db-ring-fill {
      fill: none;
      stroke-linecap: round;
      transition: stroke-dashoffset .8s cubic-bezier(.16,1,.3,1);
    }
    .db-ring-center {
      text-anchor: middle; dominant-baseline: middle;
      font-family: var(--font, 'Lexend', sans-serif);
    }
    .db-ring-legend {
      display: flex; gap: 18px;
      flex-wrap: wrap; justify-content: center;
    }
    .db-ring-legend-item {
      display: flex; align-items: center; gap: 7px;
      font-size: .72rem; color: var(--t3, #9a8c74);
    }
    .db-ring-dot {
      width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
    }

    /* ── Bar chart ── */
    .db-bars { display: flex; flex-direction: column; gap: 14px; }
    .db-bar-row { display: flex; flex-direction: column; gap: 5px; }
    .db-bar-meta {
      display: flex; justify-content: space-between; align-items: baseline;
    }
    .db-bar-name {
      font-size: .78rem; font-weight: 600;
      color: var(--t2, #c4b699);
      white-space: nowrap; overflow: hidden;
      text-overflow: ellipsis; max-width: 140px;
    }
    .db-bar-val {
      font-size: .74rem; font-weight: 700;
      color: var(--gold, #d4af37);
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }
    .db-bar-track {
      height: 7px; border-radius: 100px;
      background: var(--bg-raised, #201e16);
      overflow: hidden; position: relative;
    }
    .db-bar-fill {
      height: 100%; border-radius: 100px;
      animation: db-bar-grow .7s cubic-bezier(.16,1,.3,1) both;
    }

    /* ── Recent transactions ── */
    .db-tx-list { display: flex; flex-direction: column; gap: 2px; }
    .db-tx {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 10px; border-radius: 10px;
      transition: background .2s; cursor: default;
      animation: db-fadeUp .38s cubic-bezier(.16,1,.3,1) both;
    }
    .db-tx:hover { background: rgba(212,175,55,.04); }
    .db-tx-avatar {
      width: 34px; height: 34px; border-radius: 10px;
      background: linear-gradient(135deg, var(--gold-dk, #8a6c1a), var(--gold, #d4af37));
      display: flex; align-items: center; justify-content: center;
      font-size: .78rem; font-weight: 800;
      color: #1a1100; flex-shrink: 0;
    }
    .db-tx-info { flex: 1; min-width: 0; }
    .db-tx-name {
      font-size: .82rem; font-weight: 600;
      color: var(--t1, #f0e8d8);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .db-tx-date { font-size: .7rem; color: var(--t4, #7c6f59); margin-top: 1px; font-weight: 300; }
    .db-tx-right { text-align: right; flex-shrink: 0; }
    .db-tx-gold { font-size: .82rem; font-weight: 700; color: var(--gold, #d4af37); font-variant-numeric: tabular-nums; }
    .db-tx-badge {
      display: inline-block; margin-top: 2px;
      font-size: .62rem; font-weight: 700; text-transform: uppercase;
      padding: 1px 6px; border-radius: 100px;
    }
    .db-tx-badge--pos { background: rgba(74,222,128,.1);  color: var(--green, #4ade80); }
    .db-tx-badge--neg { background: rgba(248,113,113,.1); color: var(--red,   #f87171); }
    .db-tx-badge--neu { background: rgba(212,175,55,.1);  color: var(--gold,  #d4af37); }

    /* ── Payment mode pie (simple) ── */
    .db-mode-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .db-mode-card {
      background: var(--bg-raised, #201e16);
      border: 1px solid var(--border-xs, rgba(212,175,55,.05));
      border-radius: 13px;
      padding: 14px 13px;
      text-align: center;
      transition: all .3s cubic-bezier(.16,1,.3,1);
      cursor: default;
    }
    .db-mode-card:hover {
      transform: translateY(-3px);
      border-color: var(--border-md, rgba(212,175,55,.18));
    }
    .db-mode-emoji { font-size: 1.4rem; margin-bottom: 7px; display: block; transition: transform .3s; }
    .db-mode-card:hover .db-mode-emoji { transform: scale(1.15); }
    .db-mode-count { font-size: 1.25rem; font-weight: 900; font-variant-numeric: tabular-nums; margin-bottom: 3px; }
    .db-mode-label { font-size: .65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--t4, #7c6f59); }
    .db-mode-pct {
      font-size: .68rem; font-weight: 600; margin-top: 4px;
      padding: 1px 6px; border-radius: 100px;
      background: var(--bg-card, #181610);
      color: var(--t3, #9a8c74);
    }

    /* ── Activity sparkline (mini bar chart) ── */
    .db-spark-wrap { display: flex; align-items: flex-end; gap: 4px; height: 52px; }
    .db-spark-bar {
      flex: 1; border-radius: 4px 4px 0 0;
      min-width: 6px;
      transition: opacity .2s;
      animation: db-bar-grow .6s cubic-bezier(.16,1,.3,1) both;
      transform-origin: bottom;
    }
    .db-spark-bar:hover { opacity: .7; }

    /* ── Summary stats table ── */
    .db-sum-table { width: 100%; border-collapse: collapse; }
    .db-sum-table tr { border-bottom: 1px solid var(--border-xs, rgba(212,175,55,.05)); }
    .db-sum-table tr:last-child { border-bottom: none; }
    .db-sum-table td {
      padding: 10px 6px;
      font-size: .8rem;
      color: var(--t2, #c4b699);
      vertical-align: middle;
    }
    .db-sum-table td:first-child { color: var(--t4, #7c6f59); font-weight: 500; font-size: .75rem; }
    .db-sum-table td:last-child { text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; }

    /* ── Live pulse ── */
    .db-live-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--green, #4ade80);
      animation: db-pulse-dot 2s ease-in-out infinite;
      box-shadow: 0 0 8px rgba(74,222,128,.45);
      display: inline-block;
    }
    .db-live-label {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: .65rem; font-weight: 700; letter-spacing: .8px;
      text-transform: uppercase;
      color: var(--green, #4ade80);
    }

    /* ── Empty state ── */
    .db-empty {
      text-align: center; padding: 36px 20px;
      color: var(--t4, #7c6f59);
    }
    .db-empty-ico { font-size: 2rem; opacity: .2; margin-bottom: 10px; display: block; }
    .db-empty-text { font-size: .82rem; font-weight: 300; }

    /* ── Loader ── */
    .db-loader {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 80px 20px; gap: 18px;
    }
    .db-spinner {
      width: 40px; height: 40px;
      border: 3px solid var(--border-sm, rgba(212,175,55,.10));
      border-top-color: var(--gold, #d4af37);
      border-radius: 50%;
      animation: db-spin .75s linear infinite;
    }
    .db-loader-text {
      font-size: .82rem; font-weight: 300;
      color: var(--t4, #7c6f59);
    }

    /* ── Period selector ── */
    .db-period-tabs {
      display: flex;
      background: var(--bg-raised, #201e16);
      border: 1px solid var(--border-sm, rgba(212,175,55,.10));
      border-radius: 12px;
      padding: 3px;
      gap: 2px;
      flex-wrap: nowrap;
    }
    .db-period-tab {
      padding: 7px 14px;
      border-radius: 9px;
      border: none;
      background: transparent;
      font-family: var(--font, 'Lexend', sans-serif);
      font-size: .74rem;
      font-weight: 600;
      color: var(--t4, #7c6f59);
      cursor: pointer;
      transition: all .2s cubic-bezier(.16,1,.3,1);
      white-space: nowrap;
    }
    .db-period-tab:hover { color: var(--t2, #c4b699); }
    .db-period-tab.active {
      background: linear-gradient(135deg, var(--gold-dk, #8a6c1a), var(--gold, #d4af37));
      color: #0c0b08;
      box-shadow: 0 2px 10px rgba(212,175,55,.3);
    }

    /* ── Period badge on panels ── */
    .db-period-badge {
      font-size: .62rem; font-weight: 700;
      background: rgba(212,175,55,.08);
      color: var(--gold, #d4af37);
      border: 1px solid rgba(212,175,55,.14);
      padding: 2px 8px; border-radius: 100px;
      letter-spacing: .4px;
    }

    /* ── Trend comparison chip ── */
    .db-trend-chip {
      display: inline-flex; align-items: center; gap: 3px;
      font-size: .62rem; font-weight: 700;
      padding: 2px 6px; border-radius: 100px;
      margin-top: 4px;
    }
    .db-trend-chip--pos { background: rgba(74,222,128,.08); color: var(--green, #4ade80); }
    .db-trend-chip--neg { background: rgba(248,113,113,.08); color: var(--red, #f87171); }
    .db-trend-chip--neu { background: rgba(212,175,55,.08); color: var(--gold, #d4af37); }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .db-row-2, .db-row-3 { grid-template-columns: 1fr; }
      .db-kpi-strip { grid-template-columns: 1fr 1fr; }
      .db-page-title { font-size: 1.35rem; }
    }
    @media (max-width: 480px) {
      .db-kpi-strip { grid-template-columns: 1fr 1fr; }
      .db-mode-grid  { grid-template-columns: 1fr 1fr; }
      .db-period-tab { padding: 6px 9px; font-size: .68rem; }
    }
  `;
  document.head.appendChild(el);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtG  = n => Number(n || 0).toFixed(3);
const fmtC  = n => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtK  = n => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateShort = d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

// ─── Period helpers ───────────────────────────────────────────────────────────
const MS_DAY = 86400000;

function getPeriodRange(period) {
  const now = new Date();
  switch (period) {
    case 'daily': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end   = new Date(start.getTime() + MS_DAY);
      return {
        start, end,
        prevStart: new Date(start.getTime() - MS_DAY),
        prevEnd:   start,
        label:      'Today',
        shortLabel: now.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short' }),
        vsLabel:    'vs yesterday',
      };
    }
    case 'weekly': {
      const day   = now.getDay();
      const diff  = day === 0 ? 6 : day - 1; // days since Mon
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      const end   = new Date(start.getTime() + 7 * MS_DAY);
      return {
        start, end,
        prevStart: new Date(start.getTime() - 7 * MS_DAY),
        prevEnd:   start,
        label:      'This Week',
        shortLabel: `${fmtDateShort(start)} – ${fmtDateShort(new Date(end.getTime() - 1))}`,
        vsLabel:    'vs last week',
      };
    }
    case 'monthly': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end   = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      return {
        start, end,
        prevStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        prevEnd:   start,
        label:      now.toLocaleDateString('en-IN', { month: 'long' }),
        shortLabel: now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        vsLabel:    'vs last month',
      };
    }
    default: { // yearly
      const start = new Date(now.getFullYear(), 0, 1);
      const end   = new Date(now.getFullYear() + 1, 0, 1);
      return {
        start, end,
        prevStart: new Date(now.getFullYear() - 1, 0, 1),
        prevEnd:   start,
        label:      String(now.getFullYear()),
        shortLabel: String(now.getFullYear()),
        vsLabel:    'vs last year',
      };
    }
  }
}

function buildActivityBars(calcs, period) {
  const now = new Date();
  switch (period) {
    case 'daily': {
      const bars = Array.from({ length: 6 }, (_, i) => ({
        label: `${String(i * 4).padStart(2, '0')}h`, count: 0, gold: 0,
      }));
      calcs.forEach(c => {
        const slot = Math.floor(new Date(c.created_at).getHours() / 4);
        if (bars[slot]) { bars[slot].count++; bars[slot].gold += parseFloat(c.gold_input) || 0; }
      });
      return { bars, maxCount: Math.max(...bars.map(b => b.count), 1), chartTitle: "Today's Activity (4-hr blocks)" };
    }
    case 'weekly': {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const bars = days.map(d => ({ label: d, count: 0, gold: 0 }));
      calcs.forEach(c => {
        const day = new Date(c.created_at).getDay();
        const idx = day === 0 ? 6 : day - 1;
        bars[idx].count++; bars[idx].gold += parseFloat(c.gold_input) || 0;
      });
      return { bars, maxCount: Math.max(...bars.map(b => b.count), 1), chartTitle: 'Activity by Day of Week' };
    }
    case 'monthly': {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const weeks = [];
      for (let d = 1; d <= daysInMonth; d += 7) {
        const end = Math.min(d + 6, daysInMonth);
        weeks.push({ label: `${d}–${end}`, count: 0, gold: 0, startDay: d, endDay: end });
      }
      calcs.forEach(c => {
        const day = new Date(c.created_at).getDate();
        const w   = weeks.find(wk => day >= wk.startDay && day <= wk.endDay);
        if (w) { w.count++; w.gold += parseFloat(c.gold_input) || 0; }
      });
      return { bars: weeks, maxCount: Math.max(...weeks.map(b => b.count), 1), chartTitle: 'Activity by Week of Month' };
    }
    default: { // yearly
      const bars = Array.from({ length: 12 }, (_, i) => ({
        label: new Date(now.getFullYear(), i, 1).toLocaleDateString('en-IN', { month: 'short' }),
        count: 0, gold: 0, month: i,
      }));
      calcs.forEach(c => {
        const m = new Date(c.created_at).getMonth();
        bars[m].count++; bars[m].gold += parseFloat(c.gold_input) || 0;
      });
      return { bars, maxCount: Math.max(...bars.map(b => b.count), 1), chartTitle: 'Activity by Month' };
    }
  }
}

function calcTrend(curr, prev) {
  if (prev === 0 && curr === 0) return { pct: null, dir: 'neu' };
  if (prev === 0) return { pct: null, dir: 'pos' };
  const pct = ((curr - prev) / Math.abs(prev)) * 100;
  return { pct: Math.abs(pct).toFixed(0), dir: pct > 2 ? 'pos' : pct < -2 ? 'neg' : 'neu' };
}

// Animated counter hook
function useCountUp(target, duration = 900, decimals = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) { setVal(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(parseFloat(start.toFixed(decimals)));
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, decimals]);
  return val;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Animated KPI card
function KpiCard({ label, value, unit = '', icon, iconBg, iconColor, glowColor, trend, trendLabel, trendDir = 'neu', animDelay = 0, decimals = 0 }) {
  const counted = useCountUp(parseFloat(value) || 0, 900, decimals);
  return (
    <div className="db-kpi" style={{ '--kpi-glow': glowColor, animationDelay: `${animDelay}s` }}>
      <div className="db-kpi-corner">{icon}</div>
      <div className="db-kpi-icon-wrap" style={{ background: iconBg }}>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
      </div>
      <div className="db-kpi-label">{label}</div>
      <div className="db-kpi-value" style={{ color: iconColor }}>
        {decimals > 0 ? counted.toFixed(decimals) : Math.round(counted).toLocaleString('en-IN')}
        {unit && <span className="db-kpi-unit">{unit}</span>}
      </div>
      {trendLabel && (
        <div className={`db-kpi-trend db-kpi-trend--${trendDir}`}>
          {trendDir === 'pos' ? '↑' : trendDir === 'neg' ? '↓' : '◈'} {trendLabel}
        </div>
      )}
    </div>
  );
}

// Donut ring
function DonutRing({ segments, size = 160, stroke = 18 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg className="db-ring-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle className="db-ring-track" cx={size/2} cy={size/2} r={r}
        stroke="rgba(212,175,55,0.07)" strokeWidth={stroke} />
      {segments.map((seg, i) => {
        const dash = (seg.pct / 100) * circ;
        const gap  = circ - dash;
        const segOffset = circ - offset;
        offset += dash;
        return (
          <circle key={i} className="db-ring-fill"
            cx={size/2} cy={size/2} r={r}
            stroke={seg.color}
            strokeWidth={stroke - 2}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={segOffset}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: `stroke-dashoffset .8s cubic-bezier(.16,1,.3,1) ${i * .12}s` }}
          />
        );
      })}
    </svg>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────
const PERIODS = [
  { id: 'daily',   label: 'Daily'   },
  { id: 'weekly',  label: 'Weekly'  },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly',  label: 'Yearly'  },
];

export default function Dashboard() {
  useEffect(() => { injectDashboardStyles(); }, []);

  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rawData, setRawData]       = useState(null);
  const [period, setPeriod]         = useState('daily'); //Set Daily / Monthly as per your requirements.
  const lastFetch = useRef(null);

  // ── Single fetch, period switching is instant (client-side filter) ──────────
  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { data: customers } = await supabase
        .from('customers').select('id, name, mobile, created_at')
        .order('created_at', { ascending: false });
      const { data: allCalcs } = await supabase
        .from('gold_calculations').select('*')
        .order('created_at', { ascending: false });
      if (!allCalcs || !customers) return;
      lastFetch.current = new Date();
      setRawData({ customers, allCalcs });
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Period-aware aggregation (no network call on switch) ────────────────────
  const data = useMemo(() => {
    if (!rawData) return null;
    const { customers, allCalcs } = rawData;
    const range = getPeriodRange(period);

    const calcs = allCalcs.filter(c => {
      const d = new Date(c.created_at);
      return d >= range.start && d < range.end;
    });
    const prevCalcs = allCalcs.filter(c => {
      const d = new Date(c.created_at);
      return d >= range.prevStart && d < range.start;
    });

    // Aggregate current period
    let totalGoldIn = 0, totalFine = 0, totalCustFine = 0;
    let totalBalance = 0, totalPaidGold = 0, totalCash = 0, totalFinalBalance = 0;
    const payModes = { gold: 0, cash: 0, both: 0, none: 0 };
    const custSet  = new Set();

    calcs.forEach(c => {
      totalGoldIn       += parseFloat(c.gold_input)     || 0;
      totalFine         += parseFloat(c.fine_gold)      || 0;
      totalCustFine     += parseFloat(c.customer_fine)  || 0;
      totalBalance      += parseFloat(c.balance)        || 0;
      totalPaidGold     += parseFloat(c.paid_gold)      || 0;
      totalCash         += parseFloat(c.cash_payment)   || 0;
      totalFinalBalance += parseFloat(c.final_balance)  || 0;
      payModes[c.payment_mode || 'none']++;
      if (c.customer_id) custSet.add(c.customer_id);
    });

    // Aggregate previous period (for trend arrows)
    let prevGoldIn = 0, prevFine = 0, prevCash = 0;
    prevCalcs.forEach(c => {
      prevGoldIn += parseFloat(c.gold_input)   || 0;
      prevFine   += parseFloat(c.fine_gold)    || 0;
      prevCash   += parseFloat(c.cash_payment) || 0;
    });

    const netBalance = totalBalance - totalPaidGold;

    // Top customers (period-scoped)
    const custMap = {};
    calcs.forEach(c => {
      const id = c.customer_id;
      if (!custMap[id]) custMap[id] = { id, name: c.customer_name, gold: 0, fine: 0, txns: 0, balance: 0 };
      custMap[id].gold    += parseFloat(c.gold_input) || 0;
      custMap[id].fine    += parseFloat(c.fine_gold)  || 0;
      custMap[id].txns    += 1;
      custMap[id].balance += parseFloat(c.balance)    || 0;
    });
    const topCustomers = Object.values(custMap).sort((a, b) => b.gold - a.gold).slice(0, 6);
    const maxGold = topCustomers[0]?.gold || 1;

    const recent = calcs.slice(0, 10);

    const total = calcs.length;
    const donutTotal = total || 1;
    const donutSegs = [
      { label: 'Gold',      color: '#fbbf24', pct: (payModes.gold / donutTotal) * 100, count: payModes.gold },
      { label: 'Cash',      color: '#60a5fa', pct: (payModes.cash / donutTotal) * 100, count: payModes.cash },
      { label: 'Gold+Cash', color: '#c084fc', pct: (payModes.both / donutTotal) * 100, count: payModes.both },
      { label: 'None',      color: '#4b4538', pct: (payModes.none / donutTotal) * 100, count: payModes.none },
    ].filter(s => s.count > 0);

    const { bars: activityBars, maxCount: maxBarCount, chartTitle } = buildActivityBars(calcs, period);

    const trends = {
      goldIn: calcTrend(totalGoldIn, prevGoldIn),
      fine:   calcTrend(totalFine,   prevFine),
      txns:   calcTrend(total,       prevCalcs.length),
      cash:   calcTrend(totalCash,   prevCash),
    };

    return {
      kpis: {
        totalCustomers:    customers.length,
        activeCustomers:   custSet.size,
        totalTransactions: total,
        totalGoldIn, totalFine, totalCustFine,
        totalBalance, totalPaidGold, totalCash, netBalance, totalFinalBalance,
      },
      topCustomers, maxGold, recent,
      activityBars, maxBarCount, chartTitle,
      donutSegs, payModes,
      total, trends, range,
    };
  }, [rawData, period]);

  // ── Renders ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="db-loader">
      <div className="db-spinner" />
      <p className="db-loader-text">Building your dashboard…</p>
    </div>
  );

  if (!data) return (
    <div className="db-empty">
      <span className="db-empty-ico"><BarChart2 size={36} /></span>
      <p className="db-empty-text">No data available yet.</p>
    </div>
  );

  const {
    kpis, topCustomers, maxGold, recent,
    activityBars, maxBarCount, chartTitle,
    donutSegs, payModes, total, trends, range,
  } = data;
  const hasData = kpis.totalTransactions > 0;
  const maxGoldBar = Math.max(...activityBars.map(b => b.gold), 1);

  return (
    <div className="db-wrap">

      {/* ══ Page Header ══ */}
      <div className="db-page-head db-s1">
        <div>
          <h1 className="db-page-title">Dashboard</h1>
          <p className="db-page-sub">
            {lastFetch.current
              ? `Last updated ${lastFetch.current.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · ${range.shortLabel}`
              : 'Live summary of gold transactions'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {/* Period selector */}
          <div className="db-period-tabs" role="group" aria-label="View period">
            {PERIODS.map(p => (
              <button
                key={p.id}
                className={`db-period-tab${period === p.id ? ' active' : ''}`}
                onClick={() => setPeriod(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <span className="db-live-label">
            <span className="db-live-dot" /> Live
          </span>
          <button className={`db-refresh-btn${refreshing ? ' loading' : ''}`} onClick={() => load(true)}>
            <span className="db-refresh-icon"><RefreshCw size={13} /></span>
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ══ KPI Strip ══ */}
      <div className="db-kpi-strip db-s2">
        {/* Active customers in period */}
        <KpiCard
          label="Active Customers"
          value={kpis.activeCustomers}
          icon={<Users size={18} />}
          iconBg="rgba(212,175,55,0.1)"
          iconColor="var(--gold, #d4af37)"
          glowColor="radial-gradient(ellipse at top left, rgba(212,175,55,0.06), transparent)"
          trendLabel={`${kpis.totalCustomers} total registered`}
          trendDir="neu"
          animDelay={0.05}
        />
        <KpiCard
          label="Transactions"
          value={kpis.totalTransactions}
          icon={<ClipboardList size={18} />}
          iconBg="rgba(96,165,250,0.1)"
          iconColor="var(--blue, #60a5fa)"
          glowColor="radial-gradient(ellipse at top left, rgba(96,165,250,0.05), transparent)"
          trendLabel={trends.txns.pct !== null ? `${trends.txns.dir === 'pos' ? '↑' : trends.txns.dir === 'neg' ? '↓' : '◈'} ${trends.txns.pct}% ${range.vsLabel}` : range.vsLabel}
          trendDir={trends.txns.dir}
          animDelay={0.09}
        />
        <KpiCard
          label="Gold In"
          value={kpis.totalGoldIn}
          unit="g"
          icon={<Scale size={18} />}
          iconBg="rgba(212,175,55,0.1)"
          iconColor="var(--gold, #d4af37)"
          glowColor="radial-gradient(ellipse at top left, rgba(212,175,55,0.06), transparent)"
          trendLabel={trends.goldIn.pct !== null ? `${trends.goldIn.dir === 'pos' ? '↑' : trends.goldIn.dir === 'neg' ? '↓' : '◈'} ${trends.goldIn.pct}% ${range.vsLabel}` : range.vsLabel}
          trendDir={trends.goldIn.dir}
          decimals={3}
          animDelay={0.13}
        />
        <KpiCard
          label="Fine Gold"
          value={kpis.totalFine}
          unit="g"
          icon={<Gem size={18} />}
          iconBg="rgba(74,222,128,0.1)"
          iconColor="var(--green, #4ade80)"
          glowColor="radial-gradient(ellipse at top left, rgba(74,222,128,0.05), transparent)"
          trendLabel={trends.fine.pct !== null ? `${trends.fine.dir === 'pos' ? '↑' : trends.fine.dir === 'neg' ? '↓' : '◈'} ${trends.fine.pct}% ${range.vsLabel}` : range.vsLabel}
          trendDir={trends.fine.dir}
          decimals={3}
          animDelay={0.17}
        />
        <KpiCard
          label="Net Balance"
          value={Math.abs(kpis.netBalance)}
          unit="g"
          icon={kpis.netBalance >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          iconBg={kpis.netBalance >= 0 ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)'}
          iconColor={kpis.netBalance >= 0 ? 'var(--green, #4ade80)' : 'var(--red, #f87171)'}
          glowColor={kpis.netBalance >= 0
            ? 'radial-gradient(ellipse at top left, rgba(74,222,128,0.06), transparent)'
            : 'radial-gradient(ellipse at top left, rgba(248,113,113,0.06), transparent)'}
          trendLabel={kpis.netBalance >= 0 ? 'mfr owes customer' : 'cust owes mfr'}
          trendDir={kpis.netBalance >= 0 ? 'pos' : 'neg'}
          decimals={3}
          animDelay={0.21}
        />
        <KpiCard
          label="Cash Collected"
          value={kpis.totalCash}
          unit="₹"
          icon={<Wallet size={18} />}
          iconBg="rgba(251,191,36,0.1)"
          iconColor="var(--orange, #fbbf24)"
          glowColor="radial-gradient(ellipse at top left, rgba(251,191,36,0.05), transparent)"
          trendLabel={trends.cash.pct !== null ? `${trends.cash.dir === 'pos' ? '↑' : trends.cash.dir === 'neg' ? '↓' : '◈'} ${trends.cash.pct}% ${range.vsLabel}` : range.vsLabel}
          trendDir={trends.cash.dir}
          decimals={0}
          animDelay={0.25}
        />
      </div>

      {/* ══ Row: Activity chart + Summary table ══ */}
      <div className="db-row-3 db-s3">

        {/* Period-adaptive activity chart */}
        <div className="db-panel">
          <div className="db-panel-head">
            <div className="db-panel-title-wrap">
              <div className="db-panel-ico" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.12)' }}><CalendarDays size={18} /></div>
              <div>
                <div className="db-panel-title">Transaction Activity</div>
                <div className="db-panel-sub">{chartTitle}</div>
              </div>
            </div>
            <span className="db-period-badge">{range.label}</span>
          </div>

          {/* Sparkline bars */}
          {activityBars.every(b => b.count === 0) ? (
            <div className="db-empty">
              <span className="db-empty-ico"><BarChart2 size={36} /></span>
              <p className="db-empty-text">No transactions in this period</p>
            </div>
          ) : (
            <>
              <div className="db-spark-wrap" style={{ height: '72px', marginBottom: '8px' }}>
                {activityBars.map((b, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div
                      className="db-spark-bar"
                      title={`${b.label}: ${b.count} txn${b.count !== 1 ? 's' : ''} · ${fmtG(b.gold)}g`}
                      style={{
                        height: `${Math.max((b.count / maxBarCount) * 56, b.count > 0 ? 6 : 3)}px`,
                        background: b.count > 0
                          ? 'linear-gradient(180deg, var(--gold, #d4af37), var(--gold-dk, #8a6c1a))'
                          : 'var(--bg-raised, #201e16)',
                        opacity: b.count > 0 ? 1 : 0.35,
                        animationDelay: `${i * 0.05}s`,
                        borderRadius: '4px 4px 0 0',
                      }}
                    />
                  </div>
                ))}
              </div>
              {/* Axis labels */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {activityBars.map((b, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '.58rem', color: 'var(--t4, #7c6f59)', fontWeight: 600, letterSpacing: '.3px', lineHeight: 1.2 }}>
                    {b.label}
                  </div>
                ))}
              </div>

              {/* Gold weight bars */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-xs, rgba(212,175,55,.05))' }}>
                <div style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.2px', color: 'var(--t4, #7c6f59)', marginBottom: '10px' }}>
                  Gold Processed (g) — {range.label}
                </div>
                <div className="db-bars">
                  {activityBars.filter(b => b.gold > 0).map((b, i) => (
                    <div key={i} className="db-bar-row">
                      <div className="db-bar-meta">
                        <span className="db-bar-name">{b.label}</span>
                        <span className="db-bar-val">{fmtG(b.gold)}g</span>
                      </div>
                      <div className="db-bar-track">
                        <div
                          className="db-bar-fill"
                          style={{
                            width: `${(b.gold / maxGoldBar) * 100}%`,
                            background: 'linear-gradient(90deg, var(--gold-dk, #8a6c1a), var(--gold, #d4af37))',
                            animationDelay: `${i * 0.08}s`,
                            '--bar-w': `${(b.gold / maxGoldBar) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Summary stats table */}
        <div className="db-panel">
          <div className="db-panel-head">
            <div className="db-panel-title-wrap">
              <div className="db-panel-ico" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.14)' }}><BarChart2 size={18} /></div>
              <div>
                <div className="db-panel-title">Gold Summary</div>
                <div className="db-panel-sub">{range.shortLabel}</div>
              </div>
            </div>
          </div>
          <table className="db-sum-table">
            <tbody>
              {[
                { label: 'Total Gold In',    val: `${fmtG(kpis.totalGoldIn)} g`,   color: 'var(--gold, #d4af37)' },
                { label: 'Total Fine Gold',  val: `${fmtG(kpis.totalFine)} g`,     color: 'var(--green, #4ade80)' },
                { label: 'Customer Fine',    val: `${fmtG(kpis.totalCustFine)} g`, color: 'var(--t2, #c4b699)' },
                { label: 'Gross Balance',    val: `${fmtG(kpis.totalBalance)} g`,  color: 'var(--gold, #d4af37)' },
                { label: 'Paid Gold',        val: `${fmtG(kpis.totalPaidGold)} g`, color: 'var(--orange, #fbbf24)' },
                { label: 'Net Gold Balance', val: `${fmtG(kpis.netBalance)} g`,    color: kpis.netBalance >= 0 ? 'var(--green, #4ade80)' : 'var(--red, #f87171)' },
                { label: 'Cash Collected',   val: `₹ ${fmtC(kpis.totalCash)}`,     color: 'var(--blue, #60a5fa)' },
              ].map(({ label, val, color }) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td style={{ color }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ Row: Top customers + Payment mode breakdown ══ */}
      <div className="db-row-2 db-s4">

        {/* Top customers — period scoped */}
        <div className="db-panel">
          <div className="db-panel-head">
            <div className="db-panel-title-wrap">
              <div className="db-panel-ico" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.12)' }}><Trophy size={18} /></div>
              <div>
                <div className="db-panel-title">Top Customers</div>
                <div className="db-panel-sub">By gold processed · {range.label}</div>
              </div>
            </div>
            {topCustomers.length > 0 && <span className="db-panel-badge">Top {topCustomers.length}</span>}
          </div>
          {topCustomers.length === 0 ? (
            <div className="db-empty">
              <span className="db-empty-ico"><Users size={36} /></span>
              <p className="db-empty-text">No activity in this period</p>
            </div>
          ) : (
            <div className="db-bars">
              {topCustomers.map((c, i) => (
                <div key={c.id} className="db-bar-row" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="db-bar-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '7px', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--gold-dk, #8a6c1a), var(--gold, #d4af37))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.65rem', fontWeight: 800, color: '#1a1100',
                      }}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="db-bar-name">{c.name}</span>
                      <span style={{ fontSize: '.65rem', color: 'var(--t4, #7c6f59)', flexShrink: 0 }}>
                        {c.txns} txn{c.txns !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="db-bar-val">{fmtG(c.gold)}g</span>
                  </div>
                  <div className="db-bar-track">
                    <div
                      className="db-bar-fill"
                      style={{
                        width: `${(c.gold / maxGold) * 100}%`,
                        background: i === 0
                          ? 'linear-gradient(90deg, var(--gold-dk, #8a6c1a), var(--gold-br, #debb50))'
                          : i === 1
                          ? 'linear-gradient(90deg, #7a5c0a, var(--gold, #d4af37))'
                          : 'linear-gradient(90deg, rgba(212,175,55,0.3), rgba(212,175,55,0.6))',
                        animationDelay: `${i * 0.07}s`,
                        '--bar-w': `${(c.gold / maxGold) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment mode breakdown — period scoped */}
        <div className="db-panel">
          <div className="db-panel-head">
            <div className="db-panel-title-wrap">
              <div className="db-panel-ico" style={{ background: 'rgba(192,132,252,0.08)', border: '1px solid rgba(192,132,252,0.15)' }}><CreditCard size={18} /></div>
              <div>
                <div className="db-panel-title">Payment Modes</div>
                <div className="db-panel-sub">How customers settled · {range.label}</div>
              </div>
            </div>
          </div>
          {hasData ? (
            <>
              <div className="db-ring-wrap" style={{ marginBottom: '18px' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <DonutRing segments={donutSegs} size={150} stroke={20} />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold, #d4af37)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{total}</div>
                    <div style={{ fontSize: '.6rem', fontWeight: 600, color: 'var(--t4, #7c6f59)', textTransform: 'uppercase', letterSpacing: '1px' }}>txns</div>
                  </div>
                </div>
                <div className="db-ring-legend">
                  {[
                    { label: 'Gold',      color: '#fbbf24', count: payModes.gold },
                    { label: 'Cash',      color: '#60a5fa', count: payModes.cash },
                    { label: 'Gold+Cash', color: '#c084fc', count: payModes.both },
                    { label: 'None',      color: '#4b4538', count: payModes.none },
                  ].filter(x => x.count > 0).map(x => (
                    <div key={x.label} className="db-ring-legend-item">
                      <span className="db-ring-dot" style={{ background: x.color }} />
                      <span>{x.label} ({x.count})</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="db-mode-grid">
                {[
                  { key: 'gold', icon: <Coins size={18} />, label: 'Gold', color: '#fbbf24' },
                  { key: 'cash', icon: <Banknote size={18} />, label: 'Cash', color: '#60a5fa' },
                  { key: 'both', icon: <Handshake size={18} />, label: 'Both', color: '#c084fc' },
                  { key: 'none', icon: <Circle size={18} />, label: 'None', color: '#6b6358' },
                ].map(({ key, icon, label, color }) => (
                  <div className="db-mode-card" key={key}>
                    <span className="db-mode-emoji">{icon}</span>
                    <div className="db-mode-count" style={{ color }}>{payModes[key]}</div>
                    <div className="db-mode-label">{label}</div>
                    <div className="db-mode-pct">{total > 0 ? ((payModes[key] / total) * 100).toFixed(0) : 0}%</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="db-empty">
              <span className="db-empty-ico"><CreditCard size={36} /></span>
              <p className="db-empty-text">No transactions in this period</p>
            </div>
          )}
        </div>
      </div>

      {/* ══ Recent Transactions (period-scoped) ══ */}
      <div className="db-panel db-s5">
        <div className="db-panel-head">
          <div className="db-panel-title-wrap">
            <div className="db-panel-ico" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.14)' }}><Clock size={18} /></div>
            <div>
              <div className="db-panel-title">Recent Transactions</div>
              <div className="db-panel-sub">Latest {Math.min(recent.length, 10)} records · {range.label}</div>
            </div>
          </div>
          <span className="db-period-badge">{range.label}</span>
        </div>

        {recent.length === 0 ? (
          <div className="db-empty">
            <span className="db-empty-ico"><ClipboardList size={36} /></span>
            <p className="db-empty-text">No transactions in this period</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div className="db-tx-list" style={{ minWidth: '520px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 80px 80px 80px 80px 70px',
              gap: '8px', padding: '6px 10px',
              fontSize: '.62rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '1px',
              color: 'var(--t5, #5f5444)',
              borderBottom: '1px solid var(--border-xs, rgba(212,175,55,.05))',
              marginBottom: '4px',
            }}>
              <span>Customer</span>
              <span style={{ textAlign: 'right' }}>Gold In</span>
              <span style={{ textAlign: 'right' }}>Fine Gold</span>
              <span style={{ textAlign: 'right' }}>Balance</span>
              <span style={{ textAlign: 'right' }}>Paid Gold</span>
              <span style={{ textAlign: 'right' }}>Mode</span>
            </div>
            {recent.map((tx, i) => {
              const bal    = parseFloat(tx.balance) || 0;
              const balDir = bal > 0 ? 'pos' : bal < 0 ? 'neg' : 'neu';
              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 80px 80px 80px 80px 70px',
                    gap: '8px', padding: '9px 10px',
                    borderRadius: '10px', transition: 'background .18s',
                    cursor: 'default',
                    animation: `db-fadeUp .36s cubic-bezier(.16,1,.3,1) ${i * .04}s both`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                    <div className="db-tx-avatar" style={{ width: '30px', height: '30px', borderRadius: '9px', fontSize: '.72rem' }}>
                      {(tx.customer_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="db-tx-name" style={{ fontSize: '.8rem' }}>{tx.customer_name || '—'}</div>
                      <div className="db-tx-date">{fmtDateShort(tx.created_at)}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '.8rem', fontWeight: 600, color: 'var(--gold, #d4af37)', fontVariantNumeric: 'tabular-nums', alignSelf: 'center' }}>
                    {fmtG(tx.gold_input)}g
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '.8rem', fontWeight: 600, color: 'var(--green, #4ade80)', fontVariantNumeric: 'tabular-nums', alignSelf: 'center' }}>
                    {fmtG(tx.fine_gold)}g
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '.8rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', alignSelf: 'center',
                    color: balDir === 'pos' ? 'var(--green, #4ade80)' : balDir === 'neg' ? 'var(--red, #f87171)' : 'var(--t4, #7c6f59)' }}>
                    {fmtG(tx.balance)}g
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '.8rem', fontWeight: 600, color: 'var(--orange, #fbbf24)', fontVariantNumeric: 'tabular-nums', alignSelf: 'center' }}>
                    {fmtG(tx.paid_gold || 0)}g
                  </div>
                  <div style={{ textAlign: 'right', alignSelf: 'center' }}>
                    <span style={{
                      fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase',
                      padding: '2px 7px', borderRadius: '100px', letterSpacing: '.3px',
                      background: tx.payment_mode === 'gold' ? 'rgba(251,191,36,.1)' : tx.payment_mode === 'cash' ? 'rgba(96,165,250,.1)' : tx.payment_mode === 'both' ? 'rgba(192,132,252,.1)' : 'rgba(255,255,255,.03)',
                      color: tx.payment_mode === 'gold' ? 'var(--orange, #fbbf24)' : tx.payment_mode === 'cash' ? 'var(--blue, #60a5fa)' : tx.payment_mode === 'both' ? '#c084fc' : 'var(--t5, #5f5444)',
                    }}>
                      {tx.payment_mode || '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        )}
      </div>

    </div>
  );
}
