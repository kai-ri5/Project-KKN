(function () {
  "use strict";

  /* =====================================================
     SUPABASE
  ===================================================== */

  var SUPABASE_URL =
    "https://ljgedntbohlgdtkphqex.supabase.co";

  var SUPABASE_KEY =
    "sb_publishable_j06auKDeW4sdrJGBoIqkXg_F3dQSjV9";

  var supabaseClient = null;

  if (
    window.supabase &&
    window.supabase.createClient
  ) {
    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );
  }


  /* =====================================================
     STATE
  ===================================================== */

  var allCampaigns = [];

  var currentFilter = "semua";

  var searchKeyword = "";


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


  function closeMenu() {

    if (
      !menuToggle ||
      !navLinks
    ) {
      return;
    }


    menuToggle.classList.remove(
      "active"
    );


    navLinks.classList.remove(
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
      .forEach(function (link) {

        link.addEventListener(
          "click",
          closeMenu
        );

      });


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

          closeMenu();

        }

      }
    );


    document.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Escape"
        ) {

          closeMenu();

        }

      }
    );


    window.addEventListener(
      "resize",
      function () {

        if (
          window.innerWidth > 720
        ) {

          closeMenu();

        }

      }
    );

  }


  /* =====================================================
     FOOTER YEAR
  ===================================================== */

  var footerYear =
    document.getElementById(
      "footerYear"
    );


  if (footerYear) {

    footerYear.textContent =
      new Date().getFullYear();

  }


  /* =====================================================
     HELPERS
  ===================================================== */

  function escapeHtml(value) {

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


  function formatRupiah(value) {

    var number =
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


  function calculatePercentage(
    collected,
    target
  ) {

    var targetNumber =
      Number(target) || 0;


    var collectedNumber =
      Number(collected) || 0;


    if (
      targetNumber <= 0
    ) {

      return 0;

    }


    return Math.min(
      Math.round(
        (
          collectedNumber /
          targetNumber
        ) * 100
      ),
      100
    );

  }


  function normalizeCategory(
    category
  ) {

    return String(
      category || ""
    )
      .trim()
      .toUpperCase();

  }


  function getImageHtml(
    campaign,
    className
  ) {

    if (
      campaign.gambar_url
    ) {

      return (
        '<img ' +

        'src="' +
        escapeHtml(
          campaign.gambar_url
        ) +
        '" ' +

        'alt="' +
        escapeHtml(
          campaign.judul ||
          "Campaign Donasi"
        ) +
        '" ' +

        'class="' +
        className +
        '" ' +

        'loading="lazy" ' +

        "/>"
      );

    }


    return (
      '<div class="campaign-image-placeholder">' +
      "Masjid Noor Islam" +
      "</div>"
    );

  }


  /* =====================================================
     STATISTIK
  ===================================================== */

  function renderStatistics() {

    var campaignElement =
      document.getElementById(
        "statCampaign"
      );


    var priorityElement =
      document.getElementById(
        "statPrioritas"
      );


    var collectedElement =
      document.getElementById(
        "statTerkumpul"
      );


    var activeCampaigns =
      allCampaigns.filter(
        function (campaign) {

          return (
            campaign.aktif !== false
          );

        }
      );


    var priorityCount =
      activeCampaigns.filter(
        function (campaign) {

          return Boolean(
            campaign.prioritas
          );

        }
      ).length;


    var totalCollected =
      activeCampaigns.reduce(
        function (
          total,
          campaign
        ) {

          return (
            total +
            (
              Number(
                campaign.terkumpul
              ) || 0
            )
          );

        },
        0
      );


    if (campaignElement) {

      campaignElement.textContent =
        activeCampaigns.length;

    }


    if (priorityElement) {

      priorityElement.textContent =
        priorityCount;

    }


    if (collectedElement) {

      collectedElement.textContent =
        formatRupiah(
          totalCollected
        );

    }

  }


  /* =====================================================
     FEATURED CAMPAIGN
  ===================================================== */

  function renderFeaturedCampaigns() {

    var container =
      document.getElementById(
        "featuredCampaigns"
      );


    if (!container) {

      return;

    }


    var featured =
      allCampaigns.filter(
        function (campaign) {

          return Boolean(
            campaign.prioritas
          );

        }
      );


    /*
      Kalau tidak ada campaign Prioritas,
      tampilkan campaign terbaru sebagai
      campaign utama.
    */

    if (
      featured.length === 0 &&
      allCampaigns.length > 0
    ) {

      featured = [
        allCampaigns[0]
      ];

    }


    /*
      Maksimal 2 campaign prioritas
      di bagian atas.
    */

    featured =
      featured.slice(
        0,
        2
      );


    if (
      featured.length === 0
    ) {

      container.innerHTML =
        '<div class="loading-box">' +
        "Belum ada campaign prioritas." +
        "</div>";

      return;

    }


    var html = "";


    featured.forEach(
      function (campaign) {

        var target =
          Number(
            campaign.target
          ) || 0;


        var collected =
          Number(
            campaign.terkumpul
          ) || 0;


        var percentage =
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
            '<img ' +

            'class="featured-card-image" ' +

            'src="' +
            escapeHtml(
              campaign.gambar_url
            ) +
            '" ' +

            'alt="' +
            escapeHtml(
              campaign.judul ||
              "Campaign Donasi"
            ) +
            '" ' +

            'loading="lazy" ' +

            "/>";

        } else {

          imageHtml = "";

        }


        /*
          INFAQ:
          href menuju #qris.

          Kategori lain:
          href menuju halaman Donasi
          dengan ID campaign.
        */

        var campaignHref =
          category === "INFAQ"
            ? "#qris"
            : (
                "../Donasi/donasi.html?id=" +
                encodeURIComponent(
                  campaign.id
                )
              );


        html +=
          '<article class="featured-card">' +

            imageHtml +

            '<div class="featured-content">' +

              '<div class="featured-badges">' +

                (
                  campaign.prioritas
                    ? (
                        '<span class="featured-priority">' +
                        "★ Campaign Prioritas" +
                        "</span>"
                      )
                    : ""
                ) +

                '<span class="featured-category">' +
                  escapeHtml(
                    campaign.kategori ||
                    "INFAQ"
                  ) +
                "</span>" +

              "</div>" +


              "<h3>" +

                escapeHtml(
                  campaign.judul ||
                  "Campaign Donasi"
                ) +

              "</h3>" +


              '<p class="featured-description">' +

                escapeHtml(
                  campaign.deskripsi ||
                  "Mari bersama mendukung program kebaikan Masjid Noor Islam."
                ) +

              "</p>" +


              '<div class="featured-bottom">' +

                '<div class="featured-progress-area">' +

                  '<div class="featured-progress-label">' +

                    "<strong>" +
                      percentage +
                      "% Terkumpul" +
                    "</strong>" +

                    "<span>" +
                      "Target: " +
                      formatRupiah(
                        target
                      ) +
                    "</span>" +

                  "</div>" +


                  '<div class="featured-progress">' +

                    '<span style="width:' +
                      percentage +
                      '%"></span>' +

                  "</div>" +


                  '<div class="featured-collected">' +

                    "Terkumpul" +

                    "<strong>" +
                      formatRupiah(
                        collected
                      ) +
                    "</strong>" +

                  "</div>" +

                "</div>" +


                '<a ' +

                  'href="' +
                  campaignHref +
                  '" ' +

                  'class="featured-donate js-donate" ' +

                  'data-campaign-id="' +
                  escapeHtml(
                    campaign.id
                  ) +
                  '">' +

                  "Donasi Sekarang" +

                  "<span>→</span>" +

                "</a>" +

              "</div>" +

            "</div>" +

          "</article>";

      }
    );


    container.innerHTML =
      html;


    bindDonateButtons();

  }


  /* =====================================================
     CAMPAIGN CARD
  ===================================================== */

  function createCampaignCard(
    campaign
  ) {

    var target =
      Number(
        campaign.target
      ) || 0;


    var collected =
      Number(
        campaign.terkumpul
      ) || 0;


    var percentage =
      calculatePercentage(
        collected,
        target
      );


    var category =
      normalizeCategory(
        campaign.kategori
      );


    var priorityHtml =
      campaign.prioritas
        ? (
            '<span class="card-badge card-badge-priority">' +
            "★ Prioritas" +
            "</span>"
          )
        : "";


    var image;


    if (
      campaign.gambar_url
    ) {

      image =
        '<img ' +

        'src="' +
        escapeHtml(
          campaign.gambar_url
        ) +
        '" ' +

        'alt="' +
        escapeHtml(
          campaign.judul ||
          "Campaign Donasi"
        ) +
        '" ' +

        'loading="lazy" ' +

        "/>";

    } else {

      image =
        '<div class="campaign-image-placeholder">' +
        "Masjid Noor Islam" +
        "</div>";

    }


    /*
      Link hanya fallback apabila JS
      tidak bekerja.

      Event click tetap diproses
      melalui selectCampaign().
    */

    var campaignHref =
      category === "INFAQ"
        ? "#qris"
        : (
            "../Donasi/donasi.html?id=" +
            encodeURIComponent(
              campaign.id
            )
          );


    return (

      '<article class="campaign-card">' +


        '<div class="campaign-card-image">' +

          image +

          '<div class="card-badges">' +

            priorityHtml +

            '<span class="card-badge card-badge-category">' +

              escapeHtml(
                campaign.kategori ||
                "INFAQ"
              ) +

            "</span>" +

          "</div>" +

        "</div>" +


        '<div class="campaign-card-body">' +


          "<h3>" +

            escapeHtml(
              campaign.judul ||
              "Campaign Donasi"
            ) +

          "</h3>" +


          '<p class="campaign-card-description">' +

            escapeHtml(
              campaign.deskripsi ||
              "Mari bersama mendukung program kebaikan Masjid Noor Islam."
            ) +

          "</p>" +


          '<div class="card-progress-row">' +

            "<strong>" +

              percentage +
              "% Terkumpul" +

            "</strong>" +


            "<span>" +

              "Target " +
              formatRupiah(
                target
              ) +

            "</span>" +

          "</div>" +


          '<div class="card-progress-bar">' +

            '<span style="width:' +
              percentage +
              '%"></span>' +

          "</div>" +


          '<div class="campaign-card-footer">' +


            "<div>" +

              '<div class="card-collected-label">' +
                "Terkumpul" +
              "</div>" +

              '<div class="card-collected">' +

                formatRupiah(
                  collected
                ) +

              "</div>" +

            "</div>" +


            '<a ' +

              'href="' +
              campaignHref +
              '" ' +

              'class="card-donate js-donate" ' +

              'data-campaign-id="' +
              escapeHtml(
                campaign.id
              ) +
              '">' +

              "Donasi Sekarang" +

              "<span>→</span>" +

            "</a>" +


          "</div>" +

        "</div>" +

      "</article>"

    );

  }


  /* =====================================================
     FILTER CAMPAIGN
  ===================================================== */

  function getFilteredCampaigns() {

    return allCampaigns.filter(
      function (campaign) {

        var matchCategory =
          true;


        if (
          currentFilter ===
          "prioritas"
        ) {

          matchCategory =
            Boolean(
              campaign.prioritas
            );

        } else if (
          currentFilter !==
          "semua"
        ) {

          matchCategory =

            String(
              campaign.kategori ||
              "INFAQ"
            ).toUpperCase() ===
            currentFilter.toUpperCase();

        }


        var searchableText =
          (
            (
              campaign.judul ||
              ""
            ) +

            " " +

            (
              campaign.deskripsi ||
              ""
            ) +

            " " +

            (
              campaign.kategori ||
              ""
            )

          ).toLowerCase();


        var matchSearch =
          searchableText.includes(
            searchKeyword
              .toLowerCase()
          );


        return (
          matchCategory &&
          matchSearch
        );

      }
    );

  }


  /* =====================================================
     RENDER GRID
  ===================================================== */

  function renderCampaignGrid() {

    var grid =
      document.getElementById(
        "campaignGrid"
      );


    var empty =
      document.getElementById(
        "campaignEmpty"
      );


    var resultCount =
      document.getElementById(
        "campaignResultCount"
      );


    if (!grid) {

      return;

    }


    var filtered =
      getFilteredCampaigns();


    if (resultCount) {

      resultCount.textContent =
        filtered.length;

    }


    if (
      filtered.length === 0
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


    var html = "";


    filtered.forEach(
      function (campaign) {

        html +=
          createCampaignCard(
            campaign
          );

      }
    );


    grid.innerHTML =
      html;


    bindDonateButtons();

  }


  /* =====================================================
     SEARCH
  ===================================================== */

  var searchInput =
    document.getElementById(
      "campaignSearch"
    );


  if (searchInput) {

    searchInput.addEventListener(
      "input",
      function () {

        searchKeyword =
          searchInput.value
            .trim();


        renderCampaignGrid();

      }
    );

  }


  /* =====================================================
     FILTER BUTTONS
  ===================================================== */

  var filterButtons =
    document.querySelectorAll(
      ".filter-btn"
    );


  filterButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          filterButtons.forEach(
            function (item) {

              item.classList.remove(
                "active"
              );

            }
          );


          button.classList.add(
            "active"
          );


          currentFilter =
            button.getAttribute(
              "data-filter"
            ) ||
            "semua";


          renderCampaignGrid();

        }
      );

    }
  );


  /* =====================================================
     SELECT CAMPAIGN
     BAGIAN PALING PENTING
  ===================================================== */

  function selectCampaign(
    campaignId,
    shouldScroll
  ) {

    var campaign =
      allCampaigns.find(
        function (item) {

          return (
            String(item.id) ===
            String(
              campaignId
            )
          );

        }
      );


    if (!campaign) {

      console.error(
        "Campaign tidak ditemukan:",
        campaignId
      );

      return;

    }


    var category =
      normalizeCategory(
        campaign.kategori
      );


    /* ==================================================
       SELAIN INFAQ
       → HALAMAN TRANSFER REKENING
    ================================================== */

    if (
      category !== "INFAQ"
    ) {

      window.location.href =
        "../Donasi/donasi.html?id=" +
        encodeURIComponent(
          campaign.id
        );


      return;

    }


    /* ==================================================
       INFAQ
       → TETAP PAKAI QRIS YANG SUDAH ADA
    ================================================== */

    var box =
      document.getElementById(
        "selectedCampaign"
      );


    var title =
      document.getElementById(
        "selectedCampaignTitle"
      );


    if (box) {

      box.hidden =
        false;

    }


    if (title) {

      title.textContent =
        campaign.judul ||
        "Campaign Donasi";

    }


    /*
      Tambahkan campaign ID ke URL
      agar campaign Infaq tetap diketahui.

      Contoh:
      infaq.html?campaign=123#qris
    */

    var newUrl =
      new URL(
        window.location.href
      );


    newUrl.searchParams.set(
      "campaign",
      campaign.id
    );


    newUrl.hash =
      "qris";


    history.replaceState(
      null,
      "",
      newUrl.toString()
    );


    /*
      Scroll ke bagian QRIS hanya
      apabila user menekan tombol.
    */

    if (shouldScroll) {

      var qris =
        document.getElementById(
          "qris"
        );


      if (qris) {

        qris.scrollIntoView(
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


  /* =====================================================
     DONATE BUTTON BINDINGS
  ===================================================== */

  function bindDonateButtons() {

    document
      .querySelectorAll(
        ".js-donate"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function (event) {

              event.preventDefault();


              var id =
                button.getAttribute(
                  "data-campaign-id"
                );


              selectCampaign(
                id,
                true
              );

            }
          );

        }
      );

  }


  /* =====================================================
     REMOVE CAMPAIGN SELECTION
  ===================================================== */

  var removeSelected =
    document.getElementById(
      "selectedCampaignRemove"
    );


  if (removeSelected) {

    removeSelected.addEventListener(
      "click",
      function () {

        var box =
          document.getElementById(
            "selectedCampaign"
          );


        if (box) {

          box.hidden =
            true;

        }


        var url =
          new URL(
            window.location.href
          );


        url.searchParams.delete(
          "campaign"
        );


        /*
          Hapus #qris juga supaya URL
          kembali bersih ketika selection
          dihapus.
        */

        if (
          url.hash === "#qris"
        ) {

          url.hash = "";

        }


        history.replaceState(
          null,
          "",
          url.toString()
        );

      }
    );

  }


  /* =====================================================
     QUERY PARAMETER CAMPAIGN
  ===================================================== */

  function loadCampaignFromUrl() {

    var params =
      new URLSearchParams(
        window.location.search
      );


    var campaignId =
      params.get(
        "campaign"
      );


    if (
      !campaignId
    ) {

      return;

    }


    var campaign =
      allCampaigns.find(
        function (item) {

          return (
            String(item.id) ===
            String(
              campaignId
            )
          );

        }
      );


    if (!campaign) {

      return;

    }


    var category =
      normalizeCategory(
        campaign.kategori
      );


    /*
      Kalau seseorang membuka:

      infaq.html?campaign=ID

      tetapi ID tersebut ternyata
      bukan kategori INFAQ,
      otomatis pindahkan ke rekening.
    */

    if (
      category !== "INFAQ"
    ) {

      window.location.replace(
        "../Donasi/donasi.html?id=" +
        encodeURIComponent(
          campaign.id
        )
      );


      return;

    }


    /*
      Kalau benar INFAQ,
      tampilkan campaign yang dipilih.
    */

    selectCampaign(
      campaignId,
      false
    );


    /*
      Kalau URL memiliki #qris,
      scroll ke QRIS setelah halaman
      selesai render.
    */

    if (
      window.location.hash ===
      "#qris"
    ) {

      setTimeout(
        function () {

          var qris =
            document.getElementById(
              "qris"
            );


          if (qris) {

            qris.scrollIntoView(
              {
                behavior:
                  "smooth",

                block:
                  "start"
              }
            );

          }

        },
        150
      );

    }

  }


  /* =====================================================
     LOAD SUPABASE CAMPAIGNS
  ===================================================== */

  function loadCampaigns() {

    var grid =
      document.getElementById(
        "campaignGrid"
      );


    var featured =
      document.getElementById(
        "featuredCampaigns"
      );


    if (
      !supabaseClient
    ) {

      if (grid) {

        grid.innerHTML =
          '<div class="loading-box grid-loading">' +
          "Supabase tidak dapat dimuat." +
          "</div>";

      }


      if (featured) {

        featured.innerHTML =
          '<div class="loading-box">' +
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
          ascending: false
        }
      )

      .order(
        "created_at",
        {
          ascending: false
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
                '<div class="loading-box grid-loading">' +
                "Campaign belum dapat dimuat." +
                "</div>";

            }


            if (featured) {

              featured.innerHTML =
                '<div class="loading-box">' +
                "Campaign prioritas belum dapat dimuat." +
                "</div>";

            }


            return;

          }


          /*
            Data campaign aktif.

            QURBAN tidak menggunakan
            campaign_donasi, jadi kalau
            ada data QURBAN yang terlanjur
            masuk ke tabel ini, jangan
            tampilkan.
          */

          allCampaigns =
            (
              result.data ||
              []
            ).filter(
              function (campaign) {

                return (
                  normalizeCategory(
                    campaign.kategori
                  ) !== "QURBAN"
                );

              }
            );


          renderStatistics();


          renderFeaturedCampaigns();


          renderCampaignGrid();


          loadCampaignFromUrl();

        }
      )

      .catch(
        function (error) {

          console.error(
            "Kesalahan Supabase:",
            error
          );


          if (grid) {

            grid.innerHTML =
              '<div class="loading-box grid-loading">' +
              "Terjadi kesalahan saat mengambil campaign." +
              "</div>";

          }

        }
      );

  }


  /* =====================================================
     INITIALIZE
  ===================================================== */

  loadCampaigns();

})();