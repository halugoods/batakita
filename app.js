const unitPrice = 1_000;
const whatsappNumber = "6285156955735";
const scenarios = {
  minimarket: {
    title: "Lahan dan bangunan disewa tenant",
    assetValue: 1_650_000_000,
    targetLabel: "Rp1,65 M",
    rate: 6.9,
    rateLabel: "Yield sewa bersih simulasi",
    distributionLabel: "Estimasi distribusi/tahun",
  },
  franchise: {
    title: "Gerai ritel berbasis franchise",
    assetValue: 850_000_000,
    targetLabel: "Rp850 Jt",
    rate: 8,
    rateLabel: "Profit operasional simulasi",
    distributionLabel: "Estimasi profit/tahun",
  },
  productive: {
    title: "Aset properti produktif lain",
    assetValue: 1_200_000_000,
    targetLabel: "Rp1,2 M",
    rate: 7,
    rateLabel: "Yield bersih simulasi",
    distributionLabel: "Estimasi distribusi/tahun",
  },
};

let currentScenario = scenarios.minimarket;

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatPercent = (value) =>
  `${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value)}%`;

const formatShortRupiah = (value) => {
  const number = Number(value) || 0;
  const formatter = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  });

  if (number >= 1_000_000_000) return `Rp${formatter.format(number / 1_000_000_000)} M`;
  if (number >= 1_000_000) return `Rp${formatter.format(number / 1_000_000)} Jt`;
  return formatRupiah(number);
};

const monthlyInput = document.querySelector("#monthlyInput");
const monthInput = document.querySelector("#monthInput");
const yieldInput = document.querySelector("#yieldInput");
const monthlyOutput = document.querySelector("#monthlyOutput");
const monthOutput = document.querySelector("#monthOutput");
const yieldOutput = document.querySelector("#yieldOutput");
const totalContribution = document.querySelector("#totalContribution");
const unitCount = document.querySelector("#unitCount");
const ownershipShare = document.querySelector("#ownershipShare");
const annualDistribution = document.querySelector("#annualDistribution");
const progressBar = document.querySelector("#progressBar");
const impactLine = document.querySelector("#impactLine");
const scenarioPill = document.querySelector("#scenarioPill");
const yieldLabel = document.querySelector("#yieldLabel");
const simFineprint = document.querySelector("#simFineprint");
const distributionLabel = document.querySelector("#distributionLabel");
const targetAssetValue = document.querySelector("#targetAssetValue");
const chainScenario = document.querySelector("#chainScenario");
const contractAssetLabel = document.querySelector("#contractAssetLabel");
const contractMintLabel = document.querySelector("#contractMintLabel");
const contractShareLabel = document.querySelector("#contractShareLabel");
const contractCode = document.querySelector("#contractCode");
const chainStatus = document.querySelector("#chainStatus");
const chainBlock = document.querySelector("#chainBlock");
const chainOrder = document.querySelector("#chainOrder");
const chainUnits = document.querySelector("#chainUnits");
const chainShare = document.querySelector("#chainShare");
const chainDistribution = document.querySelector("#chainDistribution");
const chainHash = document.querySelector("#chainHash");
const ledgerList = document.querySelector("#ledgerList");
const contractSimButton = document.querySelector("#contractSimButton");
const contractResetButton = document.querySelector("#contractResetButton");
const contractSyncButton = document.querySelector("#contractSyncButton");
const techAssetNameInput = document.querySelector("#techAssetNameInput");
const techTargetInput = document.querySelector("#techTargetInput");
const techOrderInput = document.querySelector("#techOrderInput");
const techUnitInput = document.querySelector("#techUnitInput");
const techRateInput = document.querySelector("#techRateInput");
const techModeInput = document.querySelector("#techModeInput");
const techSteps = Array.from(document.querySelectorAll("[data-tech-step]"));
let techTimer;
let techStatus = "ready";
let activeTechStep = 0;
let isTechCustom = false;

function getSimulationSnapshot() {
  const monthly = Number(monthlyInput.value);
  const months = Number(monthInput.value);
  const yieldRate = Number(yieldInput.value) / 100;
  const total = monthly * months;
  const units = Math.floor(total / unitPrice);
  const ownership = total / currentScenario.assetValue;
  const distribution = currentScenario.assetValue * yieldRate * ownership;

  return {
    monthly,
    months,
    yieldRate,
    total,
    units,
    ownership,
    distribution,
  };
}

