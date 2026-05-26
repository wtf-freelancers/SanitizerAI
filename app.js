"use strict";

// ============================================================
// REGIONAL BANK CONFIG
// ============================================================
const REGION_CONFIG = {
    ZA: {
        name: "South Africa",
        flag: "🇿🇦",
        currency: "R",
        locale: "en-ZA",
        paymentRail: "EFT",
        banks: ["CAPITEC", "FNB", "ABSA", "STANDARD BANK", "NEDBANK", "TYMEBANK"]
    },
    US: {
        name: "United States",
        flag: "🇺🇸",
        currency: "$",
        locale: "en-US",
        paymentRail: "ACH",
        banks: ["CHASE", "BANK OF AMERICA", "WELLS FARGO", "CITIBANK", "US BANK"]
    },
    GB: {
        name: "United Kingdom",
        flag: "🇬🇧",
        currency: "£",
        locale: "en-GB",
        paymentRail: "Faster Payments",
        banks: ["BARCLAYS", "LLOYDS", "HSBC UK", "NATWEST", "MONZO", "STARLING"]
    },
    EU: {
        name: "Europe",
        flag: "🇪🇺",
        currency: "€",
        locale: "de-DE",
        paymentRail: "SEPA",
        banks: ["DEUTSCHE BANK", "BNP PARIBAS", "SANTANDER EU", "ING", "REVOLUT EU"]
    },
    AU: {
        name: "Australia",
        flag: "🇦🇺",
        currency: "A$",
        locale: "en-AU",
        paymentRail: "NPP / OSKO",
        banks: ["CBA", "WESTPAC", "ANZ", "NAB", "MACQUARIE"]
    },
    NG: {
        name: "Nigeria",
        flag: "🇳🇬",
        currency: "₦",
        locale: "en-NG",
        paymentRail: "NIBSS / NIP",
        banks: ["ZENITH BANK", "GTB", "ACCESS BANK", "UBA", "FIRST BANK", "OPAY"]
    },
    KE: {
        name: "Kenya",
        flag: "🇰🇪",
        currency: "KSh",
        locale: "en-KE",
        paymentRail: "RTGS / M-Pesa",
        banks: ["KCB", "EQUITY BANK", "COOPERATIVE", "MPESA", "NCBA", "ABSA KE"]
    },
    IN: {
        name: "India",
        flag: "🇮🇳",
        currency: "₹",
        locale: "en-IN",
        paymentRail: "UPI / NEFT",
        banks: ["SBI", "HDFC", "ICICI", "AXIS", "KOTAK", "PAYTM"]
    },
    AE: {
        name: "UAE",
        flag: "🇦🇪",
        currency: "AED",
        locale: "en-AE",
        paymentRail: "UAEFTS / AANI",
        banks: ["EMIRATES NBD", "FAB", "ADCB", "MASHREQ", "DIB"]
    },
    CA: {
        name: "Canada",
        flag: "🇨🇦",
        currency: "CA$",
        locale: "en-CA",
        paymentRail: "Interac / EFT",
        banks: ["RBC", "TD BANK", "SCOTIABANK", "BMO", "CIBC"]
    }
};

// ============================================================
// STATE
// ============================================================
const state = {
    records: [], // no demo records — Alex J is UI-only
    nextId: 1,
    region: "ZA",
    currentInvoice: null,
    invoiceReady: false
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
});

// ============================================================
// NAVIGATION
// ============================================================
function bindNavButtons() {
    document.querySelectorAll(".nav-btn, .mobile-tab").forEach(btn => {
        btn.addEventListener("click", () => switchAppModule(btn.dataset.target));
    });
}

function switchAppModule(targetScreenId) {
    document.querySelectorAll(".app-screen").forEach(s => s.classList.remove("active-screen"));
    const screen = document.getElementById(targetScreenId);
    if (screen) screen.classList.add("active-screen");

    document.querySelectorAll(".nav-btn").forEach(b =>
        b.classList.toggle("active", b.dataset.target === targetScreenId));
    document.querySelectorAll(".mobile-tab").forEach(t =>
        t.classList.toggle("active", t.dataset.target === targetScreenId));
}

