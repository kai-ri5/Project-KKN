/* =========================================================
   DONASI - MASJID NOOR ISLAM
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://ljgedntbohlgdtkphqex.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_j06auKDeW4sdrJGBoIqkXg_F3dQSjV9";


const sb =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================================
   ELEMENT HELPER
========================================================= */

function el(id) {
  return document.getElementById(id);
}


/* =========================================================
   ELEMENTS
========================================================= */

const loadingState =
  el("loadingState");

const errorState =
  el("errorState");

const errorMessage =
  el("errorMessage");

const donationContent =
  el("donationContent");


const breadcrumbTitle =
  el("breadcrumbTitle");

const campaignImage =
  el("campaignImage");

const campaignCategory =
  el("campaignCategory");

const priorityBadge =
  el("priorityBadge");

const campaignEyebrow =
  el("campaignEyebrow");

const campaignTitle =
  el("campaignTitle");

const campaignDescription =
  el("campaignDescription");

const campaignCollected =
  el("campaignCollected");

const campaignTarget =
  el("campaignTarget");

const campaignProgress =
  el("campaignProgress");

const campaignPercent =
  el("campaignPercent");


const bankName =
  el("bankName");

const accountNumber =
  el("accountNumber");

const accountName =
  el("accountName");

const paymentInstructions =
  el("paymentInstructions");

const copyAccountButton =
  el("copyAccountButton");


const summaryCategory =
  el("summaryCategory");

const summaryTitle =
  el("summaryTitle");

const summaryCollected =
  el("summaryCollected");

const summaryTarget =
  el("summaryTarget");


const toast =
  el("toast");


/* =========================================================
   STATE
========================================================= */

let currentCampaign = null;
let currentPaymentSettings = null;

let toastTimer = null;


/* =========================================================
   URL PARAMETER
========================================================= */

const params =
  new URLSearchParams(
    window.location.search
  );

const campaignId =
  params.get("id");


/* =========================================================
   FORMAT CURRENCY
========================================================= */

function formatRupiah(value) {

  const number =
    Number(value) || 0;

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }
  ).format(number);

}


/* =========================================================
   CATEGORY
========================================================= */

function normalizeCategory(category) {

  return String(category || "")
    .trim()
    .toUpperCase();

}


/* =========================================================
   PROGRESS
========================================================= */

function calculateProgress(
  collected,
  target
) {

  const collectedNumber =
    Number(collected) || 0;

  const targetNumber =
    Number(target) || 0;


  if (targetNumber <= 0) {
    return 0;
  }


  const percent =
    (
      collectedNumber /
      targetNumber
    ) * 100;


  return Math.min(
    Math.max(percent, 0),
    100
  );

}


/* =========================================================
   SHOW ERROR
========================================================= */

function showError(message) {

  if (loadingState) {
    loadingState.classList.add(
      "hidden"
    );
  }

  if (donationContent) {
    donationContent.classList.add(
      "hidden"
    );
  }

  if (errorState) {
    errorState.classList.remove(
      "hidden"
    );
  }

  if (errorMessage) {
    errorMessage.textContent =
      message ||
      "Terjadi kesalahan saat memuat campaign.";
  }

}


/* =========================================================
   SHOW CONTENT
========================================================= */