function getScenarioMode() {
  return currentScenario.distributionLabel.toLowerCase().includes("profit") ? "profit" : "yield";
}

function getModeLabels(mode) {
  if (mode === "profit") {
    return {
      rateLabel: "Profit operasional simulasi",
      distributionLabel: "Estimasi profit/tahun",
      ledgerLabel: "Profit",
    };
  }

  return {
    rateLabel: "Yield sewa bersih simulasi",
    distributionLabel: "Estimasi distribusi/tahun",
    ledgerLabel: "Distribusi",
  };
}

function syncTechInputsFromSimulation() {
  const snapshot = getSimulationSnapshot();

  techAssetNameInput.value = currentScenario.title;
  techTargetInput.value = String(currentScenario.assetValue);
  techOrderInput.value = String(snapshot.total);
  techUnitInput.value = String(unitPrice);
  techRateInput.value = String(Number(yieldInput.value));
  techModeInput.value = getScenarioMode();
}

function getTechSnapshot() {
  if (!isTechCustom) syncTechInputsFromSimulation();

  const assetName = techAssetNameInput.value.trim() || "Aset properti produktif";
  const assetValue = Math.max(Number(techTargetInput.value) || currentScenario.assetValue, 1);
  const orderValue = Math.max(Number(techOrderInput.value) || unitPrice, 0);
  const techUnitPrice = Math.max(Number(techUnitInput.value) || unitPrice, 1);
  const rate = Math.max(Number(techRateInput.value) || 0, 0);
  const mode = techModeInput.value || getScenarioMode();
  const units = Math.floor(orderValue / techUnitPrice);
  const ownership = orderValue / assetValue;
  const distribution = orderValue * (rate / 100);

  return {
    assetName,
    assetValue,
    targetLabel: formatShortRupiah(assetValue),
    orderValue,
    unitPrice: techUnitPrice,
    rate,
    mode,
    units,
    ownership,
    distribution,
    ...getModeLabels(mode),
  };
}

function makeHash(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  let seed = hash >>> 0;
  let hex = "";
  for (let index = 0; index < 8; index += 1) {
    seed = Math.imul(seed ^ (index + 1), 16777619) >>> 0;
    hex += seed.toString(16).padStart(8, "0");
  }

  return `0x${hex}`;
}

function setTechStep(stepIndex, isConfirmed = false) {
  techSteps.forEach((step, index) => {
    step.classList.toggle("is-active", !isConfirmed && index === stepIndex);
    step.classList.toggle("is-done", isConfirmed ? true : index < stepIndex);
  });
}

function renderLedgerRows(snapshot, txHash) {
  const rows = [
    ["Whitelist", "KYC user lolos"],
    ["Mint", `${new Intl.NumberFormat("id-ID").format(snapshot.units)} unit`],
    ["Hash", `${txHash.slice(0, 10)}...${txHash.slice(-6)}`],
    [snapshot.ledgerLabel, formatRupiah(snapshot.distribution)],
  ];

  ledgerList.innerHTML = rows
    .map(
      ([label, value]) => `
        <div class="ledger-row">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `,
    )
    .join("");
}

function renderContractCode(snapshot, txHash) {
  const shareBps = Math.round(snapshot.ownership * 10_000);
  const modeFunction = snapshot.mode === "profit" ? "recordProfit" : "recordRentDistribution";
  const modeComment = snapshot.mode === "profit" ? "profit operasional" : "sewa bersih";

  contractCode.textContent = `// BataKita smart contract simulation
// Simplified Solidity-style pseudo-code, not production code.
contract BataKitaAsset {
    string public assetName = ${JSON.stringify(snapshot.assetName)};
    uint256 public targetFunding = ${Math.round(snapshot.assetValue)}; // ${snapshot.targetLabel}
    uint256 public unitPrice = ${Math.round(snapshot.unitPrice)};
    uint256 public totalUnits = ${Math.max(Math.floor(snapshot.assetValue / snapshot.unitPrice), 1)};

    mapping(address => bool) public whitelist;
    mapping(address => uint256) public units;

    event UnitMinted(address indexed user, uint256 unitAmount, uint256 rupiahPaid);
    event DistributionRecorded(uint256 cashflow, uint256 userShareBps, bytes32 txHash);

    function whitelistUser(address user) external onlyOperator {
        whitelist[user] = true;
    }

    function mintUnit(address user, uint256 rupiahPaid) external onlyOperator {
        require(whitelist[user], "KYC_REQUIRED");
        require(rupiahPaid >= unitPrice, "ORDER_TOO_SMALL");

        uint256 unitAmount = rupiahPaid / unitPrice;
        units[user] += unitAmount;

        emit UnitMinted(user, unitAmount, rupiahPaid);
    }

    function ${modeFunction}(uint256 cashflow) external onlySPV {
        // cashflow = ${modeComment} dari aset off-chain
        uint256 userShareBps = ${shareBps};
        bytes32 txHash = ${txHash};

        emit DistributionRecorded(cashflow, userShareBps, txHash);
    }
}`;
}

function renderTechSimulation() {
  const snapshot = getTechSnapshot();
  const hashInput = `${snapshot.assetName}:${snapshot.orderValue}:${snapshot.units}:${snapshot.rate}:${snapshot.mode}`;
  const txHash = makeHash(hashInput);
  const blockNumber = 204817 + Math.round(snapshot.orderValue / snapshot.unitPrice) + Math.round(snapshot.assetValue / 100_000_000);

  chainScenario.textContent = snapshot.assetName;
  contractAssetLabel.textContent = snapshot.targetLabel;
  contractMintLabel.textContent = `${new Intl.NumberFormat("id-ID").format(snapshot.units)} unit`;
  contractShareLabel.textContent = formatPercent(snapshot.ownership * 100);
  chainBlock.textContent = `Block #${new Intl.NumberFormat("id-ID").format(blockNumber)}`;
  chainOrder.textContent = formatRupiah(snapshot.orderValue);
  chainUnits.textContent = `${new Intl.NumberFormat("id-ID").format(snapshot.units)} unit`;
  chainShare.textContent = formatPercent(snapshot.ownership * 100);
  chainDistribution.textContent = formatRupiah(snapshot.distribution);
  chainHash.textContent = txHash;
  renderContractCode(snapshot, txHash);
  chainStatus.textContent =
    techStatus === "confirmed"
      ? "Confirmed on demo chain"
      : techStatus === "running"
        ? "Writing transaction..."
        : "Ready to simulate";
  renderLedgerRows(snapshot, txHash);
  setTechStep(activeTechStep, techStatus === "confirmed");
}

function updateSimulation() {
  const snapshot = getSimulationSnapshot();
  const progress = Math.min(snapshot.ownership * 100, 100);

  scenarioPill.textContent = `Skenario aktif: ${currentScenario.title}`;
  yieldLabel.textContent = currentScenario.rateLabel;
  simFineprint.textContent = `Simulasi memakai ${currentScenario.title.toLowerCase()} dengan target dana ${currentScenario.targetLabel} dan unit Rp1.000. Angka bersifat edukasi dan bukan janji hasil.`;
  distributionLabel.textContent = currentScenario.distributionLabel;
  targetAssetValue.textContent = currentScenario.targetLabel;
  monthlyOutput.textContent = formatRupiah(snapshot.monthly);
  monthOutput.textContent = `${snapshot.months} bulan`;
  yieldOutput.textContent = `${Number(yieldInput.value).toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
  totalContribution.textContent = formatRupiah(snapshot.total);
  unitCount.textContent = new Intl.NumberFormat("id-ID").format(snapshot.units);
  ownershipShare.textContent = formatPercent(snapshot.ownership * 100);
  annualDistribution.textContent = formatRupiah(snapshot.distribution);
  progressBar.style.width = `${Math.max(progress, 0.8)}%`;
  impactLine.textContent = `Dengan ${formatRupiah(snapshot.monthly)}/bulan selama ${snapshot.months} bulan, user membangun porsi ekonomi kecil pada ${currentScenario.title.toLowerCase()} tanpa perlu membeli aset penuh sendiri.`;
  renderTechSimulation();
}

function setScenario(scenarioKey) {
  currentScenario = scenarios[scenarioKey] || scenarios.minimarket;
  isTechCustom = false;
  yieldInput.value = String(currentScenario.rate);
  updateSimulation();
}

[monthlyInput, monthInput, yieldInput].forEach((input) => {
  input.addEventListener("input", updateSimulation);
});

document.querySelectorAll("[data-asset]").forEach((button) => {
  button.addEventListener("click", () => {
    const map = {
      minimarket:
        "Tesis: sewa lahan minimarket-ready menarik jika legal tanah bersih, akses parkir cukup, tenant kuat, dan yield bersih tetap aman setelah pajak, maintenance, serta cadangan kosong.",
      franchise:
        "Tesis: franchise memberi potensi profit operasional, tetapi underwriting harus menghitung omzet konservatif, stok, pegawai, royalti, sewa, shrinkage, dan modal kerja.",
      opportunity:
        "Tesis: aset properti produktif lain hanya masuk jika punya tenant jelas, kontrak tertulis, legal lengkap, skenario keluar, dan cashflow yang bisa diaudit.",
    };

    const message = map[button.dataset.asset];
    button.textContent = message;
    button.classList.add("expanded");
    window.setTimeout(() => {
      button.innerHTML = '<i data-lucide="bar-chart-3" aria-hidden="true"></i> Lihat tesis';
      button.classList.remove("expanded");
      if (window.lucide) window.lucide.createIcons();
    }, 4800);
  });
});

document.querySelectorAll("[data-scenario]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    setScenario(button.dataset.scenario);
    document.querySelector("#simulasi").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

contractSimButton.addEventListener("click", () => {
  window.clearInterval(techTimer);
  techStatus = "running";
  activeTechStep = 0;
  renderTechSimulation();

  techTimer = window.setInterval(() => {
    activeTechStep += 1;
    if (activeTechStep >= techSteps.length) {
      window.clearInterval(techTimer);
      activeTechStep = techSteps.length - 1;
      techStatus = "confirmed";
    }
    renderTechSimulation();
  }, 620);
});

contractResetButton.addEventListener("click", () => {
  window.clearInterval(techTimer);
  techStatus = "ready";
  activeTechStep = 0;
  renderTechSimulation();
});

contractSyncButton.addEventListener("click", () => {
  isTechCustom = false;
  techStatus = "ready";
  activeTechStep = 0;
  updateSimulation();
});

[techAssetNameInput, techTargetInput, techOrderInput, techUnitInput, techRateInput, techModeInput].forEach((input) => {
  input.addEventListener("input", () => {
    isTechCustom = true;
    techStatus = "ready";
    activeTechStep = 0;
    renderTechSimulation();
  });
});

document.querySelector("#waitlistButton").addEventListener("click", () => {
  const status = document.querySelector("#formStatus");
  const name = document.querySelector("#nameInput")?.value?.trim() || "Saya";
  const budget = document.querySelector('select[name="budget"]')?.value || "Rp1.000 - Rp10.000";
  const message = `Halo, saya ${name}. Saya tertarik join waitlist BataKita. by Halu Goods untuk tokenisasi sewa lahan/franchise ritel. Nominal nyaman saya: ${budget}.`;
  status.textContent = "Membuka WhatsApp untuk join waitlist...";
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});

function initMobileAutoSliders() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 700px)");
  const sliderSelectors = [".signal-strip", ".product-grid", ".asset-grid", ".contract-steps", ".flow-list", ".research-grid"];
  const sliders = sliderSelectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)));

  if (!sliders.length) return;

  let timers = [];
  const pausedUntil = new WeakMap();
  const stop = () => {
    timers.forEach((timer) => window.clearInterval(timer));
    timers = [];
  };

  sliders.forEach((slider) => {
    const pause = () => {
      pausedUntil.set(slider, Date.now() + 8000);
    };

    ["pointerdown", "touchstart", "wheel", "focusin"].forEach((eventName) => {
      slider.addEventListener(eventName, pause, { passive: true });
    });
  });

  const start = () => {
    stop();
    if (!mobileQuery.matches || prefersReducedMotion.matches) return;

    sliders.forEach((slider, index) => {
      const timer = window.setInterval(() => {
        if (Date.now() < (pausedUntil.get(slider) || 0) || slider.scrollWidth <= slider.clientWidth) return;

        const cards = Array.from(slider.children);
        const currentIndex = cards.findIndex((card) => card.offsetLeft >= slider.scrollLeft - 4);
        const nextIndex = currentIndex >= cards.length - 1 ? 0 : Math.max(currentIndex + 1, 1);
        slider.scrollTo({ left: cards[nextIndex]?.offsetLeft || 0, behavior: "smooth" });
      }, 3400 + index * 350);

      timers.push(timer);
    });
  };

  mobileQuery.addEventListener("change", start);
  prefersReducedMotion.addEventListener("change", start);
  start();
}

window.addEventListener("DOMContentLoaded", () => {
  updateSimulation();
  initMobileAutoSliders();
  if (window.lucide) window.lucide.createIcons();
});

window.addEventListener("load", () => {
  if (window.lucide) window.lucide.createIcons();
});
