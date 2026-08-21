(function () {
  "use strict";

  /* =========================
       SUPABASE
    ========================= */

  const SUPABASE_URL = "https://ljgedntbohlgdtkphqex.supabase.co";

  const SUPABASE_KEY = "sb_publishable_j06auKDeW4sdrJGBoIqkXg_F3dQSjV9";

  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
  );

  /* =========================
       UTILITIES
    ========================= */

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")

      .replace(/</g, "&lt;")

      .replace(/>/g, "&gt;")

      .replace(/"/g, "&quot;")

      .replace(/'/g, "&#039;");
  }

  function setMessage(element, message, type) {
    if (!element) {
      return;
    }

    element.textContent = message || "";

    element.className = "form-message";

    if (type) {
      element.classList.add(type);
    }
  }

  /* =========================
       CEK ADMIN
    ========================= */

  async function checkAdmin(userId) {
    const { data, error } = await supabaseClient

      .from("admin_users")

      .select("user_id")

      .eq("user_id", userId)

      .maybeSingle();

    if (error) {
      console.error("Gagal mengecek admin:", error);

      return false;
    }

    return !!data;
  }

  /* =====================================================
       LOGIN PAGE
    ===================================================== */

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    const loginMessage = document.getElementById("loginMessage");

    /*
          Kalau sebelumnya sudah login,
          langsung cek apakah admin
        */

    supabaseClient.auth

      .getSession()

      .then(async function (result) {
        const session = result.data.session;

        if (!session) {
          return;
        }

        const allowed = await checkAdmin(session.user.id);

        if (allowed) {
          window.location.href = "dashboard.html";
        }
      });

    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      setMessage(loginMessage, "Memproses login...");

      const email = document.getElementById("email").value.trim();

      const password = document.getElementById("password").value;

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,

        password: password,
      });

      if (error) {
        console.error("LOGIN ERROR:", error);

        setMessage(loginMessage, "Login gagal: " + error.message, "error");

        return;
      }

      if (!data.user) {
        setMessage(
          loginMessage,

          "User tidak ditemukan.",

          "error",
        );

        return;
      }

      const allowed = await checkAdmin(data.user.id);

      if (!allowed) {
        await supabaseClient.auth.signOut();

        setMessage(
          loginMessage,

          "Akun ini tidak memiliki akses admin.",

          "error",
        );

        return;
      }

      setMessage(
        loginMessage,

        "Login berhasil.",

        "success",
      );

      window.location.href = "dashboard.html";
    });
  }

  /* =====================================================
       DASHBOARD
    ===================================================== */

  const kegiatanForm = document.getElementById("kegiatanForm");

  if (kegiatanForm) {
    const editId = document.getElementById("editId");

    const namaKegiatan = document.getElementById("namaKegiatan");

    const hari = document.getElementById("hari");

    const jam = document.getElementById("jam");

    const deskripsi = document.getElementById("deskripsi");

    const submitButton = document.getElementById("submitButton");

    const cancelEditButton = document.getElementById("cancelEditButton");

    const formMessage = document.getElementById("formMessage");

    const adminKegiatanList = document.getElementById("adminKegiatanList");

    const refreshButton = document.getElementById("refreshButton");

    const logoutButton = document.getElementById("logoutButton");

    let kegiatanData = [];

    /* =========================
           AUTH GUARD
        ========================= */

    async function requireAdmin() {
      const result = await supabaseClient.auth.getSession();

      const session = result.data.session;

      if (!session) {
        window.location.href = "login.html";

        return false;
      }

      const allowed = await checkAdmin(session.user.id);

      if (!allowed) {
        await supabaseClient.auth.signOut();

        window.location.href = "login.html";

        return false;
      }

      return true;
    }

    /* =========================
           RESET FORM
        ========================= */

    function resetForm() {
      kegiatanForm.reset();

      editId.value = "";

      submitButton.textContent = "Tambah Kegiatan";

      cancelEditButton.hidden = true;
    }

    /* =========================
           RENDER DATA
        ========================= */

    function renderKegiatan() {
      if (!kegiatanData || kegiatanData.length === 0) {
        adminKegiatanList.innerHTML =
          '<div class="empty-state">' + "Belum ada kegiatan." + "</div>";

        return;
      }

      adminKegiatanList.innerHTML = kegiatanData

        .map(function (kegiatan) {
          const meta = [kegiatan.hari, kegiatan.jam]

            .filter(Boolean)

            .join(" · ");

          return (
            '<div class="activity-item">' +
            "<div>" +
            "<h3>" +
            escapeHtml(kegiatan.nama_kegiatan) +
            "</h3>" +
            (meta
              ? '<div class="activity-meta">' + escapeHtml(meta) + "</div>"
              : "") +
            (kegiatan.deskripsi
              ? '<p class="activity-description">' +
                escapeHtml(kegiatan.deskripsi) +
                "</p>"
              : "") +
            "</div>" +
            '<div class="activity-buttons">' +
            "<button " +
            'type="button" ' +
            'class="edit-button" ' +
            'data-edit="' +
            kegiatan.id +
            '">' +
            "Edit" +
            "</button>" +
            "<button " +
            'type="button" ' +
            'class="delete-button" ' +
            'data-delete="' +
            kegiatan.id +
            '">' +
            "Hapus" +
            "</button>" +
            "</div>" +
            "</div>"
          );
        })

        .join("");
    }

    /* =========================
           LOAD DATA
        ========================= */

    async function loadKegiatan() {
      adminKegiatanList.innerHTML =
        '<div class="empty-state">' + "Memuat kegiatan..." + "</div>";

      const { data, error } = await supabaseClient

        .from("kegiatan")

        .select("id,nama_kegiatan,hari,jam,deskripsi")

        .order("id", {
          ascending: true,
        });

      if (error) {
        console.error(error);

        adminKegiatanList.innerHTML =
          '<div class="empty-state">' + "Gagal mengambil kegiatan." + "</div>";

        return;
      }

      kegiatanData = data || [];

      renderKegiatan();
    }

    /* =========================
           SUBMIT
        ========================= */

    kegiatanForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      setMessage(formMessage, "Menyimpan...");

      const payload = {
        nama_kegiatan: namaKegiatan.value.trim(),

        hari: hari.value.trim() || null,

        jam: jam.value || null,

        deskripsi: deskripsi.value.trim() || null,
      };

      if (!payload.nama_kegiatan) {
        setMessage(
          formMessage,

          "Nama kegiatan wajib diisi.",

          "error",
        );

        return;
      }

      let result;

      /* EDIT */

      if (editId.value) {
        result = await supabaseClient

          .from("kegiatan")

          .update(payload)

          .eq("id", editId.value);
      } else {

      /* INSERT */
        result = await supabaseClient

          .from("kegiatan")

          .insert([payload]);
      }

      if (result.error) {
        console.error(result.error);

        setMessage(
          formMessage,

          "Gagal menyimpan: " + result.error.message,

          "error",
        );

        return;
      }

      setMessage(
        formMessage,

        "Kegiatan berhasil disimpan.",

        "success",
      );

      resetForm();

      await loadKegiatan();
    });

    /* =========================
           EDIT & DELETE
        ========================= */

    adminKegiatanList.addEventListener(
      "click",

      async function (event) {
        const editButton = event.target.closest("[data-edit]");

        const deleteButton = event.target.closest("[data-delete]");

        /* EDIT */

        if (editButton) {
          const id = String(editButton.dataset.edit);

          const kegiatan = kegiatanData.find(function (item) {
            return String(item.id) === id;
          });

          if (!kegiatan) {
            return;
          }

          editId.value = kegiatan.id;

          namaKegiatan.value = kegiatan.nama_kegiatan || "";

          hari.value = kegiatan.hari || "";

          jam.value = kegiatan.jam || "";

          deskripsi.value = kegiatan.deskripsi || "";

          submitButton.textContent = "Simpan Perubahan";

          cancelEditButton.hidden = false;

          window.scrollTo({
            top: 0,

            behavior: "smooth",
          });
        }

        /* DELETE */

        if (deleteButton) {
          const id = deleteButton.dataset.delete;

          const kegiatan = kegiatanData.find(function (item) {
            return String(item.id) === String(id);
          });

          const nama = kegiatan?.nama_kegiatan || "kegiatan ini";

          const confirmed = window.confirm('Hapus "' + nama + '"?');

          if (!confirmed) {
            return;
          }

          const { error } = await supabaseClient

            .from("kegiatan")

            .delete()

            .eq("id", id);

          if (error) {
            console.error(error);

            alert("Gagal menghapus kegiatan: " + error.message);

            return;
          }

          await loadKegiatan();
        }
      },
    );

    /* =========================
           CANCEL EDIT
        ========================= */

    cancelEditButton.addEventListener(
      "click",

      function () {
        resetForm();

        setMessage(formMessage, "");
      },
    );

    /* =========================
           REFRESH
        ========================= */

    refreshButton.addEventListener(
      "click",

      loadKegiatan,
    );

    /* =========================
           LOGOUT
        ========================= */

    logoutButton.addEventListener(
      "click",

      async function () {
        await supabaseClient.auth.signOut();

        window.location.href = "login.html";
      },
    );

    /* =========================
           REALTIME
        ========================= */

    supabaseClient

      .channel("admin-kegiatan")

      .on(
        "postgres_changes",

        {
          event: "*",

          schema: "public",

          table: "kegiatan",
        },

        function () {
          loadKegiatan();
        },
      )

      .subscribe();

    /* =========================
           START
        ========================= */

    requireAdmin().then(function (allowed) {
      if (allowed) {
        loadKegiatan();
      }
    });
  }
})();
