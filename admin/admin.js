// ========================================
// CEK LOGIN ADMIN
// ========================================

const adminLogin =
    localStorage.getItem("adminLogin");

if (adminLogin !== "true") {

    window.location.href =
        "login.html";

}


// ========================================
// API BACKEND
// ========================================

const API =
    "/api/produk";

const API_UPLOAD =
    "/api/upload";

const API_USERS =
    "/api/users";


// ========================================
// FUNGSI URL GAMBAR
// ========================================

function getUrlGambar(gambar) {

    if (!gambar) {
        return "";
    }


    // Kalau gambar dari uploads
    if (gambar.startsWith("/uploads/")) {

        return (
            "/api/produk" +
            gambar
        );

    }


    // Kalau gambar sudah URL lengkap
    if (
        gambar.startsWith("http://") ||
        gambar.startsWith("https://")
    ) {

        return gambar;

    }


    // Kalau gambar lama dari folder image/images
    return gambar;

}


// ========================================
// AMBIL PRODUK DARI DATABASE
// ========================================

async function ambilProduk() {

    try {

        const response =
            await fetch(API);


        if (!response.ok) {

            throw new Error(
                "Gagal mengambil data produk."
            );

        }


        const data =
            await response.json();


        console.log(
            "Produk dari database:",
            data
        );


        tampilkanProduk(data);

    }

    catch (error) {

        console.error(
            "Error ambil produk:",
            error
        );


        const container =
            document.getElementById(
                "daftarProduk"
            );


        if (container) {

            container.innerHTML = `

                <p style="color:red;">

                    Gagal mengambil data produk.

                </p>

            `;

        }

    }

}


// ========================================
// TAMPILKAN PRODUK
// ========================================

function tampilkanProduk(data) {

    updateDashboard(data);


    const container =
        document.getElementById(
            "daftarProduk"
        );


    if (!container) {

        console.error(
            "Element #daftarProduk tidak ditemukan."
        );

        return;

    }


    container.innerHTML = "";


    // ========================================
    // BELUM ADA PRODUK
    // ========================================

    if (data.length === 0) {

        container.innerHTML = `

            <p>
                Belum ada produk.
            </p>

        `;

        return;

    }


    // ========================================
    // TAMPILKAN PRODUK
    // ========================================

    data.forEach(function(item) {

        const urlGambar =
            getUrlGambar(item.gambar);


        container.innerHTML += `

            <div class="produk-admin">

                <div class="produk-admin-info">

                    ${
                        urlGambar
                            ? `
                                <img
                                    src="${urlGambar}"
                                    alt="${item.nama}"
                                    class="gambar-produk-admin"
                                    onerror="this.style.display='none'"
                                >
                            `
                            : `
                                <div class="gambar-tidak-ada">
                                    Tidak ada gambar
                                </div>
                            `
                    }


                    <div>

                        <h3>
                            ${item.nama}
                        </h3>


                        <p>
                            Kategori:
                            ${item.kategori}
                        </p>


                        <p>
                            Harga:
                            Rp${Number(
                                item.harga
                            ).toLocaleString("id-ID")}
                        </p>


                        <p>
                            Stok:
                            ${item.stok}
                        </p>


                        <p>
                            Status PO:
                            ${
                                item.status_po === "buka"
                                    ? "🟢 PO Dibuka"
                                    : "🔴 PO Ditutup"
                            }
                        </p>

                    </div>

                </div>


                <div class="admin-buttons">

                    <button
                        type="button"
                        class="btn-edit"
                        onclick="editProduk(${item.id})"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="btn-hapus"
                        onclick="hapusProduk(${item.id})"
                    >
                        Hapus
                    </button>

                </div>

            </div>

        `;

    });

}


// ========================================
// DASHBOARD
// ========================================

function updateDashboard(data) {

    const totalProduk =
        document.getElementById(
            "totalProduk"
        );


    const poDibuka =
        document.getElementById(
            "poDibuka"
        );


    const poDitutup =
        document.getElementById(
            "poDitutup"
        );


    const jumlahTotal =
        data.length;


    const jumlahDibuka =
        data.filter(function(item) {

            return item.status_po === "buka";

        }).length;


    const jumlahDitutup =
        data.filter(function(item) {

            return item.status_po === "tutup";

        }).length;


    if (totalProduk) {

        totalProduk.textContent =
            jumlahTotal;

    }


    if (poDibuka) {

        poDibuka.textContent =
            jumlahDibuka;

    }


    if (poDitutup) {

        poDitutup.textContent =
            jumlahDitutup;

    }

}