function showContent() {

  if (loadingState) {
    loadingState.classList.add(
      "hidden"
    );
  }

  if (errorState) {
    errorState.classList.add(
      "hidden"
    );
  }

  if (donationContent) {
    donationContent.classList.remove(
      "hidden"
    );
  }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

  if (!toast) {
    return;
  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  if (toastTimer) {
    clearTimeout(toastTimer);
  }


  toastTimer =
    setTimeout(
      function () {

        toast.classList.remove(
          "show"
        );

      },
      2200
    );

}


/* =========================================================
   FALLBACK IMAGE
========================================================= */

function setFallbackImage() {

  if (!campaignImage) {
    return;
  }


  campaignImage.src =
    "../Infaq/qr/Logo Masjid.png";


  campaignImage.style.objectFit =
    "contain";

  campaignImage.style.padding =
    "70px";

  campaignImage.style.background =
    "#f6f1e4";

}


/* =========================================================
   RENDER CAMPAIGN
========================================================= */

function renderCampaign(campaign) {

  currentCampaign =
    campaign;


  const category =
    normalizeCategory(
      campaign.kategori
    );


  const collected =
    Number(
      campaign.terkumpul
    ) || 0;


  const target =
    Number(
      campaign.target
    ) || 0;


  const progress =
    calculateProgress(
      collected,
      target
    );


  /* DOCUMENT TITLE */

  document.title =
    campaign.judul +
    " | Masjid Noor Islam";


  /* BREADCRUMB */

  if (breadcrumbTitle) {

    breadcrumbTitle.textContent =
      campaign.judul || "Campaign";

  }


  /* IMAGE */

  if (campaignImage) {

    if (campaign.gambar_url) {

      campaignImage.src =
        campaign.gambar_url;

      campaignImage.style.objectFit =
        "cover";

      campaignImage.style.padding =
        "0";

      campaignImage.style.background =
        "";

    } else {

      setFallbackImage();

    }


    campaignImage.onerror =
      function () {

        campaignImage.onerror =
          null;

        setFallbackImage();

      };

  }


  /* CATEGORY */

  if (campaignCategory) {

    campaignCategory.textContent =
      category || "DONASI";

  }


  if (summaryCategory) {

    summaryCategory.textContent =
      category || "DONASI";

  }


  /* PRIORITY */

  if (priorityBadge) {

    if (campaign.prioritas) {

      priorityBadge.classList.remove(
        "hidden"
      );

    } else {

      priorityBadge.classList.add(
        "hidden"
      );

    }

  }


  /* EYEBROW */

  if (campaignEyebrow) {

    campaignEyebrow.textContent =
      category
        ? category +
          " • Masjid Noor Islam"
        : "Program Masjid Noor Islam";

  }


  /* TITLE */

  if (campaignTitle) {

    campaignTitle.textContent =
      campaign.judul ||
      "Campaign Masjid Noor Islam";

  }


  if (summaryTitle) {

    summaryTitle.textContent =
      campaign.judul ||
      "Campaign Masjid Noor Islam";

  }


  /* DESCRIPTION */

  if (campaignDescription) {

    campaignDescription.textContent =
      campaign.deskripsi ||
      "Mari bersama-sama mendukung program Masjid Noor Islam.";

  }


  /* COLLECTED */

  const formattedCollected =
    formatRupiah(collected);


  if (campaignCollected) {

    campaignCollected.textContent =
      formattedCollected;

  }


  if (summaryCollected) {

    summaryCollected.textContent =
      formattedCollected;

  }


  /* TARGET */

  const formattedTarget =
    target > 0
      ? formatRupiah(target)
      : "Tanpa target";


  if (campaignTarget) {

    campaignTarget.textContent =
      formattedTarget;

  }


  if (summaryTarget) {

    summaryTarget.textContent =
      formattedTarget;

  }


  /* PROGRESS */

  if (campaignProgress) {

    campaignProgress.style.width =
      progress + "%";

  }


  if (campaignPercent) {

    campaignPercent.textContent =
      Math.round(progress) + "%";

  }

}


/* =========================================================
   RENDER PAYMENT SETTINGS
========================================================= */

function renderPaymentSettings(
  settings
) {

  currentPaymentSettings =
    settings;


  if (bankName) {

    bankName.textContent =
      settings.bank_name ||
      "Rekening Masjid";

  }


  if (accountNumber) {

    accountNumber.textContent =
      settings.account_number ||
      "-";

  }


  if (accountName) {

    accountName.textContent =
      settings.account_name ||
      "Masjid Noor Islam";

  }


  if (paymentInstructions) {

    const instructions =
      settings.instructions ||
      [
        "Buka mobile banking, internet banking, atau ATM.",
        "Pilih menu Transfer.",
        "Masukkan nomor rekening yang tertera.",
        "Masukkan nominal pembayaran.",
        "Periksa nama penerima dan selesaikan transfer."
      ].join("\n");


    const lines =
      instructions
        .split("\n")
        .map(
          function (line) {
            return line.trim();
          }
        )
        .filter(Boolean);


    if (lines.length > 1) {

      const list =
        document.createElement(
          "ol"
        );


      lines.forEach(
        function (line) {

          const item =
            document.createElement(
              "li"
            );

          item.textContent =
            line.replace(
              /^\d+[\.\)]\s*/,
              ""
            );

          list.appendChild(
            item
          );

        }
      );


      paymentInstructions.innerHTML =
        "";

      paymentInstructions.appendChild(
        list
      );

    } else {

      paymentInstructions.textContent =
        instructions;

    }

  }

}


/* =========================================================
   LOAD CAMPAIGN
========================================================= */

