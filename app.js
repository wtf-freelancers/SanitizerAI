/* ============================================================
   SanitizerAI Enterprise — app.js
   Features: Navigation, Intake, Ledger, EFT, Invoice
             Real CSV download, Real PDF generation (jsPDF)
   ============================================================ */

"use strict";

// ============================================================
// STATE
// ============================================================
const state = {
    records: [
        { id: 1, name: "Alex J", amount: "R2,800.00", amountNum: 2800, bank: "CAPITEC", units: "14 units logged" }
    ],
    nextId: 2,
    currentInvoice: {
        client: "Alex J",
        amount: "R2,800.00",
        bank: "CAPITEC",
        desc: "Contractor service items parsed via secure operational system channel logging",
        number: "INV-2026-0041"
    }
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
});

// ============================================================
// NAVIGATION
// ============================================================
function bindNavButtons() {
    // Desktop sidebar
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.target;
            switchAppModule(target);
        });
    });

    // Mobile bottom nav
    document.querySelectorAll(".mobile-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.target;
            switchAppModule(target);
        });
    });
}

function switchAppModule(targetScreenId) {
    // Screens
    document.querySelectorAll(".app-screen").forEach(s => s.classList.remove("active-screen"));
    const screen = document.getElementById(targetScreenId);
    if (screen) screen.classList.add("active-screen");

    // Desktop nav
    document.querySelectorAll(".nav-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.target === targetScreenId);
    });

    // Mobile tabs
    document.querySelectorAll(".mobile-tab").forEach(t => {
        t.classList.toggle("active", t.dataset.target === targetScreenId);
    });
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
            const fileName = input.files[0].name;
            zone.querySelector("strong").textContent = `✓ ${fileName}`;
            zone.style.borderColor = "#10b981";
            zone.style.background = "rgba(16,185,129,0.04)";
        }
    });
}

