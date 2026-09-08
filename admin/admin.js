(function () {
  "use strict";

  var SUPABASE_URL =
    "https://ljgedntbohlgdtkphqex.supabase.co";

  var SUPABASE_KEY =
    "sb_publishable_j06auKDeW4sdrJGBoIqkXg_F3dQSjV9";


  var db =
    window.supabase &&
    window.supabase.createClient

      ? window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY,
        )

      : null;


  var kegiatanData = [];

  var campaignData = [];

  var qurbanData = [];

  var campaignFilter =
    "ALL";

  var deleteCallback =
    null;



  function esc(value) {

    return String(
      value ?? "",
    )

      .replace(
        /&/g,
        "&amp;",
      )

      .replace(
        /</g,
        "&lt;",
      )

      .replace(
        />/g,
        "&gt;",
      )

      .replace(
        /"/g,
        "&quot;",
      )

      .replace(
        /'/g,
        "&#039;",
      );
  }



  function rupiah(value) {

    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      },
    ).format(
      Number(value) || 0,
    );
  }



  function pct(
    collected,
    target,
  ) {

    collected =
      Number(collected) || 0;

    target =
      Number(target) || 0;


    if (target <= 0) {
      return 0;
    }


    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          collected /
          target *
          100,
        ),
      ),
    );
  }



  function el(id) {
    return document.getElementById(
      id,
    );
  }



  function msg(
    id,
    text,
    success,
  ) {

    var element =
      el(id);


    if (!element) {
      return;
    }


    element.textContent =
      text || "";


    element.style.color =
      success
        ? "#24764e"
        : "#b5502e";
  }



  function toast(text) {

    var element =
      el("toast");


    if (!element) {
      return;
    }


    element.textContent =
      text;


    element.classList.add(
      "show",
    );


    setTimeout(
      function () {

        element.classList.remove(
          "show",
        );

      },
      2500,
    );
  }



  function openModal(id) {

    var element =
      el(id);


    if (!element) {
      return;
    }


    element.hidden =
      false;


    document.body.style.overflow =
      "hidden";
  }



  function closeModal(id) {

    var element =
      el(id);


    if (!element) {
      return;
    }


    element.hidden =
      true;


    document.body.style.overflow =
      "";
  }



  function fileName(file) {

    var extension =
      (
        file.name
          .split(".")
          .pop() ||
        "jpg"
      )
        .toLowerCase();


    return (
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .slice(2, 9) +
      "." +
      extension
    );
  }



  async function upload(
    bucket,
    folder,
    file,
  ) {

    if (!file) {
      return null;
    }


    if (
      !file.type.startsWith(
        "image/",
      )
    ) {

      throw new Error(
        "File harus berupa gambar.",
      );
    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

      throw new Error(
        "Ukuran gambar maksimal 5 MB.",
      );
    }


    var path =
      folder +
      "/" +
      fileName(file);


    var result =
      await db.storage

        .from(bucket)

        .upload(
          path,
          file,
          {
            cacheControl:
              "3600",

            upsert:
              false,
          },
        );


    if (result.error) {
      throw result.error;
    }


    return db.storage

      .from(bucket)

      .getPublicUrl(path)
      .data
      .publicUrl;
  }



  async function isAdmin(uid) {

    var result =
      await db

        .from(
          "admin_users",
        )

        .select(
          "user_id",
        )

        .eq(
          "user_id",
          uid,
        )

        .maybeSingle();


    return (
      !result.error &&
      !!result.data
    );
  }



  /* =====================================================
     LOGIN
  ===================================================== */

  var loginForm =
    el("loginForm");


  if (loginForm) {

    (async function () {

      if (!db) {
        return;
      }


      var result =
        await db.auth
          .getSession();


      if (
        result.data.session &&
        await isAdmin(
          result.data.session.user.id,
        )
      ) {

        location.href =
          "dashboard.html";
      }

    })();


    loginForm.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();


        var button =
          el("loginButton");


        button.disabled =
          true;


        button.textContent =
          "Memproses...";


        msg(
          "loginMessage",
          "",
        );


        try {

          var result =
            await db.auth
              .signInWithPassword({

                email:
                  el("loginEmail")
                    .value
                    .trim(),

                password:
                  el("loginPassword")
                    .value,

              });


          if (result.error) {
            throw result.error;
          }


          if (
            !await isAdmin(
              result.data.user.id,
            )
          ) {

            await db.auth
              .signOut();


            throw new Error(
              "Akun ini tidak memiliki akses admin.",
            );
          }


          location.href =
            "dashboard.html";

        } catch (error) {

          msg(
            "loginMessage",
            error.message ||
              "Login gagal.",
          );

        } finally {

          button.disabled =
            false;


          button.textContent =
            "Masuk Dashboard";
        }
      },
    );
  }



  /* =====================================================
     DASHBOARD INIT
  ===================================================== */

  if (
    document.querySelector(
      ".dashboard-main",
    )
  ) {

    initDashboard();
  }



  async function initDashboard() {

    if (!db) {

      location.href =
        "login.html";

      return;
    }


    var result =
      await db.auth
        .getSession();


    var session =
      result.data.session;


    if (
      !session ||
      !await isAdmin(
        session.user.id,
      )
    ) {

      if (session) {

        await db.auth
          .signOut();
      }


      location.href =
        "login.html";

      return;
    }


    if (el("adminEmail")) {

      el("adminEmail")
        .textContent =
          session.user.email ||
          "Admin";
    }


    setupNav();

    setupModal();

    setupForms();

    setupFilters();


    await Promise.all([
      loadKegiatan(),
      loadCampaign(),
      loadQurban(),
    ]);


    updateOverview();
  }



  if (el("logoutButton")) {

    el("logoutButton")
      .addEventListener(
        "click",
        async function () {

          if (db) {
            await db.auth
              .signOut();
          }


          location.href =
            "login.html";
        },
      );
  }



  /* =====================================================
     NAVIGATION
  ===================================================== */

  function setupNav() {

    document
      .querySelectorAll(
        ".sidebar-link",
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              var section =
                button.dataset
                  .section;


              document
                .querySelectorAll(
                  ".sidebar-link",
                )
                .forEach(
                  function (item) {

                    item.classList.remove(
                      "active",
                    );
                  },
                );


              button.classList.add(
                "active",
              );


              document
                .querySelectorAll(
                  ".dashboard-section",
                )
                .forEach(
                  function (item) {

                    item.classList.remove(
                      "active",
                    );
                  },
                );


              var sectionElement =
                el(
                  "section-" +
                  section,
                );


              if (sectionElement) {

                sectionElement
                  .classList
                  .add("active");
              }


              var titles = {

                overview:
                  "Dashboard",

                kegiatan:
                  "Kegiatan",

                campaign:
                  "ZIS & Donasi",

                qurban:
                  "Qurban",

              };


              if (el("pageTitle")) {

                el("pageTitle")
                  .textContent =
                    titles[section] ||
                    "Dashboard";
              }


              if (el("sidebar")) {

                el("sidebar")
                  .classList
                  .remove("open");
              }
            },
          );
        },
      );


    if (
      el(
        "mobileSidebarButton",
      )
    ) {

      el(
        "mobileSidebarButton",
      )
        .addEventListener(
          "click",
          function () {

            if (el("sidebar")) {

              el("sidebar")
                .classList
                .toggle("open");
            }
          },
        );
    }
  }



  /* =====================================================
     MODALS
  ===================================================== */

  function setupModal() {

    document
      .querySelectorAll(
        "[data-close-modal]",
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              closeModal(
                button.dataset
                  .closeModal,
              );
            },
          );
        },
      );


    document
      .querySelectorAll(
        ".modal-backdrop",
      )
      .forEach(
        function (modal) {

          modal.addEventListener(
            "click",
            function (event) {

              if (
                event.target ===
                  modal &&
                modal.id !==
                  "confirmModal"
              ) {

                closeModal(
                  modal.id,
                );
              }
            },
          );
        },
      );
  }



  function confirmDelete(
    title,
    text,
    callback,
  ) {

    el("confirmTitle")
      .textContent =
        title;


    el("confirmText")
      .textContent =
        text;


    deleteCallback =
      callback;


    openModal(
      "confirmModal",
    );
  }



  /* =====================================================
     SETUP FORMS
  ===================================================== */

  function setupForms() {

    if (
      el(
        "addKegiatanButton",
      )
    ) {

      el(
        "addKegiatanButton",
      )
        .addEventListener(
          "click",
          function () {

            resetKegiatan();

            openModal(
              "kegiatanModal",
            );
          },
        );
    }


    if (el("kegiatanForm")) {

      el("kegiatanForm")
        .addEventListener(
          "submit",
          saveKegiatan,
        );
    }


    if (
      el(
        "addCampaignButton",
      )
    ) {

      el(
        "addCampaignButton",
      )
        .addEventListener(
          "click",
          function () {

            resetCampaign();

            openModal(
              "campaignModal",
            );
          },
        );
    }


    if (el("campaignForm")) {

      el("campaignForm")
        .addEventListener(
          "submit",
          saveCampaign,
        );
    }


    if (
      el(
        "addQurbanButton",
      )
    ) {

      el(
        "addQurbanButton",
      )
        .addEventListener(
          "click",
          function () {

            resetQurban();

            openModal(
              "qurbanModal",
            );
          },
        );
    }


    if (el("qurbanForm")) {

      el("qurbanForm")
        .addEventListener(
          "submit",
          saveQurban,
        );
    }


    if (el("cancelConfirm")) {

      el("cancelConfirm")
        .addEventListener(
          "click",
          function () {

            deleteCallback =
              null;

            closeModal(
              "confirmModal",
            );
          },
        );
    }


    if (el("confirmDelete")) {

      el("confirmDelete")
        .addEventListener(
          "click",
          function () {

            var callback =
              deleteCallback;


            deleteCallback =
              null;


            closeModal(
              "confirmModal",
            );


            if (callback) {
              callback();
            }
          },
        );
    }
  }



  function setupFilters() {

    document
      .querySelectorAll(
        "[data-campaign-filter]",
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              document
                .querySelectorAll(
                  "[data-campaign-filter]",
                )
                .forEach(
                  function (item) {

                    item.classList.remove(
                      "active",
                    );
                  },
                );


              button.classList.add(
                "active",
              );


              campaignFilter =
                button.dataset
                  .campaignFilter;


              renderCampaign();
            },
          );
        },
      );
  }



  /* =====================================================
     KEGIATAN
  ===================================================== */

  async function loadKegiatan() {

    var result =
      await db

        .from("kegiatan")

        .select("*")

        .order(
          "id",
          {
            ascending: false,
          },
        );


    kegiatanData =
      result.error
        ? []
        : (
            result.data || []
          );


    if (result.error) {

      console.error(
        result.error,
      );
    }


    renderKegiatan();
  }



  function renderKegiatan() {

    var body =
      el(
        "kegiatanTableBody",
      );


    if (!body) {
      return;
    }


    if (
      !kegiatanData.length
    ) {

      body.innerHTML =
        '<tr><td colspan="6">Belum ada kegiatan.</td></tr>';

      return;
    }


    body.innerHTML =
      kegiatanData

        .map(
          function (item) {

            var image =
              item.gambar_url

                ? '<img class="table-kegiatan-image" src="' +
                  esc(
                    item.gambar_url,
                  ) +
                  '" alt="Foto kegiatan">'

                : '<div class="table-image-empty">Tidak ada foto</div>';


            return (
              "<tr>" +

              "<td>" +
              image +
              "</td>" +

              '<td class="table-title">' +
              esc(
                item.nama_kegiatan,
              ) +
              "</td>" +

              "<td>" +
              esc(item.hari) +
              "</td>" +

              "<td>" +
              esc(item.jam) +
              "</td>" +

              "<td>" +
              esc(
                item.deskripsi ||
                "-",
              ) +
              "</td>" +

              "<td>" +

              '<div class="table-actions">' +

              '<button class="action-button" data-edit-kegiatan="' +
              item.id +
              '">' +
              "Edit" +
              "</button>" +

              '<button class="action-button delete" data-delete-kegiatan="' +
              item.id +
              '">' +
              "Hapus" +
              "</button>" +

              "</div>" +

              "</td>" +

              "</tr>"
            );
          },
        )

        .join("");


    body
      .querySelectorAll(
        "[data-edit-kegiatan]",
      )
      .forEach(
        function (button) {

          button.onclick =
            function () {

              editKegiatan(
                button.dataset
                  .editKegiatan,
              );
            };
        },
      );


    body
      .querySelectorAll(
        "[data-delete-kegiatan]",
      )
      .forEach(
        function (button) {

          button.onclick =
            function () {

              confirmDelete(

                "Hapus Kegiatan?",

                "Kegiatan ini akan dihapus dari website.",

                function () {

                  deleteKegiatan(
                    button.dataset
                      .deleteKegiatan,
                  );
                },

              );
            };
        },
      );
  }



  function resetKegiatan() {

    el("kegiatanForm")
      .reset();


    el("kegiatanId")
      .value =
        "";


    el("kegiatanModalTitle")
      .textContent =
        "Tambah Kegiatan";


    el(
      "kegiatanCurrentImage",
    ).hidden =
      true;


    el(
      "kegiatanCurrentImage",
    ).innerHTML =
      "";


    msg(
      "kegiatanMessage",
      "",
    );
  }



  function editKegiatan(id) {

    var item =
      kegiatanData.find(
        function (data) {

          return (
            String(data.id) ===
            String(id)
          );
        },
      );


    if (!item) {
      return;
    }


    el("kegiatanId")
      .value =
        item.id;


    el("namaKegiatan")
      .value =
        item.nama_kegiatan ||
        "";


    el("hariKegiatan")
      .value =
        item.hari || "";


    el("jamKegiatan")
      .value =
        item.jam || "";


    el("deskripsiKegiatan")
      .value =
        item.deskripsi ||
        "";


    el("kegiatanModalTitle")
      .textContent =
        "Edit Kegiatan";


    var current =
      el(
        "kegiatanCurrentImage",
      );


    if (item.gambar_url) {

      current.hidden =
        false;


      current.innerHTML =
        '<div class="current-image-label">' +
        "Foto saat ini" +
        "</div>" +

        '<img src="' +
        esc(
          item.gambar_url,
        ) +
        '" alt="Foto kegiatan">';

    } else {

      current.hidden =
        true;

      current.innerHTML =
        "";
    }


    openModal(
      "kegiatanModal",
    );
  }



  async function saveKegiatan(
    event,
  ) {

    event.preventDefault();


    msg(
      "kegiatanMessage",
      "Menyimpan...",
      true,
    );


    try {

      var id =
        el("kegiatanId")
          .value;


      var old =
        kegiatanData.find(
          function (item) {

            return (
              String(item.id) ===
              String(id)
            );
          },
        );


      var url =
        old
          ? old.gambar_url
          : null;


      var file =
        el("kegiatanImage")
          .files[0];


      if (file) {

        url =
          await upload(
            "kegiatan-images",
            "kegiatan",
            file,
          );
      }


      var data = {

        nama_kegiatan:
          el("namaKegiatan")
            .value
            .trim(),

        hari:
          el("hariKegiatan")
            .value
            .trim(),

        jam:
          el("jamKegiatan")
            .value
            .trim(),

        deskripsi:
          el("deskripsiKegiatan")
            .value
            .trim(),

        gambar_url:
          url,

      };


      var result;


      if (id) {

        result =
          await db

            .from("kegiatan")

            .update(data)

            .eq(
              "id",
              id,
            );

      } else {

        result =
          await db

            .from("kegiatan")

            .insert(data);
      }


      if (result.error) {
        throw result.error;
      }


      closeModal(
        "kegiatanModal",
      );


      toast(
        id
          ? "Kegiatan berhasil diperbarui."
          : "Kegiatan berhasil ditambahkan.",
      );


      await loadKegiatan();

      updateOverview();

    } catch (error) {

      msg(
        "kegiatanMessage",
        error.message ||
        "Kegiatan gagal disimpan.",
      );
    }
  }



  async function deleteKegiatan(
    id,
  ) {

    var result =
      await db

        .from("kegiatan")

        .delete()

        .eq(
          "id",
          id,
        );


    if (result.error) {

      toast(
        "Gagal menghapus kegiatan.",
      );

      return;
    }


    toast(
      "Kegiatan berhasil dihapus.",
    );


    await loadKegiatan();

    updateOverview();
  }



  /* =====================================================
     CAMPAIGN
  ===================================================== */

  async function loadCampaign() {

    var result =
      await db

        .from(
          "campaign_donasi",
        )

        .select("*")

        .order(
          "prioritas",
          {
            ascending: false,
          },
        )

        .order(
          "created_at",
          {
            ascending: false,
          },
        );


    campaignData =
      result.error

        ? []

        : (
            result.data || []
          ).filter(
            function (item) {

              return (
                String(
                  item.kategori ||
                  "",
                )
                  .toUpperCase() !==
                "QURBAN"
              );
            },
          );


    if (result.error) {

      console.error(
        result.error,
      );
    }


    renderCampaign();
  }



  function renderCampaign() {

    var grid =
      el(
        "adminCampaignGrid",
      );


    if (!grid) {
      return;
    }


    var list =
      campaignFilter ===
      "ALL"

        ? campaignData

        : campaignData
            .filter(
              function (item) {

                return (
                  String(
                    item.kategori ||
                    "",
                  )
                    .toUpperCase() ===
                  campaignFilter
                );
              },
            );


    if (!list.length) {

      grid.innerHTML =
        '<div class="empty-state">Belum ada campaign pada kategori ini.</div>';

      return;
    }


    grid.innerHTML =
      list

        .map(
          function (item) {

            var progress =
              pct(
                item.terkumpul,
                item.target,
              );


            var image =
              item.gambar_url

                ? '<img src="' +
                  esc(
                    item.gambar_url,
                  ) +
                  '" alt="' +
                  esc(item.judul) +
                  '">'

                : '<div class="admin-image-placeholder">Masjid Noor Islam</div>';


            return (
              '<article class="admin-campaign-card">' +

              '<div class="admin-campaign-image">' +

              image +

              '<span class="admin-category">' +
              esc(
                item.kategori ||
                "DONASI",
              ) +
              "</span>" +

              (
                item.prioritas
                  ? '<span class="admin-priority">Prioritas</span>'
                  : ""
              ) +

              "</div>" +

              '<div class="admin-campaign-content">' +

              "<h3>" +
              esc(item.judul) +
              "</h3>" +

              '<p class="admin-campaign-description">' +
              esc(
                item.deskripsi ||
                "",
              ) +
              "</p>" +

              '<div class="status-row">' +

              '<span class="status-badge ' +
              (
                item.aktif
                  ? "status-active"
                  : "status-inactive"
              ) +
              '">' +

              (
                item.aktif
                  ? "Aktif"
                  : "Tidak Aktif"
              ) +

              "</span>" +

              "<span>" +
              progress +
              "%</span>" +

              "</div>" +

              '<div class="admin-progress">' +
              '<span style="width:' +
              progress +
              '%"></span>' +
              "</div>" +

              '<div class="admin-campaign-money">' +
              rupiah(
                item.terkumpul,
              ) +
              " / " +
              rupiah(
                item.target,
              ) +
              "</div>" +

              '<div class="admin-campaign-actions">' +

              '<button class="action-button" data-edit-campaign="' +
              item.id +
              '">' +
              "Edit" +
              "</button>" +

              '<button class="action-button delete" data-delete-campaign="' +
              item.id +
              '">' +
              "Hapus" +
              "</button>" +

              "</div>" +

              "</div>" +

              "</article>"
            );
          },
        )

        .join("");


    grid
      .querySelectorAll(
        "[data-edit-campaign]",
      )
      .forEach(
        function (button) {

          button.onclick =
            function () {

              editCampaign(
                button.dataset
                  .editCampaign,
              );
            };
        },
      );


    grid
      .querySelectorAll(
        "[data-delete-campaign]",
      )
      .forEach(
        function (button) {

          button.onclick =
            function () {

              confirmDelete(

                "Hapus Campaign?",

                "Campaign akan dihapus dari website.",

                function () {

                  deleteCampaign(
                    button.dataset
                      .deleteCampaign,
                  );
                },

              );
            };
        },
      );
  }



  function resetCampaign() {

    el("campaignForm")
      .reset();


    el("campaignId")
      .value =
        "";


    el("campaignTerkumpul")
      .value =
        0;


    el("campaignAktif")
      .checked =
        true;


    el("campaignModalTitle")
      .textContent =
        "Tambah Campaign";


    el(
      "campaignCurrentImage",
    ).hidden =
      true;


    el(
      "campaignCurrentImage",
    ).innerHTML =
      "";


    msg(
      "campaignMessage",
      "",
    );
  }



  function editCampaign(id) {

    var item =
      campaignData.find(
        function (data) {

          return (
            String(data.id) ===
            String(id)
          );
        },
      );


    if (!item) {
      return;
    }


    el("campaignId")
      .value =
        item.id;


    el("campaignJudul")
      .value =
        item.judul || "";


    el("campaignKategori")
      .value =
        String(
          item.kategori ||
          "DONASI",
        )
          .toUpperCase();


    el("campaignTarget")
      .value =
        item.target || 0;


    el("campaignTerkumpul")
      .value =
        item.terkumpul || 0;


    el("campaignDeskripsi")
      .value =
        item.deskripsi || "";


    el("campaignAktif")
      .checked =
        !!item.aktif;


    el("campaignPrioritas")
      .checked =
        !!item.prioritas;


    el("campaignModalTitle")
      .textContent =
        "Edit Campaign";


    var current =
      el(
        "campaignCurrentImage",
      );


    if (item.gambar_url) {

      current.hidden =
        false;


      current.innerHTML =
        '<div class="current-image-label">' +
        "Gambar saat ini" +
        "</div>" +

        '<img src="' +
        esc(
          item.gambar_url,
        ) +
        '" alt="Gambar campaign">';

    } else {

      current.hidden =
        true;

      current.innerHTML =
        "";
    }


    openModal(
      "campaignModal",
    );
  }



  async function saveCampaign(
    event,
  ) {

    event.preventDefault();


    msg(
      "campaignMessage",
      "Menyimpan...",
      true,
    );


    try {

      var id =
        el("campaignId")
          .value;


      var old =
        campaignData.find(
          function (item) {

            return (
              String(item.id) ===
              String(id)
            );
          },
        );


      var url =
        old
          ? old.gambar_url
          : null;


      var file =
        el("campaignImage")
          .files[0];


      if (file) {

        url =
          await upload(
            "campaign-images",
            "campaign",
            file,
          );
      }


      var data = {

        judul:
          el("campaignJudul")
            .value
            .trim(),

        kategori:
          el("campaignKategori")
            .value,

        target:
          Number(
            el("campaignTarget")
              .value,
          ) || 0,

        terkumpul:
          Number(
            el("campaignTerkumpul")
              .value,
          ) || 0,

        deskripsi:
          el("campaignDeskripsi")
            .value
            .trim(),

        gambar_url:
          url,

        aktif:
          el("campaignAktif")
            .checked,

        prioritas:
          el("campaignPrioritas")
            .checked,

      };


      var result;


      if (id) {

        result =
          await db

            .from(
              "campaign_donasi",
            )

            .update(data)

            .eq(
              "id",
              id,
            );

      } else {

        result =
          await db

            .from(
              "campaign_donasi",
            )

            .insert(data);
      }


      if (result.error) {
        throw result.error;
      }


      closeModal(
        "campaignModal",
      );


      toast(
        id
          ? "Campaign berhasil diperbarui."
          : "Campaign berhasil ditambahkan.",
      );


      await loadCampaign();

      updateOverview();

    } catch (error) {

      msg(
        "campaignMessage",
        error.message ||
        "Campaign gagal disimpan.",
      );
    }
  }



  async function deleteCampaign(
    id,
  ) {

    var result =
      await db

        .from(
          "campaign_donasi",
        )

        .delete()

        .eq(
          "id",
          id,
        );


    if (result.error) {

      toast(
        "Campaign gagal dihapus.",
      );

      return;
    }


    toast(
      "Campaign berhasil dihapus.",
    );


    await loadCampaign();

    updateOverview();
  }



  /* =====================================================
     QURBAN
  ===================================================== */

  async function loadQurban() {

    var result =
      await db

        .from(
          "program_qurban",
        )

        .select("*")

        .order(
          "prioritas",
          {
            ascending: false,
          },
        )

        .order(
          "created_at",
          {
            ascending: false,
          },
        );


    qurbanData =
      result.error
        ? []
        : (
            result.data || []
          );


    if (result.error) {

      console.error(
        "Qurban:",
        result.error,
      );
    }


    renderQurban();
  }



  function renderQurban() {

    var grid =
      el(
        "adminQurbanGrid",
      );


    if (!grid) {
      return;
    }


    if (
      !qurbanData.length
    ) {

      grid.innerHTML =
        '<div class="empty-state">Belum ada program qurban.</div>';

      return;
    }


    grid.innerHTML =
      qurbanData

        .map(
          function (item) {

            var image =
              item.gambar_url

                ? '<img src="' +
                  esc(
                    item.gambar_url,
                  ) +
                  '" alt="' +
                  esc(item.judul) +
                  '">'

                : '<div class="admin-image-placeholder">Qurban</div>';


            return (
              '<article class="admin-campaign-card">' +

              '<div class="admin-campaign-image">' +

              image +

              '<span class="admin-category">QURBAN</span>' +

              (
                item.prioritas
                  ? '<span class="admin-priority">Prioritas</span>'
                  : ""
              ) +

              "</div>" +

              '<div class="admin-campaign-content">' +

              "<h3>" +
              esc(item.judul) +
              "</h3>" +

              '<p class="admin-campaign-description">' +
              esc(
                item.jenis_hewan,
              ) +
              " · " +
              rupiah(
                item.harga,
              ) +
              "</p>" +

              '<p class="admin-campaign-description">' +
              esc(
                item.periode ||
                "",
              ) +
              "</p>" +

              '<div class="status-row">' +

              '<span class="status-badge ' +
              (
                item.aktif
                  ? "status-active"
                  : "status-inactive"
              ) +
              '">' +

              (
                item.aktif
                  ? "Aktif"
                  : "Tidak Aktif"
              ) +

              "</span>" +

              "</div>" +

              '<div class="admin-campaign-actions">' +

              '<button class="action-button" data-edit-qurban="' +
              item.id +
              '">' +
              "Edit" +
              "</button>" +

              '<button class="action-button delete" data-delete-qurban="' +
              item.id +
              '">' +
              "Hapus" +
              "</button>" +

              "</div>" +

              "</div>" +

              "</article>"
            );
          },
        )

        .join("");


    grid
      .querySelectorAll(
        "[data-edit-qurban]",
      )
      .forEach(
        function (button) {

          button.onclick =
            function () {

              editQurban(
                button.dataset
                  .editQurban,
              );
            };
        },
      );


    grid
      .querySelectorAll(
        "[data-delete-qurban]",
      )
      .forEach(
        function (button) {

          button.onclick =
            function () {

              confirmDelete(

                "Hapus Program Qurban?",

                "Program qurban akan dihapus dari website.",

                function () {

                  deleteQurban(
                    button.dataset
                      .deleteQurban,
                  );
                },

              );
            };
        },
      );
  }



  function resetQurban() {

    el("qurbanForm")
      .reset();


    el("qurbanId")
      .value =
        "";


    el("qurbanAktif")
      .checked =
        true;


    el("qurbanModalTitle")
      .textContent =
        "Tambah Qurban";


    el(
      "qurbanCurrentImage",
    ).hidden =
      true;


    el(
      "qurbanCurrentImage",
    ).innerHTML =
      "";


    msg(
      "qurbanMessage",
      "",
    );
  }



  function editQurban(id) {

    var item =
      qurbanData.find(
        function (data) {

          return (
            String(data.id) ===
            String(id)
          );
        },
      );


    if (!item) {
      return;
    }


    el("qurbanId")
      .value =
        item.id;


    el("qurbanJudul")
      .value =
        item.judul || "";


    el("qurbanJenis")
      .value =
        item.jenis_hewan ||
        "";


    el("qurbanHarga")
      .value =
        item.harga || 0;


    el("qurbanPeriode")
      .value =
        item.periode || "";


    el("qurbanKontak")
      .value =
        item.kontak || "";


    el("qurbanDeskripsi")
      .value =
        item.deskripsi ||
        "";


    el("qurbanAktif")
      .checked =
        !!item.aktif;


    el("qurbanPrioritas")
      .checked =
        !!item.prioritas;


    el("qurbanModalTitle")
      .textContent =
        "Edit Qurban";


    var current =
      el(
        "qurbanCurrentImage",
      );


    if (item.gambar_url) {

      current.hidden =
        false;


      current.innerHTML =
        '<div class="current-image-label">' +
        "Gambar saat ini" +
        "</div>" +

        '<img src="' +
        esc(
          item.gambar_url,
        ) +
        '" alt="Foto qurban">';

    } else {

      current.hidden =
        true;

      current.innerHTML =
        "";
    }


    openModal(
      "qurbanModal",
    );
  }



  async function saveQurban(
    event,
  ) {

    event.preventDefault();


    msg(
      "qurbanMessage",
      "Menyimpan...",
      true,
    );


    try {

      var id =
        el("qurbanId")
          .value;


      var old =
        qurbanData.find(
          function (item) {

            return (
              String(item.id) ===
              String(id)
            );
          },
        );


      var url =
        old
          ? old.gambar_url
          : null;


      var file =
        el("qurbanImage")
          .files[0];


      if (file) {

        url =
          await upload(
            "qurban-images",
            "qurban",
            file,
          );
      }


      var kontak =
        el("qurbanKontak")
          .value
          .replace(
            /\D/g,
            "",
          );


      var data = {

        judul:
          el("qurbanJudul")
            .value
            .trim(),

        jenis_hewan:
          el("qurbanJenis")
            .value
            .trim(),

        harga:
          Number(
            el("qurbanHarga")
              .value,
          ) || 0,

        periode:
          el("qurbanPeriode")
            .value
            .trim(),

        kontak:
          kontak,

        deskripsi:
          el("qurbanDeskripsi")
            .value
            .trim(),

        gambar_url:
          url,

        aktif:
          el("qurbanAktif")
            .checked,

        prioritas:
          el("qurbanPrioritas")
            .checked,

      };


      var result;


      if (id) {

        result =
          await db

            .from(
              "program_qurban",
            )

            .update(data)

            .eq(
              "id",
              id,
            );

      } else {

        result =
          await db

            .from(
              "program_qurban",
            )

            .insert(data);
      }


      if (result.error) {
        throw result.error;
      }


      closeModal(
        "qurbanModal",
      );


      toast(
        id
          ? "Program qurban diperbarui."
          : "Program qurban ditambahkan.",
      );


      await loadQurban();

    } catch (error) {

      msg(
        "qurbanMessage",
        error.message ||
        "Program qurban gagal disimpan.",
      );
    }
  }



  async function deleteQurban(
    id,
  ) {

    var result =
      await db

        .from(
          "program_qurban",
        )

        .delete()

        .eq(
          "id",
          id,
        );


    if (result.error) {

      toast(
        "Program qurban gagal dihapus.",
      );

      return;
    }


    toast(
      "Program qurban berhasil dihapus.",
    );


    await loadQurban();
  }



  /* =====================================================
     OVERVIEW
  ===================================================== */

  function updateOverview() {

    if (el("statKegiatan")) {

      el("statKegiatan")
        .textContent =
          kegiatanData.length;
    }


    var active =
      campaignData.filter(
        function (item) {

          return item.aktif;
        },
      );


    var priority =
      campaignData.filter(
        function (item) {

          return item.prioritas;
        },
      );


    var total =
      campaignData.reduce(
        function (
          sum,
          item,
        ) {

          return (
            sum +
            (
              Number(
                item.terkumpul,
              ) || 0
            )
          );
        },
        0,
      );


    if (el("statCampaign")) {

      el("statCampaign")
        .textContent =
          active.length;
    }


    if (el("statPrioritas")) {

      el("statPrioritas")
        .textContent =
          priority.length;
    }


    if (el("statTerkumpul")) {

      el("statTerkumpul")
        .textContent =
          rupiah(total);
    }


    var container =
      el(
        "overviewCampaignList",
      );


    if (!container) {
      return;
    }


    if (!campaignData.length) {

      container.innerHTML =
        '<div class="empty-state">Belum ada campaign.</div>';

      return;
    }


    container.innerHTML =
      campaignData

        .slice(
          0,
          5,
        )

        .map(
          function (item) {

            return (
              '<div class="overview-item">' +

              "<div>" +

              "<h4>" +
              esc(item.judul) +
              "</h4>" +

              "<span>" +
              esc(
                item.kategori ||
                "DONASI",
              ) +
              " · " +
              (
                item.aktif
                  ? "Aktif"
                  : "Tidak aktif"
              ) +
              "</span>" +

              "</div>" +

              '<div class="overview-money">' +
              rupiah(
                item.terkumpul,
              ) +
              "</div>" +

              "</div>"
            );
          },
        )

        .join("");
  }

})();