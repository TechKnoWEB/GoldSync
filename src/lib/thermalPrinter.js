// ============================================
// thermalPrinter.js  — v6 (Table Fix)
// 3-inch (80mm / 48-col) Bluetooth ESC/POS


const ESC = 0x1b;
const GS  = 0x1d;
const LF  = 0x0a;

const PRINT_WIDTH = 48;

const encoder = new TextEncoder();

// ── Formatting helpers ────────────────────────

function pr(s, len) {
  s = String(s == null ? '' : s);
  if (s.length >= len) return s.substring(0, len);
  return s + ' '.repeat(len - s.length);
}

function pl(s, len) {
  s = String(s == null ? '' : s);
  if (s.length >= len) return s.substring(0, len);
  return ' '.repeat(len - s.length) + s;
}

function sep(ch, w) {
  return (ch || '-').repeat(w || PRINT_WIDTH);
}

function f3(n) { return Number(n || 0).toFixed(3); }
function f1(n) { return Number(n || 0).toFixed(1); }
function f2(n) { return Number(n || 0).toFixed(2); }

function safeNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  var n = Number(val);
  return isNaN(n) ? 0 : n;
}

// ── BLE UUIDs ────────────────────────────────
const KNOWN_SERVICE_UUIDS = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  '0000ffe0-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000ae30-0000-1000-8000-00805f9b34fb',
  '0000af30-0000-1000-8000-00805f9b34fb',
  '00001800-0000-1000-8000-00805f9b34fb',
  '00001801-0000-1000-8000-00805f9b34fb',
  '0000fee7-0000-1000-8000-00805f9b34fb',
  '0000fff0-0000-1000-8000-00805f9b34fb',
  '0000feaa-0000-1000-8000-00805f9b34fb',
  '00001802-0000-1000-8000-00805f9b34fb',
  '0000180a-0000-1000-8000-00805f9b34fb',
  '0000180f-0000-1000-8000-00805f9b34fb',
];

const KNOWN_CHARACTERISTIC_UUIDS = [
  '00002af1-0000-1000-8000-00805f9b34fb',
  '0000ffe1-0000-1000-8000-00805f9b34fb',
  'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f',
  '49535343-8841-43f4-a8d4-ecbe34729bb3',
  '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
  '0000ff02-0000-1000-8000-00805f9b34fb',
  '0000ae01-0000-1000-8000-00805f9b34fb',
  '0000af01-0000-1000-8000-00805f9b34fb',
  '00002af0-0000-1000-8000-00805f9b34fb',
  '0000fee8-0000-1000-8000-00805f9b34fb',
  '0000fff1-0000-1000-8000-00805f9b34fb',
  '0000fff2-0000-1000-8000-00805f9b34fb',
  '0000ff01-0000-1000-8000-00805f9b34fb',
];

let savedBluetoothDevice = null;

function delay(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

// ── Input sanitisers ──────────────────────────

function sanitizeRecord(rec) {
  if (!rec || typeof rec !== 'object') rec = {};
  return {
    created_at     : rec.created_at      || new Date().toISOString(),
    gold_input     : safeNum(rec.gold_input),
    purity_percent : safeNum(rec.purity_percent),
    fine_gold      : safeNum(rec.fine_gold),
    customer_fine  : safeNum(rec.customer_fine),
    balance        : safeNum(rec.balance),
    gold_price     : safeNum(rec.gold_price),
    paid_gold      : safeNum(rec.paid_gold),
    cash_payment   : safeNum(rec.cash_payment),
    final_balance  : safeNum(rec.final_balance),
    payment_mode   : rec.payment_mode || 'none',
    invoice_number : rec.invoice_number || '',
    bill_status    : rec.bill_status    || 'confirmed',
  };
}

function sanitizeTotals(totals) {
  if (!totals || typeof totals !== 'object') totals = {};
  return {
    gold     : safeNum(totals.gold),
    fine     : safeNum(totals.fine),
    custFine : safeNum(totals.custFine),
    bal      : safeNum(totals.bal),
    paidGold : safeNum(totals.paidGold),
    cash     : safeNum(totals.cash),
    finalBal : safeNum(totals.finalBal),
    net      : totals.net !== undefined
                 ? safeNum(totals.net)
                 : safeNum(totals.bal) - safeNum(totals.paidGold),
  };
}

// ── Byte helpers ──────────────────────────────
function concatBytes(arrays) {
  var total = 0;
  for (var i = 0; i < arrays.length; i++) total += arrays[i].length;
  var out = new Uint8Array(total);
  var off = 0;
  for (var j = 0; j < arrays.length; j++) {
    out.set(arrays[j], off);
    off += arrays[j].length;
  }
  return out;
}

// ── Bluetooth request (acceptAllDevices) ──────
async function requestPrinterDevice() {
  if (savedBluetoothDevice && savedBluetoothDevice.gatt) {
    try {
      if (savedBluetoothDevice.gatt.connected) {
        console.log('Reusing connected device:', savedBluetoothDevice.name);
        return savedBluetoothDevice;
      }
      console.log('Reconnecting saved device:', savedBluetoothDevice.name);
      return savedBluetoothDevice;
    } catch (_) {
      savedBluetoothDevice = null;
    }
  }

  if (!navigator.bluetooth) {
    throw new Error('Web Bluetooth API not available. Use Chrome on Android or Desktop.');
  }

  var device;
  try {
    device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: KNOWN_SERVICE_UUIDS,
    });
  } catch (err) {
    if (err.name === 'NotFoundError' ||
        (err.message && err.message.toLowerCase().indexOf('cancel') !== -1)) {
      throw new Error('Bluetooth device selection was cancelled.');
    }
    throw new Error('No Bluetooth printer selected. Make sure it is turned on and in range.');
  }

  if (!device) throw new Error('No device selected');

  device.addEventListener('gattserverdisconnected', function () {
    console.warn('⚠ Printer disconnected unexpectedly');
  });

  savedBluetoothDevice = device;
  return device;
}

