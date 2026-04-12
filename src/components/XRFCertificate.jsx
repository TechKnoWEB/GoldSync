import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const CARD_W = 700;
const CARD_H = 440;
const SCALE  = 3; // export resolution multiplier

const GRADIENT_PRESETS = [
  { name: 'White',         from: '#ffffff', to: '#ffffff', angle: 135 },
  { name: 'Midnight Gold', from: '#0d1b2e', to: '#b8860b', angle: 135 },
  { name: 'Antique Gold',  from: '#7a5c00', to: '#d4af37', angle: 135 },
  { name: 'Rose Gold',     from: '#3d1515', to: '#c8826e', angle: 135 },
  { name: 'Deep Navy Gold',from: '#0a1628', to: '#c8960c', angle: 120 },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function isLight(hex) {
  if (!hex || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}
function todayFormatted() {
  const d = new Date();
  return [String(d.getDate()).padStart(2,'0'), String(d.getMonth()+1).padStart(2,'0'), d.getFullYear()].join('-');
}
function genCertNo() {
  return String(Math.floor(Math.random() * 90_000_000) + 10_000_000);
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ─── Canvas Drawing: FRONT ─────────────────────────────────────────────── */
async function drawFront(ctx, d, S) {
  const W = CARD_W * S, H = CARD_H * S;
  const light = isLight(d.cardGradient.from);
  const cText   = light ? '#111111' : '#f0ece4';
  const cSub    = light ? '#444444' : '#c8bfac';
  const cLabel  = light ? '#666666' : '#9a9080';
  const cDivBg  = light ? '#ac681f' : '#e0d09a';
  const cDivTxt = light ? '#e8dcc0' : '#1a1200';
  const bText   = '#111111';
  const bLabel  = '#666666';
  const bBorder = 'rgba(0,0,0,0.13)';

  // Card background
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 0, 0, W, H, 10 * S);
  ctx.fill();

  // Shadow clip
  ctx.save();
  roundRect(ctx, 0, 0, W, H, 10 * S);
  ctx.clip();

  /* ── Header background ── */
  const headerH = 120 * S;
  const hGrad = ctx.createLinearGradient(0, 0, W, headerH);
  hGrad.addColorStop(0, d.cardGradient.from);
  hGrad.addColorStop(1, d.cardGradient.to);
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, 0, W, headerH);

  /* ── QR Code ── */
  let qrImg = null;
  if (d.qrContent) {
    try {
      const qrDataUrl = await QRCode.toDataURL(d.qrContent, {
        width: 90 * S, margin: 1, errorCorrectionLevel: 'H',
        color: { dark: '#000000', light: '#ffffff' },
      });
      qrImg = await loadImage(qrDataUrl);
    } catch(e) { /* skip */ }
  }

  const qrSize   = 92 * S;
  const qrPad    = 5  * S;
  const qrRight  = W - 20 * S;
  const qrTop    = 10 * S;
  const textAreaW = qrImg ? W - qrSize - 50 * S : W - 40 * S;

  if (qrImg) {
    // White box behind QR
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, qrRight - qrSize - qrPad * 2, qrTop - qrPad, qrSize + qrPad * 2, qrSize + qrPad * 2, 2 * S);
    ctx.fill();
    ctx.drawImage(qrImg, qrRight - qrSize - qrPad, qrTop, qrSize, qrSize);
  }

  /* ── Shop Name ── */
  ctx.fillStyle = cText;
  ctx.font = `800 ${30 * S}px 'Lexend','Segoe UI',sans-serif`;
  ctx.textAlign = 'center';
  const shopNameX = (textAreaW) / 2 + 20 * S;
  ctx.fillText((d.shopName || 'YOUR SHOP NAME').toUpperCase(), shopNameX, 48 * S);

  /* ── Shop Address ── */
  ctx.fillStyle = cSub;
  ctx.font = `400 ${14 * S}px 'Lexend','Segoe UI',sans-serif`;
  ctx.fillText((d.shopAddress || 'Shop Address').toUpperCase(), shopNameX, 66 * S);

  /* ── Shop Info ── */
  if (d.shopInfo) {
    ctx.fillStyle = cLabel;
    ctx.font = `400 ${9 * S}px 'Lexend','Segoe UI',sans-serif`;
    ctx.fillText(d.shopInfo, shopNameX, 82 * S);
  }

  /* ── Title bar ── */
  const titleBarY = headerH;
  const titleBarH = 22 * S;
  ctx.fillStyle = cDivBg;
  ctx.fillRect(0, titleBarY, W, titleBarH);
  ctx.fillStyle = cDivTxt;
  ctx.font      = `800 ${9.5 * S}px 'Lexend','Segoe UI',sans-serif`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = `${2.8 * S}px`;
  ctx.fillText('XRF GOLD TESTING CERTIFICATE (ONLY FOR SKIN)', W / 2, titleBarY + 15 * S);
  ctx.letterSpacing = '0px';

  /* ── Middle section ── */
  const midY  = titleBarY + titleBarH;
  const midH  = (CARD_H - 36) * S - midY;  // leave room for note
  const noteH = 28 * S;
  const midBottom = H - noteH;

  // Left 50% background (white already)
  // Right 50% background
  ctx.fillStyle = 'rgba(0,0,0,0.015)';
  ctx.fillRect(W / 2, midY, W / 2, midBottom - midY);

  // Dividing vertical line
  ctx.strokeStyle = bBorder;
  ctx.lineWidth   = 1 * S;
  ctx.beginPath();
  ctx.moveTo(W / 2, midY);
  ctx.lineTo(W / 2, midBottom);
  ctx.stroke();

  /* ── Customer Info rows ── */
  const rows = [
    ['Customer Name',  d.customerName  ? d.customerName.toUpperCase() : '—', true ],
    ['Certificate No', d.certNo        || '—', false],
    ['Date',           d.date          || '—', false],
    ['Product Name',   d.productName   ? d.productName.toUpperCase() : '—', true],
    ['Product Weight', d.productWeight ? d.productWeight + ' g' : '—', false],
    ['Product Karat',  d.productKarat  ? d.productKarat  + ' K' : '—', false],
  ];

  let rowY = midY + 16 * S;
  const labelW  = 105 * S;
  const rowX    = 16 * S;
  const rowStep = 30 * S;

  rows.forEach(([lbl, val]) => {
    ctx.textAlign = 'left';
    ctx.font      = `600 ${10 * S}px 'Lexend','Segoe UI',sans-serif`;
    ctx.fillStyle = bLabel;
    ctx.fillText(lbl.toUpperCase(), rowX, rowY);

    ctx.font      = `700 ${12 * S}px 'Lexend','Segoe UI',sans-serif`;
    ctx.fillStyle = bText;
    // Clip value text so it doesn't overflow the left column
    ctx.save();
    ctx.beginPath();
    ctx.rect(rowX + labelW, rowY - 14 * S, W / 2 - rowX - labelW - 10 * S, 18 * S);
    ctx.clip();
    ctx.fillText(val, rowX + labelW, rowY);
    ctx.restore();

    rowY += rowStep;
  });

  /* ── Metal Report ── */
  const metalY = rowY + 8 * S;

  // Top border
  ctx.strokeStyle = bBorder;
  ctx.lineWidth   = 1.5 * S;
  ctx.beginPath();
  ctx.moveTo(rowX, metalY - 4 * S);
  ctx.lineTo(W / 2 - 16 * S, metalY - 4 * S);
  ctx.stroke();

  ctx.fillStyle = '#cc0000';
  ctx.font      = `800 ${10 * S}px 'Lexend','Segoe UI',sans-serif`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = `${1.5 * S}px`;
  ctx.fillText('METAL REPORT', W / 4, metalY + 12 * S);
  ctx.letterSpacing = '0px';

  // Bottom border under title
  ctx.strokeStyle = bBorder;
  ctx.lineWidth   = 1.5 * S;
  ctx.beginPath();
  ctx.moveTo(rowX, metalY + 18 * S);
  ctx.lineTo(W / 2 - 16 * S, metalY + 18 * S);
  ctx.stroke();

  const metals = [
    ['Gold',   d.gold   ? `${d.gold}%`   : '—'],
    ['Copper', d.copper ? `${d.copper}%` : '—'],
    ['Silver', d.silver ? `${d.silver}%` : '—'],
    ['Others', d.others ? `${d.others}%` : '—'],
  ];
  const colW = (W / 2 - 32 * S) / 2;
  metals.forEach(([lbl, val], i) => {
    const mx = rowX + (i % 2) * colW;
    const my = metalY + 34 * S + Math.floor(i / 2) * 26 * S;
    ctx.textAlign = 'left';
    ctx.font      = `600 ${12 * S}px 'Lexend','Segoe UI',sans-serif`;
    ctx.fillStyle = bLabel;
    ctx.fillText(`${lbl}: `, mx, my);
    const lblMeasure = ctx.measureText(`${lbl}: `).width;
    ctx.font      = `700 ${12 * S}px 'Lexend','Segoe UI',sans-serif`;
    ctx.fillStyle = bText;
    ctx.fillText(val, mx + lblMeasure, my);
  });

  /* ── Product Image (right 50%) ── */
  const imgX    = W / 2 + 14 * S;
  const imgY    = midY + 14 * S;
  const imgMaxW = W / 2 - 28 * S;
  const imgMaxH = midBottom - midY - 28 * S;

  if (d.productImage) {
    try {
      const prodImg = await loadImage(d.productImage);
      const scale   = Math.min(imgMaxW / prodImg.width, imgMaxH / prodImg.height, 1);
      const dw = prodImg.width  * scale;
      const dh = prodImg.height * scale;
      const dx = imgX + (imgMaxW - dw) / 2;
      const dy = imgY + (imgMaxH - dh) / 2;
      ctx.save();
      roundRect(ctx, dx, dy, dw, dh, 8 * S);
      ctx.clip();
      ctx.drawImage(prodImg, dx, dy, dw, dh);
      ctx.restore();
    } catch(e) { /* skip */ }
  } else {
    // Placeholder box
    ctx.strokeStyle = bBorder;
    ctx.lineWidth   = 1.5 * S;
    ctx.setLineDash([6 * S, 4 * S]);
    roundRect(ctx, imgX, imgY, imgMaxW, imgMaxH, 10 * S);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle   = bLabel;
    ctx.font        = `400 ${9 * S}px 'Lexend','Segoe UI',sans-serif`;
    ctx.textAlign   = 'center';
    ctx.fillText('Product Photo', imgX + imgMaxW / 2, imgY + imgMaxH / 2);
  }

  /* ── Horizontal border above note ── */
  ctx.strokeStyle = bBorder;
  ctx.lineWidth   = 1 * S;
  ctx.beginPath();
  ctx.moveTo(0, midBottom);
  ctx.lineTo(W, midBottom);
  ctx.stroke();

  /* ── Note ── */
  ctx.fillStyle = bLabel;
  ctx.font      = `italic 400 ${10.5 * S}px 'Lexend','Segoe UI',sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Note: max. deviation +/- 0.50% as per machine specification', W / 2, midBottom + 18 * S);

  ctx.restore(); // remove clip
}

/* ─── Canvas Drawing: BACK ──────────────────────────────────────────────── */
async function drawBack(ctx, d, S) {
  const W = CARD_W * S, H = CARD_H * S;
  const light = isLight(d.cardGradient.from);
  const cText   = light ? '#111111' : '#ece5d8';
  const cSub    = light ? '#555555' : '#9a9080';
  const cDivBg  = light ? '#d49e63' : '#e0d09a';
  const cDivTxt = light ? '#e8dcc0' : '#1a1200';
  const cNumBg  = light ? '#2a2015' : '#d4af37';
  const cNumTxt = light ? '#e8dcc0' : '#1a1000';
  const cBorder = light ? 'rgba(0,0,0,0.13)' : 'rgba(255,255,255,0.10)';

  // Card background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, d.cardGradient.from);
  bgGrad.addColorStop(1, d.cardGradient.to);
  ctx.fillStyle = bgGrad;
  roundRect(ctx, 0, 0, W, H, 10 * S);
  ctx.fill();

  ctx.save();
  roundRect(ctx, 0, 0, W, H, 10 * S);
  ctx.clip();

  /* ── Watermark ── */
  ctx.save();
  ctx.globalAlpha = light ? 0.04 : 0.045;
  ctx.fillStyle   = light ? '#000000' : '#ffffff';
  ctx.font        = `900 ${55 * S}px 'Lexend','Segoe UI',sans-serif`;
  ctx.textAlign   = 'center';
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-28 * Math.PI / 180);
  ctx.fillText((d.shopName || 'GOLDSYNC').toUpperCase(), 0, 0);
  ctx.restore();

  /* ── Title bar ── */
  const titleBarH = 28 * S;
  ctx.fillStyle   = cDivBg;
  ctx.fillRect(0, 0, W, titleBarH);
  ctx.fillStyle   = cDivTxt;
  ctx.font        = `800 ${9.5 * S}px 'Lexend','Segoe UI',sans-serif`;
  ctx.textAlign   = 'center';
  ctx.letterSpacing = `${2.5 * S}px`;
  ctx.fillText('TERMS & CONDITIONS', W / 2, 19 * S);
  ctx.letterSpacing = '0px';

  /* ── Conditions ── */
  const conditions = d.conditions || [];
  const padX  = 22 * S;
  const padY  = titleBarH + 18 * S;
  const circR = 10 * S;
  const lineH = 15.5 * S;
  const textX = padX + circR * 2 + 11 * S;
  const textW = W - textX - padX;
  const footerH = 28 * S;
  const availH  = H - padY - footerH - 10 * S;

  let cy = padY;
  conditions.forEach((point, i) => {
    if (cy >= H - footerH - 10 * S) return;

    // Wrap text
    const lines = wrapText(ctx, point, textW, `400 ${9.5 * S}px 'Lexend','Segoe UI',sans-serif`);
    const blockH = lines.length * lineH;

    // Number circle
    ctx.fillStyle = cNumBg;
    ctx.beginPath();
    ctx.arc(padX + circR, cy + circR + 1 * S, circR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cNumTxt;
    ctx.font      = `800 ${9 * S}px 'Lexend','Segoe UI',sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(String(i + 1), padX + circR, cy + circR * 1.7);

    // Text lines
    ctx.fillStyle = cText;
    ctx.font      = `400 ${9.5 * S}px 'Lexend','Segoe UI',sans-serif`;
    ctx.textAlign = 'left';
    lines.forEach((line, li) => {
      ctx.fillText(line, textX, cy + lineH * (li + 1));
    });

    cy += blockH + 12 * S;
  });

  /* ── Product Image (back) ── */
  if (d.imageOnBack && d.productImage) {
    try {
      const pImg = await loadImage(d.productImage);
      const iSize = 120 * S;
      const iX = W - 16 * S - iSize;
      const iY = H - footerH - 10 * S - iSize;
      ctx.save();
      roundRect(ctx, iX, iY, iSize, iSize, 6 * S);
      ctx.clip();
      ctx.drawImage(pImg, iX, iY, iSize, iSize);
      ctx.restore();
      ctx.strokeStyle = cBorder;
      ctx.lineWidth   = 1.5 * S;
      roundRect(ctx, iX, iY, iSize, iSize, 6 * S);
      ctx.stroke();
    } catch(e) { /* skip */ }
  }

  /* ── Footer ── */
  ctx.strokeStyle = cBorder;
  ctx.lineWidth   = 1 * S;
  ctx.beginPath();
  ctx.moveTo(0, H - footerH);
  ctx.lineTo(W, H - footerH);
  ctx.stroke();

  ctx.fillStyle = cSub;
  ctx.font      = `400 ${8 * S}px 'Lexend','Segoe UI',sans-serif`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = `${0.8 * S}px`;
  const footerText = (d.shopName || 'YOUR SHOP NAME').toUpperCase() + (d.shopAddress ? ` · ${d.shopAddress}` : '');
  ctx.fillText(footerText, W / 2, H - footerH + 18 * S);
  ctx.letterSpacing = '0px';

  ctx.restore();
}