function processWorkspaceIntake() {
    const inputVal = document.getElementById("text-input").value.trim();
    if (!inputVal) {
        showToast("Please enter some text first.", "warn");
        return;
    }

    // Parse name
    const nameMatch = inputVal.match(/(?:my name is|i am|i'm|this is|from)\s+([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i);
    let name = nameMatch ? nameMatch[1] : (inputVal.toLowerCase().includes("sipho") ? "Sipho Khumalo" : "Client Entry");

    // Parse amount
    const amountMatch = inputVal.match(/(?:R|Rands?)\s*?(\d[\d,]*)/i);
    const amountNum = amountMatch ? parseInt(amountMatch[1].replace(/,/g, "")) : 3200;
    const amountStr = `R${amountNum.toLocaleString("en-ZA")}.00`;

    // Parse bank
    const bank = /fnb/i.test(inputVal) ? "FNB" : /standard\s*bank/i.test(inputVal) ? "STANDARD BANK" : "CAPITEC";

    // Parse units
    const unitMatch = inputVal.match(/(\d+)\s*(?:unit|hour|hr|day)/i);
    const units = unitMatch ? `${unitMatch[1]} units logged` : "Units logged";

    const id = state.nextId++;
    const record = { id, name, amount: amountStr, amountNum, bank, units };
    state.records.push(record);

    // Add to ledger DOM
    addLedgerCard(record);

    // Add to EFT queue
    addToEFTQueue(record);

    // Clear + redirect
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
        <button class="btn-invoice-route" onclick="generateInvoiceMock('${record.name}', '${record.amount}', '${record.bank}')">
            Generate Invoice →
        </button>
    `;
    ledgerList.insertAdjacentElement("afterbegin", div);
}

function addToEFTQueue(record) {
    const queueId = record.bank === "FNB" ? "queue-fnb" : "queue-capitec";
    const queue = document.getElementById(queueId);

    // Remove empty message if present
    const emptyMsg = queue.querySelector(".empty-queue-msg");
    if (emptyMsg) emptyMsg.remove();

    const row = document.createElement("div");
    row.className = "mini-recipient-row";
    row.innerHTML = `
        <div class="recipient-info">
            <strong>${record.name}</strong>
            <span class="recipient-meta">${record.bank} · Pending</span>
        </div>
        <div class="recipient-amount">${record.amount}</div>
    `;
    queue.insertAdjacentElement("afterbegin", row);
}

// ============================================================
// INVOICE GENERATION
// ============================================================
function generateInvoiceMock(name, cost, bank) {
    const invNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    state.currentInvoice = {
        client: name,
        amount: cost,
        bank,
        desc: `Professional contractor field service assignment matched to ledger entry records. Settlement Routing: (${bank})`,
        number: invNum
    };

    document.getElementById("inv-client-target").textContent = name;
    document.getElementById("inv-price-field").textContent = cost;
    document.getElementById("inv-total-field").textContent = cost;
    document.getElementById("inv-desc-field").textContent = state.currentInvoice.desc;
    document.getElementById("inv-bank-field").textContent = bank;
    document.getElementById("inv-number").textContent = invNum;

    setInvoiceDate();
    switchAppModule("invoice-app");
}

function setInvoiceDate() {
    const el = document.getElementById("inv-date");
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

// ============================================================
// CSV DOWNLOAD (REAL)
// ============================================================
function downloadCSV(bank) {
    const bankUpper = bank.toUpperCase();

    // Filter records for this bank
    const rows = state.records.filter(r => r.bank.toUpperCase().includes(bankUpper));

    if (rows.length === 0) {
        showToast(`No ${bankUpper} records to download.`, "warn");
        return;
    }

    // Build CSV content
    const headers = ["ID", "Client Name", "Bank", "Amount", "Units", "Date"];
    const today = new Date().toLocaleDateString("en-ZA");

    const csvLines = [
        headers.join(","),
        ...rows.map(r =>
            [r.id, `"${r.name}"`, r.bank, r.amount, `"${r.units}"`, today].join(",")
        )
    ];

    const csvContent = csvLines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `SanitizerAI_${bankUpper}_Batch_${today.replace(/\//g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`✓ ${bankUpper} CSV downloaded (${rows.length} record${rows.length > 1 ? "s" : ""}).`, "success");
}

// ============================================================
// PDF DOWNLOAD (REAL — jsPDF)
// ============================================================
function bindPdfButton() {
    const btn = document.getElementById("btn-pdf-download");
    if (btn) btn.addEventListener("click", downloadInvoicePDF);
}

function downloadInvoicePDF() {
    if (typeof window.jspdf === "undefined") {
        showToast("PDF library not loaded. Please check your connection.", "warn");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const inv = state.currentInvoice;
    const today = new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" });

    const W = 210; // A4 width mm
    const margin = 18;
    let y = 0;

    // ---- Header band ----
    doc.setFillColor(13, 15, 26);
    doc.rect(0, 0, W, 36, "F");

    // Logo-like accent line
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 34, W, 2, "F");

    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("SanitizerAI Enterprise", margin, 20);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("VERIFIED PAYMENT INTELLIGENCE", margin, 28);

    // Invoice label (right)
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(129, 140, 248);
    doc.text("TAX INVOICE", W - margin, 17, { align: "right" });

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text(inv.number, W - margin, 24, { align: "right" });
    doc.text(today, W - margin, 30, { align: "right" });

    y = 48;

    // ---- Client / Issuer boxes ----
    // Client box
    doc.setFillColor(248, 249, 255);
    doc.setDrawColor(228, 232, 240);
    doc.roundedRect(margin, y, 82, 26, 3, 3, "FD");

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("PREPARED FOR", margin + 5, y + 7);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text(inv.client, margin + 5, y + 15);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Verified Contractor", margin + 5, y + 21);

    // Issuer box
    doc.setFillColor(248, 249, 255);
    doc.roundedRect(W / 2 + 5, y, 82, 26, 3, 3, "FD");

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("ISSUED BY", W / 2 + 10, y + 7);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text("SanitizerAI", W / 2 + 10, y + 15);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("Enterprise Division", W / 2 + 10, y + 21);

    y += 36;

    // ---- Line items table header ----
    doc.setFillColor(13, 15, 26);
    doc.rect(margin, y, W - margin * 2, 9, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIPTION", margin + 4, y + 6);
    doc.text("BANK", W - margin - 55, y + 6);
    doc.text("AMOUNT DUE", W - margin - 4, y + 6, { align: "right" });

    y += 9;

    // ---- Line item row ----
    doc.setFillColor(250, 251, 255);
    doc.setDrawColor(228, 232, 240);
    doc.rect(margin, y, W - margin * 2, 18, "FD");

    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);

    // Wrap description text
    const descLines = doc.splitTextToSize(inv.desc, 100);
    doc.text(descLines, margin + 4, y + 7);

    doc.text(inv.bank, W - margin - 55, y + 7);

    doc.setFont("helvetica", "bold");
    doc.text(inv.amount, W - margin - 4, y + 7, { align: "right" });

    y += 24;

    // ---- Total row ----
    doc.setFillColor(13, 15, 26);
    doc.rect(margin, y, W - margin * 2, 12, "F");

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text("TOTAL SETTLEMENT VALUE", margin + 4, y + 8);

    doc.setTextColor(134, 239, 172);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(inv.amount, W - margin - 4, y + 8.5, { align: "right" });

    y += 20;

    // ---- Footer ----
    doc.setDrawColor(228, 232, 240);
    doc.line(margin, y, W - margin, y);
    y += 6;

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text(
        "Generated by SanitizerAI Enterprise · Confidential Financial Document · " + today,
        W / 2, y, { align: "center" }
    );

    // ---- Save ----
    doc.save(`${inv.number}_SanitizerAI_Invoice.pdf`);
    showToast(`✓ ${inv.number} PDF downloaded.`, "success");
}

// ============================================================
// WHATSAPP
// ============================================================
function triggerWhatsAppSend() {
    const inv = state.currentInvoice;
    const msg = `Hello, here is Tax Invoice ${inv.number} generated via SanitizerAI Enterprise for services rendered by ${inv.client}. Total Outstanding Balance: ${inv.amount}. Please process at your earliest convenience.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = "success") {
    // Remove existing
    const existing = document.querySelector(".sai-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "sai-toast";

    const colors = {
        success: { bg: "#0d0f1a", accent: "#10b981" },
        warn:    { bg: "#0d0f1a", accent: "#f59e0b" },
        error:   { bg: "#0d0f1a", accent: "#ef4444" }
    };

    const c = colors[type] || colors.success;

    toast.style.cssText = `
        position: fixed;
        bottom: 88px;
        left: 50%;
        transform: translateX(-50%) translateY(10px);
        background: ${c.bg};
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        font-size: 0.835rem;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        z-index: 9999;
        box-shadow: 0 8px 28px rgba(0,0,0,0.25);
        border-left: 3px solid ${c.accent};
        opacity: 0;
        transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
        max-width: 320px;
        white-space: nowrap;
    `;

    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateX(-50%) translateY(0)";
        });
    });

    // Animate out
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(10px)";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Expose globals for inline onclick (invoice screen)
window.switchAppModule = switchAppModule;
window.generateInvoiceMock = generateInvoiceMock;
window.downloadCSV = downloadCSV;
window.triggerWhatsAppSend = triggerWhatsAppSend;