// ── GATT connect with retry ───────────────────
async function connectGattWithRetry(device, maxRetries) {
  if (maxRetries === undefined) maxRetries = 3;
  var lastError;
  for (var attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (device.gatt.connected) {
        try { device.gatt.disconnect(); } catch (_) {}
        await delay(400);
      }
      var server = await device.gatt.connect();
      await delay(800);
      if (!server.connected) throw new Error('Connection dropped immediately');
      console.log('✓ GATT connected on attempt ' + attempt);
      return server;
    } catch (err) {
      lastError = err;
      console.warn('GATT attempt ' + attempt + '/' + maxRetries + ':', err.message);
      await delay(1000 * attempt);
    }
  }
  throw new Error('Failed to connect after ' + maxRetries + ' attempts: ' +
    (lastError ? lastError.message : 'Unknown error'));
}

// ── 3-phase characteristic discovery ─────────
async function discoverPrintCharacteristic(server) {
  var foundChars = [];

  for (var s = 0; s < KNOWN_SERVICE_UUIDS.length; s++) {
    var service;
    try { service = await server.getPrimaryService(KNOWN_SERVICE_UUIDS[s]); }
    catch (_) { continue; }
    console.log('  Found service:', KNOWN_SERVICE_UUIDS[s]);

    for (var c = 0; c < KNOWN_CHARACTERISTIC_UUIDS.length; c++) {
      try {
        var ch = await service.getCharacteristic(KNOWN_CHARACTERISTIC_UUIDS[c]);
        if (ch.properties.write || ch.properties.writeWithoutResponse) {
          console.log('  ✓ Phase 1 match:', ch.uuid);
          return ch;
        }
        foundChars.push(ch.uuid + ' (not writable)');
      } catch (_) {}
    }

    try {
      var allChars = await service.getCharacteristics();
      for (var k = 0; k < allChars.length; k++) {
        if (allChars[k].properties.write || allChars[k].properties.writeWithoutResponse) {
          console.log('  ✓ Phase 2 match:', allChars[k].uuid);
          return allChars[k];
        }
        foundChars.push(allChars[k].uuid);
      }
    } catch (_) {}
  }

  try {
    var allServices = await server.getPrimaryServices();
    for (var si = 0; si < allServices.length; si++) {
      console.log('  Phase 3 — scanning service:', allServices[si].uuid);
      try {
        var chars = await allServices[si].getCharacteristics();
        for (var ci = 0; ci < chars.length; ci++) {
          if (chars[ci].properties.write || chars[ci].properties.writeWithoutResponse) {
            console.log('  ✓ Phase 3 match:', chars[ci].uuid);
            return chars[ci];
          }
          foundChars.push(chars[ci].uuid);
        }
      } catch (_) {}
    }
  } catch (_) {}

  throw new Error(
    'No writable print characteristic found.' +
    (foundChars.length ? ' Discovered: ' + foundChars.join(', ') : ' None accessible.') +
    ' Ensure the printer is BLE-compatible and try re-pairing.'
  );
}

// ── Chunked BLE write ─────────────────────────
async function writeChunked(characteristic, data, device) {
  var CHUNK_SIZE = 100;
  var MAX_RETRIES = 2;

  for (var i = 0; i < data.length; i += CHUNK_SIZE) {
    var chunk = data.slice(i, i + CHUNK_SIZE);
    var written = false;

    for (var attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (characteristic.properties.writeWithoutResponse) {
          await characteristic.writeValueWithoutResponse(chunk);
        } else {
          await characteristic.writeValue(chunk);
        }
        written = true;
        break;
      } catch (writeErr) {
        console.warn('Chunk write failed (attempt ' + (attempt + 1) + '):', writeErr.message);
        if (writeErr.message && writeErr.message.indexOf('disconnected') !== -1 && device) {
          console.log('Reconnecting mid-write…');
          var server = await connectGattWithRetry(device, 2);
          characteristic = await discoverPrintCharacteristic(server);
        } else if (attempt === MAX_RETRIES) {
          throw writeErr;
        }
        await delay(300);
      }
    }

    if (!written) throw new Error('Failed to write chunk at offset ' + i);
    await delay(20);
  }

  return characteristic;
}

// ══════════════════════════════════════════════
// ESC/POS RECEIPT BUILDER
//
// ── COLUMN WIDTH PROOF (NO # COLUMN) ─────────
//
// GOLD TABLE — 6 columns, 5 pipes:
// Date    |    Gold| Pur% |   Fine|  CustF|    Bal
//    8   1     8  1   6  1    7  1    7  1    7
// = 8+1+8+1+6+1+7+1+7+1+7 = 48 ✓
//
// PAYMENT TABLE — 6 columns, 5 pipes:
// Date    | GPrice|    Cash|  PaidG| FinBal|Mode
//    8   1    7  1     8  1    7  1    7  1   4
// = 8+1+7+1+8+1+7+1+7+1+4 = 46 → need +2
//
// Adjusted:
// Date    |GPrice |    Cash|  PaidG| FinBal|Mode
//    8   1   7   1     8  1    7  1    7  1   5
// = 8+1+7+1+8+1+7+1+7+1+5 = 47 → need +1
//
// Final:
// Date    |GPrice |    Cash|  PaidG| FinBal| Mode
//    8   1   7   1     8  1    7  1    7  1    6
// = 8+1+7+1+8+1+7+1+7+1+6 = 48 ✓
// ══════════════════════════════════════════════

