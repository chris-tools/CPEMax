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

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("CPE MAX WORKSHEET", 105, 20, { align: "center" });

  doc.setFontSize(12);

  doc.text("Tech Name:", 15, 35);
  doc.line(40, 35, 95, 35);

  doc.text("Company:", 125, 35);
  doc.line(150, 35, 200, 35);

  doc.text(`Date: ${dateTime}`, 15, 48);

  // Current Inventory Box

  doc.rect(15, 60, 80, 90);

  doc.setFont("helvetica", "bold");
  doc.text("CURRENT INVENTORY", 55, 70, { align: "center" });

  doc.line(15, 78, 95, 78);

  doc.setFont("helvetica", "normal");

  const inventoryRows = [
    ["GPON ONT", summaryData.gpon],
    ["XGSPON ONT", summaryData.xgspon],
    ["Gateway", summaryData.gateway],
    ["Extender", summaryData.extender]
  ];

  let y = 95;

inventoryRows.forEach(row => {

  doc.text(row[0], 20, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(String(row[1]), 80, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  y += 18;
});

doc.line(15, y - 8, 95, y - 8);

doc.setFont("helvetica", "bold");
doc.text("TOTAL", 20, y + 5);

doc.setFontSize(18);
doc.text(String(summaryData.total), 80, y + 5);

  // Requested / Filled

  const left = 102;
  const top = 60;
  const rowHeight = 16;

  doc.rect(left, top, 100, 160);

  doc.line(left + 50, top, left + 50, 220);

  doc.line(left, top + 15, 202, top + 15);

  doc.setFontSize(12);
  doc.text("REQUESTED", left + 25, top + 10, { align: "center" });
  doc.text("FILLED", left + 75, top + 10, { align: "center" });

  const items = [
    "611",
    "601",
    "622",
    "632",
    "834",
    "841",
    "854",
    "8612",
    "8612SOS"
  ];

  let rowY = top + 31;

  items.forEach(item => {

    doc.line(left, rowY - 8, 202, rowY - 8);

    doc.text(item, left + 5, rowY);

    rowY += rowHeight;
  });

  doc.line(left, rowY - 8, 202, rowY - 8);

  doc.line(left + 50, rowY - 8, left + 50, rowY + 8);

  doc.setFont("helvetica", "bold");
  doc.text("TOTAL QTY", left + 5, rowY + 4);

  doc.rect(left, top, 100, (rowY + 8) - top);

  // Notes

  doc.rect(15, 228, 187, 40);

  doc.setFontSize(12);
  doc.text("Notes:", 18, 238);

  doc.line(18, 248, 195, 248);
  doc.line(18, 258, 195, 258);
  doc.line(18, 268, 195, 268);

  doc.output("dataurlnewwindow");

});
