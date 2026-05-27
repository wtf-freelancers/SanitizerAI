/* ============================================================
   SanitizerAI Suite — app.js
   International: auto-detects region, renders correct banks
   Demo: Alex J is display-only, locked, not downloadable
   Real entries: full CSV + PDF download via jsPDF
   ============================================================ */

"use strict";

// ============================================================
// REGIONAL BANK CONFIG
// ============================================================
const REGION_CONFIG = {
    ZA: {
        name: "South Africa", flag: "🇿🇦", currency: "R", locale: "en-ZA",
        paymentRail: "EFT / RTC",
        banks: ["CAPITEC", "FNB", "ABSA", "STANDARD BANK", "NEDBANK", "TYMEBANK"],
        bankDetails: [
            { label: "Payment System", value: "South African EFT / RTC" },
            { label: "Branch Code", value: "Universal: 051001" },
            { label: "Account Type", value: "Current / Cheque" },
            { label: "Reference", value: "Invoice Number" }
        ]
    },
    US: {
        name: "United States", flag: "🇺🇸", currency: "$", locale: "en-US",
        paymentRail: "ACH / Wire",
        banks: ["CHASE", "BANK OF AMERICA", "WELLS FARGO", "CITIBANK", "US BANK", "CAPITAL ONE"],
        bankDetails: [
            { label: "Payment System", value: "ACH / Fedwire" },
            { label: "Routing No.", value: "9-digit ABA number" },
            { label: "Account Type", value: "Checking / Savings" },
            { label: "Reference", value: "Invoice Number" }
        ]
    },
    GB: {
        name: "United Kingdom", flag: "🇬🇧", currency: "£", locale: "en-GB",
        paymentRail: "Faster Payments",
        banks: ["BARCLAYS", "LLOYDS", "HSBC UK", "NATWEST", "MONZO", "STARLING"],
        bankDetails: [
            { label: "Payment System", value: "Faster Payments / CHAPS" },
            { label: "Sort Code", value: "6-digit sort code" },
            { label: "Account No.", value: "8-digit account number" },
            { label: "Reference", value: "Invoice Number" }
        ]
    },
    EU: {
        name: "Europe", flag: "🇪🇺", currency: "€", locale: "de-DE",
        paymentRail: "SEPA",
        banks: ["DEUTSCHE BANK", "BNP PARIBAS", "SANTANDER EU", "ING", "REVOLUT EU", "N26"],
        bankDetails: [
            { label: "Payment System", value: "SEPA Credit Transfer" },
            { label: "IBAN", value: "Country-specific IBAN" },
            { label: "BIC / SWIFT", value: "8–11 character code" },
            { label: "Reference", value: "Invoice Number" }
        ]
    },
    AU: {
        name: "Australia", flag: "🇦🇺", currency: "A$", locale: "en-AU",
        paymentRail: "NPP / OSKO",
        banks: ["CBA", "WESTPAC", "ANZ", "NAB", "MACQUARIE", "ING AU"],
        bankDetails: [
            { label: "Payment System", value: "NPP / OSKO / BPAY" },
            { label: "BSB Number", value: "6-digit BSB" },
            { label: "Account No.", value: "Account number" },
            { label: "Reference", value: "Invoice Number" }
        ]
    },
    NG: {
        name: "Nigeria", flag: "🇳🇬", currency: "₦", locale: "en-NG",
        paymentRail: "NIBSS / NIP",
        banks: ["ZENITH BANK", "GTB", "ACCESS BANK", "UBA", "FIRST BANK", "OPAY"],
        bankDetails: [
            { label: "Payment System", value: "NIBSS Instant Payment" },
            { label: "Nuban No.", value: "10-digit NUBAN" },
            { label: "Bank Code", value: "3-digit CBN code" },
            { label: "Reference", value: "Invoice Number" }
        ]
    },
    KE: {
        name: "Kenya", flag: "🇰🇪", currency: "KSh", locale: "en-KE",
        paymentRail: "M-Pesa / RTGS",
        banks: ["KCB", "EQUITY BANK", "COOPERATIVE", "MPESA", "NCBA", "ABSA KE"],
        bankDetails: [
            { label: "Payment System", value: "M-Pesa / RTGS / EFT" },
            { label: "M-Pesa No.", value: "Safaricom number" },
            { label: "Paybill / Till", value: "Business number" },
            { label: "Reference", value: "Invoice Number" }
        ]
    },
    IN: {
        name: "India", flag: "🇮🇳", currency: "₹", locale: "en-IN",
        paymentRail: "UPI / NEFT",
        banks: ["SBI", "HDFC", "ICICI", "AXIS", "KOTAK", "PAYTM"],
        bankDetails: [
            { label: "Payment System", value: "UPI / NEFT / RTGS" },
            { label: "UPI ID", value: "name@bank" },
            { label: "IFSC Code", value: "11-character code" },
            { label: "Reference", value: "Invoice Number" }
        ]
    },
    AE: {
        name: "UAE", flag: "🇦🇪", currency: "AED", locale: "en-AE",
        paymentRail: "UAEFTS / AANI",
        banks: ["EMIRATES NBD", "FAB", "ADCB", "MASHREQ", "DIB", "ENBD"],
        bankDetails: [
            { label: "Payment System", value: "UAEFTS / AANI" },
            { label: "IBAN", value: "AE + 21 digits" },
            { label: "SWIFT / BIC", value: "Bank SWIFT code" },
            { label: "Reference", value: "Invoice Number" }
        ]
    },
    CA: {
        name: "Canada", flag: "🇨🇦", currency: "CA$", locale: "en-CA",
        paymentRail: "Interac / EFT",
        banks: ["RBC", "TD BANK", "SCOTIABANK", "BMO", "CIBC", "DESJARDINS"],
        bankDetails: [
            { label: "Payment System", value: "Interac e-Transfer / EFT" },
            { label: "Transit No.", value: "5-digit transit" },
            { label: "Institution No.", value: "3-digit institution" },
            { label: "Reference", value: "Invoice Number" }
        ]
    },
    SG: {
        name: "Singapore", flag: "🇸🇬", currency: "S$", locale: "en-SG",
        paymentRail: "PayNow / FAST",
        banks: ["DBS", "OCBC", "UOB", "STANDARD CHARTERED SG", "CITIBANK SG"],
        bankDetails: [
            { label: "Payment System", value: "PayNow / FAST / GIRO" },
            { label: "PayNow ID", value: "UEN or mobile" },
            { label: "Account No.", value: "Bank account number" },
            { label: "Reference", value: "Invoice Number" }
        ]
    },
    GH: {
        name: "Ghana", flag: "🇬🇭", currency: "GH₵", locale: "en-GH",
        paymentRail: "Mobile Money / GIP",
        banks: ["GCB BANK", "ECOBANK GH", "ABSA GH", "MOMO", "FIDELITY BANK GH"],
        bankDetails: [
            { label: "Payment System", value: "Mobile Money / GIP" },
            { label: "MoMo Number", value: "MTN / Vodafone / AirtelTigo" },
            { label: "Bank Branch", value: "Branch sort code" },
            { label: "Reference", value: "Invoice Number" }
        ]
    }
};

