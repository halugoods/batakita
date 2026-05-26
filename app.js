const assetValue = 1_650_000_000;
const unitPrice = 10_000;
const whatsappNumber = "6285156955735";

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

function updateSimulation() {
  const monthly = Number(monthlyInput.value);
  const months = Number(monthInput.value);
  const yieldRate = Number(yieldInput.value) / 100;
  const total = monthly * months;
  const units = Math.floor(total / unitPrice);
  const ownership = total / assetValue;
  const distribution = assetValue * yieldRate * ownership;
  const progress = Math.min(ownership * 100, 100);

  monthlyOutput.textContent = formatRupiah(monthly);
  monthOutput.textContent = `${months} bulan`;
  yieldOutput.textContent = `${yieldInput.value.replace(".", ",")}%`;
  totalContribution.textContent = formatRupiah(total);
  unitCount.textContent = new Intl.NumberFormat("id-ID").format(units);
  ownershipShare.textContent = formatPercent(ownership * 100);
  annualDistribution.textContent = formatRupiah(distribution);
  progressBar.style.width = `${Math.max(progress, 0.8)}%`;
  impactLine.textContent = `Dengan ${formatRupiah(monthly)}/bulan selama ${months} bulan, user membangun porsi ekonomi kecil tanpa perlu membeli tanah sendiri.`;
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
        "Tesis: properti opportunity lain hanya masuk jika punya tenant jelas, kontrak tertulis, legal lengkap, skenario keluar, dan cashflow yang bisa diaudit.",
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

document.querySelector("#waitlistButton").addEventListener("click", () => {
  const status = document.querySelector("#formStatus");
  const name = document.querySelector("#nameInput")?.value?.trim() || "Saya";
  const budget = document.querySelector('select[name="budget"]')?.value || "Rp10.000 - Rp50.000";
  const message = `Halo, saya ${name}. Saya tertarik join waitlist BataKita. by Halu Goods untuk tokenisasi sewa lahan/franchise ritel. Nominal nyaman saya: ${budget}.`;
  status.textContent = "Membuka WhatsApp untuk join waitlist...";
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});

window.addEventListener("DOMContentLoaded", () => {
  updateSimulation();
  if (window.lucide) window.lucide.createIcons();
});

window.addEventListener("load", () => {
  if (window.lucide) window.lucide.createIcons();
});
