import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient.js';

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const injectAuthStyles = () => {
  if (document.getElementById('auth-styles')) return;
  const el = document.createElement('style');
  el.id = 'auth-styles';
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,500;1,600&display=swap');

    /* ── Reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Keyframes ── */
    @keyframes au-fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes au-scaleIn  { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
    @keyframes au-shimmer  { 0%{background-position:-300% center} 100%{background-position:300% center} }
    @keyframes au-spin     { to{transform:rotate(360deg)} }
    @keyframes au-float    { 0%,100%{transform:translateY(0) rotate(0deg)} 40%{transform:translateY(-12px) rotate(1.5deg)} 70%{transform:translateY(6px) rotate(-.8deg)} }
    @keyframes au-glow-pulse { 0%,100%{box-shadow:0 8px 40px rgba(180,145,20,.18),inset 0 1px 0 rgba(255,255,255,.35)} 50%{box-shadow:0 14px 56px rgba(180,145,20,.32),inset 0 1px 0 rgba(255,255,255,.45)} }
    @keyframes au-orb-a    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(32px,-22px) scale(1.1)} }
    @keyframes au-orb-b    { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-22px,30px) scale(1.07)} }
    @keyframes au-orb-c    { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.14)} }
    @keyframes au-shake    { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-7px)} 40%,80%{transform:translateX(7px)} }
    @keyframes au-ripple   { 0%{transform:scale(0);opacity:.55} 100%{transform:scale(2.8);opacity:0} }
    @keyframes au-dot-pulse{ 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.65)} }
    @keyframes au-check    { from{stroke-dashoffset:36} to{stroke-dashoffset:0} }
    @keyframes au-grid-pan { 0%{background-position:0 0} 100%{background-position:60px 60px} }
    @keyframes au-border-flow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes au-pulse-ring {
      0% { transform: scale(1); opacity: .3; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    .au-s1{animation:au-fadeUp .55s cubic-bezier(.16,1,.3,1) .00s both}
    .au-s2{animation:au-fadeUp .55s cubic-bezier(.16,1,.3,1) .08s both}
    .au-s3{animation:au-fadeUp .55s cubic-bezier(.16,1,.3,1) .15s both}
    .au-s4{animation:au-fadeUp .55s cubic-bezier(.16,1,.3,1) .22s both}
    .au-s5{animation:au-fadeUp .55s cubic-bezier(.16,1,.3,1) .29s both}
    .au-s6{animation:au-fadeUp .55s cubic-bezier(.16,1,.3,1) .36s both}
    .au-s7{animation:au-fadeUp .55s cubic-bezier(.16,1,.3,1) .42s both}

    /* ── Shell: side-by-side split ── */
    .au-shell {
      min-height: 100vh;
      display: flex;
      font-family: 'Lexend', sans-serif;
      background: #ffffff;
      overflow: hidden;
      position: relative;
    }

    /* ── LEFT: decorative brand panel ── */
    .au-deco {
      flex: 1.15;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 48px;
      overflow: hidden;
      background: linear-gradient(165deg, #fefcf7 0%, #fdf6e3 30%, #f9edc7 60%, #faf3e0 100%);
      border-right: 1px solid rgba(180,145,20,.12);
    }
    @media(max-width:900px){ .au-deco { display: none; } }

    /* Animated grid texture */
    .au-deco::before {
      content: '';
      position: absolute; inset: 0; z-index: 0;
      background-image:
        linear-gradient(rgba(180,145,20,.045) 1px, transparent 1px),
        linear-gradient(90deg, rgba(180,145,20,.045) 1px, transparent 1px);
      background-size: 60px 60px;
      animation: au-grid-pan 10s linear infinite;
    }
    .au-deco::after {
      content: '';
      position: absolute; inset: 0; z-index: 0;
      background: radial-gradient(ellipse at 30% 20%, rgba(212,175,55,.06) 0%, transparent 60%),
                  radial-gradient(ellipse at 70% 80%, rgba(180,145,20,.05) 0%, transparent 55%);
    }

    .au-deco-orb {
      position: absolute; border-radius: 50%; pointer-events: none;
    }
    .au-deco-orb-a { width:420px;height:420px;top:-100px;right:-100px; background:radial-gradient(circle,rgba(212,175,55,.1) 0%,transparent 65%); animation:au-orb-a 11s ease-in-out infinite; }
    .au-deco-orb-b { width:340px;height:340px;bottom:-80px;left:-80px; background:radial-gradient(circle,rgba(180,145,20,.08) 0%,transparent 65%); animation:au-orb-b 14s ease-in-out infinite; }
    .au-deco-orb-c { width:240px;height:240px;top:50%;left:50%; background:radial-gradient(circle,rgba(212,175,55,.05) 0%,transparent 65%); animation:au-orb-c 18s ease-in-out infinite; }

    /* Geometric SVG overlay */
    .au-deco-geo {
      position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden;
    }
    .au-deco-geo svg { width: 100%; height: 100%; opacity: .06; }

    .au-deco-body {
      position: relative; z-index: 2;
      max-width: 400px; text-align: center;
    }
    .au-emblem {
      width: 96px; height: 96px; border-radius: 30px; margin: 0 auto 32px;
      background: linear-gradient(135deg, #b8941a, #d4af37, #f0dea0, #d4af37, #9a7b15);
      display: flex; align-items: center; justify-content: center;
      font-size: 2.6rem; color: #fff;
      animation: au-float 6.5s ease-in-out infinite, au-glow-pulse 3.5s ease-in-out infinite;
      position: relative;
      box-shadow: 0 8px 40px rgba(180,145,20,.22);
    }
    .au-emblem::after {
      content: '';
      position: absolute; inset: -5px; border-radius: 34px;
      background: conic-gradient(from 0deg, rgba(212,175,55,0), rgba(212,175,55,.35), rgba(212,175,55,0), rgba(212,175,55,.25), rgba(212,175,55,0));
      animation: au-spin 7s linear infinite;
      z-index: -1;
    }

    .au-deco-headline {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.8rem; font-weight: 600; font-style: italic;
      line-height: 1.18; color: #3a2e15; margin-bottom: 14px;
      letter-spacing: -.015em;
    }
    .au-deco-headline em {
      font-style: normal;
      background: linear-gradient(120deg, #b8941a 0%, #d4af37 30%, #f0dea0 55%, #d4af37 80%, #9a7b15 100%);
      background-size: 250% auto;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      animation: au-shimmer 5s linear infinite;
    }
    .au-deco-desc {
      font-size: .84rem; font-weight: 300; color: #8a7a5a; line-height: 1.8;
      margin-bottom: 44px;
    }

    .au-features { display: flex; flex-direction: column; gap: 10px; text-align: left; }
    .au-feat {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 16px;
      background: rgba(255,255,255,.65);
      border: 1px solid rgba(180,145,20,.1);
      border-radius: 14px;
      transition: all .3s cubic-bezier(.16,1,.3,1);
      backdrop-filter: blur(6px);
    }
    .au-feat:hover {
      border-color: rgba(180,145,20,.25);
      background: rgba(255,255,255,.85);
      transform: translateX(5px);
      box-shadow: 0 4px 20px rgba(180,145,20,.08);
    }
    .au-feat-ico {
      width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
      background: linear-gradient(135deg, rgba(212,175,55,.1), rgba(212,175,55,.05));
      border: 1px solid rgba(180,145,20,.15);
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
      transition: transform .3s;
    }
    .au-feat:hover .au-feat-ico { transform: scale(1.1) rotate(-3deg); }
    .au-feat-text strong { display:block; font-size:.82rem; font-weight:700; color:#4a3e25; margin-bottom:2px; }
    .au-feat-text span { font-size:.74rem; font-weight:300; color:#8a7a5a; line-height:1.45; }

    .au-deco-wm {
      position: absolute; bottom: 24px; left: 0; right: 0; z-index: 2;
      text-align: center; font-size: .62rem; color: #c4b48a;
      letter-spacing: 1.5px; text-transform: uppercase;
    }

    /* ── RIGHT: form panel ── */
    .au-form-panel {
      width: 520px; flex-shrink: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 52px 48px;
      background: #ffffff;
      position: relative;
      overflow-y: auto;
    }
    @media(max-width:900px) {
      .au-form-panel {
        width: 100%;
        padding: 32px 20px;
        min-height: 100vh;
      }
    }
    @media(max-width:420px) {
      .au-form-panel {
        padding: 24px 16px;
      }
    }

    /* left edge gold accent line */
    .au-form-panel::before {
      content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 3px;
      background: linear-gradient(180deg, transparent 0%, rgba(212,175,55,.4) 30%, rgba(212,175,55,.5) 50%, rgba(212,175,55,.4) 70%, transparent 100%);
    }
    @media(max-width:900px) {
      .au-form-panel::before {
        top: 0; left: 0; right: 0; bottom: auto; width: auto; height: 3px;
        background: linear-gradient(90deg, transparent 0%, rgba(212,175,55,.4) 30%, rgba(212,175,55,.5) 50%, rgba(212,175,55,.4) 70%, transparent 100%);
      }
    }

    .au-card { width: 100%; max-width: 420px; }

    /* ── Brand strip ── */
    .au-brand { display:flex; align-items:center; gap:14px; margin-bottom:36px; }
    .au-brand-ico {
      width:48px; height:48px; border-radius:14px;
      background: linear-gradient(135deg, #b8941a, #d4af37, #f0dea0);
      display:flex; align-items:center; justify-content:center; font-size:1.3rem;
      box-shadow: 0 4px 20px rgba(180,145,20,.22), inset 0 1px 0 rgba(255,255,255,.3);
      flex-shrink: 0; color: #fff;
    }
    .au-brand-name {
      font-size: 1.1rem; font-weight: 900; letter-spacing: -.025em;
      background: linear-gradient(120deg, #9a7b15, #d4af37, #b8941a);
      background-size: 200% auto;
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
      animation: au-shimmer 5s linear infinite;
    }
    .au-brand-sub { font-size:.68rem; font-weight:400; color:#b0a080; margin-top:2px; letter-spacing:.3px; }

    /* ── Tab strip ── */
    .au-tabs {
      display:flex; gap:0;
      background: #f8f6f0;
      border: 1px solid rgba(180,145,20,.1);
      border-radius: 14px; padding: 4px;
      margin-bottom: 28px;
    }
    .au-tab {
      flex:1; padding:11px 18px;
      background:transparent; border:none; border-radius:11px;
      font-family:'Lexend',sans-serif; font-size:.84rem; font-weight:500;
      color:#a09070; cursor:pointer;
      transition:all .3s cubic-bezier(.16,1,.3,1);
    }
    .au-tab:hover:not(.on) { color:#7a6530; background: rgba(180,145,20,.04); }
    .au-tab.on {
      background: #ffffff;
      border: 1px solid rgba(180,145,20,.18);
      color:#9a7b15; font-weight:700;
      box-shadow: 0 2px 12px rgba(180,145,20,.08);
    }

    /* ── Heading ── */
    .au-heading { margin-bottom:26px; }
    .au-heading-title {
      font-size:1.65rem; font-weight:900; letter-spacing:-.035em;
      color:#2a2215; line-height:1.15;
    }
    .au-heading-sub {
      font-size:.8rem; font-weight:300; color:#9a8a68; margin-top:6px; line-height:1.6;
    }

    /* ── Alert banners ── */
    .au-alert {
      padding:12px 15px; border-radius:12px;
      font-size:.8rem; font-weight:400; line-height:1.5;
      margin-bottom:18px;
      display:flex; align-items:flex-start; gap:10px;
      animation: au-fadeUp .3s ease;
    }
    .au-alert-err  { background:#fef2f2; border:1px solid #fecaca; color:#dc2626; }
    .au-alert-ok   { background:#f0fdf4; border:1px solid #bbf7d0; color:#16a34a; }
    .au-alert-info { background:#fefce8; border:1px solid #fde68a; color:#a16207; }
    .au-alert-ico  { font-size:.95rem; flex-shrink:0; margin-top:1px; }

    /* ── Field ── */
    .au-field { margin-bottom:16px; }
    .au-label {
      display:flex; align-items:center; justify-content:space-between;
      font-size:.68rem; font-weight:700;
      text-transform:uppercase; letter-spacing:1.3px;
      color:#8a7a5a; margin-bottom:8px;
    }
    .au-label-link {
      font-size:.72rem; font-weight:500; color:#b8941a;
      text-transform:none; letter-spacing:0; cursor:pointer;
      transition:color .2s; border:none; background:none;
      font-family:inherit;
    }
    .au-label-link:hover { color:#d4af37; }

    .au-inp-wrap {
      position:relative;
    }
    .au-inp-wrap.shake { animation: au-shake .4s ease; }
    .au-inp-ico {
      position:absolute; left:14px; top:50%; transform:translateY(-50%);
      font-size:.82rem; opacity:.35; pointer-events:none; z-index:1;
      transition:opacity .2s;
    }
    .au-inp-wrap:focus-within .au-inp-ico { opacity:.7; }
    .au-eye {
      position:absolute; right:13px; top:50%; transform:translateY(-50%);
      background:none; border:none; cursor:pointer; padding:4px;
      color:#a09070; font-size:.9rem; z-index:1;
      transition:color .2s; line-height:1;
    }
    .au-eye:hover { color:#d4af37; }

    .au-inp {
      width:100%;
      background:#fafaf7;
      border:1.5px solid #e8e2d0;
      border-radius:12px;
      padding:13px 15px 13px 42px;
      font-family:'Lexend',sans-serif;
      font-size:.92rem; font-weight:400;
      color:#2a2215; outline:none;
      transition:border-color .22s,box-shadow .22s,background .22s;
      -webkit-appearance:none;
    }
    .au-inp::placeholder { color:#c4b8a0; }
    .au-inp:hover:not(:focus):not(:disabled) { border-color:#d4c8a8; }
    .au-inp:focus {
      border-color:#d4af37;
      box-shadow:0 0 0 3.5px rgba(212,175,55,.1);
      background:#ffffff;
    }
    .au-inp:disabled { opacity:.45; cursor:not-allowed; }
    .au-inp.err { border-color:#f87171 !important; }
    .au-inp.err:focus { box-shadow:0 0 0 3.5px rgba(248,113,113,.1) !important; }
    .au-inp.no-ico { padding-left:15px; }

    .au-hint { font-size:.68rem; font-weight:300; color:#a09070; margin-top:6px; padding-left:2px; line-height:1.45; }
    .au-hint.err { color:#dc2626; font-weight:400; }

    /* ── Password strength ── */
    .au-pw-bars { display:flex; gap:4px; margin-top:8px; }
    .au-pw-bar  { flex:1; height:3.5px; border-radius:2px; background:#f0ece0; transition:background .35s; }
    .au-pw-bar.lv1 { background:#ef4444; }
    .au-pw-bar.lv2 { background:#f59e0b; }
    .au-pw-bar.lv3 { background:#22c55e; }
    .au-pw-bar.lv4 { background:#16a34a; }
    .au-pw-label { font-size:.64rem; text-align:right; margin-top:4px; font-weight:500; }

    /* ── Checkbox ── */
    .au-check { display:flex; align-items:flex-start; gap:10px; margin-bottom:16px; cursor:pointer; }
    .au-check-box {
      width:20px; height:20px; border-radius:6px; margin-top:1px;
      border:1.5px solid #d4c8a8; background:#fafaf7;
      display:flex; align-items:center; justify-content:center;
      flex-shrink:0; transition:all .2s; cursor:pointer;
    }
    .au-check-box.on { background:linear-gradient(135deg,#d4af37,#b8941a); border-color:#b8941a; }
    .au-check-mark  { font-size:.65rem; color:#ffffff; line-height:1; }
    .au-check-text  { font-size:.77rem; font-weight:300; color:#7a6a48; line-height:1.5; }
    .au-check-text a { color:#b8941a; text-decoration:underline; cursor:pointer; }
    .au-check-text a:hover { color:#d4af37; }

    /* ── Submit button ── */
    .au-btn {
      width:100%; margin-top:10px;
      background: linear-gradient(135deg, #9a7b15, #b8941a, #d4af37, #f0dea0, #d4af37, #b8941a);
      background-size: 300% auto;
      border:none; border-radius:14px;
      padding:15px 24px;
      font-family:'Lexend',sans-serif;
      font-size:.95rem; font-weight:800; color:#ffffff;
      cursor:pointer;
      position:relative; overflow:hidden;
      transition:all .32s cubic-bezier(.16,1,.3,1);
      box-shadow: 0 4px 24px rgba(180,145,20,.2), 0 1px 3px rgba(180,145,20,.1);
      letter-spacing:.3px;
      text-shadow: 0 1px 2px rgba(0,0,0,.15);
    }
    .au-btn::before {
      content:''; position:absolute; inset:0;
      background:linear-gradient(135deg,rgba(255,255,255,.15),transparent 60%);
      opacity:0; transition:opacity .3s;
    }
    .au-btn:hover:not(:disabled) {
      background-position:right center;
      transform:translateY(-2px);
      box-shadow: 0 8px 36px rgba(180,145,20,.3), 0 2px 8px rgba(180,145,20,.15);
    }
    .au-btn:hover:not(:disabled)::before { opacity:1; }
    .au-btn:active:not(:disabled) { transform:translateY(0); }
    .au-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; }
    .au-btn-ripple {
      position:absolute; border-radius:50%;
      background:rgba(255,255,255,.3);
      width:12px; height:12px; margin:-6px;
      animation:au-ripple .65s ease-out forwards;
      pointer-events:none;
    }
    .au-spinner {
      display:inline-block; width:16px; height:16px;
      border:2px solid rgba(255,255,255,.35); border-top-color:#ffffff;
      border-radius:50%; animation:au-spin .6s linear infinite;
      vertical-align:middle; margin-right:8px;
    }

    /* ── Divider ── */
    .au-divider { display:flex; align-items:center; gap:12px; margin:20px 0; }
    .au-divider-line { flex:1; height:1px; background:#e8e2d0; }
    .au-divider-text { font-size:.66rem; font-weight:500; color:#b0a080; text-transform:uppercase; letter-spacing:.8px; }

    /* ── Footer switch ── */
    .au-switch { text-align:center; margin-top:20px; font-size:.8rem; font-weight:300; color:#8a7a5a; }
    .au-switch-link {
      color:#b8941a; font-weight:600; cursor:pointer; margin-left:5px;
      transition:color .2s; text-decoration: none;
    }
    .au-switch-link:hover { color:#d4af37; }

    /* ── Back button ── */
    .au-back {
      display:inline-flex; align-items:center; gap:7px;
      font-size:.78rem; font-weight:500; color:#a09070;
      cursor:pointer; margin-bottom:24px; padding:2px 0;
      background:none; border:none; font-family:inherit;
      transition:color .2s;
    }
    .au-back:hover { color:#b8941a; }
    .au-back-arrow { transition:transform .25s; display:inline-block; }
    .au-back:hover .au-back-arrow { transform:translateX(-4px); }

    /* ── Success screen ── */
    .au-success {
      text-align:center; padding:28px 16px;
      animation:au-scaleIn .45s cubic-bezier(.16,1,.3,1);
    }
    .au-success-ring {
      width:80px; height:80px; border-radius:50%; margin:0 auto 24px;
      background: #f0fdf4;
      border:2px solid #86efac;
      display:flex; align-items:center; justify-content:center;
      position: relative;
    }
    .au-success-ring::after {
      content: '';
      position: absolute; inset: -8px; border-radius: 50%;
      border: 1.5px solid rgba(34,197,94,.15);
      animation: au-pulse-ring 2s ease-out infinite;
    }
    .au-success-ring svg { overflow:visible; }
    .au-success-ring .ck { stroke-dasharray:36; stroke-dashoffset:36; animation:au-check .6s .2s cubic-bezier(.16,1,.3,1) forwards; }
    .au-success-title { font-size:1.35rem; font-weight:900; color:#2a2215; margin-bottom:10px; letter-spacing:-.025em; }
    .au-success-sub   { font-size:.82rem; font-weight:300; color:#8a7a5a; line-height:1.7; margin-bottom:24px; }
    .au-success-em    { color:#b8941a; font-weight:600; }

    /* ── Bottom legal ── */
    .au-legal {
      position:absolute; bottom:18px; left:0; right:0;
      text-align:center; font-size:.62rem; color:#c4b8a0; letter-spacing:.5px;
    }
    @media(max-width:900px) {
      .au-legal {
        position:relative; bottom:auto;
        margin-top:32px; padding-bottom:16px;
      }
    }

    /* ── Mobile brand header (shows on mobile only) ── */
    .au-mobile-header {
      display: none;
      width: 100%;
      padding: 28px 20px 20px;
      text-align: center;
      background: linear-gradient(180deg, #fdf6e3 0%, #ffffff 100%);
      border-bottom: 1px solid rgba(180,145,20,.1);
    }
    @media(max-width:900px) {
      .au-mobile-header { display: block; }
    }
    .au-mobile-emblem {
      width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 12px;
      background: linear-gradient(135deg, #b8941a, #d4af37, #f0dea0);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; color: #fff;
      box-shadow: 0 4px 18px rgba(180,145,20,.2);
    }
    .au-mobile-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.4rem; font-weight: 700; font-style: italic;
      color: #3a2e15;
    }
    .au-mobile-title em {
      font-style: normal;
      background: linear-gradient(120deg, #b8941a, #d4af37, #f0dea0);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    /* ── Responsive tweaks ── */
    @media(max-width:420px) {
      .au-heading-title { font-size: 1.4rem; }
      .au-tabs { border-radius: 12px; }
      .au-tab { padding: 10px 14px; font-size: .8rem; }
      .au-btn { padding: 14px 20px; font-size: .9rem; border-radius: 12px; }
      .au-inp { padding: 12px 14px 12px 38px; font-size: .88rem; }
    }
  `;
  document.head.appendChild(el);
};

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const pwScore = pw => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(Math.ceil(s * 4 / 5), 4);
};
const PW_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const PW_COLS = { 1: '#ef4444', 2: '#f59e0b', 3: '#22c55e', 4: '#16a34a' };

/*
const FEATURES = [
  { ico: '⚖️', title: 'Live Gold Calc', desc: 'Fine gold & balance computed in real-time with purity tracking' },
  { ico: '📊', title: 'Customer Ledger', desc: 'Per-customer transaction history with running net balance' },
  { ico: '◈', title: 'Analytics Dashboard', desc: 'Visual summary of gold flows, payment modes & top clients' },
  { ico: '🖨️', title: 'Receipt Printing', desc: 'Thermal & browser print for 80mm paper receipts' },
];
*/

const FEATURES = [
{ ico: '⚖️', title: 'Live Gold Calc', desc: 'Real-time purity & balance' },
  { ico: '📊', title: 'Customer Ledger', desc: 'Transaction history & net balance' },
  { ico: '◈', title: 'Analytics', desc: 'Gold flows & visual summary' },
  //{ ico: '🖨️', title: 'Receipt Print', desc: 'Thermal 80mm paper support' },
];

/* ── Shared subcomponents (defined OUTSIDE main component) ────────────── */
function BrandBar() {
  return (
    <div className="au-brand">
      <div className="au-brand-ico">✦</div>
      <div>
        <div className="au-brand-name">Gold Sync</div>
        <div className="au-brand-sub">Manufacturing Ledger System</div>
      </div>
    </div>
  );
}

function Alert({ type, msg }) {
  const ico = type === 'err' ? '⚠️' : type === 'ok' ? '✅' : 'ℹ️';
  return (
    <div className={`au-alert au-alert-${type}`}>
      <span className="au-alert-ico">{ico}</span>
      <span>{msg}</span>
    </div>
  );
}

function MobileHeader() {
  return (
    <div className="au-mobile-header">
      <div className="au-mobile-emblem">✦</div>
      <div className="au-mobile-title">
        Precision <em>Gold Tracking</em>
      </div>
    </div>
  );
}

function DecoPanel() {
  return (
    <div className="au-deco">
      <div className="au-deco-orb au-deco-orb-a" />
      <div className="au-deco-orb au-deco-orb-b" />
      <div className="au-deco-orb au-deco-orb-c" />
      <div className="au-deco-geo">
        <svg viewBox="0 0 640 900" preserveAspectRatio="xMidYMid slice">
          <circle cx="320" cy="450" r="200" fill="none" stroke="#b8941a" strokeWidth=".8" />
          <circle cx="320" cy="450" r="290" fill="none" stroke="#b8941a" strokeWidth=".4" />
          <circle cx="320" cy="450" r="380" fill="none" stroke="#b8941a" strokeWidth=".3" />
          <polygon points="320,220 520,350 480,560 160,560 120,350" fill="none" stroke="#b8941a" strokeWidth=".7" />
          <line x1="0" y1="450" x2="640" y2="450" stroke="#b8941a" strokeWidth=".4" />
          <line x1="320" y1="0" x2="320" y2="900" stroke="#b8941a" strokeWidth=".4" />
          <line x1="0" y1="0" x2="640" y2="900" stroke="#b8941a" strokeWidth=".25" />
          <line x1="640" y1="0" x2="0" y2="900" stroke="#b8941a" strokeWidth=".25" />
        </svg>
      </div>
      <div className="au-deco-body">
        <div className="au-emblem">✦</div>
        <div className="au-deco-headline">
          Precision<br /><em>Gold Tracking</em>
        </div>
        <div className="au-deco-desc">
          A complete manufacturing ledger for fine gold computation,
          customer management, and balance reconciliation.
        </div>
        <div className="au-features">
          {FEATURES.map(f => (
            <div className="au-feat" key={f.title}>
              <div className="au-feat-ico">{f.ico}</div>
              <div className="au-feat-text">
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/*<div className="au-deco-wm">© {new Date().getFullYear()} GoldSync</div>*/}
    </div>
  );
}

/* ── Field components (OUTSIDE main component to prevent re-mounting) ─── */
function InputField({ id, label, type, value, onChange, placeholder, icon, extra, autoComplete, disabled, hasError, isShaking }) {
  return (
    <div className="au-field">
      <label className="au-label" htmlFor={id}>{label}{extra}</label>
      <div className={`au-inp-wrap${isShaking ? ' shake' : ''}`}>
        <span className="au-inp-ico">{icon}</span>
        <input
          id={id}
          name={id}
          type={type || 'text'}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`au-inp${hasError ? ' err' : ''}`}
        />
      </div>
      {hasError && <div className="au-hint err">⚠ {hasError}</div>}
    </div>
  );
}

function PasswordField({ id, label, value, onChange, show, onToggleShow, autoComplete, extra, hint, disabled, hasError, isShaking, showStrength, score: pwScoreVal }) {
  return (
    <div className="au-field">
      <label className="au-label" htmlFor={id}>{label}{extra}</label>
      <div className={`au-inp-wrap${isShaking ? ' shake' : ''}`}>
        <span className="au-inp-ico">🔒</span>
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
          placeholder="••••••••"
          disabled={disabled}
          className={`au-inp${hasError ? ' err' : ''}`}
          style={{ paddingRight: '42px' }}
        />
        <button type="button" className="au-eye" onClick={onToggleShow} tabIndex={-1}>
          {show ? '🙈' : '👁️'}
        </button>
      </div>
      {showStrength && value && value.length > 0 && (
        <>
          <div className="au-pw-bars">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`au-pw-bar${pwScoreVal >= i ? ` lv${pwScoreVal}` : ''}`}
                style={pwScoreVal >= i ? { background: PW_COLS[pwScoreVal] } : {}} />
            ))}
          </div>
          <div className="au-pw-label" style={{ color: PW_COLS[pwScoreVal] || '#a09070' }}>
            {PW_LABELS[pwScoreVal]}
          </div>
        </>
      )}
      {hasError && <div className="au-hint err">⚠ {hasError}</div>}
      {hint && !hasError && <div className="au-hint">{hint}</div>}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function AuthPage({ onAuthSuccess }) {
  useEffect(() => { injectAuthStyles(); }, []);

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errs, setErrs] = useState({});
  const [shakeKey, setShakeKey] = useState('');
  const [sentEmail, setSentEmail] = useState('');

  const btnRef = useRef(null);
  const score = pwScore(password);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) setMode('reset');
  }, []);

  const clear = useCallback(() => {
    setAlert(null); setErrs({});
    setPassword(''); setConfirmPw('');
    setShowPw(false); setShowCPw(false); setShakeKey('');
  }, []);

  const go = useCallback(m => { clear(); setMode(m); }, [clear]);

  const shake = useCallback(k => { setShakeKey(k); setTimeout(() => setShakeKey(''), 500); }, []);

  const addRipple = useCallback(e => {
    const btn = btnRef.current; if (!btn) return;
    const r = document.createElement('span');
    const rect = btn.getBoundingClientRect();
    r.className = 'au-btn-ripple';
    r.style.left = `${e.clientX - rect.left}px`;
    r.style.top = `${e.clientY - rect.top}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 700);
  }, []);

  // Stable onChange handlers
  const handleEmailChange = useCallback(e => {
    setEmail(e.target.value);
    setErrs(p => ({ ...p, email: '' }));
  }, []);

  const handlePasswordChange = useCallback(e => {
    setPassword(e.target.value);
    setErrs(p => ({ ...p, password: '' }));
  }, []);

  const handleConfirmPwChange = useCallback(e => {
    setConfirmPw(e.target.value);
    setErrs(p => ({ ...p, confirmPw: '' }));
  }, []);

  const handleFullNameChange = useCallback(e => {
    setFullName(e.target.value);
    setErrs(p => ({ ...p, fullName: '' }));
  }, []);

  const handleTogglePw = useCallback(() => setShowPw(p => !p), []);
  const handleToggleCPw = useCallback(() => setShowCPw(p => !p), []);

  const validate = useCallback(() => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';

    if (mode !== 'forgot') {
      if (!password) e.password = 'Password is required';
      else if (password.length < 6) e.password = 'Minimum 6 characters';
    }
    if (mode === 'signup' || mode === 'reset') {
      if (mode === 'signup' && !fullName.trim()) e.fullName = 'Full name is required';
      if (password !== confirmPw) e.confirmPw = 'Passwords do not match';
      if (mode === 'reset' && password.length < 8) e.password = 'Minimum 8 characters';
      if (mode === 'signup' && !agreed) e.agreed = 'Please accept the terms to continue';
    }
    return e;
  }, [email, password, confirmPw, fullName, mode, agreed]);

  const submit = async e => {
    e.preventDefault();
    addRipple(e);
    setAlert(null);
    const v = validate();
    if (Object.keys(v).length) { setErrs(v); shake(Object.keys(v)[0]); return; }
    setErrs({});
    setLoading(true);
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess?.(data.user);
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setSentEmail(email); go('sent');
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}${window.location.pathname}#type=recovery`,
        });
        if (error) throw error;
        setSentEmail(email); go('sent');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        window.history.replaceState(null, '', window.location.pathname);
        setAlert({ type: 'ok', msg: 'Password updated! Signing you in…' });
        setTimeout(() => go('login'), 2200);
      }
    } catch (err) {
      setAlert({ type: 'err', msg: err.message || 'Something went wrong. Please try again.' });
      shake('email');
    } finally {
      setLoading(false);
    }
  };

  /* ── SUCCESS / EMAIL SENT screen ─────────────────────────────────────── */
  if (mode === 'sent') {
    return (
      <div className="au-shell" style={{ flexDirection: 'column' }}>
        <MobileHeader />
        <div style={{ display: 'flex', flex: 1 }}>
          <DecoPanel />
          <div className="au-form-panel">
            <div className="au-card">
              <BrandBar />
              <div className="au-success">
                <div className="au-success-ring">
                  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                    <polyline className="ck" points="7,18 14,25 27,10"
                      stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
                <div className="au-success-title">Check your email</div>
                <div className="au-success-sub">
                  We sent a link to <span className="au-success-em">{sentEmail}</span>.<br />
                  {fullName
                    ? 'Click the link to verify your account and get started.'
                    : 'Follow the link to reset your password.'}
                </div>
                <button className="au-btn" ref={btnRef} onClick={() => { clear(); setFullName(''); setEmail(''); go('login'); }}>
                  ← Back to Sign In
                </button>
                <div className="au-switch" style={{ marginTop: '16px' }}>
                  Didn't get it?{' '}
                  <span className="au-switch-link" onClick={() => go(fullName ? 'signup' : 'forgot')}>
                    Resend email
                  </span>
                </div>
              </div>
            </div>
            <div className="au-legal">© {new Date().getFullYear()} GoldSync</div>
          </div>
        </div>
      </div>
    );
  }

  /* ── RESET PASSWORD screen ───────────────────────────────────────────── */
  if (mode === 'reset') {
    return (
      <div className="au-shell" style={{ flexDirection: 'column' }}>
        <MobileHeader />
        <div style={{ display: 'flex', flex: 1 }}>
          <DecoPanel />
          <div className="au-form-panel">
            <div className="au-card">
              <div className="au-s1"><BrandBar /></div>
              <div className="au-s2">
                <button className="au-back" onClick={() => go('login')}>
                  <span className="au-back-arrow">←</span> Back to sign in
                </button>
              </div>
              <div className="au-heading au-s2">
                <div className="au-heading-title">Set new password</div>
                <div className="au-heading-sub">Choose a strong, unique password for your account</div>
              </div>
              {alert && <Alert {...alert} />}
              <form onSubmit={submit} noValidate>
                <div className="au-s3">
                  <PasswordField
                    id="password" label="New Password" value={password}
                    onChange={handlePasswordChange} show={showPw} onToggleShow={handleTogglePw}
                    autoComplete="new-password" disabled={loading}
                    hasError={errs.password} isShaking={shakeKey === 'password'}
                    showStrength={true} score={score}
                    hint="Minimum 8 characters with mixed case &amp; numbers"
                  />
                </div>
                <div className="au-s4">
                  <PasswordField
                    id="confirmPw" label="Confirm New Password" value={confirmPw}
                    onChange={handleConfirmPwChange} show={showCPw} onToggleShow={handleToggleCPw}
                    autoComplete="new-password" disabled={loading}
                    hasError={errs.confirmPw} isShaking={shakeKey === 'confirmPw'}
                    showStrength={false} score={0}
                  />
                </div>
                <div className="au-s5">
                  <button ref={btnRef} type="submit" className="au-btn" disabled={loading}>
                    {loading && <span className="au-spinner" />}
                    {loading ? 'Updating…' : '✦ Update Password'}
                  </button>
                </div>
              </form>
            </div>
            <div className="au-legal">© {new Date().getFullYear()} GoldSync</div>
          </div>
        </div>
      </div>
    );
  }

  /* ── FORGOT PASSWORD screen ──────────────────────────────────────────── */
  if (mode === 'forgot') {
    return (
      <div className="au-shell" style={{ flexDirection: 'column' }}>
        <MobileHeader />
        <div style={{ display: 'flex', flex: 1 }}>
          <DecoPanel />
          <div className="au-form-panel">
            <div className="au-card">
              <div className="au-s1"><BrandBar /></div>
              <div className="au-s2">
                <button className="au-back" onClick={() => go('login')}>
                  <span className="au-back-arrow">←</span> Back to sign in
                </button>
              </div>
              <div className="au-heading au-s2">
                <div className="au-heading-title">Forgot password?</div>
                <div className="au-heading-sub">Enter your registered email to receive a reset link</div>
              </div>
              {alert && <Alert {...alert} />}
              <form onSubmit={submit} noValidate>
                <div className="au-s3">
                  <InputField
                    id="email" label="Email Address" type="email" value={email}
                    onChange={handleEmailChange} placeholder="you@example.com" icon="📧"
                    autoComplete="email" disabled={loading}
                    hasError={errs.email} isShaking={shakeKey === 'email'}
                  />
                </div>
                <div className="au-s4">
                  <button ref={btnRef} type="submit" className="au-btn" disabled={loading}>
                    {loading && <span className="au-spinner" />}
                    {loading ? 'Sending…' : '📧 Send Reset Link'}
                  </button>
                </div>
              </form>
              <div className="au-switch au-s5">
                Remember your password?
                <span className="au-switch-link" onClick={() => go('login')}> Sign in</span>
              </div>
            </div>
            <div className="au-legal">© {new Date().getFullYear()} GoldSync</div>
          </div>
        </div>
      </div>
    );
  }

  /* ── LOGIN + SIGNUP (tabbed) ─────────────────────────────────────────── */
  return (
    <div className="au-shell" style={{ flexDirection: 'column' }}>
      <MobileHeader />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <DecoPanel />
        <div className="au-form-panel">
          <div className="au-card">
            <div className="au-s1"><BrandBar /></div>

            {/* Tab strip */}
            <div className="au-tabs au-s2">
              <button className={`au-tab${mode === 'login' ? ' on' : ''}`} onClick={() => go('login')}>Sign In</button>
              {/*<button className={`au-tab${mode === 'signup' ? ' on' : ''}`} onClick={() => go('signup')}>Create Account</button>*/}
            </div>

            {/* Heading */}
            <div className="au-heading au-s2">
              <div className="au-heading-title">
                {mode === 'login' ? 'Welcome back' : 'Join GoldSync'}
              </div>
              <div className="au-heading-sub">
                {mode === 'login'
                  ? 'Sign in to access your gold ledger and calculations'
                  : 'Create your account to start tracking gold transactions'}
              </div>
            </div>

            {alert && <Alert {...alert} />}

            <form onSubmit={submit} noValidate>
              {/* Full name (signup) */}
              {mode === 'signup' && (
                <div className="au-s3">
                  <InputField
                    id="fullName" label="Full Name" value={fullName}
                    onChange={handleFullNameChange} placeholder="Your full name" icon="👤"
                    autoComplete="name" disabled={loading}
                    hasError={errs.fullName} isShaking={shakeKey === 'fullName'}
                  />
                </div>
              )}

              {/* Email */}
              <div className={mode === 'signup' ? 'au-s4' : 'au-s3'}>
                <InputField
                  id="email" label="Email Address" type="email" value={email}
                  onChange={handleEmailChange} placeholder="you@example.com" icon="📧"
                  autoComplete="email" disabled={loading}
                  hasError={errs.email} isShaking={shakeKey === 'email'}
                />
              </div>

              {/* Password */}
              <div className={mode === 'signup' ? 'au-s5' : 'au-s4'}>
                <PasswordField
                  id="password" label="Password" value={password}
                  onChange={handlePasswordChange} show={showPw} onToggleShow={handleTogglePw}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  hint={mode === 'signup' ? 'Use 8+ chars, mixed case, numbers & symbols' : undefined}
                  disabled={loading}
                  hasError={errs.password} isShaking={shakeKey === 'password'}
                  showStrength={mode === 'signup'} score={score}
                  extra={mode === 'login' && (
                    <button type="button" className="au-label-link" onClick={() => go('forgot')}>
                      Forgot password?
                    </button>
                  )}
                />
              </div>

              {/* Confirm password (signup) */}
              {mode === 'signup' && (
                <div className="au-s6">
                  <PasswordField
                    id="confirmPw" label="Confirm Password" value={confirmPw}
                    onChange={handleConfirmPwChange} show={showCPw} onToggleShow={handleToggleCPw}
                    autoComplete="new-password" disabled={loading}
                    hasError={errs.confirmPw} isShaking={shakeKey === 'confirmPw'}
                    showStrength={false} score={0}
                  />
                </div>
              )}

              {/* Remember me (login) */}
              {mode === 'login' && (
                <div className="au-s5">
                  <div className="au-check" onClick={() => setRememberMe(p => !p)}>
                    <div className={`au-check-box${rememberMe ? ' on' : ''}`}>
                      {rememberMe && <span className="au-check-mark">✓</span>}
                    </div>
                    <span className="au-check-text">Keep me signed in on this device</span>
                  </div>
                </div>
              )}

              {/* Terms (signup) */}
              {mode === 'signup' && (
                <div className="au-s7">
                  <div className="au-check" onClick={() => setAgreed(p => !p)}>
                    <div className={`au-check-box${agreed ? ' on' : ''}`}>
                      {agreed && <span className="au-check-mark">✓</span>}
                    </div>
                    <span className="au-check-text">
                      I agree to the <a onClick={e => e.stopPropagation()}>Terms of Service</a> and{' '}
                      <a onClick={e => e.stopPropagation()}>Privacy Policy</a>
                    </span>
                  </div>
                  {errs.agreed && <div className="au-hint err">⚠ {errs.agreed}</div>}
                </div>
              )}

              {/* CTA */}
              <div className={mode === 'signup' ? 'au-s7' : 'au-s6'}>
                <button ref={btnRef} type="submit" className="au-btn" disabled={loading}>
                  {loading && <span className="au-spinner" />}
                  {loading
                    ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                    : (mode === 'login' ? '✦  Sign In' : '✦  Create Account')}
                </button>
              </div>
            </form>
          </div>

          <div className="au-legal">© {new Date().getFullYear()} GoldSync · Developed by TeamR.</div>
        </div>
      </div>
    </div>
  );
}