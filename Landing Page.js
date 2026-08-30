(function () {
  "use strict";

  /* =====================================================
     MOBILE NAVIGATION
  ===================================================== */

  var menuToggle = document.getElementById("menuToggle");

  var navLinks = document.getElementById("navLinks");

  function closeMobileMenu() {
    if (!menuToggle || !navLinks) {
      return;
    }

    navLinks.classList.remove("active");

    menuToggle.classList.remove("active");

    menuToggle.setAttribute("aria-expanded", "false");

    document.body.classList.remove("menu-open");
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function (event) {
      event.stopPropagation();

      var isOpen = navLinks.classList.toggle("active");

      menuToggle.classList.toggle("active", isOpen);

      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("click", function (event) {
      if (
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMobileMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) {
        closeMobileMenu();
      }
    });
  }

  /* =====================================================
     FOOTER YEAR
  ===================================================== */

  var footerYear = document.getElementById("footerYear");

  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  /* =====================================================
     PRAYER CONFIGURATION
  ===================================================== */

  var PRAYER_ORDER = ["imsak", "subuh", "dzuhur", "ashar", "maghrib", "isya"];

  var PRAYER_LABEL = {
    imsak: "Imsak",

    subuh: "Subuh",

    dzuhur: "Dzuhur",

    ashar: "Ashar",

    maghrib: "Maghrib",

    isya: "Isya",
  };

  var PRAYER_ICON = {
    imsak:
      '<svg class="jcard-icon icon-anim" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
      '<path d="M12 3v2M12 19v2M5 12H3M21 12h-2M7.8 7.8 6.3 6.3M17.7 17.7l-1.5-1.5M7.8 16.2 6.3 17.7M17.7 6.3l-1.5 1.5"/>' +
      "</svg>",

    subuh:
      '<svg class="jcard-icon icon-anim" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
      '<path d="M12 2v4M4.9 4.9l2.8 2.8M2 12h4M4.9 19.1l2.8-2.8M12 18v4M19.1 19.1l-2.8-2.8M18 12h4M19.1 4.9l-2.8 2.8"/>' +
      "</svg>",

    dzuhur:
      '<svg class="jcard-icon icon-anim" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="4"/>' +
      '<path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>' +
      "</svg>",

    ashar:
      '<svg class="jcard-icon icon-anim" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
      '<path d="M17 18a5 5 0 1 0-10 0"/>' +
      '<path d="M12 9V2M4.2 4.2l1.4 1.4"/>' +
      "</svg>",

    maghrib:
      '<svg class="jcard-icon icon-anim" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
      '<path d="M12 10V2M4.2 4.2l1.4 1.4M2 12h2M4.2 19.8l1.4-1.4M12 22v-2"/>' +
      '<path d="M17 18a5 5 0 1 0-10 0"/>' +
      "</svg>",

    isya:
      '<svg class="jcard-icon icon-anim" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
      '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>' +
      "</svg>",
  };

  var FALLBACK_KOTA_ID = "1219";

  var jadwalData = null;

  /* =====================================================
     HELPERS
  ===================================================== */

  function pad(number) {
    return number < 10 ? "0" + number : String(number);
  }

  function toMinutes(hhmm) {
    if (!hhmm) {
      return 0;
    }

    var parts = hhmm.split(":");

    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  /* =====================================================
     RENDER PRAYER SCHEDULE
  ===================================================== */

  function renderJadwal(jadwal, lokasiLabel, tanggalLabel) {
    jadwalData = jadwal;

    var grid = document.getElementById("jadwalGrid");

    if (!grid) {
      return;
    }

    var cardsHtml = "";

    PRAYER_ORDER.forEach(function (key) {
      cardsHtml +=
        '<div class="jcard" data-key="' +
        key +
        '">' +
        (PRAYER_ICON[key] || "") +
        '<div class="jname">' +
        PRAYER_LABEL[key] +
        "</div>" +
        '<div class="jtime">' +
        (jadwal[key] || "--:--") +
        "</div>" +
        "</div>";
    });

    grid.innerHTML = cardsHtml;

    var tanggalElement = document.getElementById("jadwalTanggal");

    if (tanggalElement) {
      tanggalElement.textContent = tanggalLabel || "";
    }

    var sumberElement = document.getElementById("jadwalSumber");

    if (sumberElement) {
      sumberElement.textContent =
        "Wilayah: " +
        (lokasiLabel || "Kota Yogyakarta") +
        " · Sumber: Kemenag RI";
    }

    var statusElement = document.getElementById("jadwalStatus");

    if (statusElement) {
      statusElement.textContent = "";
    }

    highlightNextPrayer();
  }

  /* =====================================================
     NEXT PRAYER
  ===================================================== */

  function highlightNextPrayer() {
    if (!jadwalData) {
      return;
    }

    var now = new Date();

    var nowMinutes = now.getHours() * 60 + now.getMinutes();

    var cards = document.querySelectorAll("#jadwalGrid .jcard");

    cards.forEach(function (card) {
      card.classList.remove("active");
    });

    var upcoming = null;

    for (var i = 0; i < PRAYER_ORDER.length; i++) {
      var key = PRAYER_ORDER[i];

      /*
        Imsak tidak dihitung
        sebagai sholat wajib berikutnya
      */

      if (key === "imsak") {
        continue;
      }

      if (!jadwalData[key]) {
        continue;
      }

      if (toMinutes(jadwalData[key]) > nowMinutes) {
        upcoming = key;

        break;
      }
    }

    var pcName = document.getElementById("pcNextName");

    var pcTime = document.getElementById("pcTime");

    var pcTimer = document.getElementById("pcTimer");

    var targetKey;

    var targetHHMM;

    var isTomorrow = false;

    if (upcoming) {
      targetKey = upcoming;

      targetHHMM = jadwalData[upcoming];

      var activeCard = document.querySelector(
        '#jadwalGrid .jcard[data-key="' + upcoming + '"]',
      );

      if (activeCard) {
        activeCard.classList.add("active");
      }
    } else {
      targetKey = "subuh";

      targetHHMM = jadwalData.subuh;

      isTomorrow = true;

      var subuhCard = document.querySelector(
        '#jadwalGrid .jcard[data-key="subuh"]',
      );

      if (subuhCard) {
        subuhCard.classList.add("active");
      }
    }

    if (pcName) {
      pcName.textContent = PRAYER_LABEL[targetKey] || "Sholat";
    }

    if (pcTime) {
      pcTime.textContent = targetHHMM || "--:--";
    }

    if (pcTimer && targetHHMM) {
      var timeParts = targetHHMM.split(":");

      var targetDate = new Date(
        now.getFullYear(),

        now.getMonth(),

        now.getDate(),

        parseInt(timeParts[0], 10),

        parseInt(timeParts[1], 10),

        0,
      );

      if (isTomorrow || targetDate.getTime() <= now.getTime()) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      var difference = targetDate.getTime() - now.getTime();

      var totalSeconds = Math.max(
        0,

        Math.floor(difference / 1000),
      );

      var hours = Math.floor(totalSeconds / 3600);

      var minutes = Math.floor((totalSeconds % 3600) / 60);

      var seconds = totalSeconds % 60;

      pcTimer.textContent =
        pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
    }
  }

  setInterval(highlightNextPrayer, 1000);

  /* =====================================================
     FETCH PRAYER API
  ===================================================== */

  function fetchJadwalById(kotaId, lokasiLabel) {
    var now = new Date();

    var year = now.getFullYear();

    var month = pad(now.getMonth() + 1);

    var day = pad(now.getDate());

    var url =
      "https://api.myquran.com/v2/sholat/jadwal/" +
      kotaId +
      "/" +
      year +
      "/" +
      month +
      "/" +
      day;

    return fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Gagal mengambil jadwal");
        }

        return response.json();
      })

      .then(function (result) {
        if (!result || !result.status || !result.data || !result.data.jadwal) {
          throw new Error("Format data tidak sesuai");
        }

        var jadwal = result.data.jadwal;

        var label = result.data.lokasi || lokasiLabel;

        renderJadwal(
          jadwal,

          label,

          jadwal.tanggal || "",
        );
      });
  }

  /* =====================================================
     LOAD PRAYER DATA
  ===================================================== */

  function loadJadwal() {
    var status = document.getElementById("jadwalStatus");

    if (status) {
      status.textContent = "Memuat jadwal sholat…";
    }

    fetch("https://api.myquran.com/v2/sholat/kota/cari/yogyakarta")
      .then(function (response) {
        return response.json();
      })

      .then(function (result) {
        var kotaId = FALLBACK_KOTA_ID;

        var label = "Kota Yogyakarta";

        if (result && result.status && Array.isArray(result.data)) {
          var match = result.data.find(function (kota) {
            return /kota yogyakarta/i.test(kota.lokasi || "");
          });

          if (match) {
            kotaId = match.id;

            label = match.lokasi;
          }
        }

        return fetchJadwalById(kotaId, label);
      })

      .catch(function () {
        fetchJadwalById(
          FALLBACK_KOTA_ID,

          "Kota Yogyakarta",
        ).catch(function () {
          if (status) {
            status.textContent =
              "Jadwal sholat belum dapat dimuat. Silakan coba beberapa saat lagi.";
          }

          var timer = document.getElementById("pcTimer");

          if (timer) {
            timer.textContent = "--:--:--";
          }
        });
      });
  }

  /* =====================================================
     SUPABASE KEGIATAN
  ===================================================== */

  var SUPABASE_URL = "https://ljgedntbohlgdtkphqex.supabase.co";

  var SUPABASE_KEY = "sb_publishable_j06auKDeW4sdrJGBoIqkXg_F3dQSjV9";

  var supabaseClient = null;

  if (window.supabase && window.supabase.createClient) {
    supabaseClient = window.supabase.createClient(

      SUPABASE_URL,

      SUPABASE_KEY,
    );
  }

  /* =====================================================
     SECURITY ESCAPE HTML
  ===================================================== */

  function escapeHtml(value) {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")

      .replace(/</g, "&lt;")

      .replace(/>/g, "&gt;")

      .replace(/"/g, "&quot;")

      .replace(/'/g, "&#039;");
  }

  /* =====================================================
     RENDER KEGIATAN
  ===================================================== */

  function renderKegiatan(list) {
    var grid = document.getElementById("kegiatanGrid");

    var note = document.getElementById("kegiatanNote");

    if (!grid) {
      return;
    }

    if (!list || list.length === 0) {
      grid.innerHTML = "";

      if (note) {
        note.hidden = false;

        note.textContent =
          "Belum ada kegiatan yang ditambahkan oleh takmir. Bagian ini akan otomatis terisi ketika data kegiatan tersedia.";
      }

      return;
    }

    if (note) {
      note.hidden = true;
    }

    var html = "";

    list.forEach(function (kegiatan) {
      var jadwalText = [kegiatan.hari, kegiatan.jam]

        .filter(Boolean)

        .join(" · ");

      html +=
        '<article class="keg-card">' +
        "<div>" +
        (jadwalText
          ? '<div class="keg-tag">' + escapeHtml(jadwalText) + "</div>"
          : "") +
        "<h3>" +
        escapeHtml(kegiatan.nama_kegiatan || "Kegiatan") +
        "</h3>" +
        (kegiatan.deskripsi
          ? "<p>" + escapeHtml(kegiatan.deskripsi) + "</p>"
          : "") +
        "</div>" +
        "</article>";
    });

    grid.innerHTML = html;
  }

  /* =====================================================
     LOAD KEGIATAN
  ===================================================== */

  function loadKegiatan() {
    if (!supabaseClient) {
      renderKegiatan([]);

      return;
    }

    supabaseClient

      .from("kegiatan")

      .select("*")

      .order("id", {
        ascending: true,
      })

      .then(function (result) {
        if (result.error) {
          console.error(
            "Gagal mengambil kegiatan:",

            result.error,
          );

          renderKegiatan([]);

          return;
        }

        renderKegiatan(result.data);
      })

      .catch(function (error) {
        console.error(

          "Kesalahan Supabase:",

          error,
        );

        renderKegiatan([]);
      });
  }

  /* =====================================================
     INITIALIZE
  ===================================================== */

  loadJadwal();

  loadKegiatan();
})();