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

  const now = new Date();

  const dateTime =
  String(now.getMonth() + 1).padStart(2, "0") + "/" +
  String(now.getDate()).padStart(2, "0") + "/" +
  now.getFullYear() + "  " +
  now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });

  const pdfWindow = window.open("", "_blank");

  pdfWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<title>CPE MAX Worksheet</title>

<style>
body{
  font-family: Arial, sans-serif;
  color:#000;
  margin:30px;
}

h1{
  text-align:center;
  font-size:32px;
  margin-bottom:30px;
}

.header{
  display:flex;
  justify-content:space-between;
  margin-bottom:18px;
  font-size:18px;
  font-weight:bold;
}

.date-row{
  font-size:18px;
  font-weight:bold;
  margin-bottom:30px;
}

.main{
  display:flex;
  gap:30px;
  align-items:flex-start;
}

table{
  border-collapse:collapse;
}

.inventory-table{
  width:42%;
}

.request-table{
  width:58%;
}

.inventory-table th,
.request-table th{
  border:2px solid #000;
  padding:12px;
  text-align:center;
  font-size:18px;
}

.inventory-table td{
  border:2px solid #000;
  padding:18px;
  font-size:20px;
}

.inventory-table td:last-child{
  width:90px;
  text-align:center;
  font-weight:bold;
  font-size:24px;
}

.request-table td{
  border:2px solid #000;
  padding:14px;
  height:58px;
  font-size:18px;
}

.request-table td:first-child{
  width:50%;
  font-weight:bold;
}

.request-table td:last-child{
  width:50%;
}

.total-row{
  font-weight:bold;
}

.notes{
  margin-top:25px;
}

.notes-title{
  font-weight:bold;
  margin-bottom:10px;
  font-size:18px;
}

.notes-box{
  border:2px solid #000;
  padding:12px;
}

.note-line{
  border-bottom:2px solid #000;
  height:34px;
  margin-bottom:12px;
}
</style>

</head>
<body>

<h1>CPE MAX WORKSHEET</h1>

<div class="header">
  <div>
    Tech Name: ________________________
  </div>

  <div>
    Company: ________________________
  </div>
</div>

<div class="date-row">
  Date: ${dateTime}
</div>

<div class="main">

<table class="inventory-table">

<tr>
  <th colspan="2">CURRENT INVENTORY</th>
</tr>

<tr>
  <td>GPON ONT</td>
  <td>${summaryData.gpon}</td>
</tr>

<tr>
  <td>XGSPON ONT</td>
  <td>${summaryData.xgspon}</td>
</tr>

<tr>
  <td>Gateway</td>
  <td>${summaryData.gateway}</td>
</tr>

<tr>
  <td>Extender</td>
  <td>${summaryData.extender}</td>
</tr>

<tr class="total-row">
  <td>TOTAL</td>
  <td>${summaryData.total}</td>
</tr>

</table>

<table class="request-table">

<tr>
  <th>REQUESTED</th>
  <th>FILLED</th>
</tr>

<tr><td>611</td><td></td></tr>
<tr><td>601</td><td></td></tr>
<tr><td>622</td><td></td></tr>
<tr><td>632</td><td></td></tr>
<tr><td>834</td><td></td></tr>
<tr><td>841</td><td></td></tr>
<tr><td>854</td><td></td></tr>
<tr><td>8612</td><td></td></tr>
<tr><td>8612SOS</td><td></td></tr>

<tr class="total-row">
  <td>TOTAL QTY</td>
  <td></td>
</tr>

</table>

</div>

<div class="notes">

  <div class="notes-title">
    Notes:
  </div>

  <div class="notes-box">
    <div class="note-line"></div>
    <div class="note-line"></div>
    <div class="note-line"></div>
    <div class="note-line"></div>
  </div>

</div>

</body>
</html>
`);

  pdfWindow.document.close();

});
