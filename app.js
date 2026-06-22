const CPE_ITEMS = {
  "204376": {
    name: "ONT-411",
    type: "GPON ONT",
    max: 10
  },

  "213567": {
    name: "ONT-611",
    type: "GPON ONT",
    max: 10
  },

  "214181": {
    name: "ONT-601",
    type: "GPON ONT",
    max: 10
  },

  "213155": {
    name: "ONT-622",
    type: "XGSPON ONT",
    max: 12
  },

  "214152": {
    name: "ONT-632",
    type: "XGSPON ONT",
    max: 12
  },

  "213380": {
    name: "Modem-834",
    type: "Gateway",
    max: 22
  },

  "213484": {
    name: "Modem-854",
    type: "Gateway",
    max: 22
  },

  "213850": {
    name: "Modem-854 SOS",
    type: "Gateway",
    max: 22
  },

  "214595": {
    name: "Modem-8612 SOS",
    type: "Gateway",
    max: 22
  },

  "214278": {
    name: "Modem-8612",
    type: "Gateway",
    max: 22
  },

  "213865": {
    name: "Extender-6E",
    type: "Extender",
    max: 11
  },

  "213320": {
    name: "Extender-AX",
    type: "Extender",
    max: 11
  },

  "213264": {
    name: "Extender-841",
    type: "Extender",
    max: 11
  }
};

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const fileStatus = document.getElementById("fileStatus");
const generateBtn = document.getElementById("generateBtn");
const printBtn = document.getElementById("printBtn");

let selectedFile = null;
let summaryData = null;

function setLoadedFile(file) {
  selectedFile = file;

  fileStatus.textContent = file.name;
  fileStatus.classList.add("file-loaded");

  generateBtn.disabled = false;
}

dropZone.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) return;

  setLoadedFile(file);
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();

  const file = event.dataTransfer.files[0];

  if (!file) return;

  setLoadedFile(file);
});

const resultsDiv = document.getElementById("results");

generateBtn.addEventListener("click", () => {

  if (!selectedFile) return;

  const reader = new FileReader();

  reader.onload = (e) => {

    const csvText = e.target.result;

    const lines = csvText.split(/\r?\n/);

    const counts = {};

Object.keys(CPE_ITEMS).forEach(part => {
  counts[part] = 0;
});

    for (let i = 1; i < lines.length; i++) {

      const line = lines[i];

      if (!line.trim()) continue;

      const match = line.match(/(\d{6})-/);

      if (!match) continue;

      const partNumber = match[1];

      if (counts.hasOwnProperty(partNumber)) {
        counts[partNumber]++;
      }
    }
/*
    let rows = "";
    let totalPieces = 0;

    Object.entries(TOTE_ITEMS).forEach(([partNumber, item]) => {

      const currentQty = counts[partNumber] || 0;
      const neededQty = item.maxQty - currentQty;

      if (neededQty > 0) {

       totalPieces += neededQty;
        
       rows += `
          <tr>
          <td>${partNumber}</td>
          <td>${item.description}</td>
          <td>${neededQty}</td>
        </tr>
        `;
      }

    });
*/

    let categoryTotals = {};
Object.values(CPE_ITEMS).forEach(item => {

  if (!categoryTotals[item.type]) {

    categoryTotals[item.type] = {
      current: 0,
      max: item.max
    };

  }

});

    Object.entries(CPE_ITEMS).forEach(([partNumber, item]) => {

  categoryTotals[item.type].current += counts[partNumber] || 0;

});

   let summaryRows = "";

let totalMax = 0;
let totalCurrent = 0;
let totalCanAdd = 0;

Object.entries(categoryTotals).forEach(([category, data]) => {

  const canAdd = Math.max(0, data.max - data.current);

  totalMax += data.max;
  totalCurrent += data.current;
  totalCanAdd += canAdd;

  summaryRows += `
    <tr>
      <td>${category}</td>
      <td class="max-col">${data.max}</td>
      <td>${data.current}</td>
      <td class="${canAdd > 0 ? "can-add" : "can-add-zero"}">${canAdd}</td>
    </tr>
  `;

});

summaryRows += `
  <tr class="totals-row">
    <td>TOTAL</td>
    <td>${totalMax}</td>
    <td>${totalCurrent}</td>
    <td>${totalCanAdd}</td>
  </tr>
`;

    summaryData = {
  gpon: categoryTotals["GPON ONT"]?.current || 0,
  xgspon: categoryTotals["XGSPON ONT"]?.current || 0,
  gateway: categoryTotals["Gateway"]?.current || 0,
  extender: categoryTotals["Extender"]?.current || 0,
  total: totalCurrent
};
    
   if (!summaryRows) {

        
  resultsDiv.innerHTML = `
  <div class="result-item">
    <div class="result-part">
      No supported CPE found in inventory
    </div>
  </div>
`;

  printBtn.disabled = true;
  return;
}

  resultsDiv.innerHTML = `
  <table class="pick-table">
    <thead>
  <tr>
    <th>Category</th>
    <th>Max</th>
    <th>Current</th>
    <th>Can Add</th>
  </tr>
</thead>
    <tbody>
      ${summaryRows}
    </tbody>
  </table>
`;
    printBtn.disabled = false;

  };

  reader.readAsText(selectedFile);

});