// ========================================
// TAMBAH PRODUK
// ========================================

const form =
    document.getElementById(
        "formProduk"
    );


if (form) {

    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            try {

                // ========================================
                // AMBIL FILE
                // ========================================

                const fileInput =
                    document.getElementById(
                        "gambar"
                    );


                const file =
                    fileInput
                        ? fileInput.files[0]
                        : null;


                let gambar = "";


                // ========================================
                // UPLOAD GAMBAR
                // ========================================

                if (file) {

                    const formData =
                        new FormData();


                    formData.append(
                        "gambar",
                        file
                    );


                    const uploadResponse =
                        await fetch(
                            API_UPLOAD,
                            {
                                method: "POST",
                                body: formData
                            }
                        );


                    const uploadResult =
                        await uploadResponse.json();


                    if (!uploadResponse.ok) {

                        throw new Error(
                            uploadResult.message ||
                            "Gagal upload gambar."
                        );

                    }


                    gambar =
                        uploadResult.gambar;


                    console.log(
                        "Gambar berhasil diupload:",
                        gambar
                    );

                }


                // ========================================
                // DATA PRODUK
                // ========================================

                const data = {

                    nama:
                        document.getElementById(
                            "nama"
                        ).value,


                    kategori:
                        document.getElementById(
                            "kategori"
                        ).value,


                    harga:
                        Number(
                            document.getElementById(
                                "harga"
                            ).value
                        ),


                    gambar:
                        gambar,


                    deskripsi:
                        document.getElementById(
                            "deskripsi"
                        ).value,


                    stok:
                        Number(
                            document.getElementById(
                                "stok"
                            ).value
                        ),


                    status_po:
                        document.getElementById(
                            "statusPo"
                        )
                            ? document.getElementById(
                                "statusPo"
                            ).value
                            : "buka"

                };


                // ========================================
                // SIMPAN PRODUK
                // ========================================

                const response =
                    await fetch(
                        API,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(data)

                        }
                    );


                const hasil =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        hasil.message ||
                        "Gagal menambahkan produk."
                    );

                }


                alert(
                    "Produk berhasil ditambahkan!"
                );


                form.reset();


                // ========================================
                // REFRESH PRODUK
                // ========================================

                await ambilProduk();

            }

            catch (error) {

                console.error(error);


                alert(
                    "Terjadi kesalahan: " +
                    error.message
                );

            }

        }
    );

}


// ========================================
// HAPUS PRODUK
// ========================================

