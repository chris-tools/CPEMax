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

    Object.keys(TOTE_ITEMS).forEach(part => {
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

   if (!rows) {

  resultsDiv.innerHTML = `
    <div class="result-item">
      <div class="result-part">
        Tote is fully stocked
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
        <th>Part Number</th>
        <th>Description</th>
        <th>Qty</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="pick-summary">
    Total Pieces To Pick: ${totalPieces}
  </div>
`;
    printBtn.disabled = false;

  };

  reader.readAsText(selectedFile);

});

printBtn.addEventListener("click", () => {
  window.print();
});