function buildReceiptData(customer, records, totals, userProfile) {
  customer = customer || {};
  customer.name   = customer.name   || 'N/A';
  customer.mobile = customer.mobile || 'N/A';
  records  = Array.isArray(records) ? records : [];
  var T    = sanitizeTotals(totals);
  var W    = PRINT_WIDTH;
  var parts = [];
  userProfile = userProfile || {};
  var businessName = (userProfile.business_name || 'SREE GOLD').toUpperCase();
  var businessAddr = (userProfile.address       || 'MANUFACTURING').toUpperCase();
  var shopGstin    =  userProfile.gstin         || '';
  var shopPhone    =  userProfile.shop_phone    || userProfile.mobile || '';

  function addCmd() {
    for (var i = 0; i < arguments.length; i++) {
      parts.push(new Uint8Array(arguments[i]));
    }
  }
  function addText(s) {
    parts.push(encoder.encode(String(s)));
  }
  function addLine(s) {
    parts.push(encoder.encode(String(s)));
    parts.push(new Uint8Array([LF]));
  }

  // ────────────────────────────────────────
  // Gold table row builder — exactly 48 chars
  //
  // Date(8)|Gold(8)|Pur%(6)|Fine(7)|CustF(7)|Bal(7)
  // 8+1+8+1+6+1+7+1+7+1+7 = 48 ✓
  // ────────────────────────────────────────
  function goldRow(date, gold, pct, fine, cuf, bal) {
    return (
      pr(date, 8) + '|' +
      pl(gold, 8) + '|' +
      pl(pct,  6) + '|' +
      pl(fine, 7) + '|' +
      pl(cuf,  7) + '|' +
      pl(bal,  7)
    );
  }

  // ────────────────────────────────────────
  // Payment table row builder — exactly 48 chars
  //
  // Date(8)|GPrice(7)|Cash(8)|PaidG(7)|FinBal(7)|Mode(6)
  // 8+1+7+1+8+1+7+1+7+1+6 = 48 ✓
  // ────────────────────────────────────────
  function payRow(date, gp, cash, paid, fb, mode) {
    return (
      pr(date, 8) + '|' +
      pl(gp,   7) + '|' +
      pl(cash, 8) + '|' +
      pl(paid, 7) + '|' +
      pl(fb,   7) + '|' +
      pr(mode, 6)
    );
  }

  // ══════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════
  addCmd([ESC, 0x40]);
  addCmd([ESC, 0x33, 24]);

  // ══════════════════════════════════════════
  // HEADER
  // ══════════════════════════════════════════
  addCmd([ESC, 0x61, 1]);
  addCmd([GS, 0x21, 0x11]);
  addCmd([ESC, 0x45, 1]);
  addLine(businessName);

  addCmd([GS, 0x21, 0x00]);
  addCmd([ESC, 0x45, 1]);
  addLine(businessAddr);

  addCmd([ESC, 0x45, 0]);
  addLine('TAX INVOICE / STATEMENT');
  addLine(sep('=', W));

  // ══════════════════════════════════════════
  // CUSTOMER INFO
  // ══════════════════════════════════════════
  addCmd([ESC, 0x61, 0]);

  addCmd([ESC, 0x45, 1]); addText('Customer : ');
  addCmd([ESC, 0x45, 0]); addLine(customer.name);

  addCmd([ESC, 0x45, 1]); addText('Mobile   : ');
  addCmd([ESC, 0x45, 0]); addLine(customer.mobile);

  addCmd([ESC, 0x45, 1]); addText('Printed  : ');
  addCmd([ESC, 0x45, 0]); addLine(new Date().toLocaleString('en-IN'));

  //addCmd([ESC, 0x45, 1]); addText('Records  : ');
  //addCmd([ESC, 0x45, 0]); addLine(String(records.length));

  addLine(sep('-', W));

  // ══════════════════════════════════════════
  // SECTION 1: GOLD CALCULATION DETAILS
  //
  // Date    |    Gold| Pur% |   Fine|  CustF|    Bal
  //    8   1     8  1   6  1    7  1    7  1    7
  // = 48 chars exactly ✓
  // ══════════════════════════════════════════
  addCmd([ESC, 0x61, 1]);
  addCmd([ESC, 0x45, 1]);
  addLine('GOLD CALCULATION DETAILS');
  addCmd([ESC, 0x45, 0]);
  addCmd([ESC, 0x61, 0]);
  addLine(sep('-', W));

  // Table header
  addCmd([ESC, 0x45, 1]);
  addLine(goldRow('Date', 'Gold', 'Pur%', 'Fine', 'CustF', 'Bal'));
  addCmd([ESC, 0x45, 0]);
  addLine(sep('-', W));

  // Data rows
  for (var i = 0; i < records.length; i++) {
    var rec = sanitizeRecord(records[i]);

    var dateStr;
    try {
      dateStr = new Date(rec.created_at).toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit',
      });
    } catch (_) {
      dateStr = '--/--';
    }

    var purStr = rec.purity_percent > 0
      ? f1(rec.purity_percent) + '%'
      : '-';

    addLine(goldRow(
      dateStr,
      f3(rec.gold_input),
      purStr,
      f3(rec.fine_gold),
      f3(rec.customer_fine),
      f3(rec.balance)
    ));
  }

  addLine(sep('-', W));

  // Totals row (no "T" — starts with TOTALS in Date column)
  addCmd([ESC, 0x45, 1]);
  addLine(goldRow(
    'TOTALS',
    f3(T.gold),
    '-',
    f3(T.fine),
    f3(T.custFine),
    f3(T.bal)
  ));
  addCmd([ESC, 0x45, 0]);
  addLine(sep('=', W));

  // ══════════════════════════════════════════
  // SECTION 2: PAYMENT DETAILS
  //
  // Date    |GPrice |    Cash|  PaidG| FinBal| Mode
  //    8   1   7   1     8  1    7  1    7  1    6
  // = 48 chars exactly ✓
  // ══════════════════════════════════════════
  parts.push(new Uint8Array([LF]));

  addCmd([ESC, 0x61, 1]);
  addCmd([ESC, 0x45, 1]);
  addLine('PAYMENT DETAILS');
  addCmd([ESC, 0x45, 0]);
  addCmd([ESC, 0x61, 0]);
  addLine(sep('-', W));

  // Table header
  addCmd([ESC, 0x45, 1]);
  addLine(payRow('Date', 'GPrice', 'Cash', 'PaidG', 'FinBal', 'Mode'));
  addCmd([ESC, 0x45, 0]);
  addLine(sep('-', W));

  // Data rows
  for (var j = 0; j < records.length; j++) {
    var rec2 = sanitizeRecord(records[j]);

    var dateStr2;
    try {
      dateStr2 = new Date(rec2.created_at).toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit',
      });
    } catch (_) {
      dateStr2 = '--/--';
    }

    var gp = rec2.gold_price > 0 ? f1(rec2.gold_price) : '-';
    var mode = (rec2.cash_payment > 0 && rec2.paid_gold > 0) ? 'Both'
             : rec2.cash_payment > 0 ? 'Cash'
             : rec2.paid_gold > 0 ? 'Gold'
             : 'None';

    addLine(payRow(
      dateStr2,
      gp,
      f1(rec2.cash_payment),
      f3(rec2.paid_gold),
      f3(rec2.final_balance),
      mode
    ));
  }

  addLine(sep('-', W));

  // Totals row (no "T")
  addCmd([ESC, 0x45, 1]);
  addLine(payRow(
    'TOTALS',
    '-',
    f1(T.cash),
    f3(T.paidGold),
    f3(T.finalBal),
    ''
  ));
  addCmd([ESC, 0x45, 0]);
  addLine(sep('=', W));

  // ══════════════════════════════════════════
  // NET BALANCE
  // ══════════════════════════════════════════
  parts.push(new Uint8Array([LF]));

  addCmd([ESC, 0x61, 1]);
  addCmd([GS, 0x21, 0x10]);
  addCmd([ESC, 0x45, 1]);
  addLine('NET BALANCE');

  addCmd([GS, 0x21, 0x11]);
  addLine(f3(T.net) + 'g');

  addCmd([GS, 0x21, 0x00]);
  addCmd([ESC, 0x45, 0]);
  addLine(
    T.net >= 0
      ? 'Receivable'//Manufacturer owes Customer
      : 'Payble'//Customer owes Manufacturer
  );

  // ══════════════════════════════════════════
  // SUMMARY BREAKDOWN
  // ══════════════════════════════════════════
  addLine(sep('-', W));
  addCmd([ESC, 0x61, 0]);

  addLine(pr('Total Gold:', 24)      + pl(f3(T.gold)     + 'g', 24));
  addLine(pr('Total Fine Gold:', 24) + pl(f3(T.fine)     + 'g', 24));
  addLine(pr('Total Balance:', 24)   + pl(f3(T.bal)      + 'g', 24));
  addLine(pr('Total Cash=Gold:', 24) + pl(f3(T.paidGold) + 'g', 24));

  if (T.cash > 0) {
    addLine(pr('Total Cash:', 24) + pl('Rs.' + f1(T.cash), 24));
  }

  addLine(pr('Net (Bal-Paid):', 24) + pl(f3(T.net) + 'g', 24));
  addLine(sep('=', W));

  // ══════════════════════════════════════════
  // FOOTER
  // ══════════════════════════════════════════
  addCmd([ESC, 0x61, 1]);
  addLine('Thank you for your business!');
  //addLine('----Developed by TeamR.----');
  //addLine('Precision . Trust . Excellence');

  addCmd([ESC, 0x64, 4]);
  addCmd([GS, 0x56, 0x01]);

  return concatBytes(parts);
}

