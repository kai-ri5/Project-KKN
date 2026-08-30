(function () {
  "use strict";


  /* =====================================================
     SUPABASE
  ===================================================== */

  const SUPABASE_URL =
    "https://ljgedntbohlgdtkphqex.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_j06auKDeW4sdrJGBoIqkXg_F3dQSjV9";


  const supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );



  /* =====================================================
     UTILITIES
  ===================================================== */

  function escapeHtml(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }



  function rupiah(value) {

    return new Intl.NumberFormat(
      "id-ID"
    ).format(
      Number(value) || 0
    );

  }



  function setMessage(
    element,
    message,
    type
  ) {

    if (!element) {
      return;
    }


    element.textContent =
      message || "";


    element.className =
      "form-message";


    if (type) {
      element.classList.add(type);
    }

  }



  /* =====================================================
     CEK ADMIN
  ===================================================== */

  async function checkAdmin(
    userId
  ) {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("admin_users")
        .select("user_id")
        .eq(
          "user_id",
          userId
        )
        .maybeSingle();


    if (error) {

      console.error(
        "Gagal mengecek admin:",
        error
      );

      return false;

    }


    return Boolean(data);

  }



  /* =====================================================
     LOGIN
  ===================================================== */

  const loginForm =
    document.getElementById(
      "loginForm"
    );


  if (loginForm) {

    const loginMessage =
      document.getElementById(
        "loginMessage"
      );


    async function checkExistingLogin() {

      try {

        const {
          data
        } =
          await supabaseClient
            .auth
            .getSession();


        if (
          !data ||
          !data.session
        ) {
          return;
        }


        const allowed =
          await checkAdmin(
            data.session.user.id
          );


        if (allowed) {

          window.location.replace(
            "dashboard.html"
          );

        }

      } catch (error) {

        console.error(error);

      }

    }


    checkExistingLogin();


    loginForm.addEventListener(
      "submit",
      async function (event) {

        event.preventDefault();


        const submitButton =
          loginForm.querySelector(
            'button[type="submit"]'
          );


        submitButton.disabled =
          true;


        setMessage(
          loginMessage,
          "Memproses login..."
        );


        const email =
          document
            .getElementById("email")
            .value
            .trim();


        const password =
          document
            .getElementById(
              "password"
            )
            .value;


        const {
          data,
          error
        } =
          await supabaseClient
            .auth
            .signInWithPassword({
              email,
              password
            });


        if (error) {

          console.error(
            "Login error:",
            error
          );


          setMessage(
            loginMessage,
            "Login gagal: " +
              error.message,
            "error"
          );


          submitButton.disabled =
            false;


          return;

        }


        if (!data.user) {

          setMessage(
            loginMessage,
            "User tidak ditemukan.",
            "error"
          );


          submitButton.disabled =
            false;


          return;

        }


        const allowed =
          await checkAdmin(
            data.user.id
          );


        if (!allowed) {

          await supabaseClient
            .auth
            .signOut();


          setMessage(
            loginMessage,
            "Akun ini tidak memiliki akses admin.",
            "error"
          );


          submitButton.disabled =
            false;


          return;

        }


        setMessage(
          loginMessage,
          "Login berhasil.",
          "success"
        );


        window.location.replace(
          "dashboard.html"
        );

      }
    );

  }



  /* =====================================================
     DASHBOARD
  ===================================================== */

  const kegiatanForm =
    document.getElementById(
      "kegiatanForm"
    );


  const campaignForm =
    document.getElementById(
      "campaignForm"
    );


  if (
    kegiatanForm ||
    campaignForm
  ) {


    /* ===================================================
       AUTH GUARD
    =================================================== */

    async function requireAdmin() {

      try {

        const {
          data,
          error
        } =
          await supabaseClient
            .auth
            .getSession();


        if (error) {
          throw error;
        }


        const session =
          data.session;


        if (!session) {

          window.location.replace(
            "login.html"
          );

          return false;

        }


        const allowed =
          await checkAdmin(
            session.user.id
          );


        if (!allowed) {

          await supabaseClient
            .auth
            .signOut();


          window.location.replace(
            "login.html"
          );


          return false;

        }


        return true;

      } catch (error) {

        console.error(
          "Auth guard error:",
          error
        );


        window.location.replace(
          "login.html"
        );


        return false;

      }

    }



    /* ===================================================
       TAB
    =================================================== */

    const tabs =
      document.querySelectorAll(
        ".admin-tab"
      );


    const contents =
      document.querySelectorAll(
        ".tab-content"
      );


    tabs.forEach(
      function (tab) {

        tab.addEventListener(
          "click",
          function () {

            const target =
              tab.dataset.tab;


            tabs.forEach(
              function (item) {

                item.classList.remove(
                  "active"
                );

              }
            );


            contents.forEach(
              function (item) {

                item.classList.remove(
                  "active"
                );

              }
            );


            tab.classList.add(
              "active"
            );


            const targetContent =
              document.getElementById(
                "tab-" + target
              );


            if (targetContent) {

              targetContent.classList.add(
                "active"
              );

            }

          }
        );

      }
    );



    /* ===================================================
       LOGOUT
    =================================================== */

    const logoutButton =
      document.getElementById(
        "logoutButton"
      );


    if (logoutButton) {

      logoutButton.addEventListener(
        "click",
        async function () {

          await supabaseClient
            .auth
            .signOut();


          window.location.replace(
            "login.html"
          );

        }
      );

    }



    /* =====================================================
       KEGIATAN
    ===================================================== */

    let kegiatanData = [];


    const editId =
      document.getElementById(
        "editId"
      );


    const namaKegiatan =
      document.getElementById(
        "namaKegiatan"
      );


    const hari =
      document.getElementById(
        "hari"
      );


    const jam =
      document.getElementById(
        "jam"
      );


    const deskripsi =
      document.getElementById(
        "deskripsi"
      );


    const kegiatanSubmit =
      document.getElementById(
        "submitButton"
      );


    const cancelEditButton =
      document.getElementById(
        "cancelEditButton"
      );


    const formMessage =
      document.getElementById(
        "formMessage"
      );


    const adminKegiatanList =
      document.getElementById(
        "adminKegiatanList"
      );


    const refreshButton =
      document.getElementById(
        "refreshButton"
      );



    function resetKegiatanForm() {

      if (!kegiatanForm) {
        return;
      }


      kegiatanForm.reset();


      editId.value = "";


      kegiatanSubmit.textContent =
        "Tambah Kegiatan";


      cancelEditButton.hidden =
        true;

    }



    function renderKegiatanAdmin() {

      if (!adminKegiatanList) {
        return;
      }


      if (
        kegiatanData.length === 0
      ) {

        adminKegiatanList.innerHTML = `
          <div class="empty-state">
            Belum ada kegiatan.
          </div>
        `;

        return;

      }


      adminKegiatanList.innerHTML =
        kegiatanData
          .map(function (item) {

            const meta = [
              item.hari,
              item.jam
            ]
              .filter(Boolean)
              .join(" · ");


            return `
              <div class="activity-item">

                <div>

                  <h3>
                    ${
                      escapeHtml(
                        item.nama_kegiatan
                      )
                    }
                  </h3>

                  ${
                    meta
                      ? `
                        <div class="activity-meta">
                          ${escapeHtml(meta)}
                        </div>
                      `
                      : ""
                  }

                  ${
                    item.deskripsi
                      ? `
                        <p class="activity-description">
                          ${
                            escapeHtml(
                              item.deskripsi
                            )
                          }
                        </p>
                      `
                      : ""
                  }

                </div>


                <div class="activity-buttons">

                  <button
                    type="button"
                    class="edit-button"
                    data-kegiatan-edit="${
                      item.id
                    }"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    class="delete-button"
                    data-kegiatan-delete="${
                      item.id
                    }"
                  >
                    Hapus
                  </button>

                </div>

              </div>
            `;

          })
          .join("");

    }



    async function loadKegiatan() {

      if (!adminKegiatanList) {
        return;
      }


      adminKegiatanList.innerHTML = `
        <div class="empty-state">
          Memuat kegiatan...
        </div>
      `;


      const {
        data,
        error
      } =
        await supabaseClient
          .from("kegiatan")
          .select(
            "id,nama_kegiatan,hari,jam,deskripsi"
          )
          .order(
            "id",
            {
              ascending: true
            }
          );


      if (error) {

        console.error(error);


        adminKegiatanList.innerHTML = `
          <div class="empty-state">
            Gagal mengambil kegiatan.
          </div>
        `;


        return;

      }


      kegiatanData =
        data || [];


      renderKegiatanAdmin();

    }



    if (kegiatanForm) {

      kegiatanForm.addEventListener(
        "submit",
        async function (event) {

          event.preventDefault();


          const payload = {

            nama_kegiatan:
              namaKegiatan
                .value
                .trim(),

            hari:
              hari.value.trim() ||
              null,

            jam:
              jam.value ||
              null,

            deskripsi:
              deskripsi
                .value
                .trim() ||
              null

          };


          if (
            !payload.nama_kegiatan
          ) {

            setMessage(
              formMessage,
              "Nama kegiatan wajib diisi.",
              "error"
            );

            return;

          }


          setMessage(
            formMessage,
            "Menyimpan..."
          );


          kegiatanSubmit.disabled =
            true;


          let result;


          if (editId.value) {

            result =
              await supabaseClient
                .from("kegiatan")
                .update(payload)
                .eq(
                  "id",
                  editId.value
                );

          } else {

            result =
              await supabaseClient
                .from("kegiatan")
                .insert([
                  payload
                ]);

          }


          kegiatanSubmit.disabled =
            false;


          if (result.error) {

            console.error(
              result.error
            );


            setMessage(
              formMessage,
              "Gagal menyimpan: " +
                result.error.message,
              "error"
            );


            return;

          }


          setMessage(
            formMessage,
            "Kegiatan berhasil disimpan.",
            "success"
          );


          resetKegiatanForm();

          await loadKegiatan();

        }
      );

    }



    if (cancelEditButton) {

      cancelEditButton.addEventListener(
        "click",
        function () {

          resetKegiatanForm();

          setMessage(
            formMessage,
            ""
          );

        }
      );

    }



    if (refreshButton) {

      refreshButton.addEventListener(
        "click",
        loadKegiatan
      );

    }



    if (adminKegiatanList) {

      adminKegiatanList.addEventListener(
        "click",
        async function (event) {

          const editButton =
            event.target.closest(
              "[data-kegiatan-edit]"
            );


          const deleteButton =
            event.target.closest(
              "[data-kegiatan-delete]"
            );


          if (editButton) {

            const id =
              String(
                editButton.dataset
                  .kegiatanEdit
              );


            const item =
              kegiatanData.find(
                function (kegiatan) {

                  return (
                    String(
                      kegiatan.id
                    ) === id
                  );

                }
              );


            if (!item) {
              return;
            }


            editId.value =
              item.id;


            namaKegiatan.value =
              item.nama_kegiatan ||
              "";


            hari.value =
              item.hari || "";


            jam.value =
              item.jam || "";


            deskripsi.value =
              item.deskripsi || "";


            kegiatanSubmit.textContent =
              "Simpan Perubahan";


            cancelEditButton.hidden =
              false;


            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });

          }


          if (deleteButton) {

            const id =
              deleteButton.dataset
                .kegiatanDelete;


            const item =
              kegiatanData.find(
                function (kegiatan) {

                  return (
                    String(
                      kegiatan.id
                    ) ===
                    String(id)
                  );

                }
              );


            const confirmed =
              window.confirm(
                'Hapus "' +
                  (
                    item?.nama_kegiatan ||
                    "kegiatan"
                  ) +
                  '"?'
              );


            if (!confirmed) {
              return;
            }


            const {
              error
            } =
              await supabaseClient
                .from("kegiatan")
                .delete()
                .eq(
                  "id",
                  id
                );


            if (error) {

              alert(
                "Gagal menghapus: " +
                  error.message
              );

              return;

            }


            await loadKegiatan();

          }

        }
      );

    }



    /* =====================================================
       CAMPAIGN
    ===================================================== */

    let campaignData = [];


    const campaignEditId =
      document.getElementById(
        "campaignEditId"
      );


    const existingImageUrl =
      document.getElementById(
        "existingImageUrl"
      );


    const campaignJudul =
      document.getElementById(
        "campaignJudul"
      );


    const campaignKategori =
      document.getElementById(
        "campaignKategori"
      );


    const campaignDeskripsi =
      document.getElementById(
        "campaignDeskripsi"
      );


    const campaignTarget =
      document.getElementById(
        "campaignTarget"
      );


    const campaignTerkumpul =
      document.getElementById(
        "campaignTerkumpul"
      );


    const campaignImage =
      document.getElementById(
        "campaignImage"
      );


    const campaignPrioritas =
      document.getElementById(
        "campaignPrioritas"
      );


    const campaignAktif =
      document.getElementById(
        "campaignAktif"
      );


    const campaignSubmitButton =
      document.getElementById(
        "campaignSubmitButton"
      );


    const campaignCancelButton =
      document.getElementById(
        "campaignCancelButton"
      );


    const campaignMessage =
      document.getElementById(
        "campaignMessage"
      );


    const adminCampaignList =
      document.getElementById(
        "adminCampaignList"
      );


    const refreshCampaignButton =
      document.getElementById(
        "refreshCampaignButton"
      );


    const imagePreviewWrapper =
      document.getElementById(
        "imagePreviewWrapper"
      );


    const imagePreview =
      document.getElementById(
        "imagePreview"
      );



    function showImagePreview(
      url
    ) {

      if (
        !url ||
        !imagePreview ||
        !imagePreviewWrapper
      ) {

        if (
          imagePreviewWrapper
        ) {
          imagePreviewWrapper.hidden =
            true;
        }


        return;

      }


      imagePreview.src = url;


      imagePreviewWrapper.hidden =
        false;

    }



    if (campaignImage) {

      campaignImage.addEventListener(
        "change",
        function () {

          const file =
            campaignImage.files[0];


          if (!file) {

            showImagePreview(
              existingImageUrl.value
            );

            return;

          }


          const temporaryUrl =
            URL.createObjectURL(
              file
            );


          showImagePreview(
            temporaryUrl
          );

        }
      );

    }



    async function uploadCampaignImage(
      file
    ) {

      if (!file) {
        return null;
      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        throw new Error(
          "File harus berupa gambar."
        );

      }


      const extension =
        file.name
          .split(".")
          .pop()
          .toLowerCase();


      const safeExtension =
        ["jpg", "jpeg", "png", "webp"]
          .includes(extension)
          ? extension
          : "jpg";


      const filename =
        Date.now() +
        "-" +
        Math.random()
          .toString(36)
          .substring(2, 9) +
        "." +
        safeExtension;


      const {
        error
      } =
        await supabaseClient
          .storage
          .from(
            "campaign-images"
          )
          .upload(
            filename,
            file,
            {
              cacheControl: "3600",
              upsert: false
            }
          );


      if (error) {
        throw error;
      }


      const {
        data
      } =
        supabaseClient
          .storage
          .from(
            "campaign-images"
          )
          .getPublicUrl(
            filename
          );


      return data.publicUrl;

    }



    function resetCampaignForm() {

      if (!campaignForm) {
        return;
      }


      campaignForm.reset();


      campaignEditId.value =
        "";


      existingImageUrl.value =
        "";


      campaignTerkumpul.value =
        "0";


      campaignAktif.checked =
        true;


      campaignPrioritas.checked =
        false;


      campaignSubmitButton.textContent =
        "Tambah Campaign";


      campaignCancelButton.hidden =
        true;


      if (imagePreviewWrapper) {

        imagePreviewWrapper.hidden =
          true;

      }


      if (imagePreview) {

        imagePreview.removeAttribute(
          "src"
        );

      }

    }



    function renderCampaignAdmin() {

      if (!adminCampaignList) {
        return;
      }


      if (
        campaignData.length === 0
      ) {

        adminCampaignList.innerHTML = `
          <div class="empty-state">
            Belum ada campaign.
          </div>
        `;

        return;

      }


      adminCampaignList.innerHTML =
        campaignData
          .map(function (item) {

            const image =
              item.gambar_url
                ? `
                  <img
                    src="${
                      escapeHtml(
                        item.gambar_url
                      )
                    }"
                    alt=""
                  >
                `
                : `
                  <div class="campaign-admin-placeholder">
                    Masjid Noor Islam
                  </div>
                `;


            return `
              <article class="campaign-admin-item">

                <div class="campaign-admin-image">
                  ${image}
                </div>


                <div class="campaign-admin-main">

                  <div class="campaign-admin-tags">

                    <span class="campaign-admin-tag">
                      ${
                        escapeHtml(
                          item.kategori
                        )
                      }
                    </span>

                    ${
                      item.prioritas
                        ? `
                          <span
                            class="campaign-admin-tag priority"
                          >
                            Prioritas
                          </span>
                        `
                        : ""
                    }

                    ${
                      !item.aktif
                        ? `
                          <span
                            class="campaign-admin-tag inactive"
                          >
                            Nonaktif
                          </span>
                        `
                        : ""
                    }

                  </div>


                  <h3>
                    ${
                      escapeHtml(
                        item.judul
                      )
                    }
                  </h3>


                  ${
                    item.deskripsi
                      ? `
                        <p class="campaign-admin-description">
                          ${
                            escapeHtml(
                              item.deskripsi
                            )
                          }
                        </p>
                      `
                      : ""
                  }


                  <div class="campaign-admin-money">

                    <span>
                      Terkumpul
                      <strong>
                        Rp ${
                          rupiah(
                            item.terkumpul
                          )
                        }
                      </strong>
                    </span>

                    <span>
                      Target
                      <strong>
                        Rp ${
                          rupiah(
                            item.target
                          )
                        }
                      </strong>
                    </span>

                  </div>


                  <div class="campaign-admin-actions">

                    <button
                      type="button"
                      class="edit-button"
                      data-campaign-edit="${
                        item.id
                      }"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      class="delete-button"
                      data-campaign-delete="${
                        item.id
                      }"
                    >
                      Hapus
                    </button>

                  </div>

                </div>

              </article>
            `;

          })
          .join("");

    }



    async function loadCampaignAdmin() {

      if (!adminCampaignList) {
        return;
      }


      adminCampaignList.innerHTML = `
        <div class="empty-state">
          Memuat campaign...
        </div>
      `;


      const {
        data,
        error
      } =
        await supabaseClient
          .from(
            "campaign_donasi"
          )
          .select("*")
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
          );


      if (error) {

        console.error(error);


        adminCampaignList.innerHTML = `
          <div class="empty-state">
            Gagal mengambil campaign.
          </div>
        `;


        return;

      }


      campaignData =
        data || [];


      renderCampaignAdmin();

    }



    if (campaignForm) {

      campaignForm.addEventListener(
        "submit",
        async function (event) {

          event.preventDefault();


          const judul =
            campaignJudul
              .value
              .trim();


          const target =
            Number(
              campaignTarget.value
            );


          const terkumpul =
            Number(
              campaignTerkumpul.value ||
              0
            );


          if (!judul) {

            setMessage(
              campaignMessage,
              "Judul campaign wajib diisi.",
              "error"
            );

            return;

          }


          if (
            !target ||
            target <= 0
          ) {

            setMessage(
              campaignMessage,
              "Target donasi harus lebih dari 0.",
              "error"
            );

            return;

          }


          if (
            terkumpul < 0
          ) {

            setMessage(
              campaignMessage,
              "Dana terkumpul tidak boleh negatif.",
              "error"
            );

            return;

          }


          campaignSubmitButton.disabled =
            true;


          setMessage(
            campaignMessage,
            "Menyimpan campaign..."
          );


          try {

            let imageUrl =
              existingImageUrl.value ||
              null;


            const file =
              campaignImage
                .files[0];


            if (file) {

              setMessage(
                campaignMessage,
                "Mengupload gambar..."
              );


              imageUrl =
                await uploadCampaignImage(
                  file
                );

            }


            const payload = {

              judul,

              deskripsi:
                campaignDeskripsi
                  .value
                  .trim() ||
                null,

              kategori:
                campaignKategori.value,

              target,

              terkumpul,

              gambar_url:
                imageUrl,

              prioritas:
                campaignPrioritas
                  .checked,

              aktif:
                campaignAktif
                  .checked

            };


            let result;


            if (
              campaignEditId.value
            ) {

              result =
                await supabaseClient
                  .from(
                    "campaign_donasi"
                  )
                  .update(payload)
                  .eq(
                    "id",
                    campaignEditId
                      .value
                  );

            } else {

              result =
                await supabaseClient
                  .from(
                    "campaign_donasi"
                  )
                  .insert([
                    payload
                  ]);

            }


            if (result.error) {
              throw result.error;
            }


            setMessage(
              campaignMessage,
              "Campaign berhasil disimpan.",
              "success"
            );


            resetCampaignForm();


            await loadCampaignAdmin();

          } catch (error) {

            console.error(error);


            setMessage(
              campaignMessage,
              "Gagal menyimpan: " +
                error.message,
              "error"
            );

          } finally {

            campaignSubmitButton.disabled =
              false;

          }

        }
      );

    }



    if (campaignCancelButton) {

      campaignCancelButton.addEventListener(
        "click",
        function () {

          resetCampaignForm();

          setMessage(
            campaignMessage,
            ""
          );

        }
      );

    }



    if (refreshCampaignButton) {

      refreshCampaignButton.addEventListener(
        "click",
        loadCampaignAdmin
      );

    }



    if (adminCampaignList) {

      adminCampaignList.addEventListener(
        "click",
        async function (event) {

          const editButton =
            event.target.closest(
              "[data-campaign-edit]"
            );


          const deleteButton =
            event.target.closest(
              "[data-campaign-delete]"
            );


          /* =====================
             EDIT CAMPAIGN
          ===================== */

          if (editButton) {

            const id =
              String(
                editButton.dataset
                  .campaignEdit
              );


            const item =
              campaignData.find(
                function (campaign) {

                  return (
                    String(
                      campaign.id
                    ) === id
                  );

                }
              );


            if (!item) {
              return;
            }


            campaignEditId.value =
              item.id;


            campaignJudul.value =
              item.judul || "";


            campaignKategori.value =
              item.kategori ||
              "INFAQ";


            campaignDeskripsi.value =
              item.deskripsi || "";


            campaignTarget.value =
              item.target || "";


            campaignTerkumpul.value =
              item.terkumpul || 0;


            campaignPrioritas.checked =
              Boolean(
                item.prioritas
              );


            campaignAktif.checked =
              Boolean(
                item.aktif
              );


            existingImageUrl.value =
              item.gambar_url || "";


            showImagePreview(
              item.gambar_url
            );


            campaignSubmitButton
              .textContent =
              "Simpan Perubahan";


            campaignCancelButton.hidden =
              false;


            document
              .querySelector(
                '[data-tab="campaign"]'
              )
              ?.click();


            window.scrollTo({
              top: 180,
              behavior: "smooth"
            });

          }



          /* =====================
             DELETE CAMPAIGN
          ===================== */

          if (deleteButton) {

            const id =
              deleteButton.dataset
                .campaignDelete;


            const item =
              campaignData.find(
                function (campaign) {

                  return (
                    String(
                      campaign.id
                    ) ===
                    String(id)
                  );

                }
              );


            const confirmed =
              window.confirm(
                'Hapus campaign "' +
                  (
                    item?.judul ||
                    "ini"
                  ) +
                  '"?'
              );


            if (!confirmed) {
              return;
            }


            const {
              error
            } =
              await supabaseClient
                .from(
                  "campaign_donasi"
                )
                .delete()
                .eq(
                  "id",
                  id
                );


            if (error) {

              alert(
                "Gagal menghapus: " +
                  error.message
              );

              return;

            }


            await loadCampaignAdmin();

          }

        }
      );

    }



    /* =====================================================
       START DASHBOARD
    ===================================================== */

    requireAdmin().then(
      async function (allowed) {

        if (!allowed) {
          return;
        }


        await Promise.all([
          loadKegiatan(),
          loadCampaignAdmin()
        ]);

      }
    );

  }

})();