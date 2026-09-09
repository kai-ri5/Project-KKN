(function () {
  "use strict";


  /* =====================================================
     MOBILE NAVIGATION
  ===================================================== */

  var menuToggle =
    document.getElementById(
      "menuToggle"
    );


  var navLinks =
    document.getElementById(
      "navLinks"
    );


  function closeMobileMenu() {

    if (
      !menuToggle ||
      !navLinks
    ) {
      return;
    }


    navLinks.classList.remove(
      "active"
    );


    menuToggle.classList.remove(
      "active"
    );


    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );


    document.body.classList.remove(
      "menu-open"
    );

  }


  if (
    menuToggle &&
    navLinks
  ) {

    menuToggle.addEventListener(
      "click",
      function (event) {

        event.stopPropagation();


        var isOpen =
          navLinks.classList.toggle(
            "active"
          );


        menuToggle.classList.toggle(
          "active",
          isOpen
        );


        menuToggle.setAttribute(
          "aria-expanded",
          isOpen
            ? "true"
            : "false"
        );


        document.body.classList.toggle(
          "menu-open",
          isOpen
        );

      }
    );


    navLinks
      .querySelectorAll("a")
      .forEach(
        function (link) {

          link.addEventListener(
            "click",
            closeMobileMenu
          );

        }
      );


    document.addEventListener(
      "click",
      function (event) {

        if (
          !navLinks.contains(
            event.target
          ) &&
          !menuToggle.contains(
            event.target
          )
        ) {

          closeMobileMenu();

        }

      }
    );


    document.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key ===
          "Escape"
        ) {

          closeMobileMenu();

        }

      }
    );


    window.addEventListener(
      "resize",
      function () {

        if (
          window.innerWidth >
          720
        ) {

          closeMobileMenu();

        }

      }
    );

  }


  /* =====================================================
     FOOTER
  ===================================================== */

  var footerYear =
    document.getElementById(
      "footerYear"
    );


  if (footerYear) {

    footerYear.textContent =
      new Date()
        .getFullYear();

  }


  /* =====================================================
     SUPABASE
  ===================================================== */

  var SUPABASE_URL =
    "https://ljgedntbohlgdtkphqex.supabase.co";


  var SUPABASE_KEY =
    "sb_publishable_j06auKDeW4sdrJGBoIqkXg_F3dQSjV9";


  var supabaseClient =
    null;


  if (
    window.supabase &&
    window.supabase
      .createClient
  ) {

    supabaseClient =
      window.supabase
        .createClient(
          SUPABASE_URL,
          SUPABASE_KEY
        );

  }


  /* =====================================================
     HELPERS
  ===================================================== */

  function pad(number) {

    return number < 10
      ? "0" + number
      : String(number);

  }


  function toMinutes(
    hhmm
  ) {

    if (!hhmm) {
      return 0;
    }


    var parts =
      hhmm.split(":");


    return (
      parseInt(
        parts[0],
        10
      ) * 60 +
      parseInt(
        parts[1],
        10
      )
    );

  }


  function escapeHtml(
    value
  ) {

    if (
      value === null ||
      value === undefined
    ) {

      return "";

    }


    return String(value)

      .replace(
        /&/g,
        "&amp;"
      )

      .replace(
        /</g,
        "&lt;"
      )

      .replace(
        />/g,
        "&gt;"
      )

      .replace(
        /"/g,
        "&quot;"
      )

      .replace(
        /'/g,
        "&#039;"
      );

  }


  function formatRupiah(
    value
  ) {

    return new Intl.NumberFormat(
      "id-ID",
      {
        style:
          "currency",

        currency:
          "IDR",

        maximumFractionDigits:
          0
      }
    ).format(
      Number(value) ||
      0
    );

  }


  /* =====================================================
     JADWAL SHOLAT
  ===================================================== */

  var PRAYER_ORDER = [

    "imsak",
    "subuh",
    "dzuhur",
    "ashar",
    "maghrib",
    "isya"

  ];


  var PRAYER_LABEL = {

    imsak:
      "Imsak",

    subuh:
      "Subuh",

    dzuhur:
      "Dzuhur",

    ashar:
      "Ashar",

    maghrib:
      "Maghrib",

    isya:
      "Isya"

  };


  var PRAYER_ICON = {

    imsak:
      '<svg class="jcard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3v2M12 19v2M5 12H3M21 12h-2"/></svg>',

    subuh:
      '<svg class="jcard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v4M4.9 4.9l2.8 2.8M2 12h4M18 12h4"/></svg>',

    dzuhur:
      '<svg class="jcard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>',

    ashar:
      '<svg class="jcard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 18a5 5 0 1 0-10 0"/><path d="M12 9V2"/></svg>',

    maghrib:
      '<svg class="jcard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 18a5 5 0 1 0-10 0"/><path d="M12 10V2"/></svg>',

    isya:
      '<svg class="jcard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'

  };


  var FALLBACK_KOTA_ID =
    "1219";


  var jadwalData =
    null;


  function renderJadwal(
    jadwal,
    lokasiLabel,
    tanggalLabel
  ) {

    jadwalData =
      jadwal;


    var grid =
      document.getElementById(
        "jadwalGrid"
      );


    if (!grid) {
      return;
    }


    var html = "";


    PRAYER_ORDER.forEach(
      function (key) {

        html +=

          '<div class="jcard" data-key="' +
          key +
          '">' +

          (
            PRAYER_ICON[key] ||
            ""
          ) +

          '<div class="jname">' +
          PRAYER_LABEL[key] +
          "</div>" +

          '<div class="jtime">' +

          escapeHtml(
            jadwal[key] ||
            "--:--"
          ) +

          "</div>" +

          "</div>";

      }
    );


    grid.innerHTML =
      html;


    var tanggal =
      document.getElementById(
        "jadwalTanggal"
      );


    if (tanggal) {

      tanggal.textContent =
        tanggalLabel ||
        "";

    }


    var sumber =
      document.getElementById(
        "jadwalSumber"
      );


    if (sumber) {

      sumber.textContent =

        "Wilayah: " +

        (
          lokasiLabel ||
          "Kota Yogyakarta"
        ) +

        " · Sumber: Kemenag RI";

    }


    var status =
      document.getElementById(
        "jadwalStatus"
      );


    if (status) {

      status.textContent =
        "";

    }


    highlightNextPrayer();

  }


  function highlightNextPrayer() {

    if (!jadwalData) {
      return;
    }


    var now =
      new Date();


    var nowMinutes =

      now.getHours() *
      60 +

      now.getMinutes();


    document
      .querySelectorAll(
        "#jadwalGrid .jcard"
      )
      .forEach(
        function (card) {

          card.classList
            .remove(
              "active"
            );

        }
      );


    var upcoming =
      null;


    for (
      var i = 0;
      i <
      PRAYER_ORDER.length;
      i++
    ) {

      var key =
        PRAYER_ORDER[i];


      if (
        key === "imsak"
      ) {
        continue;
      }


      if (
        !jadwalData[key]
      ) {
        continue;
      }


      if (
        toMinutes(
          jadwalData[key]
        ) >
        nowMinutes
      ) {

        upcoming =
          key;

        break;

      }

    }


    var targetKey;

    var targetHHMM;

    var isTomorrow =
      false;


    if (upcoming) {

      targetKey =
        upcoming;


      targetHHMM =
        jadwalData[
          upcoming
        ];


      var activeCard =
        document
          .querySelector(

            '#jadwalGrid .jcard[data-key="' +
            upcoming +
            '"]'

          );


      if (activeCard) {

        activeCard
          .classList
          .add(
            "active"
          );

      }

    } else {

      targetKey =
        "subuh";


      targetHHMM =
        jadwalData.subuh;


      isTomorrow =
        true;


      var subuhCard =
        document
          .querySelector(
            '#jadwalGrid .jcard[data-key="subuh"]'
          );


      if (subuhCard) {

        subuhCard
          .classList
          .add(
            "active"
          );

      }

    }


    var nameElement =
      document.getElementById(
        "pcNextName"
      );


    var timeElement =
      document.getElementById(
        "pcTime"
      );


    var timerElement =
      document.getElementById(
        "pcTimer"
      );


    if (nameElement) {

      nameElement.textContent =
        PRAYER_LABEL[
          targetKey
        ] ||
        "Sholat";

    }


    if (timeElement) {

      timeElement.textContent =
        targetHHMM ||
        "--:--";

    }


    if (
      timerElement &&
      targetHHMM
    ) {

      var parts =
        targetHHMM
          .split(":");


      var targetDate =
        new Date(

          now.getFullYear(),

          now.getMonth(),

          now.getDate(),

          parseInt(
            parts[0],
            10
          ),

          parseInt(
            parts[1],
            10
          ),

          0

        );


      if (
        isTomorrow ||
        targetDate.getTime() <=
        now.getTime()
      ) {

        targetDate.setDate(
          targetDate.getDate() +
          1
        );

      }


      var difference =

        targetDate.getTime() -
        now.getTime();


      var totalSeconds =
        Math.max(

          0,

          Math.floor(
            difference /
            1000
          )

        );


      var hours =
        Math.floor(
          totalSeconds /
          3600
        );


      var minutes =
        Math.floor(

          (
            totalSeconds %
            3600
          ) /

          60

        );


      var seconds =
        totalSeconds %
        60;


      timerElement.textContent =

        pad(hours) +
        ":" +

        pad(minutes) +
        ":" +

        pad(seconds);

    }

  }


  setInterval(
    highlightNextPrayer,
    1000
  );


  function fetchJadwalById(
    kotaId,
    lokasiLabel
  ) {

    var now =
      new Date();


    var year =
      now.getFullYear();


    var month =
      pad(
        now.getMonth() +
        1
      );


    var day =
      pad(
        now.getDate()
      );


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

      .then(
        function (response) {

          if (
            !response.ok
          ) {

            throw new Error(
              "Gagal mengambil jadwal"
            );

          }


          return response.json();

        }
      )

      .then(
        function (result) {

          if (
            !result ||
            !result.status ||
            !result.data ||
            !result.data.jadwal
          ) {

            throw new Error(
              "Format data tidak sesuai"
            );

          }


          var jadwal =
            result.data.jadwal;


          renderJadwal(

            jadwal,

            result.data.lokasi ||
            lokasiLabel,

            jadwal.tanggal ||
            ""

          );

        }
      );

  }


  function loadJadwal() {

    var status =
      document.getElementById(
        "jadwalStatus"
      );


    if (status) {

      status.textContent =
        "Memuat jadwal sholat…";

    }


    fetch(
      "https://api.myquran.com/v2/sholat/kota/cari/yogyakarta"
    )

      .then(
        function (response) {

          return response
            .json();

        }
      )

      .then(
        function (result) {

          var kotaId =
            FALLBACK_KOTA_ID;


          var label =
            "Kota Yogyakarta";


          if (
            result &&
            result.status &&
            Array.isArray(
              result.data
            )
          ) {

            var match =
              result.data.find(
                function (kota) {

                  return /kota yogyakarta/i
                    .test(
                      kota.lokasi ||
                      ""
                    );

                }
              );


            if (match) {

              kotaId =
                match.id;

              label =
                match.lokasi;

            }

          }


          return fetchJadwalById(
            kotaId,
            label
          );

        }
      )

      .catch(
        function () {

          fetchJadwalById(

            FALLBACK_KOTA_ID,

            "Kota Yogyakarta"

          ).catch(
            function () {

              if (status) {

                status.textContent =
                  "Jadwal sholat belum dapat dimuat.";

              }


              var timer =
                document.getElementById(
                  "pcTimer"
                );


              if (timer) {

                timer.textContent =
                  "--:--:--";

              }

            }
          );

        }
      );

  }


  /* =====================================================
     KEGIATAN
  ===================================================== */

  function renderKegiatan(
    list
  ) {

    var grid =
      document.getElementById(
        "kegiatanGrid"
      );


    var note =
      document.getElementById(
        "kegiatanNote"
      );


    if (!grid) {
      return;
    }


    if (
      !list ||
      list.length === 0
    ) {

      grid.innerHTML =
        "";


      if (note) {

        note.hidden =
          false;


        note.textContent =
          "Belum ada kegiatan yang ditambahkan oleh takmir.";

      }


      return;

    }


    if (note) {

      note.hidden =
        true;

    }


    var html =
      "";


    list.forEach(
      function (kegiatan) {

        var jadwalText =
          [

            kegiatan.hari,

            kegiatan.jam

          ]

            .filter(Boolean)

            .join(
              " · "
            );


        var imageHtml;


        if (
          kegiatan.gambar_url
        ) {

          imageHtml =

            '<div class="keg-image">' +

            '<img src="' +

            escapeHtml(
              kegiatan.gambar_url
            ) +

            '" alt="' +

            escapeHtml(

              kegiatan
                .nama_kegiatan ||

              "Kegiatan Masjid Noor Islam"

            ) +

            '" loading="lazy">' +

            "</div>";

        } else {

          imageHtml =

            '<div class="keg-image keg-image-placeholder">' +

            "<span>" +
            "Masjid Noor Islam" +
            "</span>" +

            "</div>";

        }


        html +=

          '<article class="keg-card">' +

          imageHtml +

          '<div class="keg-card-body">' +

          (
            jadwalText

              ? (
                  '<div class="keg-tag">' +

                  escapeHtml(
                    jadwalText
                  ) +

                  "</div>"
                )

              : ""
          ) +

          "<h3>" +

          escapeHtml(

            kegiatan
              .nama_kegiatan ||

            "Kegiatan"

          ) +

          "</h3>" +

          (
            kegiatan.deskripsi

              ? (
                  "<p>" +

                  escapeHtml(
                    kegiatan.deskripsi
                  ) +

                  "</p>"
                )

              : ""
          ) +

          "</div>" +

          "</article>";

      }
    );


    grid.innerHTML =
      html;

  }


  function loadKegiatan() {

    if (
      !supabaseClient
    ) {

      renderKegiatan(
        []
      );

      return;

    }


    supabaseClient

      .from(
        "kegiatan"
      )

      .select(
        "*"
      )

      .order(
        "id",
        {
          ascending:
            true
        }
      )

      .then(
        function (result) {

          if (
            result.error
          ) {

            console.error(
              "Gagal mengambil kegiatan:",
              result.error
            );


            renderKegiatan(
              []
            );


            return;

          }


          renderKegiatan(
            result.data ||
            []
          );

        }
      )

      .catch(
        function (error) {

          console.error(
            "Kesalahan Supabase:",
            error
          );


          renderKegiatan(
            []
          );

        }
      );

  }


  /* =====================================================
     CAMPAIGN
  ===================================================== */

  var campaignData =
    [];


  /*
    FALSE:
    tampil maksimal 3.

    TRUE:
    tampil semua.
  */

  var showAllCampaigns =
    false;


  /*
    Karena kartu filter Zakat /
    Donasi di landing page sudah
    dihapus, landing selalu
    menampilkan semua kategori.
  */

  var activeCampaignFilter =
    "ALL";


  function calculatePercentage(
    terkumpul,
    target
  ) {

    var collected =
      Number(
        terkumpul
      ) || 0;


    var goal =
      Number(
        target
      ) || 0;


    if (
      goal <= 0
    ) {

      return 0;

    }


    return Math.min(

      100,

      Math.max(

        0,

        Math.round(

          collected /
          goal *
          100

        )

      )

    );

  }


  function normalizeCategory(
    category
  ) {

    return String(
      category ||
      "DONASI"
    )

      .trim()

      .toUpperCase();

  }


  function getFilteredCampaigns() {

    var list =
      campaignData
        .slice();


    if (
      activeCampaignFilter ===
      "ALL"
    ) {

      return list;

    }


    return list.filter(
      function (campaign) {

        var category =
          normalizeCategory(
            campaign.kategori
          );


        return (
          category ===
          activeCampaignFilter
        );

      }
    );

  }


  /* =====================================================
     CAMPAIGN
     MAX 3 / LEBIH BANYAK
  ===================================================== */

  function renderCurrentCampaigns() {

    var list =
      getFilteredCampaigns();


    /*
      Default maksimal 3.
    */

    if (
      !showAllCampaigns
    ) {

      list =
        list.slice(
          0,
          3
        );

    }


    renderCampaign(
      list
    );


    updateCampaignToggleButton();

  }


  function updateCampaignToggleButton() {

    var button =
      document.getElementById(
        "campaignReset"
      );


    if (!button) {
      return;
    }


    var total =
      getFilteredCampaigns()
        .length;


    /*
      Kalau jumlah campaign
      hanya 3 atau kurang,
      tombol disembunyikan.
    */

    if (
      total <= 3
    ) {

      button.hidden =
        true;


      return;

    }


    button.hidden =
      false;


    button.textContent =

      showAllCampaigns

        ? "Lebih Sedikit"

        : "Lebih Banyak";

  }


  function renderCampaign(
    list
  ) {

    var grid =
      document.getElementById(
        "campaignGrid"
      );


    var empty =
      document.getElementById(
        "campaignEmpty"
      );


    if (!grid) {
      return;
    }


    if (
      !list ||
      list.length === 0
    ) {

      grid.innerHTML =
        "";


      if (empty) {

        empty.hidden =
          false;

      }


      return;

    }


    if (empty) {

      empty.hidden =
        true;

    }


    var html =
      "";


    list.forEach(
      function (campaign) {

        var target =
          Number(
            campaign.target
          ) || 0;


        var collected =
          Number(
            campaign.terkumpul
          ) || 0;


        var progress =
          calculatePercentage(
            collected,
            target
          );


        var category =
          normalizeCategory(
            campaign.kategori
          );


        var imageHtml;


        if (
          campaign.gambar_url
        ) {

          imageHtml =

            '<img src="' +

            escapeHtml(
              campaign.gambar_url
            ) +

            '" alt="' +

            escapeHtml(

              campaign.judul ||
              "Campaign Masjid Noor Islam"

            ) +

            '" loading="lazy">';

        } else {

          imageHtml =

            '<div class="campaign-image-placeholder">' +

            "Masjid Noor Islam" +

            "</div>";

        }


        var priority =
          campaign.prioritas

            ? (
                '<span class="campaign-priority">' +
                "Prioritas" +
                "</span>"
              )

            : "";


        /*
          INFAQ:
          menuju halaman Infaq / QRIS.

          SELAIN INFAQ:
          menuju halaman rekening.
        */

        var actionUrl =

          category === "INFAQ"

            ? (
                "Infaq/infaq.html?campaign=" +

                encodeURIComponent(
                  campaign.id
                ) +

                "#qris"
              )

            : (
                "Donasi/donasi.html?id=" +

                encodeURIComponent(
                  campaign.id
                )
              );


        html +=

          '<article class="campaign-card">' +


          '<div class="campaign-image">' +

          imageHtml +

          priority +

          "</div>" +


          '<div class="campaign-content">' +


          '<div class="campaign-category">' +

          escapeHtml(
            category
          ) +

          "</div>" +


          "<h4>" +

          escapeHtml(

            campaign.judul ||
            "Program Masjid"

          ) +

          "</h4>" +


          '<p class="campaign-description">' +

          escapeHtml(

            campaign.deskripsi ||

            "Mari berpartisipasi dalam program kebaikan Masjid Noor Islam."

          ) +

          "</p>" +


          '<div class="campaign-progress-head">' +

          "<span>" +

          progress +

          "% terkumpul" +

          "</span>" +

          "<span>" +
          "Target" +
          "</span>" +

          "</div>" +


          '<div class="campaign-progress">' +

          '<div class="campaign-progress-bar" style="width:' +

          progress +

          '%"></div>' +

          "</div>" +


          '<div class="campaign-money">' +


          "<div>" +

          "<small>" +
          "Terkumpul" +
          "</small>" +

          "<strong>" +

          formatRupiah(
            collected
          ) +

          "</strong>" +

          "</div>" +


          "<div>" +

          "<small>" +
          "Target" +
          "</small>" +

          "<strong>" +

          formatRupiah(
            target
          ) +

          "</strong>" +

          "</div>" +


          "</div>" +


          '<a class="campaign-action" href="' +

          actionUrl +

          '">' +

          "Donasi Sekarang" +

          "</a>" +


          "</div>" +

          "</article>";

      }
    );


    grid.innerHTML =
      html;

  }


  function loadCampaign() {

    var grid =
      document.getElementById(
        "campaignGrid"
      );


    if (
      !supabaseClient
    ) {

      if (grid) {

        grid.innerHTML =

          '<div class="campaign-loading">' +

          "Campaign belum dapat dimuat." +

          "</div>";

      }


      return;

    }


    supabaseClient

      .from(
        "campaign_donasi"
      )

      .select(
        "*"
      )

      .eq(
        "aktif",
        true
      )

      .order(
        "prioritas",
        {
          ascending:
            false
        }
      )

      .order(
        "created_at",
        {
          ascending:
            false
        }
      )

      .then(
        function (result) {

          if (
            result.error
          ) {

            console.error(
              "Gagal mengambil campaign:",
              result.error
            );


            if (grid) {

              grid.innerHTML =

                '<div class="campaign-loading">' +

                "Campaign belum dapat dimuat." +

                "</div>";

            }


            return;

          }


          /*
            QURBAN tidak ditampilkan
            sebagai campaign karena
            punya section sendiri.
          */

          campaignData =
            (
              result.data ||
              []
            )

              .filter(
                function (campaign) {

                  return (

                    normalizeCategory(
                      campaign.kategori
                    ) !==
                    "QURBAN"

                  );

                }
              );


          /*
            Setiap refresh kembali
            maksimal tiga.
          */

          activeCampaignFilter =
            "ALL";


          showAllCampaigns =
            false;


          renderCurrentCampaigns();

        }
      )

      .catch(
        function (error) {

          console.error(
            "Kesalahan campaign:",
            error
          );


          if (grid) {

            grid.innerHTML =

              '<div class="campaign-loading">' +

              "Campaign belum dapat dimuat." +

              "</div>";

          }

        }
      );

  }


  /* =====================================================
     CAMPAIGN TOGGLE
  ===================================================== */

  var campaignReset =
    document.getElementById(
      "campaignReset"
    );


  if (campaignReset) {

    campaignReset.addEventListener(
      "click",
      function () {


        /*
          Tukar kondisi:
          false → true
          true → false
        */

        showAllCampaigns =
          !showAllCampaigns;


        renderCurrentCampaigns();


        /*
          Saat kembali ke
          "Lebih Sedikit",
          scroll ke judul Campaign.
        */

        if (
          !showAllCampaigns
        ) {

          var head =
            document.querySelector(
              ".campaign-head"
            );


          if (head) {

            head.scrollIntoView(
              {
                behavior:
                  "smooth",

                block:
                  "start"
              }
            );

          }

        }

      }
    );

  }


  /* =====================================================
     QURBAN
  ===================================================== */

  function formatWhatsapp(
    number
  ) {

    var value =
      String(
        number ||
        ""
      )

        .replace(
          /\D/g,
          ""
        );


    if (
      value.startsWith(
        "0"
      )
    ) {

      value =

        "62" +

        value.substring(
          1
        );

    }


    return value;

  }


  function renderQurban(
    list
  ) {

    var grid =
      document.getElementById(
        "qurbanGrid"
      );


    var empty =
      document.getElementById(
        "qurbanEmpty"
      );


    if (!grid) {
      return;
    }


    if (
      !list ||
      list.length === 0
    ) {

      grid.innerHTML =
        "";


      if (empty) {

        empty.hidden =
          false;

      }


      return;

    }


    if (empty) {

      empty.hidden =
        true;

    }


    var html =
      "";


    list.forEach(
      function (qurban) {

        var image;


        if (
          qurban.gambar_url
        ) {

          image =

            '<img src="' +

            escapeHtml(
              qurban.gambar_url
            ) +

            '" alt="' +

            escapeHtml(

              qurban.judul ||
              "Program Qurban"

            ) +

            '" loading="lazy">';

        } else {

          image =

            '<div class="qurban-image-placeholder">' +

            "Program Qurban" +

            "</div>";

        }


        var whatsapp =
          formatWhatsapp(
            qurban.kontak
          );


        var message =

          "Assalamu'alaikum, saya ingin mendaftar program " +

          (
            qurban.judul ||
            "Qurban Masjid Noor Islam"
          ) +

          " di Masjid Noor Islam.";


        var whatsappUrl =

          whatsapp

            ? (
                "https://wa.me/" +

                whatsapp +

                "?text=" +

                encodeURIComponent(
                  message
                )
              )

            : "#";


        html +=

          '<article class="qurban-card">' +


          '<div class="qurban-image">' +

          image +

          (
            qurban.prioritas

              ? (
                  '<span class="campaign-priority">' +
                  "Prioritas" +
                  "</span>"
                )

              : ""
          ) +

          "</div>" +


          '<div class="qurban-content">' +


          '<div class="campaign-category">' +

          "QURBAN" +

          "</div>" +


          "<h3>" +

          escapeHtml(

            qurban.judul ||
            "Program Qurban"

          ) +

          "</h3>" +


          '<div class="qurban-kind">' +

          escapeHtml(
            qurban.jenis_hewan ||
            ""
          ) +

          "</div>" +


          '<div class="qurban-price">' +

          formatRupiah(
            qurban.harga
          ) +

          "</div>" +


          (
            qurban.periode

              ? (
                  '<div class="qurban-period">' +

                  escapeHtml(
                    qurban.periode
                  ) +

                  "</div>"
                )

              : ""
          ) +


          (
            qurban.deskripsi

              ? (
                  "<p>" +

                  escapeHtml(
                    qurban.deskripsi
                  ) +

                  "</p>"
                )

              : ""
          ) +


          (
            whatsapp

              ? (
                  '<a class="qurban-action" href="' +

                  whatsappUrl +

                  '" target="_blank" rel="noopener noreferrer">' +

                  "Daftar Qurban via WhatsApp" +

                  "</a>"
                )

              : (
                  '<span class="qurban-action qurban-action-disabled">' +

                  "Kontak panitia belum tersedia" +

                  "</span>"
                )
          ) +


          "</div>" +

          "</article>";

      }
    );


    grid.innerHTML =
      html;

  }


  function loadQurban() {

    if (
      !supabaseClient
    ) {

      renderQurban(
        []
      );

      return;

    }


    supabaseClient

      .from(
        "program_qurban"
      )

      .select(
        "*"
      )

      .eq(
        "aktif",
        true
      )

      .order(
        "prioritas",
        {
          ascending:
            false
        }
      )

      .order(
        "created_at",
        {
          ascending:
            false
        }
      )

      .then(
        function (result) {

          if (
            result.error
          ) {

            console.error(
              "Gagal mengambil Qurban:",
              result.error
            );


            renderQurban(
              []
            );


            return;

          }


          renderQurban(
            result.data ||
            []
          );

        }
      )

      .catch(
        function (error) {

          console.error(
            "Qurban:",
            error
          );


          renderQurban(
            []
          );

        }
      );

  }


  /* =====================================================
     INIT
  ===================================================== */

  loadJadwal();

  loadKegiatan();

  loadCampaign();

  loadQurban();


})();