// ══════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════

export function isBluetoothAvailable() {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

export function forgetPrinter() {
  if (savedBluetoothDevice &&
      savedBluetoothDevice.gatt &&
      savedBluetoothDevice.gatt.connected) {
    try { savedBluetoothDevice.gatt.disconnect(); } catch (_) {}
  }
  savedBluetoothDevice = null;
  console.log('Saved printer cleared');
}

export async function printViaBluetooth(customer, records, totals) {
  if (!isBluetoothAvailable()) {
    throw new Error(
      'Web Bluetooth is not supported. Use Chrome or Edge on desktop/Android.'
    );
  }

  var device;
  try {
    device = await requestPrinterDevice();
    console.log('Selected:', device.name || 'Unknown Printer');

    var server = await connectGattWithRetry(device, 3);
    var characteristic = await discoverPrintCharacteristic(server);
    var receiptData = buildReceiptData(customer, records, totals);

    console.log('Sending receipt (' + receiptData.length + ' bytes, ' +
                records.length + ' rows)…');

    await writeChunked(characteristic, receiptData, device);
    console.log('✓ Receipt printed successfully');

    await delay(300);
    if (device.gatt.connected) {
      try { device.gatt.disconnect(); } catch (_) {}
    }

    return { success: true, method: 'bluetooth' };
  } catch (error) {
    if (device && device.gatt && device.gatt.connected) {
      try { device.gatt.disconnect(); } catch (_) {}
    }
    if (error.message && (
        error.message.indexOf('cancelled') !== -1 ||
        error.message.indexOf('No Bluetooth') !== -1 ||
        error.message.indexOf('not available') !== -1
    )) {
      savedBluetoothDevice = null;
    }
    throw new Error('Print failed: ' + error.message);
  }
}

// ══════════════════════════════════════════════
// WINDOW (BROWSER) PRINT
// ══════════════════════════════════════════════
// ══════════════════════════════════════════════
// ESC/POS builder — Current Order only
// Layout (48-col):
//   Label (24) + Value (24)
// ══════════════════════════════════════════════
function buildCurrentOrderData(customer, order, netBalance) {
  customer = customer || {};
  customer.name   = customer.name   || 'N/A';
  customer.mobile = customer.mobile || 'N/A';
  order = order || {};

  var W       = PRINT_WIDTH;
  var bal     = safeNum(order.balance);
  var prevBal = safeNum(netBalance) - bal;
  var netBal  = safeNum(netBalance);
  var parts   = [];

  var statusLabel = order.billStatus
    ? (order.billStatus.charAt(0).toUpperCase() + order.billStatus.slice(1))
    : 'Draft';
  var metalLabel = order.metalType
    ? (order.metalType.charAt(0).toUpperCase() + order.metalType.slice(1))
    : 'Gold';

  function addCmd() {
    for (var i = 0; i < arguments.length; i++) parts.push(new Uint8Array(arguments[i]));
  }
  function addText(s) { parts.push(encoder.encode(String(s))); }
  function addLine(s) { parts.push(encoder.encode(String(s))); parts.push(new Uint8Array([LF])); }
  function kv(label, value) {
    addLine(pr(label + ':', 24) + pl(String(value), 24));
  }
  function divider(ch) { addLine(sep(ch || '-', W)); }

  // ── INIT ──
  addCmd([ESC, 0x40]);           // init
  addCmd([ESC, 0x33, 24]);       // line spacing

  // ── HEADER ──
  addCmd([ESC, 0x61, 1]);        // center
  addCmd([GS,  0x21, 0x11]);     // double width+height
  addCmd([ESC, 0x45, 1]);
  addLine('SREE GOLD');
  addCmd([GS,  0x21, 0x00]);
  addCmd([ESC, 0x45, 1]);
  addLine('MANUFACTURING');
  addCmd([ESC, 0x45, 0]);
  addLine('CALCULATION RECEIPT');
  divider('=');

  // ── CUSTOMER ──
  addCmd([ESC, 0x61, 0]);        // left
  addCmd([ESC, 0x45, 1]); addText('Customer : ');
  addCmd([ESC, 0x45, 0]); addLine(customer.name);
  addCmd([ESC, 0x45, 1]); addText('Mobile   : ');
  addCmd([ESC, 0x45, 0]); addLine(customer.mobile);
  addCmd([ESC, 0x45, 1]); addText('Date     : ');
  addCmd([ESC, 0x45, 0]); addLine(new Date().toLocaleString('en-IN'));
  addCmd([ESC, 0x45, 1]); addText('Status   : ');
  addCmd([ESC, 0x45, 0]); addLine(statusLabel);
  divider('-');

  // ── CURRENT ORDER ──
  addCmd([ESC, 0x61, 1]);
  addCmd([ESC, 0x45, 1]);
  addLine('CURRENT ORDER');
  addCmd([ESC, 0x45, 0]);
  addCmd([ESC, 0x61, 0]);
  divider('-');

  kv('Metal',         metalLabel);
  kv('Gold Weight',   f3(order.goldInput) + ' g');
  kv('Purity',        safeNum(order.purityPercent).toFixed(2) + ' %');

  addCmd([ESC, 0x45, 1]);
  kv('Fine Gold',     f3(order.fineGold) + ' g');
  addCmd([ESC, 0x45, 0]);

  kv('Customer Fine', f3(order.customerFine) + ' g');
  divider('-');

  // ── BALANCE TABLE (3 columns) ──
  // Prev(15) | This(15) | Net(16) = 48 (with 2 pipes) → 15+1+15+1+16=48
  var hPrev = pr(' Prev.Bal', 15);
  var hThis = pr(' ThisOrd.',15);
  var hNet  = pr(' Net Bal.',16);
  addCmd([ESC, 0x45, 1]);
  addLine(hPrev + '|' + hThis + '|' + hNet);
  addCmd([ESC, 0x45, 0]);
  divider('-');

  function balCell(val, w) {
    var s = f3(val) + 'g';
    return pr(' ' + s, w);
  }
  addLine(balCell(prevBal,15) + '|' + balCell(bal,15) + '|' + balCell(netBal,16));

  function dirCell(val, w) {
    var d = val >= 0 ? ' Receivable' : ' Payable';
    return pr(d, w);
  }
  addLine(dirCell(prevBal,15) + '|' + dirCell(bal,15) + '|' + dirCell(netBal,16));
  divider('=');

  // ── NET BALANCE HERO ──
  addCmd([ESC, 0x61, 1]);
  addCmd([GS,  0x21, 0x10]);
  addCmd([ESC, 0x45, 1]);
  addLine('NET BALANCE');
  addCmd([GS,  0x21, 0x11]);
  addLine(f3(netBal) + ' g');
  addCmd([GS,  0x21, 0x00]);
  addCmd([ESC, 0x45, 0]);
  addLine(netBal >= 0 ? 'Receivable' : 'Payable');

  // ── FOOTER ──
  divider('=');
  addCmd([ESC, 0x61, 1]);
  addLine('Thank you for your business!');
  addCmd([ESC, 0x64, 4]);        // feed 4 lines
  addCmd([GS,  0x56, 0x01]);     // full cut

  return concatBytes(parts);
}

export async function printCurrentOrderBill(customer, order, netBalance) {
  var bal     = safeNum(order ? order.balance : 0);
  var prevBal = safeNum(netBalance) - bal;
  var netBal  = safeNum(netBalance);

  customer = customer || {};
  order    = order    || {};

  var metalLabel  = order.metalType
    ? (order.metalType.charAt(0).toUpperCase() + order.metalType.slice(1))
    : 'Gold';
  var statusMap   = { draft:'#888', confirmed:'#b8860b', paid:'#006600' };
  var statusColor = statusMap[order.billStatus] || '#888';
  var statusLabel = order.billStatus
    ? (order.billStatus.charAt(0).toUpperCase() + order.billStatus.slice(1))
    : 'Draft';
  var invNum = order.invoiceNumber ? ('#' + order.invoiceNumber) : '';
  var now    = new Date().toLocaleString('en-IN');

  function colorOf(n) { return n >= 0 ? '#006600' : '#cc0000'; }
  function dirOf(n)   { return n >= 0 ? '&#8593; Receivable' : '&#8595; Payable'; }
  function row(label, value, bold, color) {
    var vs = bold
      ? '<span style="font-weight:900' + (color ? ';color:' + color : '') + '">' + value + '</span>'
      : '<span' + (color ? ' style="color:' + color + '"' : '') + '>' + value + '</span>';
    return '<div class="r"><span class="lbl">' + label + '</span>' + vs + '</div>';
  }
  var sep = '<div class="sep"></div>';

  // ── 1. Fire ESC/POS to Bluetooth in background ──
  var btStatus  = '';   // 'ok' | 'fail' | 'na'
  var btMessage = '';

  if (isBluetoothAvailable()) {
    try {
      var device = await requestPrinterDevice();
      var server = await connectGattWithRetry(device, 3);
      var characteristic = await discoverPrintCharacteristic(server);
      var data = buildCurrentOrderData(customer, order, netBalance);
      await writeChunked(characteristic, data, device);
      await delay(300);
      if (device.gatt.connected) { try { device.gatt.disconnect(); } catch(_){} }
      btStatus  = 'ok';
      btMessage = 'Sent to thermal printer &#10003;';
    } catch (err) {
      btStatus  = 'fail';
      btMessage = 'Bluetooth: ' + err.message;
      // don't rethrow — preview window still opens below
    }
  } else {
    btStatus = 'na';
  }

  // ── 2. Build & open preview window ──
  var btBanner = '';
  if (btStatus === 'ok') {
    btBanner = '<div class="bt-ok no-print">&#128424; ' + btMessage + '</div>';
  } else if (btStatus === 'fail') {
    btBanner = '<div class="bt-fail no-print">&#9888; ' + btMessage +
               '<br><small>Use the Print button below to print manually.</small></div>';
  }

  var html =
    '<!DOCTYPE html><html><head>' +
    '<meta charset="UTF-8"/>' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"/>' +
    '<title>Receipt &#8211; ' + customer.name + '</title>' +
    '<style>' +
      '@media print{' +
        '@page{margin:3mm;size:80mm auto}' +
        'body{padding:0!important}' +
        '.no-print{display:none!important}' +
      '}' +
      'body{font-family:"Courier New",Courier,monospace;font-size:10px;color:#111;' +
        'max-width:80mm;margin:0 auto;padding:5mm 4mm;background:#fff}' +
      '.hd{text-align:center;padding-bottom:7px;border-bottom:2px solid #111;margin-bottom:6px}' +
      '.hd-brand{font-size:15px;font-weight:900;letter-spacing:1.5px}' +
      '.hd-sub{font-size:7px;letter-spacing:3px;color:#555;margin-top:2px}' +
      '.hd-tag{display:inline-block;margin-top:5px;font-size:9px;font-weight:700;' +
        'background:#111;color:#fff;padding:2px 10px;border-radius:2px;letter-spacing:.8px}' +
      '.hd-inv{font-size:7px;color:#777;margin-top:2px}' +
      '.hd-status{display:inline-block;padding:1px 8px;border-radius:3px;' +
        'font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:.8px;' +
        'border:1.5px solid currentColor;margin-top:3px}' +
      '.cust{padding:5px 0;border-bottom:1px dashed #aaa;margin-bottom:5px}' +
      '.r{display:flex;justify-content:space-between;align-items:baseline;' +
        'padding:2px 0;font-size:8.5px;border-bottom:1px dotted #e8e8e8}' +
      '.r:last-child{border-bottom:none}' +
      '.lbl{color:#444;font-weight:600}' +
      '.st{text-align:center;font-size:7px;font-weight:900;text-transform:uppercase;' +
        'letter-spacing:1.5px;color:#555;padding:5px 0 3px;border-top:1px dashed #aaa;margin-top:4px}' +
      '.sep{height:1px;background:#ccc;margin:4px 0}' +
      '.bal-table{width:100%;border-collapse:collapse;margin:5px 0;font-size:8.5px}' +
      '.bal-table td{padding:3px 4px;border:1px solid #ccc}' +
      '.bal-table .h{font-size:7px;font-weight:700;text-transform:uppercase;' +
        'letter-spacing:.8px;color:#555;text-align:center;background:#f5f5f5}' +
      '.bal-table .v{font-weight:900;font-size:10px;text-align:center}' +
      '.bal-table .d{font-size:6.5px;text-align:center;color:#666;font-style:italic}' +
      '.net{margin:6px 0;padding:7px 6px;border:2.5px solid #111;border-radius:4px;text-align:center}' +
      '.net-lbl{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#555}' +
      '.net-val{font-size:18px;font-weight:900;letter-spacing:-.5px;margin:3px 0}' +
      '.net-dir{font-size:7.5px;font-style:italic;color:#444}' +
      '.ft{text-align:center;margin-top:6px;padding-top:5px;border-top:2px solid #111}' +
      '.ft-line{height:1px;background:linear-gradient(90deg,transparent,#aaa,transparent);margin:3px 0}' +
      '.ft-txt{font-size:7px;color:#777}' +
      /* Bluetooth status banners */
      '.bt-ok{background:#e6f4ea;color:#1a6630;border:1px solid #a8d5b0;border-radius:4px;' +
        'padding:7px 10px;margin:8px 0;font-size:9px;font-weight:700;text-align:center}' +
      '.bt-fail{background:#fff3cd;color:#856404;border:1px solid #ffe08a;border-radius:4px;' +
        'padding:7px 10px;margin:8px 0;font-size:8.5px;text-align:center}' +
      '.bt-fail small{font-size:7.5px;display:block;margin-top:3px;opacity:.8}' +
      /* Print button */
      '.print-btn{display:block;width:100%;margin-top:10px;padding:9px;cursor:pointer;' +
        'background:#111;color:#fff;border:none;border-radius:3px;' +
        'font-family:inherit;font-size:11px;font-weight:700;letter-spacing:.5px}' +
    '</style></head><body>' +

    /* HEADER */
    '<div class="hd">' +
      '<div class="hd-brand">&#10022; SREE GOLD &#10022;</div>' +
      '<div class="hd-sub">M A N U F A C T U R I N G</div>' +
      '<div><span class="hd-tag">CALCULATION RECEIPT</span></div>' +
      (invNum ? '<div class="hd-inv">' + invNum + '</div>' : '') +
      '<div><span class="hd-status" style="color:' + statusColor + '">' + statusLabel + '</span></div>' +
    '</div>' +

    /* CUSTOMER */
    '<div class="cust">' +
      row('Customer', customer.name) +
      row('Mobile',   customer.mobile) +
      row('Date',     now) +
    '</div>' +

    /* CURRENT ORDER */
    '<div class="st">Current Order</div>' +
    '<div style="padding:3px 0">' +
      row('Metal',         metalLabel) +
      row('Gold Weight',   f3(order.goldInput)  + ' g') +
      row('Purity',        safeNum(order.purityPercent).toFixed(2) + ' %') +
      row('Fine Gold',     f3(order.fineGold)   + ' g', true) +
      row('Customer Fine', f3(order.customerFine) + ' g') +
    '</div>' +
    sep +

    /* BALANCE TABLE */
    '<table class="bal-table">' +
      '<tr>' +
        '<td class="h">Prev. Balance</td>' +
        '<td class="h">This Order</td>' +
        '<td class="h">Net Balance</td>' +
      '</tr>' +
      '<tr>' +
        '<td class="v" style="color:' + colorOf(prevBal) + '">' + f3(prevBal) + ' g</td>' +
        '<td class="v" style="color:' + colorOf(bal)     + '">' + f3(bal)     + ' g</td>' +
        '<td class="v" style="color:' + colorOf(netBal)  + '">' + f3(netBal)  + ' g</td>' +
      '</tr>' +
      '<tr>' +
        '<td class="d">' + dirOf(prevBal) + '</td>' +
        '<td class="d">' + dirOf(bal)     + '</td>' +
        '<td class="d">' + dirOf(netBal)  + '</td>' +
      '</tr>' +
    '</table>' +

    /* NET BALANCE HERO */
    '<div class="net">' +
      '<div class="net-lbl">Net Balance</div>' +
      '<div class="net-val" style="color:' + colorOf(netBal) + '">' + f3(netBal) + ' g</div>' +
      '<div class="net-dir">' + dirOf(netBal) + '</div>' +
    '</div>' +

    /* FOOTER */
    '<div class="ft">' +
      '<div class="ft-line"></div>' +
      '<div class="ft-txt">Thank you for your business!</div>' +
      '<div class="ft-line"></div>' +
    '</div>' +

    /* BT status banner + print button (hidden on print) */
    btBanner +
    '<button class="print-btn no-print" onclick="window.print()">&#128424;&nbsp; Print Receipt</button>' +

    /* Auto-print only if Bluetooth failed or unavailable */
    (btStatus !== 'ok' ? '<script>window.onload=function(){window.print();}<\/script>' : '') +
    '</body></html>';

  var win = window.open('', '_blank', 'width=420,height=700');
  if (!win) throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
  win.document.write(html);
  win.document.close();

  if (btStatus === 'fail') throw new Error(btMessage);
  return { success: true, method: btStatus === 'ok' ? 'bluetooth' : 'window' };
}

export function printViaWindow(customer, records, totals) {
  customer = customer || {};
  customer.name   = customer.name   || 'N/A';
  customer.mobile = customer.mobile || 'N/A';
  records  = Array.isArray(records) ? records : [];
  var T    = sanitizeTotals(totals);

  var now = new Date().toLocaleString('en-IN');
  var nbColor = T.net >= 0 ? '#006600' : '#cc0000';
  var nbMsg   = T.net >= 0
    ? '\u2191 Receivable' //Manufacturer owes Customer
    : '\u2193 Payble'; //Customer owes Manufacturer
  var tBalColor = T.bal >= 0 ? '#006600' : '#cc0000';

  // ── Gold Calculation Rows ──
  var goldRows = '';
  for (var i = 0; i < records.length; i++) {
    var r = sanitizeRecord(records[i]);
    var bCls = r.balance >= 0 ? 'pos' : 'neg';
    var dt;
    try {
      dt = new Date(r.created_at).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short',
      });
    } catch (_) { dt = '--'; }

    goldRows +=
      '<tr>' +
        '<td class="c">'  + dt + '</td>' +
        '<td class="r">'  + f3(r.gold_input) + '</td>' +
        '<td class="r">'  + (r.purity_percent ? f1(r.purity_percent) + '%' : '\u2014') + '</td>' +
        '<td class="r b">' + f3(r.fine_gold) + '</td>' +
        '<td class="r">'  + f3(r.customer_fine) + '</td>' +
        '<td class="r ' + bCls + '">' + f3(r.balance) + '</td>' +
      '</tr>';
  }

  // ── Payment Rows ──
  var payRows = '';
  for (var j = 0; j < records.length; j++) {
    var r2 = sanitizeRecord(records[j]);
    var pm = (r2.cash_payment > 0 && r2.paid_gold > 0) ? 'Gold+Cash'
           : r2.cash_payment > 0 ? 'Cash'
           : r2.paid_gold > 0 ? 'Gold'
           : '\u2014';
    var fbCls = r2.final_balance >= 0 ? 'pos' : 'neg';
    var dt2;
    try {
      dt2 = new Date(r2.created_at).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short',
      });
    } catch (_) { dt2 = '--'; }

    payRows +=
      '<tr>' +
        '<td class="c">'  + dt2 + '</td>' +
        '<td class="r">\u20B9'  + f1(r2.gold_price) + '</td>' +
        '<td class="r">\u20B9'  + f1(r2.cash_payment) + '</td>' +
        '<td class="r gold">'   + f3(r2.paid_gold) + '</td>' +
        '<td class="r ' + fbCls + '">' + f3(r2.final_balance) + '</td>' +
        '<td class="c mode">'  + pm + '</td>' +
      '</tr>';
  }

  var cashSumRow = T.cash > 0
    ? '<div class="summary-row"><span>Total Cash Paid</span>' +
      '<span>\u20B9' + f1(T.cash) + '</span></div>'
    : '';

  var html =
    '<!DOCTYPE html><html><head>' +
    '<meta charset="UTF-8"/>' +
    '<meta name="viewport" content="width=device-width,initial-scale=1"/>' +
    '<title>Receipt - ' + customer.name + '</title>' +
    '<style>' +
      '@media print{@page{margin:3mm;size:80mm auto}body{padding:0!important}}' +
      'body{font-family:"Courier New",Courier,monospace;font-size:10px;' +
        'color:#000;max-width:80mm;margin:0 auto;padding:4mm;background:#fff}' +
      '.header{text-align:center;padding:8px 0 6px;border-bottom:2px solid #000}' +
      '.brand{font-size:14px;font-weight:900;letter-spacing:1px}' +
      '.brand-sub{font-size:7.5px;margin-top:2px;color:#444;letter-spacing:2.5px}' +
      '.receipt-title{font-size:9.5px;font-weight:700;margin-top:4px;letter-spacing:.5px;' +
        'background:#000;color:#fff;padding:2px 8px;display:inline-block;border-radius:2px}' +
      '.info{padding:6px 0;border-bottom:1px dashed #999}' +
      '.info-row{display:flex;justify-content:space-between;padding:1.5px 0;font-size:8.5px}' +
      '.info-label{font-weight:700;color:#333}' +
      '.info-val{text-align:right;max-width:55%;word-break:break-word}' +
      '.section-title{font-size:7.5px;font-weight:900;text-transform:uppercase;' +
        'letter-spacing:1.2px;text-align:center;padding:5px 0 3px;color:#333;' +
        'border-top:1px dashed #999;margin-top:4px}' +
      '.section-title span{background:#f0f0f0;padding:1px 6px;border-radius:2px}' +
      'table{width:100%;border-collapse:collapse;font-size:7.5px;margin:2px 0}' +
      'th{background:#222;color:#fff;padding:3px 2px;text-align:center;font-size:6.5px;' +
        'text-transform:uppercase;letter-spacing:.3px;font-weight:700;white-space:nowrap}' +
      'td{padding:2.5px 2px;border-bottom:1px dotted #ddd;vertical-align:middle}' +
      'tr:last-child td{border-bottom:none}' +
      '.c{text-align:center}.r{text-align:right;font-variant-numeric:tabular-nums}' +
      '.b{font-weight:700}' +
      '.pos{color:#006600;font-weight:700}.neg{color:#cc0000;font-weight:700}' +
      '.gold{color:#8B6914;font-weight:700}' +
      '.mode{font-size:6px;font-weight:600}' +
      '.total-row{background:#f0f0f0;font-weight:900;border-top:2px solid #000}' +
      '.total-row td{padding:3px 2px;border-bottom:none}' +
      '.net-box{margin:6px 0;padding:7px;border:2px solid #000;border-radius:4px;text-align:center}' +
      '.net-label{font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#555}' +
      '.net-value{font-size:16px;font-weight:900;margin:2px 0;letter-spacing:-.5px}' +
      '.net-sub{font-size:7px;color:#555;font-style:italic}' +
      '.summary{padding:4px 0;border-top:1px dashed #999}' +
      '.summary-row{display:flex;justify-content:space-between;padding:1.5px 0;font-size:8px}' +
      '.summary-row.highlight{font-weight:900;font-size:9px;padding:2px 0}' +
      '.dashed{border-top:1px dashed #999;margin:2px 0}' +
      '.footer{text-align:center;padding:6px 0 4px;border-top:2px solid #000;margin-top:4px}' +
      '.footer-line{height:1px;background:linear-gradient(90deg,transparent,#999,transparent);margin:3px 0}' +
      '.footer-text{font-size:7px;color:#666}' +
      '.footer-brand{font-size:8px;font-weight:700;margin-top:2px}' +
    '</style></head><body>' +

    '<div class="header">' +
      '<div class="brand">\u2726 SREE GOLD \u2726</div>' +
      '<div class="brand-sub">M A N U F A C T U R I N G</div>' +
      '<div style="margin-top:4px"><span class="receipt-title">CALCULATION RECEIPT</span></div>' +
    '</div>' +

    '<div class="info">' +
      '<div class="info-row"><span class="info-label">Customer</span><span class="info-val">' + customer.name + '</span></div>' +
      '<div class="info-row"><span class="info-label">Mobile</span><span class="info-val">' + customer.mobile + '</span></div>' +
      //'<div class="info-row"><span class="info-label">Records</span><span class="info-val">' + records.length + ' entries</span></div>' +
      '<div class="info-row"><span class="info-label">Printed</span><span class="info-val">' + now + '</span></div>' +
    '</div>' +

    '<div class="section-title"><span>\u2696 Gold Calculations</span></div>' +
    '<table>' +
      '<thead><tr><th>Date</th><th>Gold(g)</th><th>Purity</th><th>Fine(g)</th><th>C.Fine</th><th>Balance</th></tr></thead>' +
      '<tbody>' + goldRows + '</tbody>' +
      '<tfoot><tr class="total-row">' +
        '<td class="c"><b>TOTALS</b></td>' +
        '<td class="r b">' + f3(T.gold) + '</td>' +
        '<td class="c">\u2014</td>' +
        '<td class="r b">' + f3(T.fine) + '</td>' +
        '<td class="r b">' + f3(T.custFine) + '</td>' +
        '<td class="r b ' + (T.bal >= 0 ? 'pos' : 'neg') + '">' + f3(T.bal) + '</td>' +
      '</tr></tfoot>' +
    '</table>' +

    '<div class="section-title"><span>\uD83D\uDCB0 Payment Details</span></div>' +
    '<table>' +
      '<thead><tr><th>Date</th><th>G.Price</th><th>Cash(\u20B9)</th><th>Paid(g)</th><th>Fin.Bal</th><th>Mode</th></tr></thead>' +
      '<tbody>' + payRows + '</tbody>' +
      '<tfoot><tr class="total-row">' +
        '<td class="c"><b>TOTALS</b></td>' +
        '<td class="c">\u2014</td>' +
        '<td class="r b">\u20B9' + f1(T.cash) + '</td>' +
        '<td class="r b gold">' + f3(T.paidGold) + '</td>' +
        '<td class="r b ' + (T.finalBal >= 0 ? 'pos' : 'neg') + '">' + f3(T.finalBal) + '</td>' +
        '<td></td>' +
      '</tr></tfoot>' +
    '</table>' +

    '<div class="net-box">' +
      '<div class="net-label">Net Balance (Balance \u2212 Paid Gold)</div>' +
      '<div class="net-value" style="color:' + nbColor + '">' + f3(T.net) + 'g</div>' +
      '<div class="net-sub">' + nbMsg + '</div>' +
    '</div>' +

    '<div class="summary">' +
      '<div class="summary-row"><span>Total Gold Processed</span><span class="b">' + f3(T.gold) + 'g</span></div>' +
      '<div class="summary-row"><span>Total Fine Gold</span><span class="b">' + f3(T.fine) + 'g</span></div>' +
      '<div class="summary-row"><span>Total Customer Fine</span><span>' + f3(T.custFine) + 'g</span></div>' +
      '<div class="dashed"></div>' +
      '<div class="summary-row"><span>Total Balance</span><span class="b" style="color:' + tBalColor + '">' + f3(T.bal) + 'g</span></div>' +
      '<div class="summary-row"><span>Total Cash=Gold</span><span class="b gold">' + f3(T.paidGold) + 'g</span></div>' +
      cashSumRow +
      '<div class="dashed"></div>' +
      '<div class="summary-row highlight"><span>NET BALANCE</span><span style="color:' + nbColor + '">' + f3(T.net) + 'g</span></div>' +
    '</div>' +

    '<div class="footer">' +
      '<div class="footer-line"></div>' +
      '<div class="footer-text">Thank you for your business!</div>' +
      //'<div class="footer-brand">\u2726 Sree Gold Manufacturing \u2726</div>' +
      //'<div class="footer-text" style="margin-top:2px">Precision \u00B7 Trust \u00B7 Excellence</div>' +
      '<div class="footer-line"></div>' +
    '</div>' +

    '<script>window.onload=function(){window.print();}<\/script>' +
    '</body></html>';

  var win = window.open('', '_blank', 'width=400,height=700');
  if (!win) throw new Error('Pop-up blocked. Please allow pop-ups for this site.');
  win.document.write(html);
  win.document.close();
  return { success: true, method: 'window' };
}