async function hapusProduk(id) {

    const yakin =
        confirm(
            "Yakin ingin menghapus produk ini?"
        );


    if (!yakin) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/${id}`,
                {
                    method: "DELETE"
                }
            );


        const hasil =
            await response.json();


        if (!response.ok) {

            throw new Error(
                hasil.message ||
                "Gagal menghapus produk."
            );

        }


        alert(
            hasil.message
        );


        await ambilProduk();

    }

    catch (error) {

        console.error(error);


        alert(
            "Gagal menghapus produk: " +
            error.message
        );

    }

}


// ========================================
// EDIT PRODUK
// ========================================

async function editProduk(id) {

    try {

        const response =
            await fetch(
                `${API}/${id}`
            );


        if (!response.ok) {

            throw new Error(
                "Produk tidak ditemukan."
            );

        }


        const item =
            await response.json();

            window.gambarLamaEdit = item.gambar || "";


        // ========================================
        // ISI FORM
        // ========================================

        const editId =
            document.getElementById(
                "editId"
            );


        const editNama =
            document.getElementById(
                "editNama"
            );


        const editKategori =
            document.getElementById(
                "editKategori"
            );


        const editHarga =
            document.getElementById(
                "editHarga"
            );


        const editGambar =
            document.getElementById(
                "editGambar"
            );


        const editDeskripsi =
            document.getElementById(
                "editDeskripsi"
            );


        const editStok =
            document.getElementById(
                "editStok"
            );


        const editStatusPo =
            document.getElementById(
                "editStatusPo"
            );


        if (editId) {

            editId.value =
                item.id;

        }


        if (editNama) {

            editNama.value =
                item.nama;

        }


        if (editKategori) {

            editKategori.value =
                item.kategori;

        }


        if (editHarga) {

            editHarga.value =
                item.harga;

        }


        


        if (editDeskripsi) {

            editDeskripsi.value =
                item.deskripsi || "";

        }


        if (editStok) {

            editStok.value =
                item.stok;

        }


        if (editStatusPo) {

            editStatusPo.value =
                item.status_po || "buka";

        }


        // ========================================
        // TAMPILKAN FORM EDIT
        // ========================================

        const formEditContainer =
            document.getElementById(
                "formEditContainer"
            );


        if (formEditContainer) {

            formEditContainer.style.display =
                "block";


            formEditContainer.scrollIntoView({
                behavior: "smooth"
            });

        }

    }

    catch (error) {

        console.error(error);


        alert(
            "Gagal mengambil data produk."
        );

    }

}


// ========================================
// SIMPAN EDIT PRODUK
// ========================================

const formEdit =
    document.getElementById("formEditProduk");

if (formEdit) {

    formEdit.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const id =
                document.getElementById("editId").value;

            try {

                // ========================================
                // GAMBAR LAMA
                // ========================================

                let gambar =
                    window.gambarLamaEdit || "";


                // ========================================
                // CEK GAMBAR BARU
                // ========================================

                const fileInput =
                    document.getElementById("editGambar");

                const file =
                    fileInput
                        ? fileInput.files[0]
                        : null;


                // ========================================
                // UPLOAD GAMBAR BARU
                // ========================================

                if (file) {

                    const formData =
                        new FormData();

                    formData.append(
                        "gambar",
                        file
                    );


                    const uploadResponse =
                        await fetch(
                            API_UPLOAD,
                            {
                                method: "POST",
                                body: formData
                            }
                        );


                    const uploadResult =
                        await uploadResponse.json();


                    if (!uploadResponse.ok) {

                        throw new Error(
                            uploadResult.message ||
                            "Gagal upload gambar baru."
                        );

                    }


                    gambar =
                        uploadResult.gambar;


                    console.log(
                        "Gambar baru:",
                        gambar
                    );

                }


                // ========================================
                // DATA PRODUK
                // ========================================

                const data = {

                    nama:
                        document.getElementById(
                            "editNama"
                        ).value,

                    kategori:
                        document.getElementById(
                            "editKategori"
                        ).value,

                    harga:
                        Number(
                            document.getElementById(
                                "editHarga"
                            ).value
                        ),

                    gambar:
                        gambar,

                    deskripsi:
                        document.getElementById(
                            "editDeskripsi"
                        ).value,

                    stok:
                        Number(
                            document.getElementById(
                                "editStok"
                            ).value
                        ),

                    status_po:
                        document.getElementById(
                            "editStatusPo"
                        )
                            ? document.getElementById(
                                "editStatusPo"
                            ).value
                            : "buka"

                };


                // ========================================
                // UPDATE PRODUK
                // ========================================

                const response =
                    await fetch(
                        `${API}/${id}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(data)
                        }
                    );


                const hasil =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        hasil.message ||
                        "Gagal memperbarui produk."
                    );

                }


                alert(
                    "Produk berhasil diperbarui!"
                );


                // Tutup form edit
                batalEdit();


                // Ambil data terbaru
                await ambilProduk();

            }

            catch (error) {

                console.error(error);

                alert(
                    "Gagal memperbarui produk: " +
                    error.message
                );

            }

        }
    );

}


// ========================================
// BATAL EDIT
// ========================================

function batalEdit() {

    const formEditContainer =
        document.getElementById(
            "formEditContainer"
        );


    if (formEditContainer) {

        formEditContainer.style.display =
            "none";

    }

}


// ========================================
// KELOLA USER
// ========================================

async function ambilUser() {

    const daftarUser =
        document.getElementById(
            "daftarUser"
        );


    if (!daftarUser) {
        return;
    }


    try {

        const response =
            await fetch(
                API_USERS
            );


        if (!response.ok) {

            throw new Error(
                "Gagal mengambil data user."
            );

        }


        const users =
            await response.json();


        tampilkanUser(users);

    }

    catch (error) {

        console.error(error);


        daftarUser.innerHTML = `

            <p style="color:red;">
                Gagal mengambil data user.
            </p>

        `;

    }

}


// ========================================
// TAMPILKAN USER
// ========================================