printBtn.addEventListener("click", () => {

  if (!summaryData) return;

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF("p", "mm", "letter");

  const now = new Date();

  const dateTime =
    String(now.getMonth() + 1).padStart(2, "0") + "/" +
    String(now.getDate()).padStart(2, "0") + "/" +
    now.getFullYear() + "  " +
    now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });

    // Header

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("CPE ORDER", 80, 20, { align: "center" });

  doc.setFontSize(12);

  doc.text("Tech Name:", 15, 35);
  doc.line(40, 35, 95, 35);

  doc.text("Company:", 120, 35);
  doc.line(145, 35, 200, 35);

  doc.text(`Date: ${dateTime}`, 15, 48);

  // =========================
  // CURRENT INVENTORY
  // =========================

  const invX = 15;
  const invY = 60;
  const invW = 70;
  const invH = 95;

doc.rect(invX, invY, invW, invH);

  doc.setFont("helvetica", "bold");
  doc.text("CURRENT INVENTORY", invX + 35, invY + 10, { align: "center" });

  doc.line(invX, invY + 15, invX + invW, invY + 15);

  const inventoryRows = [
    ["GPON ONT", summaryData.gpon],
    ["XGSPON ONT", summaryData.xgspon],
    ["Gateway", summaryData.gateway],
    ["Extender", summaryData.extender]
  ];

  let invRowY = invY + 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  inventoryRows.forEach(([label, qty]) => {

    doc.text(label, invX + 5, invRowY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(String(qty), invX + 55, invRowY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    invRowY += 15;
  });

  doc.line(invX, invY + 75, invX + invW, invY + 75);

doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.text("TOTAL", invX + 5, invY + 87);

doc.setFontSize(16);
doc.text(String(summaryData.total), invX + 55, invY + 87);

  // =========================
  // REQUESTED / FILLED
  // =========================

  const reqX = 95;
  const reqY = 60;
  const reqW = 107;
  const rowHeight = 12;

  const items = [
    "611",
    "601",
    "622",
    "632",
    "834",
    "854",
    "854SOS",
    "8612",
    "8612SOS",
    "841",
    "TOTAL QTY",
  ];

  const tableHeight = 15 + (items.length * rowHeight);

  doc.rect(reqX, reqY, reqW, tableHeight);

  doc.line(reqX + 53.5, reqY, reqX + 53.5, reqY + tableHeight);

  doc.line(reqX, reqY + 15, reqX + reqW, reqY + 15);

  doc.setFontSize(12);
  doc.text("REQUESTED", reqX + 26.75, reqY + 10, { align: "center" });
  doc.text("FILLED", reqX + 80, reqY + 10, { align: "center" });

  let rowY = reqY + 21;

  items.forEach((item, index) => {

    doc.setFont("helvetica", "normal");

  doc.line(reqX, rowY - 6, reqX + reqW, rowY - 6);

if (item === "TOTAL QTY") {
  doc.setFont("helvetica", "bold");
}

doc.text(item, reqX + 5, rowY);

if (item !== "TOTAL QTY") {

  const textWidth = doc.getTextWidth(item);
  const markerRight = reqX + 5 + textWidth + 3;
  const markerBottom = rowY + 2;

  doc.line(markerRight, rowY - 6, markerRight, markerBottom);
  doc.line(reqX + 5, markerBottom, markerRight, markerBottom);

}

doc.setFont("helvetica", "normal");

  rowY += rowHeight;
});

doc.line(reqX, rowY - 6, reqX + reqW, rowY - 6);

  // =========================
  // NOTES
  // =========================

  const notesY = reqY + tableHeight + 12;

  doc.rect(15, notesY, 187, 42);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Notes:", 18, notesY + 10);

  doc.output("dataurlnewwindow");

});