/* ─── Utility: word wrap ─────────────────────────────────────────────────── */
function wrapText(ctx, text, maxW, font) {
  ctx.font = font;
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const word of words) {
    const test = cur ? cur + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/* ─── Utility: load image ────────────────────────────────────────────────── */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/* ─── Download via Canvas ────────────────────────────────────────────────── */
async function downloadCard(side, d, shopName, certNo) {
  const canvas = document.createElement('canvas');
  canvas.width  = CARD_W * SCALE;
  canvas.height = CARD_H * SCALE;
  const ctx = canvas.getContext('2d');

  if (side === 'front') {
    await drawFront(ctx, d, SCALE);
  } else {
    await drawBack(ctx, d, SCALE);
  }

  const label = `${(shopName || 'card').trim().split(/\s+/).slice(0,2).join('-')}-${certNo}-${side}`;
  const link  = document.createElement('a');
  link.download = `${label}.png`;
  link.href     = canvas.toDataURL('image/png');
  link.click();
}

/* ─── Style injection ────────────────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById('xrf-ui-styles')) return;
  const s = document.createElement('style');
  s.id = 'xrf-ui-styles';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700;800;900&display=swap');
    .xrf-wrap { animation: fadeUp .38s ease; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
    .xrf-page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:4px; }
    .xrf-page-title { font-size:1.3rem; font-weight:800; color:var(--gold-br,#c9a227); letter-spacing:-.025em; }
    .xrf-page-sub { font-size:.72rem; color:var(--t4,#666); margin-top:3px; }
    .xrf-page-actions { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
    .xrf-layout { display:grid; grid-template-columns:370px 1fr; gap:20px; align-items:start; }
    @media(max-width:1080px){ .xrf-layout { grid-template-columns:1fr; } }
    .xrf-panel { background:var(--bg-raised,#1e1e2e); border:1px solid var(--border-sm,rgba(255,255,255,.08)); border-radius:14px; padding:18px; }
    .xrf-panel + .xrf-panel { margin-top:14px; }
    .xrf-panel-title { font-size:.7rem; font-weight:700; color:var(--t3,#888); letter-spacing:1px; text-transform:uppercase; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid var(--border-xs,rgba(255,255,255,.05)); }
    .xrf-field { margin-bottom:11px; }
    .xrf-field:last-child { margin-bottom:0; }
    .xrf-label { font-size:.71rem; font-weight:600; color:var(--t3,#888); margin-bottom:5px; display:block; }
    .xrf-input { width:100%; background:var(--bg-input,rgba(255,255,255,.05)); border:1px solid var(--border-sm,rgba(255,255,255,.08)); border-radius:9px; padding:8px 11px; font-family:var(--font,Lexend,sans-serif); font-size:.82rem; color:var(--t1,#eee); outline:none; transition:border-color .2s, box-shadow .2s; box-sizing:border-box; }
    .xrf-input:focus { border-color:var(--border-lg,rgba(255,255,255,.3)); box-shadow:0 0 0 3px var(--gold-glow,rgba(212,175,55,.15)); }
    .xrf-input::placeholder { color:var(--t5,#444); }
    .xrf-row2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .xrf-row3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
    .xrf-color-presets { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
    .xrf-color-swatch { width:30px; height:30px; border-radius:50%; cursor:pointer; border:2px solid transparent; transition:all .2s; flex-shrink:0; box-shadow:0 2px 6px rgba(0,0,0,.4); }
    .xrf-color-swatch:hover { transform:scale(1.12); }
    .xrf-color-swatch.sel { border-color:var(--gold,#d4af37); transform:scale(1.18); box-shadow:0 0 0 3px rgba(212,175,55,.28); }
    .xrf-color-custom-row { display:flex; align-items:center; gap:10px; }
    .xrf-color-pick { width:38px; height:30px; border-radius:8px; border:1px solid var(--border-sm,rgba(255,255,255,.08)); cursor:pointer; padding:2px; background:var(--bg-input,rgba(255,255,255,.05)); }
    .xrf-img-zone { position:relative; border:1.5px dashed var(--border-md,rgba(255,255,255,.15)); border-radius:12px; padding:14px; text-align:center; cursor:pointer; transition:all .25s; min-height:80px; display:flex; flex-direction:column; align-items:center; justify-content:center; }
    .xrf-img-zone:hover { border-color:var(--gold-dk,#a07820); background:var(--gold-glow,rgba(212,175,55,.08)); }
    .xrf-img-zone input[type=file] { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
    .xrf-img-zone img { max-width:100%; max-height:110px; border-radius:8px; object-fit:contain; }
    .xrf-img-rm { position:absolute; top:7px; right:7px; z-index:2; background:rgba(248,113,113,.15); border:1px solid rgba(248,113,113,.3); border-radius:6px; color:#f87171; font-size:.68rem; font-family:var(--font,Lexend,sans-serif); padding:3px 8px; cursor:pointer; transition:background .2s; }
    .xrf-img-rm:hover { background:rgba(248,113,113,.28); }
    .xrf-preview-col { display:flex; flex-direction:column; gap:14px; }
    .xrf-view-toggle { display:flex; gap:6px; background:var(--bg-raised,#1e1e2e); border:1px solid var(--border-sm,rgba(255,255,255,.08)); border-radius:11px; padding:4px; }
    .xrf-vbtn { padding:7px 20px; border-radius:8px; border:none; cursor:pointer; font-family:var(--font,Lexend,sans-serif); font-size:.82rem; font-weight:600; transition:all .22s; }
    .xrf-vbtn.on { background:linear-gradient(135deg,#a07820,#d4af37); color:#1a1000; }
    .xrf-vbtn.off { background:transparent; color:var(--t3,#888); }
    .xrf-vbtn.off:hover { color:var(--t1,#eee); }
    .xrf-card-stage { border-radius:14px; background: repeating-conic-gradient(rgba(255,255,255,.025) 0% 25%, transparent 0% 50%) 0 0/18px 18px; border:1px solid var(--border-xs,rgba(255,255,255,.05)); padding:20px; display:flex; justify-content:center; overflow-x:auto; }
    .xrf-card-stage .xrf-card-scaler { transform-origin: top center; }
    @media(max-width:760px){
      .xrf-row3 { grid-template-columns:1fr 1fr; }
      .xrf-page-header { flex-direction:column; align-items:stretch; }
      .xrf-page-actions { justify-content:flex-end; }
      .xrf-card-stage { padding:12px; overflow-x:hidden; }
    }
    .xrf-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 16px; border-radius:10px; border:none; cursor:pointer; font-family:var(--font,Lexend,sans-serif); font-size:.8rem; font-weight:600; transition:all .22s; white-space:nowrap; }
    .xrf-btn:disabled { opacity:.5; cursor:not-allowed; }
    .xrf-btn:not(:disabled):hover { transform:translateY(-1px); }
    .xrf-btn-gold { background:linear-gradient(135deg,#a07820,#d4af37); color:#1a1000; }
    .xrf-btn-gold:not(:disabled):hover { box-shadow:0 4px 15px rgba(212,175,55,.4); }
    .xrf-btn-ghost { background:transparent; border:1px solid var(--border-md,rgba(255,255,255,.15)); color:var(--t2,#aaa); }
    .xrf-btn-ghost:not(:disabled):hover { border-color:rgba(255,255,255,.3); color:var(--t1,#eee); background:rgba(212,175,55,.08); }
    .xrf-btn-sm { padding:6px 12px; font-size:.74rem; }
    .xrf-gen-link { font-size:.68rem; color:var(--gold,#d4af37); cursor:pointer; background:none; border:none; font-family:var(--font,Lexend,sans-serif); padding:0 0 0 6px; }
    .xrf-gen-link:hover { text-decoration:underline; }
    .xrf-tip { background:var(--bg-raised,#1e1e2e); border:1px solid var(--border-xs,rgba(255,255,255,.05)); border-radius:10px; padding:11px 14px; font-size:.74rem; color:var(--t4,#666); line-height:1.6; }
    .xrf-tip strong { color:var(--t2,#aaa); }
    .xrf-divider { border:none; border-top:1px solid var(--border-xs,rgba(255,255,255,.05)); margin:12px 0; }
  `;
  document.head.appendChild(s);
};

/* ─── QR Code preview (for card preview in browser) ─────────────────────── */
function QRCodeCanvas({ content, size = 75 }) {
  const [dataUrl, setDataUrl] = useState('');
  useEffect(() => {
    if (!content) return;
    QRCode.toDataURL(content, { width: size * 4, margin: 1, errorCorrectionLevel: 'H', color: { dark: '#000000', light: '#ffffff' } })
      .then(setDataUrl).catch(() => {});
  }, [content, size]);
  if (!dataUrl) return null;
  return <img src={dataUrl} width={size} height={size} style={{ display:'block', width:`${size}px`, height:`${size}px`, imageRendering:'pixelated' }} alt="QR" />;
}

/* ─── Card Front Preview (React DOM, browser only) ───────────────────────── */
function CardFront({ d }) {
  const light = isLight(d.cardGradient.from);
  const c = {
    text:    light ? '#111111' : '#f0ece4',
    sub:     light ? '#444444' : '#c8bfac',
    label:   light ? '#666666' : '#9a9080',
    divBg:   light ? '#ac681fda' : '#e0d09a',
    divText: light ? '#e8dcc0'   : '#1a1200',
  };
  const body = { text: '#111111', label: '#666666', border: 'rgba(0,0,0,.13)', imgBg: 'rgba(0,0,0,.02)' };

  return (
    <div style={{ width:`${CARD_W}px`, minHeight:`${CARD_H}px`, background:'#ffffff', borderRadius:'10px', fontFamily:"'Lexend','Segoe UI',sans-serif", boxSizing:'border-box', boxShadow:'0 3px 20px rgba(0,0,0,.22)', overflow:'hidden' }}>
      <div style={{ background: `linear-gradient(${d.cardGradient.angle}deg, ${d.cardGradient.from}, ${d.cardGradient.to})`, borderRadius:'10px 10px 0 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'12px 20px', gap:'10px' }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'30px', textAlign:'center', fontWeight:800, color:c.text, letterSpacing:'.5px', lineHeight:1.5 }}>{(d.shopName||'YOUR SHOP NAME').toUpperCase()}</div>
            <div style={{ fontSize:'15px', textAlign:'center', color:c.sub, marginTop:'3px', lineHeight:1.0 }}>{(d.shopAddress||'Shop Address').toUpperCase()}</div>
            {d.shopInfo && <div style={{ fontSize:'9.5px', textAlign:'center', color:c.label, marginTop:'2px', lineHeight:1.9 }}>{d.shopInfo}</div>}
          </div>
          {d.qrContent && (
            <div style={{ flexShrink:0, width:'100px', height:'100px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ background:'#ffffff', padding:'5px', borderRadius:'1px', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:0 }}>
                <QRCodeCanvas content={d.qrContent} size={90} />
              </div>
            </div>
          )}
        </div>
        <div style={{ background:c.divBg, color:c.divText, textAlign:'center', padding:'4.5px 16px', fontSize:'10px', fontWeight:800, letterSpacing:'2.8px' }}>
          XRF GOLD TESTING CERTIFICATE (ONLY FOR SKIN)
        </div>
      </div>

      <div style={{ display:'flex', borderBottom:`1px solid ${body.border}`, minHeight:'240px' }}>
        <div style={{ width:'50%', flexShrink:0, display:'flex', flexDirection:'column' }}>
          <div style={{ flex:1, padding:'10px 16px', display:'flex', flexDirection:'column', justifyContent:'center', gap:'2px' }}>
            {[['Customer Name',d.customerName,true],['Certificate No',d.certNo,false],['Date',d.date,false],['Product Name',d.productName,true],['Product Weight',d.productWeight?d.productWeight+' g':'',false],['Product Karat',d.productKarat?d.productKarat+' K':'',false]].map(([lbl,val,caps])=>(
              <div key={lbl} style={{ display:'flex', alignItems:'center', gap:'8px', minHeight:'20px', padding:'4px 0' }}>
                <span style={{ fontSize:'10px', color:body.label, fontWeight:600, width:'105px', flexShrink:0, lineHeight:1.6, textTransform:'uppercase', letterSpacing:'.4px' }}>{lbl}</span>
                <span style={{ fontSize:'12px', color:body.text, fontWeight:700, textTransform:caps?'uppercase':'none', flex:1, lineHeight:1.6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'.2px' }}>{val||'—'}</span>
              </div>
            ))}
          </div>
          <div style={{ flex:1, padding:'10px 16px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{ fontSize:'10px', fontWeight:800, color:'#cc0000', textAlign:'center', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:'8px', paddingBottom:'5px', paddingTop:'5px', borderTop:`2px solid ${body.border}`, borderBottom:`2px solid ${body.border}` }}>Metal Report</div>
            <div style={{ display:'flex', gap:'8px', marginBottom:'5px' }}>
              <span style={{ fontSize:'12px', color:body.text, fontWeight:700, flex:1 }}><span style={{ color:body.label, fontWeight:600 }}>Gold : </span>{d.gold?`${d.gold}%`:'—'}</span>
              <span style={{ fontSize:'12px', color:body.text, fontWeight:700, flex:1 }}><span style={{ color:body.label, fontWeight:600 }}>Copper : </span>{d.copper?`${d.copper}%`:'—'}</span>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <span style={{ fontSize:'12px', color:body.text, fontWeight:700, flex:1 }}><span style={{ color:body.label, fontWeight:600 }}>Silver : </span>{d.silver?`${d.silver}%`:'—'}</span>
              <span style={{ fontSize:'12px', color:body.text, fontWeight:700, flex:1 }}><span style={{ color:body.label, fontWeight:600 }}>Others : </span>{d.others?`${d.others}%`:'—'}</span>
            </div>
          </div>
        </div>
        <div style={{ width:'50%', flexShrink:0, padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'center', background:body.imgBg, borderLeft:`1px solid ${body.border}`, position:'relative', overflow:'hidden' }}>
          {d.productImage ? (
            <img src={d.productImage} alt="Product" style={{ maxWidth:'100%', maxHeight:'190px', objectFit:'contain', borderRadius:'8px' }} />
          ) : (
            <div style={{ width:'100%', height:'190px', border:`1.5px dashed ${body.border}`, borderRadius:'10px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'8px' }}>
              <span style={{ fontSize:'40px', opacity:.3 }}>📷</span>
              <span style={{ fontSize:'9.5px', color:body.label, fontWeight:500 }}>Product Photo</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ borderTop:`1px solid ${body.border}`, padding:'5px 16px 1px', borderRadius:'0 0 10px 10px' }}>
        <div style={{ fontSize:'11px', color:body.label, textAlign:'center', fontStyle:'italic' }}>
          Note: max. deviation +/- 0.50% as per machine specification
        </div>
      </div>
    </div>
  );
}

/* ─── Card Back Preview ──────────────────────────────────────────────────── */
const DEFAULT_CONDITIONS = [
  'The Jewellery Article is tested as per the instructions of the customers.',
  'We are not responsible for other side/portion of purity of Jewellery "which are not tested by laser point by our company". The testing report is limited only at that point of Jewellery/Melted metals/Article which has been tested.',
  'Plated Jewellery/melted metals/Article will show fluctuating reading.',
  'Maximum Diff.: +/-0.50%',
];

function CardBack({ d }) {
  const light = isLight(d.cardGradient.from);
  const c = {
    text:    light ? '#111111' : '#ece5d8',
    sub:     light ? '#555555' : '#9a9080',
    border:  light ? 'rgba(0,0,0,.13)' : 'rgba(255,255,255,.10)',
    divBg:   light ? '#d49e63'          : '#e0d09a',
    divText: light ? '#e8dcc0'          : '#1a1200',
    wmColor: light ? 'rgba(0,0,0,.04)' : 'rgba(255,255,255,.045)',
    numBg:   light ? '#2a2015'          : '#d4af37',
    numText: light ? '#e8dcc0'          : '#1a1000',
    shadow:  light ? '0 3px 12px rgba(0,0,0,.12)' : '0 3px 20px rgba(0,0,0,.55)',
  };
  return (
    <div style={{ width:`${CARD_W}px`, minHeight:`${CARD_H}px`, background:`linear-gradient(${d.cardGradient.angle}deg, ${d.cardGradient.from}, ${d.cardGradient.to})`, borderRadius:'10px', fontFamily:"'Lexend','Segoe UI',sans-serif", overflow:'hidden', boxSizing:'border-box', boxShadow:c.shadow, position:'relative', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none', userSelect:'none', zIndex:0 }}>
        <div style={{ fontSize:'58px', fontWeight:900, color:c.wmColor, transform:'rotate(-28deg)', textAlign:'center', lineHeight:1.1, whiteSpace:'nowrap', letterSpacing:'1px' }}>{(d.shopName||'GOLDSYNC').toUpperCase()}</div>
      </div>
      <div style={{ background:c.divBg, color:c.divText, textAlign:'center', padding:'6px 16px', fontSize:'10px', fontWeight:800, letterSpacing:'2.5px', position:'relative', zIndex:1 }}>TERMS &amp; CONDITIONS</div>
      <div style={{ flex:1, padding:'18px 22px 16px', position:'relative', zIndex:1 }}>
        {(d.conditions||[]).map((point,i)=>(
          <div key={i} style={{ display:'flex', gap:'11px', marginBottom:i<(d.conditions.length-1)?'11px':0, alignItems:'flex-start' }}>
            <div style={{ flexShrink:0, width:'20px', height:'20px', background:c.numBg, color:c.numText, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:800, lineHeight:1 }}>{i+1}</div>
            <div style={{ fontSize:'12px', color:c.text, lineHeight:1.55, fontWeight:400 }}>{point}</div>
          </div>
        ))}
      </div>
      {d.imageOnBack && d.productImage && (
        <div style={{ position:'absolute', bottom:'34px', right:'16px', zIndex:2, width:'200px', height:'150px', borderRadius:'6px', overflow:'hidden', border:`1.5px solid ${c.border}`, background:'#fff' }}>
          <img src={d.productImage} alt="Product" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
        </div>
      )}
      <div style={{ borderTop:`1px solid ${c.border}`, padding:'6px 16px 8px', textAlign:'center', position:'relative', zIndex:1 }}>
        <div style={{ fontSize:'8px', color:c.sub, letterSpacing:'.8px' }}>{(d.shopName||'YOUR SHOP NAME').toUpperCase()}{d.shopAddress?` · ${d.shopAddress}`:''}</div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function XRFCertificate() {
  useEffect(() => { injectStyles(); }, []);

  const [view,        setView]        = useState('front');
  const [downloading, setDl]          = useState(false);
  const stageRef   = useRef(null);
  const scalerRef  = useRef(null);

  useEffect(() => {
    const stage  = stageRef.current;
    const scaler = scalerRef.current;
    if (!stage || !scaler) return;
    const update = () => {
      const available = stage.clientWidth - 24; // subtract padding
      const scale = Math.min(1, available / CARD_W);
      scaler.style.transform = `scale(${scale})`;
      scaler.style.marginBottom = `${(CARD_H * scale) - CARD_H}px`;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const [shopName,    setShopName]    = useState('');
  const [shopAddress, setShopAddress] = useState('Pathar Pratima');
  const [shopInfo,    setShopInfo]    = useState('');

  const [customerName, setCustomerName] = useState('');
  const [certNo,       setCertNo]       = useState(genCertNo);
  const [date,         setDate]         = useState(todayFormatted);
  const [productName,  setProductName]  = useState('');
  const [productWt,    setProductWt]    = useState('');
  const [productKarat, setProductKarat] = useState('');

  const [gold,   setGold]   = useState('');
  const [silver, setSilver] = useState('');
  const [copper, setCopper] = useState('');
  const [others, setOthers] = useState('');

  const [cardGradient,   setCardGradient]   = useState(() => GRADIENT_PRESETS[0]);
  const [productImage,   setProductImage]   = useState(null);
  const [imageOnBack,    setImageOnBack]    = useState(false);
  const [conditionsText, setConditionsText] = useState(() => DEFAULT_CONDITIONS.join('\n'));

  useEffect(() => {
    const karat = parseFloat(productKarat);
    if (!isNaN(karat) && karat > 0) setGold(String(Math.round((karat / 24) * 100 * 100) / 100));
  }, [productKarat]);

  const d = {
    shopName, shopAddress, shopInfo,
    customerName, certNo, date,
    productName, productWeight: productWt, productKarat,
    gold, silver, copper, others,
    cardGradient, productImage, imageOnBack,
    qrContent: (() => {
      const lines = [
        shopName     && shopName.toUpperCase(),
        customerName && customerName.toUpperCase(),
        certNo,
        date,
        productName,
        productWt    && `${productWt}g`,
        productKarat && `${productKarat}K`,
      ].filter(Boolean);
      return lines.join(' | ') || shopName || 'Your Shop Name';
    })(),
    conditions: conditionsText.split('\n').map(s => s.trim()).filter(Boolean),
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setProductImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleDownload = async (side) => {
    if (downloading) return;
    setDl(true);
    try {
      // Load Lexend font into the canvas context
      await document.fonts.load(`800 30px 'Lexend'`);
      await document.fonts.load(`400 10px 'Lexend'`);
      await downloadCard(side, d, shopName, certNo);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate image. Please try again.');
    }
    setDl(false);
  };

  return (
    <div className="xrf-wrap">
      <div className="xrf-page-header">
        <div>
          <div className="xrf-page-title">XRF Certificate Generator</div>
          <div className="xrf-page-sub">Offline · PVC Card · Custom Color · QR Code · PNG Export</div>
        </div>
        <div className="xrf-page-actions">
          <button className="xrf-btn xrf-btn-ghost xrf-btn-sm" onClick={() => handleDownload('front')} disabled={downloading}>
            {downloading ? '⌛' : '🖼'} PNG Front
          </button>
          <button className="xrf-btn xrf-btn-gold" onClick={() => handleDownload('back')} disabled={downloading}>
            {downloading ? '⌛ Working…' : '🖼 PNG Back'}
          </button>
        </div>
      </div>

      <div className="xrf-layout">
        {/* ── LEFT: Form ── */}
        <div>
          <div className="xrf-panel">
            <div className="xrf-panel-title">Certificate Information</div>
            <div className="xrf-field"><label className="xrf-label">Shop Name</label><input className="xrf-input" value={shopName} onChange={e=>setShopName(e.target.value)} /></div>
            <div className="xrf-field"><label className="xrf-label">Shop Address</label><input className="xrf-input" value={shopAddress} onChange={e=>setShopAddress(e.target.value)} /></div>
            <div className="xrf-field">
              <label className="xrf-label">Other Information <span style={{color:'var(--t5,#444)',fontWeight:400}}>(optional)</span></label>
              <input className="xrf-input" value={shopInfo} onChange={e=>setShopInfo(e.target.value)} placeholder="Phone / GSTIN / Website…" />
            </div>
            <hr className="xrf-divider" />
            <div className="xrf-field">
              <label className="xrf-label">Customer Name <span style={{color:'var(--t5,#444)',fontWeight:400,marginLeft:6,fontSize:'.67rem'}}>(printed in CAPITALS)</span></label>
              <input className="xrf-input" value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="xrf-row2">
              <div className="xrf-field">
                <label className="xrf-label">Certificate No <button className="xrf-gen-link" onClick={()=>setCertNo(genCertNo())}>↻ New</button></label>
                <input className="xrf-input" value={certNo} onChange={e=>setCertNo(e.target.value)} maxLength={10} />
              </div>
              <div className="xrf-field"><label className="xrf-label">Date (DD-MM-YYYY)</label><input className="xrf-input" value={date} onChange={e=>setDate(e.target.value)} /></div>
            </div>
            <hr className="xrf-divider" />
            <div className="xrf-row3">
              <div className="xrf-field"><label className="xrf-label">Product Name</label><input className="xrf-input" value={productName} onChange={e=>setProductName(e.target.value.toUpperCase())} placeholder="e.g. Gold Necklace" /></div>
              <div className="xrf-field"><label className="xrf-label">Product Weight</label><input className="xrf-input" value={productWt} onChange={e=>setProductWt(e.target.value)} placeholder="e.g. 12.50 g" /></div>
              <div className="xrf-field"><label className="xrf-label">Product Karat</label><input className="xrf-input" value={productKarat} onChange={e=>setProductKarat(e.target.value)} placeholder="e.g. 22" /></div>
            </div>
            <hr className="xrf-divider" />
            <div className="xrf-panel-title" style={{marginBottom:'10px'}}>Metal Report (%)</div>
            <div className="xrf-row2">
              <div className="xrf-field"><label className="xrf-label">Gold <span style={{color:'var(--t5,#444)',fontWeight:400,marginLeft:6,fontSize:'.57rem'}}>(auto from Karat)</span></label><input className="xrf-input" value={gold} onChange={e=>setGold(e.target.value)} placeholder="e.g. 91.60" /></div>
              <div className="xrf-field"><label className="xrf-label">Copper</label><input className="xrf-input" value={copper} onChange={e=>setCopper(e.target.value)} placeholder="e.g. 6.50" /></div>
            </div>
            <div className="xrf-row2">
              <div className="xrf-field"><label className="xrf-label">Silver</label><input className="xrf-input" value={silver} onChange={e=>setSilver(e.target.value)} placeholder="e.g. 1.20" /></div>
              <div className="xrf-field"><label className="xrf-label">Others</label><input className="xrf-input" value={others} onChange={e=>setOthers(e.target.value)} placeholder="e.g. 0.70" /></div>
            </div>
          </div>

          <div className="xrf-panel">
            <div className="xrf-panel-title">Card Appearance</div>
            <div className="xrf-label" style={{marginBottom:'8px'}}>Gradient Theme</div>
            <div className="xrf-color-presets">
              {GRADIENT_PRESETS.map(p=>(
                <div
                  key={p.name}
                  className={`xrf-color-swatch${cardGradient.name===p.name?' sel':''}`}
                  style={{background:`linear-gradient(${p.angle}deg, ${p.from}, ${p.to})`}}
                  title={p.name}
                  onClick={()=>setCardGradient(p)}
                />
              ))}
            </div>
            <div className="xrf-color-custom-row" style={{gap:'10px',flexWrap:'wrap'}}>
              <label className="xrf-label" style={{marginBottom:0,whiteSpace:'nowrap'}}>Custom from:</label>
              <input type="color" className="xrf-color-pick" value={cardGradient.from} onChange={e=>setCardGradient(g=>({...g, name:'Custom', from:e.target.value}))} />
              <label className="xrf-label" style={{marginBottom:0,whiteSpace:'nowrap'}}>to:</label>
              <input type="color" className="xrf-color-pick" value={cardGradient.to} onChange={e=>setCardGradient(g=>({...g, name:'Custom', to:e.target.value}))} />
            </div>
            <div style={{marginTop:'16px'}}>
              <div className="xrf-label">Product Image <span style={{color:'var(--t5,#444)',fontWeight:400}}>(optional)</span></div>
              <div className="xrf-img-zone">
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {productImage ? (
                  <>
                    <img src={productImage} alt="Product" />
                    <button className="xrf-img-rm" onClick={e=>{e.stopPropagation();setProductImage(null);}}>✕ Remove</button>
                  </>
                ) : (
                  <>
                    <div style={{fontSize:'24px',marginBottom:'5px',opacity:.6}}>📷</div>
                    <div style={{fontSize:'.78rem',color:'var(--t4,#666)'}}>Click to upload product image</div>
                    <div style={{fontSize:'.67rem',color:'var(--t5,#444)',marginTop:'3px'}}>PNG · JPG · WebP · 100% offline</div>
                  </>
                )}
              </div>
              {productImage && (
                <label style={{display:'flex',alignItems:'center',gap:'8px',marginTop:'10px',cursor:'pointer',fontSize:'.82rem',color:'var(--t2,#333)'}}>
                  <input type="checkbox" checked={imageOnBack} onChange={e=>setImageOnBack(e.target.checked)} style={{width:'15px',height:'15px',cursor:'pointer'}} />
                  Also show image on back side
                </label>
              )}
            </div>
          </div>

          <div className="xrf-panel">
            <div className="xrf-panel-title">Terms &amp; Conditions (Back Side)</div>
            <div className="xrf-field">
              <label className="xrf-label" style={{marginBottom:'6px'}}>One condition per line — shown numbered on the back</label>
              <textarea className="xrf-input" style={{minHeight:'130px',resize:'vertical',lineHeight:1.6}} value={conditionsText} onChange={e=>setConditionsText(e.target.value)} placeholder="Enter each condition on a new line…" />
            </div>
          </div>
        </div>

        {/* ── RIGHT: Preview ── */}
        <div className="xrf-preview-col">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'10px'}}>
            <div className="xrf-view-toggle">
              <button className={`xrf-vbtn ${view==='front'?'on':'off'}`} onClick={()=>setView('front')}>▣ Front Side</button>
              <button className={`xrf-vbtn ${view==='back'?'on':'off'}`} onClick={()=>setView('back')}>▣ Back Side</button>
            </div>
            <button className="xrf-btn xrf-btn-gold" onClick={()=>handleDownload(view)} disabled={downloading}>
              {downloading ? '⌛ Working…' : `🖼 Download PNG ${view==='front'?'Front':'Back'}`}
            </button>
          </div>

          <div className="xrf-card-stage" ref={stageRef}>
            <div className="xrf-card-scaler" ref={scalerRef}>
              {view === 'front' ? <CardFront d={d} /> : <CardBack d={d} />}
            </div>
          </div>

          <div className="xrf-tip">
            <strong>Tips:</strong>&nbsp; All data stays on your device — 100% offline. Downloads save as a crisp PNG (3× resolution). Standard PVC card (CR80): 85.6 × 54 mm. QR code encodes - Shop Name, Customer Name, Certificate No, Product Name, Karat and Gold Weight.
          </div>
        </div>
      </div>
    </div>
  );
}