// ============================================================
// STATE
// ============================================================
const state = {
    records: [],        // real entries only — Alex J never in here
    nextId: 1,
    region: "ZA",
    currentInvoice: null,
    invoiceIsReal: false  // false = demo invoice showing
};

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    bindNavButtons();
    bindProcessButton();
    bindFileUpload();
    bindPdfButton();
    setInvoiceDate();
    detectRegion();
    renderDemoInvoice(); // show demo invoice on load
});

// ============================================================
// NAVIGATION
// ============================================================
function bindNavButtons() {
    document.querySelectorAll(".nav-btn, .mobile-tab").forEach(btn => {
        btn.addEventListener("click", () => switchAppModule(btn.dataset.target));
    });
}

function switchAppModule(id) {
    document.querySelectorAll(".app-screen").forEach(s => s.classList.remove("active-screen"));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add("active-screen");
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.target === id));
    document.querySelectorAll(".mobile-tab").forEach(t => t.classList.toggle("active", t.dataset.target === id));
}

// ============================================================
// REGION DETECTION
// ============================================================
async function detectRegion() {
    let code = "ZA";
    try {
        const tz   = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        const lang = (navigator.language || "").toLowerCase();

        if (/africa\/(jo|cape|durban)/i.test(tz) || lang.startsWith("en-za")) code = "ZA";
        else if (/america\/(new_york|chicago|los_angeles|denver|phoenix)/i.test(tz) || lang === "en-us") code = "US";
        else if (/europe\/london/i.test(tz) || lang === "en-gb") code = "GB";
        else if (/australia\//i.test(tz) || lang === "en-au") code = "AU";
        else if (/asia\/kolkata/i.test(tz) || lang === "en-in" || lang.startsWith("hi")) code = "IN";
        else if (/africa\/lagos/i.test(tz)) code = "NG";
        else if (/africa\/nairobi/i.test(tz)) code = "KE";
        else if (/africa\/accra/i.test(tz)) code = "GH";
        else if (/asia\/dubai/i.test(tz)) code = "AE";
        else if (/asia\/singapore/i.test(tz)) code = "SG";
        else if (/america\/(toronto|vancouver|montreal|winnipeg)/i.test(tz) || lang === "en-ca") code = "CA";
        else if (/europe\//i.test(tz)) code = "EU";
    } catch (_) { code = "ZA"; }

    applyRegion(code);
}

function applyRegionOverride(code) {
    if (!code) { detectRegion(); return; }
    applyRegion(code);
}

function applyRegion(code) {
    if (!REGION_CONFIG[code]) code = "ZA";
    state.region = code;
    const cfg = REGION_CONFIG[code];

    const display = document.getElementById("region-display");
    if (display) display.textContent = `${cfg.flag} ${cfg.name} — ${cfg.paymentRail}`;

    const sel = document.getElementById("region-override");
    if (sel) sel.value = code;

    const ta = document.getElementById("text-input");
    if (ta) ta.placeholder = regionPlaceholder(code);

    renderBankQueues();

    // Update demo invoice bank details to match region
    if (!state.invoiceIsReal) renderDemoInvoice();
}

function regionPlaceholder(code) {
    const map = {
        ZA: "Example: Sipho here, total outstanding is R3200 for plumbing. Bank FNB.",
        US: "Example: John here, invoice total $1500 for consulting. Bank Chase.",
        GB: "Example: Emma here, total due £800 for design work. Bank Barclays.",
        EU: "Example: Hans here, €1200 owed for dev work. Bank Deutsche Bank.",
        AU: "Example: Liam here, A$2000 for landscaping. Bank CBA.",
        NG: "Example: Emeka here, ₦150000 for logistics. Bank GTB.",
        KE: "Example: Wanjiku here, KSh45000 for catering. Bank Equity.",
        IN: "Example: Priya here, ₹28000 for marketing. Bank HDFC.",
        AE: "Example: Ahmed here, AED 3500 for consulting. Bank FAB.",
        CA: "Example: Sophie here, CA$1800 for photography. Bank TD Bank.",
        SG: "Example: Wei here, S$2200 for web development. Bank DBS.",
        GH: "Example: Kofi here, GH₵1500 for catering. Bank GCB."
    };
    return map[code] || map.ZA;
}

// ============================================================
// DEMO INVOICE (shown on load, locked)
// ============================================================
function renderDemoInvoice() {
    const cfg = REGION_CONFIG[state.region];

    document.getElementById("inv-number").textContent       = "INV-DEMO-0000";
    document.getElementById("inv-client-target").textContent = "Alex J";
    document.getElementById("inv-region-sub").textContent   = `${cfg.name} · CAPITEC`;
    document.getElementById("inv-desc-field").textContent   = "Demo: Contractor plumbing service — 14 units. Replace with a real entry via Scanner.";
    document.getElementById("inv-bank-field").textContent   = cfg.paymentRail;
    document.getElementById("inv-price-field").textContent  = `${cfg.currency}2,800`;
    document.getElementById("inv-total-field").textContent  = `${cfg.currency}2,800`;

    renderBankDetailsBlock(cfg.bankDetails);
    setInvoiceDate();

    // Show demo notice, disable PDF
    const notice = document.getElementById("invoice-demo-notice");
    if (notice) notice.style.display = "flex";

    const pdfBtn = document.getElementById("btn-pdf-download");
    if (pdfBtn) {
        pdfBtn.disabled = true;
        pdfBtn.title    = "Generate a real invoice to enable PDF download";
    }

    state.invoiceIsReal = false;
}

function renderBankDetailsBlock(bankDetails) {
    const grid = document.getElementById("bank-details-grid");
    if (!grid) return;
    grid.innerHTML = bankDetails.map(d => `
        <div class="bank-detail-item">
            <span class="bank-detail-label">${d.label.toUpperCase()}</span>
            <span class="bank-detail-value">${d.value}</span>
        </div>`).join("");
}

// ============================================================
// BANK QUEUE RENDERER (REGIONAL)
// ============================================================
function renderBankQueues() {
    const container = document.getElementById("bank-queues-container");
    if (!container) return;
    const cfg = REGION_CONFIG[state.region];

    container.innerHTML = cfg.banks.map((bank, i) => {
        const qId    = `queue-${bank.replace(/[\s/]+/g, "-").toLowerCase()}`;
        const cls    = ["bank-q1","bank-q2","bank-q3"][i % 3];
        const records = state.records.filter(r => r.bank === bank);
        const rows   = records.length
            ? records.map(r => `
                <div class="mini-recipient-row">
                    <div class="recipient-info">
                        <strong>${r.name}</strong>
                        <span class="recipient-meta">${r.bank} · Pending · ${cfg.paymentRail}</span>
                    </div>
                    <div class="recipient-amount">${r.amount}</div>
                </div>`).join("")
            : `<div class="empty-queue-msg">No pending ${bank} items</div>`;

        return `
        <div class="bank-category-block">
            <div class="bank-header ${cls}">
                <div class="bank-header-left">
                    <span class="bank-dot"></span>
                    <span>${cfg.flag} ${bank} · ${cfg.paymentRail}</span>
                </div>
                <button class="btn-csv" onclick="downloadCSV('${bank}')">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    CSV
                </button>
            </div>
            <div class="bank-queue-list" id="${qId}">${rows}</div>
        </div>`;
    }).join("");
}

// ============================================================
// INTAKE / PROCESS
// ============================================================
function bindProcessButton() {
    const btn = document.getElementById("process-btn");
    if (btn) btn.addEventListener("click", processWorkspaceIntake);
}

function bindFileUpload() {
    const input = document.getElementById("file-input");
    const zone  = document.getElementById("upload-zone");
    if (!input) return;
    input.addEventListener("change", () => {
        if (input.files && input.files[0]) {
            zone.querySelector("strong").textContent = `✓ ${input.files[0].name}`;
            zone.style.borderColor = "#10b981";
            zone.style.background  = "rgba(16,185,129,0.04)";
        }
    });
}

function processWorkspaceIntake() {
    const raw = document.getElementById("text-input").value.trim();
    if (!raw) { showToast("Please enter some text first.", "warn"); return; }

    const cfg = REGION_CONFIG[state.region];

    // Name detection
    const nameMatch = raw.match(/(?:my name is|i am|i'm|this is|from)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i);
    const sipho     = raw.toLowerCase().includes("sipho");
    let   name      = nameMatch ? nameMatch[1] : sipho ? "Sipho Khumalo" : "New Client";

    // Amount detection — handles all currency symbols/codes
    const amtMatch  = raw.match(/(?:R|A\$|CA\$|S\$|GH₵|KSh|AED|GBP|USD|EUR|\$|£|€|₦|₹|Rands?)\s*?(\d[\d,]*(?:\.\d{1,2})?)/i);
    const amountNum = amtMatch ? parseFloat(amtMatch[1].replace(/,/g,"")) : 1000;
    const amountStr = `${cfg.currency}${amountNum.toLocaleString(cfg.locale)}`;

    // Bank detection — match against region's bank list
    const bankUpper = raw.toUpperCase();
    const matched   = cfg.banks.find(b => bankUpper.includes(b)) || cfg.banks[0];

    // Units
    const unitMatch = raw.match(/(\d+)\s*(?:unit|hour|hr|day)/i);
    const units     = unitMatch ? `${unitMatch[1]} units logged` : "Entry logged";

    const id     = state.nextId++;
    const record = { id, name, amount: amountStr, amountNum, bank: matched, units };
    state.records.push(record);

    addLedgerCard(record);
    renderBankQueues();

    document.getElementById("text-input").value = "";
    showToast(`✓ ${name} extracted and added to ledger.`, "success");
    setTimeout(() => switchAppModule("ledger-app"), 600);
}

function addLedgerCard(record) {
    const list = document.getElementById("records-list-target");
    const div  = document.createElement("div");
    div.className = "mobile-record-card";
    div.style.borderLeft = "3px solid var(--interactive)";
    div.innerHTML = `
        <div class="card-row-top">
            <span class="target-name">${record.name}</span>
            <span class="price-text">${record.amount}</span>
        </div>
        <div class="card-details-row">
            <span>${record.units}</span>
            <span class="bank-tag">${record.bank}</span>
        </div>
        <button class="btn-invoice-route" onclick="generateInvoice('${record.name}','${record.amount}','${record.bank}',${record.id})">
            Generate Invoice →
        </button>`;
    list.insertAdjacentElement("afterbegin", div);
}

// ============================================================
// INVOICE — REAL ENTRY
// ============================================================
function generateInvoice(name, cost, bank, id) {
    const cfg    = REGION_CONFIG[state.region];
    const invNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const desc   = `Professional contractor field service assignment matched to ledger entry #${id}. Settlement via ${cfg.paymentRail} (${bank}).`;

    state.currentInvoice  = { client: name, amount: cost, bank, desc, number: invNum, paymentRail: cfg.paymentRail, region: state.region };
    state.invoiceIsReal   = true;

    document.getElementById("inv-number").textContent        = invNum;
    document.getElementById("inv-client-target").textContent = name;
    document.getElementById("inv-region-sub").textContent    = `${cfg.name} · ${bank}`;
    document.getElementById("inv-desc-field").textContent    = desc;
    document.getElementById("inv-bank-field").textContent    = `${bank} · ${cfg.paymentRail}`;
    document.getElementById("inv-price-field").textContent   = cost;
    document.getElementById("inv-total-field").textContent   = cost;

    renderBankDetailsBlock(cfg.bankDetails);
    setInvoiceDate();

    // Hide demo notice, enable PDF
    const notice = document.getElementById("invoice-demo-notice");
    if (notice) notice.style.display = "none";

    const pdfBtn = document.getElementById("btn-pdf-download");
    if (pdfBtn) { pdfBtn.disabled = false; pdfBtn.title = "Download PDF invoice"; }

    switchAppModule("invoice-app");
}

// Expose as global so inline onclick works
window.generateInvoiceMock = generateInvoice;

function setInvoiceDate() {
    const el = document.getElementById("inv-date");
    if (el) el.textContent = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ============================================================
// CSV DOWNLOAD — real records only
// ============================================================
function downloadCSV(bank) {
    const rows = state.records.filter(r => r.bank === bank);
    if (!rows.length) { showToast(`No real ${bank} records to export yet.`, "warn"); return; }

    const cfg   = REGION_CONFIG[state.region];
    const today = new Date().toLocaleDateString("en-GB");
    const hdrs  = ["ID","Client Name","Bank","Payment Rail","Amount","Currency","Units","Date"];
    const lines = [
        hdrs.join(","),
        ...rows.map(r => [r.id, `"${r.name}"`, r.bank, cfg.paymentRail, r.amountNum, cfg.currency, `"${r.units}"`, today].join(","))
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `SanitizerAI_${bank.replace(/[\s/]+/g,"_")}_${today.replace(/\//g,"-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`✓ ${bank} CSV downloaded (${rows.length} record${rows.length > 1 ? "s" : ""}).`, "success");
}

// ============================================================
// PDF DOWNLOAD — real entries only via jsPDF
// ============================================================
function bindPdfButton() {
    const btn = document.getElementById("btn-pdf-download");
    if (btn) btn.addEventListener("click", downloadInvoicePDF);
}

function downloadInvoicePDF() {
    if (!state.invoiceIsReal) { showToast("Generate a real invoice first — demo entries cannot be downloaded.", "warn"); return; }
    if (typeof window.jspdf === "undefined") { showToast("PDF library not loaded. Check your connection.", "warn"); return; }

    const { jsPDF } = window.jspdf;
    const doc   = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const inv   = state.currentInvoice;
    const cfg   = REGION_CONFIG[inv.region || state.region];
    const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const W = 210, M = 18;
    let y = 0;

    // ---- Dark header band ----
    doc.setFillColor(6, 8, 15);
    doc.rect(0, 0, W, 40, "F");
    doc.setFillColor(26, 109, 181);
    doc.rect(0, 38, W, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(19);
    doc.setFont("helvetica", "bold");
    doc.text("SanitizerAI Suite", M, 20);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("INTELLIGENT PAYMENT SYSTEM", M, 29);
    doc.text(`Region: ${cfg.flag} ${cfg.name} · ${cfg.paymentRail}`, M, 35);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(96, 165, 250);
    doc.text("TAX INVOICE", W - M, 16, { align: "right" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text(inv.number, W - M, 23, { align: "right" });
    doc.text(today, W - M, 30, { align: "right" });

    y = 52;

    // ---- Parties ----
    doc.setFillColor(248, 249, 255);
    doc.setDrawColor(228, 232, 240);
    doc.roundedRect(M, y, 82, 30, 3, 3, "FD");
    doc.setFontSize(6.5); doc.setFont("helvetica", "normal"); doc.setTextColor(107, 114, 128);
    doc.text("PREPARED FOR", M + 5, y + 8);
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(17, 24, 39);
    doc.text(inv.client, M + 5, y + 17);
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(107, 114, 128);
    doc.text("Verified Contractor", M + 5, y + 24);

    doc.setFillColor(248, 249, 255);
    doc.roundedRect(W / 2 + 5, y, 82, 30, 3, 3, "FD");
    doc.setFontSize(6.5); doc.setFont("helvetica", "normal"); doc.setTextColor(107, 114, 128);
    doc.text("ISSUED BY", W / 2 + 10, y + 8);
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(17, 24, 39);
    doc.text("SanitizerAI Suite", W / 2 + 10, y + 17);
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(107, 114, 128);
    doc.text("Verified Payment Intelligence", W / 2 + 10, y + 24);

    y += 40;

    // ---- Bank details panel ----
    doc.setFillColor(240, 246, 255);
    doc.setDrawColor(190, 220, 245);
    doc.roundedRect(M, y, W - M * 2, 28, 3, 3, "FD");
    doc.setFontSize(6.5); doc.setFont("helvetica", "bold"); doc.setTextColor(26, 109, 181);
    doc.text("BANKING / PAYMENT DETAILS", M + 5, y + 7);

    const bds = cfg.bankDetails;
    const colW = (W - M * 2 - 10) / 2;
    bds.forEach((d, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const bx  = M + 5 + col * (colW + 5);
        const by  = y + 13 + row * 9;
        doc.setFontSize(5.8); doc.setFont("helvetica", "normal"); doc.setTextColor(107, 114, 128);
        doc.text(d.label.toUpperCase(), bx, by);
        doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(17, 24, 39);
        doc.text(d.value, bx, by + 5);
    });

    y += 36;

    // ---- Line items ----
    doc.setFillColor(6, 8, 15);
    doc.rect(M, y, W - M * 2, 9, "F");
    doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(255, 255, 255);
    doc.text("DESCRIPTION", M + 4, y + 6);
    doc.text("BANK / RAIL", W - M - 52, y + 6);
    doc.text("AMOUNT DUE", W - M - 4, y + 6, { align: "right" });
    y += 9;

    doc.setFillColor(250, 251, 255); doc.setDrawColor(228, 232, 240);
    doc.rect(M, y, W - M * 2, 22, "FD");
    doc.setTextColor(17, 24, 39); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
    const dLines = doc.splitTextToSize(inv.desc, 98);
    doc.text(dLines, M + 4, y + 9);
    doc.text(`${inv.bank}`, W - M - 52, y + 9);
    doc.setFont("helvetica", "bold");
    doc.text(inv.amount, W - M - 4, y + 9, { align: "right" });
    y += 28;

    // ---- Total ----
    doc.setFillColor(6, 8, 15);
    doc.rect(M, y, W - M * 2, 13, "F");
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
    doc.text("TOTAL SETTLEMENT VALUE", M + 4, y + 8.5);
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(134, 239, 172);
    doc.text(inv.amount, W - M - 4, y + 9, { align: "right" });
    y += 22;

    // ---- Footer ----
    doc.setDrawColor(228, 232, 240); doc.line(M, y, W - M, y); y += 6;
    doc.setFontSize(6.5); doc.setFont("helvetica", "normal"); doc.setTextColor(156, 163, 175);
    doc.text(`SanitizerAI Suite · Intelligent Payment System · ${today}`, W / 2, y, { align: "center" });

    doc.save(`${inv.number}_SanitizerAI_Invoice.pdf`);
    showToast(`✓ ${inv.number} PDF downloaded.`, "success");
}

// ============================================================
// WHATSAPP
// ============================================================
function triggerWhatsAppSend() {
    if (!state.invoiceIsReal) {
        showToast("Generate a real invoice before sharing.", "warn");
        return;
    }
    const inv = state.currentInvoice;
    const msg = `Hello, please find Tax Invoice ${inv.number} from SanitizerAI Suite for services rendered by ${inv.client}. Total Outstanding: ${inv.amount}. Payment via ${inv.paymentRail}. Kindly process at your earliest convenience.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
}

// ============================================================
// TOAST
// ============================================================
function showToast(message, type = "success") {
    document.querySelectorAll(".sai-toast").forEach(t => t.remove());
    const toast   = document.createElement("div");
    toast.className = "sai-toast";
    const accent  = { success: "#10b981", warn: "#f59e0b", error: "#ef4444" }[type] || "#10b981";
    toast.style.cssText = `
        position:fixed; bottom:84px; left:50%; transform:translateX(-50%) translateY(12px);
        background:#06080f; color:white; padding:11px 20px; border-radius:10px;
        font-size:0.82rem; font-family:'Inter',sans-serif; font-weight:500;
        z-index:9999; box-shadow:0 8px 28px rgba(0,0,0,0.28);
        border-left:3px solid ${accent}; opacity:0;
        transition:all 0.26s cubic-bezier(0.34,1.56,0.64,1);
        max-width:360px; white-space:nowrap;`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(-50%) translateY(0)";
    }));
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(12px)";
        setTimeout(() => toast.remove(), 300);
    }, 3400);
}

// Expose globals for inline onclick attributes
window.switchAppModule    = switchAppModule;
window.generateInvoice    = generateInvoice;
window.downloadCSV        = downloadCSV;
window.triggerWhatsAppSend = triggerWhatsAppSend;
window.applyRegionOverride = applyRegionOverride;
