import React, { useState, useRef } from 'react';
import { AlertTriangle, Trash2, Users, Upload, Download, User, Smartphone, Search, X, FileText, FolderOpen, Folder, BarChart2, CheckCircle, Loader2, CalendarDays } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient.js';

// ============================================
// Inject component-specific keyframes
// ============================================
const injectCustomerKeyframes = () => {
  if (document.getElementById('customer-form-keyframes')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'customer-form-keyframes';
  styleEl.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes slideDown {
      from { opacity: 0; max-height: 0; transform: translateY(-8px); }
      to { opacity: 1; max-height: 4000px; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes bounceIn {
      0% { opacity: 0; transform: scale(0.3); }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes shakeX {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-4px); }
      40% { transform: translateX(4px); }
      60% { transform: translateX(-3px); }
      80% { transform: translateX(3px); }
    }
    @keyframes warningPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(248,113,113,0.15); }
      50% { box-shadow: 0 0 16px 4px rgba(248,113,113,0.08); }
    }

    .cust-fade-in { animation: fadeInUp 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
    .cust-scale-in { animation: scaleIn 0.3s cubic-bezier(0.4,0,0.2,1) forwards; }
    .cust-slide-down { animation: slideDown 0.45s cubic-bezier(0.4,0,0.2,1) forwards; overflow: hidden; }
    .cust-bounce-in { animation: bounceIn 0.5s cubic-bezier(0.4,0,0.2,1) forwards; }
    .cust-shake { animation: shakeX 0.45s ease; }

    .cust-row { animation: fadeInUp 0.3s ease forwards; opacity: 0; }
    .cust-row:nth-child(1) { animation-delay: 0s; }
    .cust-row:nth-child(2) { animation-delay: 0.03s; }
    .cust-row:nth-child(3) { animation-delay: 0.06s; }
    .cust-row:nth-child(4) { animation-delay: 0.09s; }
    .cust-row:nth-child(5) { animation-delay: 0.12s; }
    .cust-row:nth-child(6) { animation-delay: 0.15s; }
    .cust-row:nth-child(7) { animation-delay: 0.18s; }
    .cust-row:nth-child(8) { animation-delay: 0.21s; }
    .cust-row:nth-child(9) { animation-delay: 0.24s; }
    .cust-row:nth-child(10) { animation-delay: 0.27s; }

    .cust-stat-hover {
      transition: all 0.35s cubic-bezier(0.4,0,0.2,1) !important;
      cursor: pointer;
    }
    .cust-stat-hover:hover {
      border-color: rgba(212,175,55,0.22) !important;
      background: rgba(212,175,55,0.07) !important;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(212,175,55,0.08);
    }
    .cust-stat-hover:active {
      transform: translateY(0);
    }
    .cust-save-btn:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(212,175,55,0.2);
    }
    .cust-save-btn:not(:disabled):active {
      transform: translateY(0);
    }
    .upload-zone-hover {
      transition: all 0.35s cubic-bezier(0.4,0,0.2,1) !important;
    }
    .upload-zone-hover:hover {
      border-color: rgba(212,175,55,0.3) !important;
      background: rgba(212,175,55,0.04) !important;
      transform: translateY(-2px);
    }
    .download-option {
      transition: all 0.35s cubic-bezier(0.4,0,0.2,1) !important;
      cursor: pointer;
    }
    .download-option:hover {
      border-color: rgba(212,175,55,0.22) !important;
      background: rgba(212,175,55,0.04) !important;
      transform: translateY(-3px);
      box-shadow: 0 6px 24px rgba(0,0,0,0.12);
    }
    .cust-search-input:focus {
      border-color: rgba(212,175,55,0.3) !important;
      box-shadow: 0 0 0 3px rgba(212,175,55,0.06) !important;
    }
    .clear-btn-hover:hover {
      border-color: rgba(248,113,113,0.3) !important;
      color: var(--red, #f87171) !important;
      background: rgba(248,113,113,0.06) !important;
    }
    .delete-btn-danger {
      transition: all 0.3s ease !important;
    }
    .delete-btn-danger:not(:disabled):hover {
      background: rgba(248,113,113,0.12) !important;
      border-color: rgba(248,113,113,0.35) !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(248,113,113,0.12);
    }
    .delete-btn-danger:not(:disabled):active {
      transform: translateY(0);
    }
    .delete-row-btn {
      transition: all 0.25s ease !important;
      cursor: pointer;
    }
    .delete-row-btn:hover {
      background: rgba(248,113,113,0.12) !important;
      border-color: rgba(248,113,113,0.3) !important;
      color: var(--red, #f87171) !important;
      transform: scale(1.1);
    }
    .collapse-toggle-hover {
      transition: opacity 0.2s ease;
      cursor: pointer;
    }
    .collapse-toggle-hover:hover {
      opacity: 0.8;
    }
    .confirm-overlay {
      animation: fadeInUp 0.25s ease forwards;
    }

    @media (max-width: 600px) {
      .cust-stats-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      .download-grid {
        grid-template-columns: 1fr !important;
      }
      .delete-controls-row {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .delete-controls-row > * {
        width: 100% !important;
      }
    }
  `;
  document.head.appendChild(styleEl);
};

// ============================================
// Styles
// ============================================
const S = {
  // ── Section label ──
  sectionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.68rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1.3px',
    color: 'var(--text-muted)',
    marginBottom: '14px',
    marginTop: '8px',
  },
  sectionLine: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(90deg, var(--border-subtle, rgba(255,255,255,0.06)), transparent)',
  },

  // ── Input with icon ──
  inputWrap: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.8rem',
    opacity: 0.35,
    pointerEvents: 'none',
    zIndex: 1,
  },
  inputPadded: {
    paddingLeft: '36px',
  },

  // ── Upload zone ──
  uploadZone: {
    border: '2px dashed rgba(212,175,55,0.15)',
    borderRadius: '14px',
    padding: '28px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    background: 'rgba(212,175,55,0.02)',
  },
  uploadIcon: {
    fontSize: '2rem',
    marginBottom: '8px',
    opacity: 0.5,
    display: 'block',
  },
  uploadTitle: {
    fontSize: '0.88rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  uploadDesc: {
    fontSize: '0.72rem',
    color: 'var(--text-dim)',
    lineHeight: 1.5,
  },
  uploadHint: {
    fontSize: '0.64rem',
    color: 'var(--text-muted)',
    marginTop: '10px',
    padding: '4px 12px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '6px',
    display: 'inline-block',
    border: '1px solid rgba(255,255,255,0.04)',
  },

  // ── File info ──
  fileInfoCard: {
    background: 'linear-gradient(135deg, rgba(34,211,153,0.04) 0%, rgba(34,211,153,0.01) 100%)',
    border: '1px solid rgba(34,211,153,0.12)',
    borderRadius: '12px',
    padding: '12px 14px',
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  fileIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    background: 'rgba(34,211,153,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.95rem',
    flexShrink: 0,
  },
  fileDetails: { flex: 1, minWidth: '120px' },
  fileName: {
    fontSize: '0.82rem',
    fontWeight: 700,
    color: 'var(--green, #22d399)',
    wordBreak: 'break-all',
  },
  fileMeta: {
    fontSize: '0.68rem',
    color: 'var(--text-dim)',
    marginTop: '2px',
  },

  // ── Small buttons ──
  smallBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '0.72rem',
    padding: '5px 10px',
    borderRadius: '7px',
    transition: 'all 0.25s ease',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
  },

  // ── Progress bar ──
  progressWrap: { marginTop: '14px' },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  progressLabel: { fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-dim)' },
  progressPercent: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: 'var(--gold, #d4af37)',
    fontVariantNumeric: 'tabular-nums',
  },
  progressTrack: {
    width: '100%',
    height: '5px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.4s ease',
  },

  // ── Upload results ──
  uploadResults: {
    marginTop: '14px',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.78rem',
    padding: '3px 0',
  },

  // ── Download grid ──
  downloadGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginTop: '4px',
  },
  downloadOption: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
    borderRadius: '12px',
    padding: '16px 14px',
    textAlign: 'center',
  },
  downloadIcon: { fontSize: '1.5rem', marginBottom: '6px', display: 'block' },
  downloadTitle: { fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' },
  downloadDesc: { fontSize: '0.68rem', color: 'var(--text-dim)', lineHeight: 1.45 },

  // ── Badge ──
  badge: {
    background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.06))',
    color: 'var(--gold, #d4af37)',
    padding: '2px 10px',
    borderRadius: '100px',
    fontSize: '0.68rem',
    fontWeight: 700,
    border: '1px solid rgba(212,175,55,0.1)',
  },

  // ── Customer avatar ──
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '7px',
    background: 'linear-gradient(135deg, var(--gold-dark, #b8860b), var(--gold, #d4af37))',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.68rem',
    fontWeight: 800,
    color: '#1a1400',
    marginRight: '8px',
    verticalAlign: 'middle',
    boxShadow: '0 2px 6px rgba(212,175,55,0.15)',
  },

  // ── Row number ──
  rowNum: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    borderRadius: '6px',
    background: 'rgba(212,175,55,0.08)',
    color: 'var(--gold-dark, #b8860b)',
    fontSize: '0.65rem',
    fontWeight: 700,
  },

  // ── Delete row button ──
  deleteRowBtn: {
    background: 'none',
    border: '1px solid rgba(248,113,113,0.12)',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '0.72rem',
    padding: '4px 8px',
    borderRadius: '6px',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
  },

  // ── Empty state ──
  emptyState: { textAlign: 'center', padding: '40px 20px' },
  emptyIcon: { fontSize: '2.2rem', marginBottom: '10px', opacity: 0.25 },
  emptyTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '6px',
  },
  emptyDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-dim)',
    maxWidth: '320px',
    margin: '0 auto',
    lineHeight: 1.5,
  },

  // ── Search ──
  searchWrap: { position: 'relative', marginBottom: '14px' },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.8rem',
    opacity: 0.3,
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    paddingLeft: '36px',
    paddingRight: '36px',
    boxSizing: 'border-box',
  },
  searchClear: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: '4px',
    opacity: 0.5,
    fontFamily: 'inherit',
  },

  // ── Delete section ──
  deleteCard: {
    background: 'linear-gradient(135deg, rgba(248,113,113,0.03) 0%, rgba(248,113,113,0.01) 100%)',
    border: '1px solid rgba(248,113,113,0.1)',
    borderRadius: '14px',
    padding: '18px',
  },
  deleteHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px',
  },
  deleteIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    flexShrink: 0,
  },
  deleteTitle: {
    fontSize: '0.92rem',
    fontWeight: 700,
    color: 'var(--red, #f87171)',
    lineHeight: 1.3,
  },
  deleteSubtitle: {
    fontSize: '0.68rem',
    color: 'var(--text-dim)',
    marginTop: '2px',
  },
  deleteControlsRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '10px',
    flexWrap: 'wrap',
  },
  deleteDateInput: {
    flex: 1,
    minWidth: '180px',
  },
  deleteBtn: {
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.2)',
    color: 'var(--red, #f87171)',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: 700,
    padding: '10px 18px',
    borderRadius: '10px',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
  },
  deletePreview: {
    marginTop: '12px',
    padding: '10px 14px',
    borderRadius: '10px',
    background: 'rgba(248,113,113,0.04)',
    border: '1px solid rgba(248,113,113,0.1)',
    fontSize: '0.76rem',
    color: 'var(--text-dim)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  // ── Confirm dialog ──
  confirmOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--bg-overlay)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
  },
  confirmCard: {
    background: 'var(--bg-card)',
    border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: '18px',
    padding: '28px 24px',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    animation: 'warningPulse 2s ease infinite',
  },
  popupCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-md)',
    borderRadius: '18px',
    padding: '24px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: 'var(--shadow-xl)',
  },
  popupHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border-xs)',
  },
  confirmIcon: {
    fontSize: '2.5rem',
    marginBottom: '12px',
    display: 'block',
  },
  confirmTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--red, #f87171)',
    marginBottom: '8px',
  },
  confirmDesc: {
    fontSize: '0.82rem',
    color: 'var(--text-dim)',
    lineHeight: 1.55,
    marginBottom: '20px',
  },
  confirmCount: {
    display: 'inline-block',
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid rgba(248,113,113,0.2)',
    padding: '4px 14px',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--red, #f87171)',
    marginBottom: '18px',
  },
  confirmBtnRow: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  confirmCancelBtn: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 600,
    padding: '10px 24px',
    borderRadius: '10px',
    fontFamily: 'inherit',
    transition: 'all 0.25s ease',
  },
  confirmDeleteBtn: {
    background: 'linear-gradient(135deg, rgba(248,113,113,0.15), rgba(248,113,113,0.08))',
    border: '1px solid rgba(248,113,113,0.3)',
    color: 'var(--red, #f87171)',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: 700,
    padding: '10px 24px',
    borderRadius: '10px',
    fontFamily: 'inherit',
    transition: 'all 0.25s ease',
  },

  // ── Template link ──
  templateLink: {
    color: 'var(--gold, #d4af37)',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.72rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },

};

function CustomerForm({ customers, onCustomerAdded }) {
  React.useEffect(() => {
    injectCustomerKeyframes();
  }, []);

  // ── Add Customer ──
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Bulk Upload ──
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // ── Download ──
  const [showDownload, setShowDownload] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // ── Delete ──
  const [showDelete, setShowDelete] = useState(false);
  const [deleteDate, setDeleteDate] = useState('');
  const [deleteMode, setDeleteMode] = useState('before'); // 'before' | 'after' | 'on'
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { count, ids }
  const [deleteSingleConfirm, setDeleteSingleConfirm] = useState(null); // single customer

  // ── Customer List ──
  const [searchQuery, setSearchQuery] = useState('');
  const [listExpanded, setListExpanded] = useState(true);

  // ════════════════════════════════════════
  // Add Customer (original logic preserved)
  // ════════════════════════════════════════
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) { toast.error('❌ Customer name is required.'); return; }
    const trimmedMobile = mobile.trim();
    if (!trimmedMobile) { toast.error('❌ Mobile number is required.'); return; }
    if (!/^\d{10}$/.test(trimmedMobile)) { toast.error('❌ Mobile must be exactly 10 digits.'); return; }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('customers')
        .insert([{ name: trimmedName, mobile: trimmedMobile }])
        .select();
      if (error) throw error;
      toast.success(`✅ Customer "${trimmedName}" added!`);
      setName(''); setMobile('');
      if (onCustomerAdded) onCustomerAdded();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error(`❌ Failed: ${error.message}`);
    } finally { setSaving(false); }
  };

  // ════════════════════════════════════════
  // CSV Parsing
  // ════════════════════════════════════════
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    const nameIdx = headers.findIndex((h) => ['name', 'customer_name', 'customer name'].includes(h));
    const mobileIdx = headers.findIndex((h) => ['mobile', 'phone', 'mobile_number', 'mobile number', 'phone_number', 'phone number'].includes(h));
    if (nameIdx === -1 || mobileIdx === -1) throw new Error('CSV must have "name" and "mobile" columns.');
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/['"]/g, ''));
      const n = cols[nameIdx]?.trim();
      const m = cols[mobileIdx]?.trim().replace(/\D/g, '');
      if (n && m) records.push({ name: n, mobile: m });
    }
    return records;
  };

  const validateRecord = (rec) => {
    const errs = [];
    if (!rec.name) errs.push('Name is empty');
    if (!/^\d{10}$/.test(rec.mobile)) errs.push('Mobile must be 10 digits');
    return errs;
  };

  // ════════════════════════════════════════
  // File handling
  // ════════════════════════════════════════
  const handleFileSelect = (file) => {
    if (!file) return;
    const isCSV = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
    if (!isCSV) { toast.error('❌ Please select a CSV file.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('❌ File must be under 5MB.'); return; }
    setUploadFile(file); setUploadResults(null); setUploadProgress(0);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragActive(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  };

  // ════════════════════════════════════════
  // Bulk Upload
  // ════════════════════════════════════════
  const handleBulkUpload = async () => {
    if (!uploadFile) { toast.error('❌ Select a CSV file first.'); return; }
    setUploading(true); setUploadProgress(0); setUploadResults(null);
    try {
      const text = await uploadFile.text();
      const records = parseCSV(text);
      if (!records.length) { toast.error('❌ No valid records found.'); setUploading(false); return; }

      let successCount = 0, skipCount = 0, errorCount = 0;
      const errors = [];
      const existingMobiles = new Set(customers.map((c) => c.mobile));
      const validRecords = [], batchSize = 20;

      for (const rec of records) {
        const valErrs = validateRecord(rec);
        if (valErrs.length) { errorCount++; errors.push(`"${rec.name || '?'}": ${valErrs.join(', ')}`); continue; }
        if (existingMobiles.has(rec.mobile)) { skipCount++; continue; }
        validRecords.push(rec); existingMobiles.add(rec.mobile);
      }

      const totalBatches = Math.ceil(validRecords.length / batchSize);
      for (let i = 0; i < validRecords.length; i += batchSize) {
        const batch = validRecords.slice(i, i + batchSize);
        try {
          const { error } = await supabase.from('customers').insert(batch).select();
          if (error) throw error;
          successCount += batch.length;
        } catch (err) { errorCount += batch.length; errors.push(`Batch: ${err.message}`); }
        setUploadProgress(Math.round(((Math.floor(i / batchSize) + 1) / totalBatches) * 100));
        await new Promise((r) => setTimeout(r, 80));
      }

      setUploadProgress(100);
      setUploadResults({ total: records.length, success: successCount, skipped: skipCount, errors: errorCount, errorDetails: errors });
      if (successCount > 0) { toast.success(`✅ Uploaded ${successCount} customer(s)!`); if (onCustomerAdded) onCustomerAdded(); }
      if (skipCount > 0) toast.info(`ℹ️ Skipped ${skipCount} duplicate(s).`);
      if (errorCount > 0) toast.warn(`⚠️ ${errorCount} error(s).`);
    } catch (error) {
      toast.error(`❌ Upload failed: ${error.message}`);
    } finally { setUploading(false); }
  };

  // ════════════════════════════════════════
  // Download
  // ════════════════════════════════════════
  const downloadTemplate = () => {
    const blob = new Blob(['name,mobile\nJohn Doe,9876543210\nJane Smith,8765432109\n'], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'customer_template.csv';
    link.click(); URL.revokeObjectURL(link.href);
    toast.success('✅ Template downloaded!');
  };

  const downloadCustomerData = (format = 'csv') => {
    if (!customers.length) { toast.error('❌ No customers to download.'); return; }
    setDownloading(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      if (format === 'csv') {
        const csv = 'Name,Mobile,Date Added\n' + customers.map((c) => `"${c.name}","${c.mobile}","${formatDate(c.created_at)}"`).join('\n');
        downloadBlob(csv, `customers_${dateStr}.csv`, 'text/csv');
        toast.success(`✅ Downloaded ${customers.length} customers as CSV!`);
      } else {
        const json = JSON.stringify(customers.map((c) => ({ name: c.name, mobile: c.mobile, date_added: formatDate(c.created_at) })), null, 2);
        downloadBlob(json, `customers_${dateStr}.json`, 'application/json');
        toast.success(`✅ Downloaded ${customers.length} customers as JSON!`);
      }
    } catch (err) { toast.error(`❌ Download failed: ${err.message}`); }
    finally { setDownloading(false); }
  };

  const downloadBlob = (content, filename, type) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click(); URL.revokeObjectURL(link.href);
  };

  // ════════════════════════════════════════
  // Delete by date
  // ════════════════════════════════════════
  const getCustomersToDelete = () => {
    if (!deleteDate) return [];
    const targetDate = new Date(deleteDate);
    targetDate.setHours(0, 0, 0, 0);

    return customers.filter((c) => {
      const cDate = new Date(c.created_at);
      cDate.setHours(0, 0, 0, 0);
      if (deleteMode === 'before') return cDate < targetDate;
      if (deleteMode === 'after') return cDate > targetDate;
      if (deleteMode === 'on') return cDate.getTime() === targetDate.getTime();
      return false;
    });
  };

  const handleDeleteByDate = () => {
    if (!deleteDate) { toast.error('❌ Please select a date.'); return; }
    const toDelete = getCustomersToDelete();
    if (!toDelete.length) { toast.info('ℹ️ No customers match this criteria.'); return; }
    setConfirmDelete({ count: toDelete.length, ids: toDelete.map((c) => c.id), names: toDelete.slice(0, 5).map((c) => c.name) });
  };

  const executeDeleteByDate = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const batchSize = 50;
      for (let i = 0; i < confirmDelete.ids.length; i += batchSize) {
        const batch = confirmDelete.ids.slice(i, i + batchSize);
        const { error } = await supabase.from('customers').delete().in('id', batch);
        if (error) throw error;
      }
      toast.success(`✅ Deleted ${confirmDelete.count} customer(s)!`);
      setConfirmDelete(null); setDeleteDate('');
      if (onCustomerAdded) onCustomerAdded();
    } catch (error) {
      toast.error(`❌ Delete failed: ${error.message}`);
    } finally { setDeleting(false); }
  };

  const handleDeleteSingle = async () => {
    if (!deleteSingleConfirm) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('customers').delete().eq('id', deleteSingleConfirm.id);
      if (error) throw error;
      toast.success(`✅ Deleted "${deleteSingleConfirm.name}".`);
      setDeleteSingleConfirm(null);
      if (onCustomerAdded) onCustomerAdded();
    } catch (error) {
      toast.error(`❌ Failed: ${error.message}`);
    } finally { setDeleting(false); }
  };

  // ════════════════════════════════════════
  // Helpers
  // ════════════════════════════════════════
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return c.name.toLowerCase().includes(q) || c.mobile.includes(q);
  });

  const deleteCandidates = getCustomersToDelete();
  const deleteModeLabels = { before: 'Added before', after: 'Added after', on: 'Added on' };

  // ════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════
  return (
    <div className="tab-content">
      {/* ── Confirmation Modal: Bulk Delete ── */}
      {confirmDelete && (
        <div style={S.confirmOverlay} className="confirm-overlay" onClick={() => !deleting && setConfirmDelete(null)}>
          <div style={S.confirmCard} className="cust-scale-in" onClick={(e) => e.stopPropagation()}>
            <span style={S.confirmIcon}><AlertTriangle size={28} /></span>
            <div style={S.confirmTitle}>Confirm Deletion</div>
            <div style={S.confirmDesc}>
              This will permanently delete customers {deleteModeLabels[deleteMode].toLowerCase()}{' '}
              <strong>{formatDate(deleteDate + 'T00:00:00')}</strong>. This action cannot be undone.
            </div>
            <div style={S.confirmCount}>{confirmDelete.count} customer{confirmDelete.count !== 1 ? 's' : ''}</div>
            {confirmDelete.names.length > 0 && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '16px', lineHeight: 1.6 }}>
                Including: {confirmDelete.names.join(', ')}
                {confirmDelete.count > 5 && ` + ${confirmDelete.count - 5} more`}
              </div>
            )}
            <div style={S.confirmBtnRow}>
              <button style={S.confirmCancelBtn} onClick={() => setConfirmDelete(null)} disabled={deleting}>Cancel</button>
              <button style={S.confirmDeleteBtn} className="delete-btn-danger" onClick={executeDeleteByDate} disabled={deleting}>
                {deleting ? <><Loader2 size={14} style={{ display:'inline-block', animation:'spin 1s linear infinite' }} /> Deleting...</> : <><Trash2 size={14} /> Delete {confirmDelete.count}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal: Single Delete ── */}
      {deleteSingleConfirm && (
        <div style={S.confirmOverlay} className="confirm-overlay" onClick={() => !deleting && setDeleteSingleConfirm(null)}>
          <div style={S.confirmCard} className="cust-scale-in" onClick={(e) => e.stopPropagation()}>
            <span style={S.confirmIcon}><Trash2 size={28} /></span>
            <div style={S.confirmTitle}>Delete Customer?</div>
            <div style={S.confirmDesc}>
              Are you sure you want to delete <strong>{deleteSingleConfirm.name}</strong> ({deleteSingleConfirm.mobile})? This cannot be undone.
            </div>
            <div style={S.confirmBtnRow}>
              <button style={S.confirmCancelBtn} onClick={() => setDeleteSingleConfirm(null)} disabled={deleting}>Cancel</button>
              <button style={S.confirmDeleteBtn} className="delete-btn-danger" onClick={handleDeleteSingle} disabled={deleting}>
                {deleting ? <><Loader2 size={14} style={{ display:'inline-block', animation:'spin 1s linear infinite' }} /> Deleting...</> : <><Trash2 size={14} /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Popup Modal: Bulk Upload ── */}
      {showUpload && (
        <div style={S.confirmOverlay} className="confirm-overlay" onClick={() => { setShowUpload(false); setUploadFile(null); setUploadResults(null); }}>
          <div style={S.popupCard} className="cust-scale-in" onClick={(e) => e.stopPropagation()}>
            <div style={S.popupHeader}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <Upload size={15} style={{ color:'var(--green,#4ade80)' }} />
                <span style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--green,#4ade80)' }}>Bulk Upload</span>
                <span style={{ fontSize:'0.68rem', color:'var(--t4)' }}>— import from CSV</span>
              </div>
              <button style={S.smallBtn} onClick={() => { setShowUpload(false); setUploadFile(null); setUploadResults(null); }}><X size={12} /> Close</button>
            </div>

            <div style={{ ...S.uploadZone, ...(isDragActive ? { borderColor:'rgba(34,211,153,0.4)', background:'rgba(34,211,153,0.06)' } : {}) }}
              className="upload-zone-hover"
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" accept=".csv" style={{ display:'none' }}
                onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])} />
              <span style={S.uploadIcon}>{isDragActive ? <FolderOpen size={32} /> : <Folder size={32} />}</span>
              <div style={S.uploadTitle}>{isDragActive ? 'Drop here!' : 'Drag & drop CSV'}</div>
              <div style={S.uploadDesc}>Or click to browse · Max 5MB</div>
              <div style={S.uploadHint}>Columns: <strong>name</strong>, <strong>mobile</strong></div>
            </div>

            <div style={{ marginTop:'10px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'6px' }}>
              <span style={{ ...S.templateLink, display:'inline-flex', alignItems:'center', gap:'5px' }} onClick={downloadTemplate} role="button" tabIndex={0}><FileText size={13} /> Download Template</span>
              <span style={{ fontSize:'0.64rem', color:'var(--t5)' }}>Max 500 rows</span>
            </div>

            {uploadFile && (
              <div style={S.fileInfoCard} className="cust-scale-in">
                <div style={S.fileIcon}><FileText size={20} /></div>
                <div style={S.fileDetails}>
                  <div style={S.fileName}>{uploadFile.name}</div>
                  <div style={S.fileMeta}>{(uploadFile.size / 1024).toFixed(1)} KB</div>
                </div>
                <button style={S.smallBtn} className="clear-btn-hover"
                  onClick={(e) => { e.stopPropagation(); setUploadFile(null); setUploadResults(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                  <X size={12} /> Remove
                </button>
              </div>
            )}

            {uploading && (
              <div style={S.progressWrap} className="cust-fade-in">
                <div style={S.progressHeader}>
                  <span style={S.progressLabel}>Uploading...</span>
                  <span style={S.progressPercent}>{uploadProgress}%</span>
                </div>
                <div style={S.progressTrack}>
                  <div style={{ ...S.progressFill, width:`${uploadProgress}%`,
                    background: uploadProgress === 100 ? 'linear-gradient(90deg,var(--green),#34d7a0)' : 'linear-gradient(90deg,var(--gold-dk),var(--gold))' }} />
                </div>
              </div>
            )}

            {uploadResults && (
              <div style={{ ...S.uploadResults,
                borderColor: uploadResults.errors > 0 ? 'rgba(248,113,113,0.15)' : 'rgba(34,211,153,0.15)',
                background: uploadResults.errors > 0 ? 'rgba(248,113,113,0.03)' : 'rgba(34,211,153,0.03)' }} className="cust-scale-in">
                <div style={{ ...S.sectionLabel, marginTop:0 }}><span>Summary</span><div style={S.sectionLine} /></div>
                <div style={S.resultItem}><BarChart2 size={13} /><span>Total: <strong>{uploadResults.total}</strong></span></div>
                <div style={S.resultItem}><CheckCircle size={13} style={{ color:'var(--green)' }} /><span style={{ color:'var(--green)' }}>Added: <strong>{uploadResults.success}</strong></span></div>
                {uploadResults.skipped > 0 && <div style={S.resultItem}><span style={{ color:'var(--orange)' }}>Skipped: <strong>{uploadResults.skipped}</strong></span></div>}
                {uploadResults.errors > 0 && (
                  <>
                    <div style={S.resultItem}><AlertTriangle size={13} style={{ color:'var(--red)' }} /><span style={{ color:'var(--red)' }}>Errors: <strong>{uploadResults.errors}</strong></span></div>
                    {uploadResults.errorDetails.length > 0 && (
                      <div style={{ marginTop:'8px', padding:'8px 10px', background:'rgba(248,113,113,0.04)', borderRadius:'6px', fontSize:'0.68rem', color:'var(--t4)', maxHeight:'100px', overflowY:'auto' }}>
                        {uploadResults.errorDetails.map((err, i) => <div key={i}>• {err}</div>)}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div style={{ marginTop:'14px', textAlign:'center' }}>
              <button type="button" className="btn btn-save cust-save-btn" disabled={!uploadFile || uploading} onClick={handleBulkUpload}>
                {uploading ? <><Loader2 size={14} style={{ display:'inline-block', animation:'spin 1s linear infinite' }} /> Uploading...</> : <><Upload size={14} /> Upload CSV</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Popup Modal: Download ── */}
      {showDownload && (
        <div style={S.confirmOverlay} className="confirm-overlay" onClick={() => setShowDownload(false)}>
          <div style={S.popupCard} className="cust-scale-in" onClick={(e) => e.stopPropagation()}>
            <div style={S.popupHeader}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <Download size={15} style={{ color:'var(--blue,#60a5fa)' }} />
                <span style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--blue,#60a5fa)' }}>Export Data</span>
                <span style={{ fontSize:'0.68rem', color:'var(--t4)' }}>— {customers.length} customer{customers.length !== 1 ? 's' : ''}</span>
              </div>
              <button style={S.smallBtn} onClick={() => setShowDownload(false)}><X size={12} /> Close</button>
            </div>
            <div style={S.downloadGrid} className="download-grid">
              <div style={{ ...S.downloadOption, borderColor:'rgba(34,211,153,0.12)', opacity: downloading ? 0.5 : 1, pointerEvents: downloading ? 'none' : 'auto' }}
                className="download-option" onClick={() => downloadCustomerData('csv')} role="button" tabIndex={0}>
                <span style={S.downloadIcon}><BarChart2 size={24} /></span>
                <div style={{ ...S.downloadTitle, color:'var(--green)' }}>{downloading ? 'Downloading...' : 'CSV'}</div>
                <div style={S.downloadDesc}>Excel &amp; Google Sheets compatible</div>
              </div>
              <div style={{ ...S.downloadOption, borderColor:'rgba(96,165,250,0.12)', opacity: downloading ? 0.5 : 1, pointerEvents: downloading ? 'none' : 'auto' }}
                className="download-option" onClick={() => downloadCustomerData('json')} role="button" tabIndex={0}>
                <span style={S.downloadIcon}><FileText size={24} /></span>
                <div style={{ ...S.downloadTitle, color:'var(--blue)' }}>{downloading ? 'Downloading...' : 'JSON'}</div>
                <div style={S.downloadDesc}>Structured data for developers</div>
              </div>
            </div>
            <div style={{ marginTop:'10px', fontSize:'0.68rem', color:'var(--t4)', textAlign:'center' }}>
              Includes: Name · Mobile · Date Added
            </div>
          </div>
        </div>
      )}

      {/* ── Popup Modal: Delete by Date ── */}
      {showDelete && (
        <div style={S.confirmOverlay} className="confirm-overlay" onClick={() => setShowDelete(false)}>
          <div style={S.popupCard} className="cust-scale-in" onClick={(e) => e.stopPropagation()}>
            <div style={S.popupHeader}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <Trash2 size={15} style={{ color:'var(--red,#f87171)' }} />
                <span style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--red,#f87171)' }}>Delete by Date</span>
                <span style={{ fontSize:'0.68rem', color:'var(--t4)' }}>— remove by join date</span>
              </div>
              <button style={S.smallBtn} onClick={() => setShowDelete(false)}><X size={12} /> Close</button>
            </div>

            <div style={{ display:'flex', gap:'6px', marginBottom:'14px', flexWrap:'wrap' }}>
              {['before', 'after', 'on'].map((mode) => (
                <button key={mode}
                  style={{
                    ...S.smallBtn,
                    background: deleteMode === mode ? 'rgba(248,113,113,0.1)' : 'none',
                    borderColor: deleteMode === mode ? 'rgba(248,113,113,0.25)' : 'rgba(255,255,255,0.08)',
                    color: deleteMode === mode ? 'var(--red,#f87171)' : 'var(--t4)',
                    fontWeight: deleteMode === mode ? 700 : 500,
                  }}
                  onClick={() => setDeleteMode(mode)}>
                  {mode === 'before' && '◀ Before'}
                  {mode === 'after' && 'After ▶'}
                  {mode === 'on' && '● On Date'}
                </button>
              ))}
            </div>

            <div style={S.deleteControlsRow} className="delete-controls-row">
              <div style={S.deleteDateInput}>
                <label className="form-label" style={{ fontSize:'0.7rem', marginBottom:'6px', display:'block' }}>Select Date</label>
                <div style={S.inputWrap}>
                  <span style={S.inputIcon}><CalendarDays size={14} /></span>
                  <input type="date" className="form-input" style={{ ...S.inputPadded, colorScheme:'dark' }}
                    value={deleteDate} onChange={(e) => setDeleteDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <button style={{ ...S.deleteBtn, opacity: !deleteDate ? 0.5 : 1 }} className="delete-btn-danger" disabled={!deleteDate} onClick={handleDeleteByDate}>
                <Trash2 size={14} /> Find &amp; Delete
              </button>
            </div>

            {deleteDate && (
              <div style={S.deletePreview} className="cust-fade-in">
                <span>{deleteCandidates.length > 0 ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}</span>
                <span>
                  {deleteCandidates.length > 0 ? (
                    <><strong style={{ color:'var(--red,#f87171)' }}>{deleteCandidates.length}</strong> customer{deleteCandidates.length !== 1 ? 's' : ''}{' '}
                    {deleteModeLabels[deleteMode].toLowerCase()} <strong>{formatDate(deleteDate + 'T00:00:00')}</strong> will be deleted</>
                  ) : <>No customers match this criteria</>}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════
          1. Add Customer Card
          ═══════════════════════════════════ */}
      <div className="card cust-fade-in">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', paddingBottom:'12px', borderBottom:'1px solid var(--border-xs)', flexWrap:'wrap', gap:'10px' }}>
          <h2 className="card-title" style={{ margin:0, padding:0, border:'none' }}>
            <User size={18} />
            Add Customer
          </h2>
          {/* Action buttons: Upload | Download | Delete */}
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            <button
              onClick={() => { setShowUpload(!showUpload); setShowDownload(false); setShowDelete(false); }}
              style={{
                ...S.smallBtn,
                borderColor: showUpload ? 'rgba(34,211,153,0.35)' : undefined,
                color: showUpload ? 'var(--green,#4ade80)' : undefined,
                background: showUpload ? 'rgba(34,211,153,0.07)' : undefined,
              }}>
              <Upload size={12} /> Upload
            </button>
            <button
              onClick={() => { setShowDownload(!showDownload); setShowUpload(false); setShowDelete(false); }}
              style={{
                ...S.smallBtn,
                borderColor: showDownload ? 'rgba(96,165,250,0.35)' : undefined,
                color: showDownload ? 'var(--blue,#60a5fa)' : undefined,
                background: showDownload ? 'rgba(96,165,250,0.07)' : undefined,
              }}>
              <Download size={12} /> Download
            </button>
            <button
              onClick={() => { setShowDelete(!showDelete); setShowUpload(false); setShowDownload(false); }}
              style={{
                ...S.smallBtn,
                borderColor: showDelete ? 'rgba(248,113,113,0.35)' : undefined,
                color: showDelete ? 'var(--red,#f87171)' : undefined,
                background: showDelete ? 'rgba(248,113,113,0.07)' : undefined,
              }}>
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label" htmlFor="customer-name">Customer Name</label>
            <div style={S.inputWrap}>
              <span style={S.inputIcon}><User size={14} /></span>
              <input id="customer-name" type="text" className="form-input" style={{ ...S.inputPadded, textTransform: 'uppercase' }}
                placeholder="Enter customer name" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} disabled={saving} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="customer-mobile">Mobile Number</label>
            <div style={S.inputWrap}>
              <span style={S.inputIcon}><Smartphone size={14} /></span>
              <input id="customer-mobile" type="text" className="form-input" style={S.inputPadded}
                placeholder="10-digit mobile number" value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10} disabled={saving} />
            </div>
            {mobile.length > 0 && mobile.length < 10 && (
              <span style={{ fontSize: '0.66rem', color: 'var(--orange)', marginTop: '4px', display: 'block' }}>
                {10 - mobile.length} more digit{10 - mobile.length !== 1 ? 's' : ''} needed
              </span>
            )}
            {mobile.length === 10 && (
              <span style={{ fontSize: '0.66rem', color: 'var(--green)', marginTop: '4px', display: 'block' }} className="cust-bounce-in">
                ✓ Valid mobile
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-save cust-save-btn" disabled={saving}>
            {saving ? <><Loader2 size={14} style={{ display:'inline-block', animation:'spin 1s linear infinite' }} /> Saving...</> : <><User size={14} /> Save Customer</>}
          </button>
        </form>
      </div>

      {/* ═══════════════════════════════════
          2. Customers List Card
          ═══════════════════════════════════ */}
      <div className="card cust-fade-in" style={{ animationDelay: '0.08s' }}>
        {/* ── Card title row ── */}
        <h2 className="card-title">
          <Users size={18} />
          Customers ({customers.length})
        </h2>


        {/* ── Search ── */}
        {customers.length > 3 && (
          <div style={S.searchWrap}>
            <span style={S.searchIcon}><Search size={14} /></span>
            <input type="text" className="form-input cust-search-input" style={S.searchInput}
              placeholder="Search name or mobile..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {searchQuery && (
              <button style={S.searchClear} onClick={() => setSearchQuery('')}><X size={12} /></button>
            )}
          </div>
        )}

        {/* ── Table / Empty state ── */}
        {customers.length === 0 ? (
          <div style={S.emptyState} className="cust-fade-in">
            <div style={S.emptyIcon}><User size={36} /></div>
            <div style={S.emptyTitle}>No Customers Yet</div>
            <div style={S.emptyDesc}>Add your first customer above or bulk upload via CSV.</div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={S.emptyState}>
            <div style={S.emptyIcon}><Search size={32} /></div>
            <div style={S.emptyTitle}>No Matches</div>
            <div style={S.emptyDesc}>No customers match "{searchQuery}".</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Date Added</th>
                  <th style={{ width:'50px', textAlign:'center' }}>Del</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) => (
                  <tr key={customer.id} className="cust-row">
                    <td><span style={S.rowNum}>{index + 1}</span></td>
                    <td className="name-cell">
                      <span style={S.avatar}>{customer.name.charAt(0).toUpperCase()}</span>
                      {customer.name}
                    </td>
                    <td>{customer.mobile}</td>
                    <td>{formatDate(customer.created_at)}</td>
                    <td style={{ textAlign:'center' }}>
                      <button style={S.deleteRowBtn} className="delete-row-btn"
                        onClick={() => setDeleteSingleConfirm(customer)} title={`Delete ${customer.name}`}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerForm;