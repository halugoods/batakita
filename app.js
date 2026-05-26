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
const techSteps = Array.from(document.querySelectorAll("[data-tech-step]"));
let techTimer;
let techStatus = "ready";
let activeTechStep = 0;

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

function makeHash(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  const base = (hash >>> 0).toString(16).padStart(8, "0");
  return `0x${base}${base.slice(2)}${base.slice(0, 6)}${base.slice(4)}`;
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
    ["Distribusi", formatRupiah(snapshot.distribution)],
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

function renderTechSimulation() {
  const snapshot = getSimulationSnapshot();
  const hashInput = `${currentScenario.title}:${snapshot.total}:${snapshot.units}:${yieldInput.value}`;
  const txHash = makeHash(hashInput);
  const blockNumber = 204817 + Math.round(snapshot.total / unitPrice) + Math.round(currentScenario.assetValue / 100_000_000);

  chainScenario.textContent = currentScenario.title;
  contractAssetLabel.textContent = currentScenario.targetLabel;
  contractMintLabel.textContent = `${new Intl.NumberFormat("id-ID").format(snapshot.units)} unit`;
  contractShareLabel.textContent = formatPercent(snapshot.ownership * 100);
  chainBlock.textContent = `Block #${new Intl.NumberFormat("id-ID").format(blockNumber)}`;
  chainOrder.textContent = formatRupiah(snapshot.total);
  chainUnits.textContent = `${new Intl.NumberFormat("id-ID").format(snapshot.units)} unit`;
  chainShare.textContent = formatPercent(snapshot.ownership * 100);
  chainDistribution.textContent = formatRupiah(snapshot.distribution);
  chainHash.textContent = txHash;
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