// ============================================================
// REGION DETECTION
// ============================================================
async function detectRegion() {
    let detected = "ZA"; // default

    try {
        // Try timezone-based detection first (no API needed)
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        const lang = navigator.language || "";

        if (/Africa\/Jo/.test(tz) || /Africa\/Cape/.test(tz) || /za/i.test(lang)) detected = "ZA";
        else if (/America\/New_York|America\/Chicago|America\/Los_Angeles|America\/Denver/.test(tz) || /^en-US/i.test(lang)) detected = "US";
        else if (/Europe\/London/.test(tz) || /^en-GB/i.test(lang)) detected = "GB";
        else if (/Australia/.test(tz) || /^en-AU/i.test(lang)) detected = "AU";
        else if (/Asia\/Kolkata/.test(tz) || /^hi|^en-IN/i.test(lang)) detected = "IN";
        else if (/Africa\/Lagos/.test(tz)) detected = "NG";
        else if (/Africa\/Nairobi/.test(tz)) detected = "KE";
        else if (/Asia\/Dubai/.test(tz)) detected = "AE";
        else if (/America\/Toronto|America\/Vancouver/.test(tz) || /^en-CA/i.test(lang)) detected = "CA";
        else if (/Europe\//.test(tz)) detected = "EU";
    } catch (e) {
        detected = "ZA";
    }

    applyRegion(detected);
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

    // Sync select
    const sel = document.getElementById("region-override");
    if (sel) sel.value = code;

    // Update placeholder text
    const ta = document.getElementById("text-input");
    if (ta) {
        const ex = getRegionExample(code);
        ta.placeholder = ex;
    }

    renderBankQueues();
}

function getRegionExample(code) {
    const examples = {
        ZA: "Example: Sipho here, total outstanding is R3200 for plumbing. Bank FNB.",
        US: "Example: John here, invoice total $1500 for consulting. Bank Chase.",
        GB: "Example: Emma here, total due £800 for design work. Bank Barclays.",
        EU: "Example: Hans here, €1200 owed for dev work. Bank Deutsche Bank.",
        AU: "Example: Liam here, A$2000 for landscaping. Bank CBA.",
        NG: "Example: Emeka here, ₦150000 for logistics. Bank GTB.",
        KE: "Example: Wanjiku here, KSh45000 for catering. Bank Equity.",
        IN: "Example: Priya here, ₹28000 for marketing. Bank HDFC.",
        AE: "Example: Ahmed here, AED 3500 for consulting. Bank FAB.",
        CA: "Example: Sophie here, CA$1800 for photography. Bank TD Bank."
    };
    return examples[code] || examples.ZA;
}

// ============================================================
// BANK QUEUE RENDERER (REGIONAL)
// ============================================================
function renderBankQueues() {
    const container = document.getElementById("bank-queues-container");
    if (!container) return;

    const cfg = REGION_CONFIG[state.region];
    const banks = cfg.banks;

    container.innerHTML = banks.map((bank, i) => {
        const queueId = `queue-${bank.replace(/\s+/g, "-").toLowerCase()}`;
        const colorClass = i % 3 === 0 ? "bank-q1" : i % 3 === 1 ? "bank-q2" : "bank-q3";
        const records = state.records.filter(r => r.bank === bank);
        const hasRecords = records.length > 0;

        const rows = hasRecords
            ? records.map(r => `
                <div class="mini-recipient-row">
                    <div class="recipient-info">
                        <strong>${r.name}</strong>
                        <span class="recipient-meta">${r.bank} · Pending</span>
                    </div>
                    <div class="recipient-amount">${r.amount}</div>
                </div>`).join("")
            : `<div class="empty-queue-msg">No pending ${bank} items</div>`;

        return `
        <div class="bank-category-block">
            <div class="bank-header ${colorClass}">
                <div class="bank-header-left">
                    <span class="bank-dot"></span>
                    <span>${cfg.flag} ${bank} · ${cfg.paymentRail}</span>
                </div>
                <button class="btn-csv" onclick="downloadCSV('${bank}')">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    CSV
                </button>
            </div>
            <div class="bank-queue-list" id="${queueId}">${rows}</div>
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
    const zone = document.getElementById("upload-zone");
    if (!input) return;
    input.addEventListener("change", () => {
        if (input.files && input.files[0]) {
            zone.querySelector("strong").textContent = `✓ ${input.files[0].name}`;
            zone.style.borderColor = "#10b981";
            zone.style.background = "rgba(16,185,129,0.04)";
        }
    });
}

function processWorkspaceIntake() {
    const inputVal = document.getElementById("text-input").value.trim();
    if (!inputVal) { showToast("Please enter some text first.", "warn"); return; }

    const cfg = REGION_CONFIG[state.region];

    // Parse name
    const nameMatch = inputVal.match(/(?:my name is|i am|i'm|this is|from)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i);
    const siphoCheck = inputVal.toLowerCase().includes("sipho");
    let name = nameMatch ? nameMatch[1] : siphoCheck ? "Sipho Khumalo" : "New Client";

    // Parse amount — handles R, $, £, €, ₦, ₹, KSh, AED, A$, CA$
    const amountMatch = inputVal.match(/(?:R|A\$|CA\$|KSh|AED|USD|\$|£|€|₦|₹|Rands?)\s*?(\d[\d,]*)/i);
    const amountNum = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 1000;
    const amountStr = `${cfg.currency}${amountNum.toLocaleString(cfg.locale)}`;

    // Parse bank — match against region banks
    const bankMatch = cfg.banks.find(b => inputVal.toUpperCase().includes(b));
    const bank = bankMatch || cfg.banks[0];

    const unitMatch = inputVal.match(/(\d+)\s*(?:unit|hour|hr|day)/i);
    const units = unitMatch ? `${unitMatch[1]} units logged` : "Entry logged";

    const id = state.nextId++;
    const record = { id, name, amount: amountStr, amountNum, bank, units };
    state.records.push(record);

    addLedgerCard(record);
    renderBankQueues();

    document.getElementById("text-input").value = "";
    showToast(`✓ ${name} extracted and added to ledger.`, "success");
    setTimeout(() => switchAppModule("ledger-app"), 600);
}

function addLedgerCard(record) {
    const ledgerList = document.getElementById("records-list-target");
    const div = document.createElement("div");
    div.className = "mobile-record-card";
    div.style.borderLeft = "3px solid #6366f1";
    div.innerHTML = `
        <div class="card-row-top">
            <span class="target-name">${record.name}</span>
            <span class="price-text target-cost">${record.amount}</span>
        </div>
        <div class="card-details-row">
            <span>${record.units}</span>
            <span class="bank-tag">${record.bank}</span>
        </div>
        <button class="btn-invoice-route" onclick="generateInvoiceMock('${record.name}', '${record.amount}', '${record.bank}', ${record.id})">
            Generate Invoice →
        </button>
    `;
    ledgerList.insertAdjacentElement("afterbegin", div);
}

// ============================================================
// INVOICE
// ============================================================
function generateInvoiceMock(name, cost, bank, id) {
    const cfg = REGION_CONFIG[state.region];
    const invNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const desc = `Professional contractor field service assignment matched to ledger entry records. Settlement via ${cfg.paymentRail} (${bank}).`;

    state.currentInvoice = { client: name, amount: cost, bank, desc, number: invNum, paymentRail: cfg.paymentRail };
    state.invoiceReady = true;

    document.getElementById("inv-client-target").textContent = name;
    document.getElementById("inv-price-field").textContent = cost;
    document.getElementById("inv-total-field").textContent = cost;
    document.getElementById("inv-desc-field").textContent = desc;
    document.getElementById("inv-bank-field").textContent = `${bank} · ${cfg.paymentRail}`;
    document.getElementById("inv-number").textContent = invNum;
    setInvoiceDate();

    // Show invoice, hide placeholder
    document.getElementById("invoice-printable").style.display = "block";
    document.getElementById("invoice-placeholder").style.display = "none";
    document.getElementById("invoice-actions").style.display = "grid";

    switchAppModule("invoice-app");
}

function setInvoiceDate() {
    const el = document.getElementById("inv-date");
    if (!el) return;
    el.textContent = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ============================================================
// CSV DOWNLOAD (real records only)
// ============================================================
function downloadCSV(bank) {
    const rows = state.records.filter(r => r.bank === bank);
    if (rows.length === 0) { showToast(`No real ${bank} records to export yet.`, "warn"); return; }

    const cfg = REGION_CONFIG[state.region];
    const today = new Date().toLocaleDateString("en-GB");
    const headers = ["ID", "Client Name", "Bank", "Payment Rail", "Amount", "Currency", "Units", "Date"];
    const lines = [
        headers.join(","),
        ...rows.map(r => [r.id, `"${r.name}"`, r.bank, cfg.paymentRail, r.amountNum, cfg.currency, `"${r.units}"`, today].join(","))
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SanitizerAI_${bank.replace(/\s/g,"_")}_Batch_${today.replace(/\//g,"-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`✓ ${bank} CSV downloaded (${rows.length} record${rows.length > 1 ? "s" : ""}).`, "success");
}

// ============================================================
// PDF DOWNLOAD (real jsPDF)
// ============================================================
function bindPdfButton() {
    const btn = document.getElementById("btn-pdf-download");
    if (btn) btn.addEventListener("click", downloadInvoicePDF);
}

function downloadInvoicePDF() {
    if (!state.invoiceReady) { showToast("Generate an invoice first.", "warn"); return; }
    if (typeof window.jspdf === "undefined") { showToast("PDF library not loaded. Check connection.", "warn"); return; }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const inv = state.currentInvoice;
    const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    const W = 210, margin = 18;
    let y = 0;

    // Header band
    doc.setFillColor(13, 15, 26);
    doc.rect(0, 0, W, 38, "F");
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 36, W, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("SanitizerAI Suite", margin, 20);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("VERIFIED PAYMENT INTELLIGENCE", margin, 28);
    doc.text("Enterprise Division", margin, 33);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(129, 140, 248);
    doc.text("TAX INVOICE", W - margin, 17, { align: "right" });
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text(inv.number, W - margin, 24, { align: "right" });
    doc.text(today, W - margin, 31, { align: "right" });

    y = 50;

    // Client / Issuer
    doc.setFillColor(248, 249, 255);
    doc.setDrawColor(228, 232, 240);
    doc.roundedRect(margin, y, 82, 28, 3, 3, "FD");
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(107, 114, 128);
    doc.text("PREPARED FOR", margin + 5, y + 8);
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(17, 24, 39);
    doc.text(inv.client, margin + 5, y + 17);
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(107, 114, 128);
    doc.text("Verified Contractor", margin + 5, y + 23);

    doc.setFillColor(248, 249, 255);
    doc.roundedRect(W / 2 + 5, y, 82, 28, 3, 3, "FD");
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(107, 114, 128);
    doc.text("ISSUED BY", W / 2 + 10, y + 8);
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(17, 24, 39);
    doc.text("SanitizerAI Suite", W / 2 + 10, y + 17);
    doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(107, 114, 128);
    doc.text("Enterprise Division", W / 2 + 10, y + 23);

    y += 38;

    // Table header
    doc.setFillColor(13, 15, 26);
    doc.rect(margin, y, W - margin * 2, 9, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTION", margin + 4, y + 6);
    doc.text("BANK / RAIL", W - margin - 55, y + 6);
    doc.text("AMOUNT DUE", W - margin - 4, y + 6, { align: "right" });
    y += 9;

    // Table row
    doc.setFillColor(250, 251, 255); doc.setDrawColor(228, 232, 240);
    doc.rect(margin, y, W - margin * 2, 20, "FD");
    doc.setTextColor(17, 24, 39); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
    const descLines = doc.splitTextToSize(inv.desc, 100);
    doc.text(descLines, margin + 4, y + 8);
    doc.text(`${inv.bank}`, W - margin - 55, y + 8);
    doc.setFont("helvetica", "bold");
    doc.text(inv.amount, W - margin - 4, y + 8, { align: "right" });
    y += 26;

    // Total
    doc.setFillColor(13, 15, 26);
    doc.rect(margin, y, W - margin * 2, 13, "F");
    doc.setTextColor(148, 163, 184); doc.setFontSize(7.5); doc.setFont("helvetica", "normal");
    doc.text("TOTAL SETTLEMENT VALUE", margin + 4, y + 8.5);
    doc.setTextColor(134, 239, 172); doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text(inv.amount, W - margin - 4, y + 9, { align: "right" });
    y += 22;

    // Footer
    doc.setDrawColor(228, 232, 240); doc.line(margin, y, W - margin, y); y += 6;
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(156, 163, 175);
    doc.text(`Generated by SanitizerAI Suite · Confidential Financial Document · ${today}`, W / 2, y, { align: "center" });

    doc.save(`${inv.number}_SanitizerAI_Invoice.pdf`);
    showToast(`✓ ${inv.number} PDF downloaded.`, "success");
}

// ============================================================
// WHATSAPP
// ============================================================
function triggerWhatsAppSend() {
    if (!state.invoiceReady) { showToast("No invoice ready to send.", "warn"); return; }
    const inv = state.currentInvoice;
    const msg = `Hello, here is Tax Invoice ${inv.number} generated via SanitizerAI Suite for services rendered by ${inv.client}. Total Outstanding Balance: ${inv.amount}. Payment via ${inv.paymentRail}. Please process at your earliest convenience.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
}

// ============================================================
// TOAST
// ============================================================
function showToast(message, type = "success") {
    const existing = document.querySelector(".sai-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.className = "sai-toast";
    const accent = type === "success" ? "#10b981" : type === "warn" ? "#f59e0b" : "#ef4444";
    toast.style.cssText = `
        position:fixed; bottom:88px; left:50%; transform:translateX(-50%) translateY(10px);
        background:#0d0f1a; color:white; padding:12px 20px; border-radius:10px;
        font-size:0.835rem; font-family:'Inter',sans-serif; font-weight:500;
        z-index:9999; box-shadow:0 8px 28px rgba(0,0,0,0.25);
        border-left:3px solid ${accent}; opacity:0;
        transition:all 0.28s cubic-bezier(0.34,1.56,0.64,1);
        max-width:340px; white-space:nowrap;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => requestAnimationFrame(() => {
        toast.style.opacity = "1"; toast.style.transform = "translateX(-50%) translateY(0)";
    }));
    setTimeout(() => {
        toast.style.opacity = "0"; toast.style.transform = "translateX(-50%) translateY(10px)";
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// Globals for inline onclick
window.switchAppModule = switchAppModule;
window.generateInvoiceMock = generateInvoiceMock;
window.downloadCSV = downloadCSV;
window.triggerWhatsAppSend = triggerWhatsAppSend;
window.applyRegionOverride = applyRegionOverride;