async function loadCampaign() {

  if (!campaignId) {

    showError(
      "ID campaign tidak ditemukan pada URL."
    );

    return null;

  }


  try {

    const result =
      await sb
        .from("campaign_donasi")
        .select("*")
        .eq(
          "id",
          campaignId
        )
        .eq(
          "aktif",
          true
        )
        .maybeSingle();


    if (result.error) {

      console.error(
        "Campaign error:",
        result.error
      );

      showError(
        "Campaign gagal dimuat. Silakan coba kembali."
      );

      return null;

    }


    if (!result.data) {

      showError(
        "Campaign tidak ditemukan atau sudah tidak aktif."
      );

      return null;

    }


    const campaign =
      result.data;


    const category =
      normalizeCategory(
        campaign.kategori
      );


    /*
      INFAQ tidak menggunakan halaman
      transfer bank.

      Jika user membuka URL Donasi
      untuk campaign INFAQ, arahkan
      kembali ke QRIS di halaman Infaq.
    */

    if (category === "INFAQ") {

      window.location.replace(
        "../Infaq/infaq.html?campaign=" +
        encodeURIComponent(
          campaign.id
        ) +
        "#qris"
      );

      return null;

    }


    /*
      QURBAN juga tidak boleh masuk
      alur campaign donasi.

      Qurban memiliki program dan
      WhatsApp sendiri.
    */

    if (category === "QURBAN") {

      window.location.replace(
        "../index.html#qurban"
      );

      return null;

    }


    renderCampaign(
      campaign
    );


    return campaign;

  } catch (error) {

    console.error(
      "Load campaign error:",
      error
    );


    showError(
      "Terjadi kesalahan saat memuat campaign."
    );


    return null;

  }

}


/* =========================================================
   LOAD PAYMENT SETTINGS
========================================================= */

async function loadPaymentSettings() {

  try {

    const result =
      await sb
        .from("payment_settings")
        .select("*")
        .eq(
          "id",
          1
        )
        .maybeSingle();


    if (result.error) {

      console.error(
        "Payment settings error:",
        result.error
      );


      renderPaymentSettings(
        {
          bank_name:
            "Rekening belum diatur",

          account_number:
            "-",

          account_name:
            "Masjid Noor Islam",

          instructions:
            "Informasi rekening belum tersedia. Silakan hubungi pengurus Masjid Noor Islam."
        }
      );


      return;

    }


    if (!result.data) {

      renderPaymentSettings(
        {
          bank_name:
            "Rekening belum diatur",

          account_number:
            "-",

          account_name:
            "Masjid Noor Islam",

          instructions:
            "Informasi rekening belum tersedia. Silakan hubungi pengurus Masjid Noor Islam."
        }
      );


      return;

    }


    renderPaymentSettings(
      result.data
    );

  } catch (error) {

    console.error(
      "Load payment error:",
      error
    );


    renderPaymentSettings(
      {
        bank_name:
          "Rekening belum diatur",

        account_number:
          "-",

        account_name:
          "Masjid Noor Islam",

        instructions:
          "Informasi rekening belum tersedia. Silakan hubungi pengurus Masjid Noor Islam."
      }
    );

  }

}


/* =========================================================
   COPY ACCOUNT NUMBER
========================================================= */

async function copyAccount() {

  if (
    !currentPaymentSettings ||
    !currentPaymentSettings.account_number
  ) {

    showToast(
      "Nomor rekening belum tersedia"
    );

    return;

  }


  const number =
    String(
      currentPaymentSettings.account_number
    ).trim();


  if (!number || number === "-") {

    showToast(
      "Nomor rekening belum tersedia"
    );

    return;

  }


  try {

    await navigator.clipboard.writeText(
      number
    );


    showToast(
      "Nomor rekening berhasil disalin"
    );

  } catch (error) {

    /*
      Fallback untuk browser yang
      tidak mendukung Clipboard API.
    */

    const textarea =
      document.createElement(
        "textarea"
      );


    textarea.value =
      number;


    textarea.style.position =
      "fixed";

    textarea.style.opacity =
      "0";


    document.body.appendChild(
      textarea
    );


    textarea.focus();
    textarea.select();


    try {

      document.execCommand(
        "copy"
      );


      showToast(
        "Nomor rekening berhasil disalin"
      );

    } catch (copyError) {

      console.error(
        copyError
      );


      showToast(
        "Gagal menyalin nomor rekening"
      );

    }


    textarea.remove();

  }

}


/* =========================================================
   EVENTS
========================================================= */

if (copyAccountButton) {

  copyAccountButton.addEventListener(
    "click",
    copyAccount
  );

}


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeDonationPage() {

  /*
    Campaign harus dicek terlebih dahulu.

    Kalau campaign INFAQ, user langsung
    dialihkan ke halaman QRIS sehingga
    payment_settings tidak perlu dimuat.
  */

  const campaign =
    await loadCampaign();


  if (!campaign) {
    return;
  }


  await loadPaymentSettings();


  showContent();

}


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeDonationPage
);