function tampilkanUser(users) {

    const daftarUser =
        document.getElementById(
            "daftarUser"
        );


    if (!daftarUser) {
        return;
    }


    if (users.length === 0) {

        daftarUser.innerHTML = `

            <p>
                Belum ada user.
            </p>

        `;

        return;

    }


    daftarUser.innerHTML = "";


    users.forEach(function(user) {

        daftarUser.innerHTML += `

            <div class="user-card">

                <div>

                    <strong>
                        ${user.username}
                    </strong>


                    <p>
                        Role:
                        ${user.role}
                    </p>

                </div>


                <div>

                    <button
                        type="button"
                        onclick="editUser(${user.id})"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        onclick="hapusUser(${user.id})"
                    >
                        Hapus
                    </button>

                </div>

            </div>

        `;

    });

}


// ========================================
// BUKA FORM USER
// ========================================

function bukaFormUser() {

    const container =
        document.getElementById(
            "formUserContainer"
        );


    const form =
        document.getElementById(
            "formUser"
        );


    if (container) {

        container.style.display =
            "block";

    }


    if (form) {

        form.reset();

    }


    const userId =
        document.getElementById(
            "userId"
        );


    if (userId) {

        userId.value = "";

    }

}


// ========================================
// TUTUP FORM USER
// ========================================

function tutupFormUser() {

    const container =
        document.getElementById(
            "formUserContainer"
        );


    if (container) {

        container.style.display =
            "none";

    }

}


// ========================================
// EDIT USER
// ========================================

async function editUser(id) {

    try {

        const response =
            await fetch(
                API_USERS
            );


        if (!response.ok) {

            throw new Error(
                "Gagal mengambil data user."
            );

        }


        const users =
            await response.json();


        const user =
            users.find(function(item) {

                return item.id === id;

            });


        if (!user) {

            alert(
                "User tidak ditemukan."
            );

            return;

        }


        const userId =
            document.getElementById(
                "userId"
            );


        const usernameUser =
            document.getElementById(
                "usernameUser"
            );


        const passwordUser =
            document.getElementById(
                "passwordUser"
            );


        const roleUser =
            document.getElementById(
                "roleUser"
            );


        if (userId) {

            userId.value =
                user.id;

        }


        if (usernameUser) {

            usernameUser.value =
                user.username;

        }


        if (passwordUser) {

            passwordUser.value =
                "";

        }


        if (roleUser) {

            roleUser.value =
                user.role;

        }


        const container =
            document.getElementById(
                "formUserContainer"
            );


        if (container) {

            container.style.display =
                "block";

        }

    }

    catch (error) {

        console.error(error);


        alert(
            "Gagal mengambil data user."
        );

    }

}


// ========================================
// SIMPAN USER
// ========================================

const formUser =
    document.getElementById(
        "formUser"
    );


if (formUser) {

    formUser.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "userId"
                ).value;


            const username =
                document.getElementById(
                    "usernameUser"
                ).value;


            const password =
                document.getElementById(
                    "passwordUser"
                ).value;


            const role =
                document.getElementById(
                    "roleUser"
                ).value;


            try {

                let response;


                // ========================================
                // TAMBAH USER
                // ========================================

                if (!id) {

                    response =
                        await fetch(
                            API_USERS,
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        username:
                                            username,

                                        password:
                                            password,

                                        role:
                                            role

                                    })

                            }
                        );

                }

                // ========================================
                // EDIT USER
                // ========================================

                else {

                    response =
                        await fetch(
                            `${API_USERS}/${id}`,
                            {

                                method: "PUT",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        username:
                                            username,

                                        password:
                                            password,

                                        role:
                                            role

                                    })

                            }
                        );

                }


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Gagal menyimpan user."
                    );

                }


                alert(
                    data.message
                );


                tutupFormUser();


                ambilUser();

            }

            catch (error) {

                console.error(error);


                alert(
                    "Gagal menyimpan user: " +
                    error.message
                );

            }

        }
    );

}


// ========================================
// HAPUS USER
// ========================================

async function hapusUser(id) {

    const yakin =
        confirm(
            "Yakin ingin menghapus user ini?"
        );


    if (!yakin) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_USERS}/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Gagal menghapus user."
            );

            return;

        }


        alert(
            data.message
        );


        ambilUser();

    }

    catch (error) {

        console.error(error);


        alert(
            "Tidak dapat terhubung ke server."
        );

    }

}


// ========================================
// JALANKAN SAAT ADMIN DIBUKA
// ========================================

ambilProduk();

ambilUser();