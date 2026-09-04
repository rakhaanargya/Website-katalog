// ================================
// DATA PRODUK
// ================================

let produk = [];


// ================================
// CONTAINER PRODUK
// ================================

const produkContainer =
    document.getElementById("produkContainer");


// ================================
// FUNGSI URL GAMBAR
// ================================

// Mendukung 2 sumber gambar:
// 1. Foto lama dari folder image/
// 2. Foto baru dari backend uploads/

function getUrlGambar(gambar) {

    if (!gambar) {
        return "image/no-image.jpg";
    }

    // Foto dari folder uploads backend
    if (gambar.startsWith("/uploads/")) {
        return "http://localhost:3000/api/produk" + gambar;
    }

    // Foto lama dari folder image
    return gambar;
}


// ================================
// AMBIL PRODUK DARI BACKEND
// ================================

async function ambilProduk() {

    try {

       const response =
    await fetch("/api/produk");

        if (!response.ok) {

            throw new Error(
                "Gagal mengambil produk dari server."
            );

        }

        produk = await response.json();

        console.log(
            "Produk dari database:",
            produk
        );

        tampilkanProduk(produk);

    } catch (error) {

        console.error(error);

        if (produkContainer) {

            produkContainer.innerHTML = `
                <p class="tidak-ditemukan">
                    Gagal mengambil data produk.
                </p>
            `;

        }

    }

}


// ================================
// FILTER, SEARCH & SORT
// ================================

let kategoriAktif = "Semua";

let kataPencarian = "";

let urutanAktif = "default";


// ================================
// MENAMPILKAN PRODUK
// ================================

function tampilkanProduk(data) {

    if (!produkContainer) {

        console.error(
            "produkContainer tidak ditemukan."
        );

        return;

    }


    produkContainer.innerHTML = "";


    // Jumlah produk

    const jumlahProdukText =
        document.getElementById(
            "jumlahProdukText"
        );


    if (jumlahProdukText) {

        jumlahProdukText.textContent =
            `Menampilkan ${data.length} produk`;

    }


    // Jika tidak ada produk

    if (data.length === 0) {

        produkContainer.innerHTML = `
            <p class="tidak-ditemukan">
                Produk tidak ditemukan.
            </p>
        `;

        return;

    }


    // Tampilkan produk

    data.forEach(function(item) {

        produkContainer.innerHTML += `

            <div class="produk">

                <img
                    src="${getUrlGambar(item.gambar)}"
                    alt="${item.nama}"
                    onerror="this.src='image/no-image.jpg'"
                >

                <h3>
                    ${item.nama}
                </h3>

                <p class="kategori">
                    ${item.kategori}
                </p>

                <p>
                    ${item.deskripsi}
                </p>

                <strong>
                    Rp${Number(item.harga).toLocaleString("id-ID")}
                </strong>

                <p class="status-po">

                    ${
                        item.status_po === "buka"
                        ? "🟢 Pre-Order Dibuka"
                        : "🔴 PO Ditutup"
                    }

                </p>


                <div class="produk-buttons">

                    <button
                        class="detail-button"
                        onclick="lihatDetail(${item.id})"
                    >
                        Lihat Detail
                    </button>


                    ${
                        item.stok > 0

                        ? `

                            ${
                                item.status_po === "buka"

                                ? `

                                    <button
                                        class="pesan-button"
                                        onclick="tambahKeKeranjang(${item.id})"
                                    >
                                        Tambah ke Keranjang
                                    </button>

                                `

                                : `

                                    <button
                                        class="pesan-button"
                                        disabled
                                    >
                                        PO Ditutup
                                    </button>

                                `
                            }

                        `

                        : `

                            <button
                                class="pesan-button"
                                disabled
                            >
                                Stok Habis
                            </button>

                        `
                    }

                </div>

            </div>

        `;

    });

}


// ================================
// TERAPKAN FILTER
// ================================

function terapkanFilter() {

    let hasil = [...produk];


    // FILTER KATEGORI

    if (kategoriAktif !== "Semua") {

        hasil =
            hasil.filter(function(item) {

                return (
                    item.kategori ===
                    kategoriAktif
                );

            });

    }


    // SEARCH

    if (kataPencarian !== "") {

        hasil =
            hasil.filter(function(item) {

                return (

                    item.nama
                        .toLowerCase()
                        .includes(kataPencarian)

                    ||

                    item.kategori
                        .toLowerCase()
                        .includes(kataPencarian)

                    ||

                    item.deskripsi
                        .toLowerCase()
                        .includes(kataPencarian)

                );

            });

    }


    // SORTING

    if (urutanAktif === "harga-rendah") {

        hasil.sort(function(a, b) {

            return a.harga - b.harga;

        });

    }


    else if (
        urutanAktif === "harga-tinggi"
    ) {

        hasil.sort(function(a, b) {

            return b.harga - a.harga;

        });

    }


    else if (urutanAktif === "nama") {

        hasil.sort(function(a, b) {

            return a.nama.localeCompare(
                b.nama,
                "id"
            );

        });

    }


    tampilkanProduk(hasil);

}


// ================================
// FILTER KATEGORI
// ================================

const filterButtons =
    document.querySelectorAll(".filter");


filterButtons.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            kategoriAktif =
                this.dataset.category;


            filterButtons.forEach(
                function(btn) {

                    btn.classList.remove(
                        "active"
                    );

                }
            );


            this.classList.add("active");


            terapkanFilter();

        }
    );

});


// ================================
// SEARCH PRODUK
// ================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function() {

            kataPencarian =
                this.value
                    .toLowerCase()
                    .trim();


            terapkanFilter();

        }
    );

}


// ================================
// SORT PRODUK
// ================================

const sortProduk =
    document.getElementById(
        "sortProduk"
    );


if (sortProduk) {

    sortProduk.addEventListener(
        "change",
        function() {

            urutanAktif =
                this.value;


            terapkanFilter();

        }
    );

}


// ================================
// PESAN PRODUK VIA WHATSAPP
// ================================

function pesanProduk(id) {

    const item =
        produk.find(function(product) {

            return product.id === id;

        });


    if (!item) {

        return;

    }


    const nomorWhatsApp =
        "6285887568636";


    const pesan =
        `Halo, saya ingin memesan ${item.nama}.`;


    const url =
        `https://wa.me/${nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;


    window.open(
        url,
        "_blank"
    );

}


// ================================
// DETAIL PRODUK
// ================================

function lihatDetail(id) {

    const item =
        produk.find(function(product) {

            return product.id === id;

        });


    if (!item) {

        return;

    }


    // ================================
    // MODAL BARU
    // ================================

    const modal =
        document.getElementById(
            "detailModal"
        );


    const modalContent =
        document.getElementById(
            "detailModalContent"
        );


    if (
        modal &&
        modalContent
    ) {

        modalContent.innerHTML = `

            <div class="detail-modal-image">

                <img
                    src="${getUrlGambar(item.gambar)}"
                    alt="${item.nama}"
                    onerror="this.src='image/no-image.jpg'"
                >

            </div>


            <div class="detail-modal-info">

                <span
                    class="detail-modal-category"
                >
                    ${item.kategori}
                </span>


                <h2>
                    ${item.nama}
                </h2>


                <div class="detail-modal-price">
                    Rp${Number(item.harga).toLocaleString("id-ID")}
                </div>


                <p>
                    ${item.deskripsi}
                </p>


                <div class="detail-quantity">

                    <span>
                        Jumlah
                    </span>


                    <div class="quantity-control">

                        <button
                            type="button"
                            onclick="kurangiJumlahDetail()"
                        >
                            −
                        </button>


                        <span id="jumlahDetail">
                            1
                        </span>


                        <button
                            type="button"
                            onclick="tambahJumlahDetail()"
                        >
                            +
                        </button>

                    </div>

                </div>


                <button
                    class="detail-add-button"
                    onclick="tambahDetailKeKeranjang(${item.id})"
                >
                    🛒 Tambah ke Keranjang
                </button>

            </div>

        `;


        window.jumlahDetailSaatIni = 1;


        modal.classList.add("show");


        return;

    }


    // ================================
    // DETAIL PRODUK LAMA
    // ================================

    const detail =
        document.getElementById(
            "detailProduk"
        );


    if (!detail) {

        console.error(
            "Elemen detail produk tidak ditemukan."
        );

        return;

    }


    detail.innerHTML = `

        <div class="detail-box">

            <button
                class="tutup-detail"
                onclick="tutupDetail()"
            >
                ×
            </button>


            <div class="detail-content">

                <div class="detail-gambar">

                    <img
                        src="${getUrlGambar(item.gambar)}"
                        alt="${item.nama}"
                        onerror="this.src='image/no-image.jpg'"
                    >

                </div>


                <div class="detail-info">

                    <p class="kategori">
                        ${item.kategori}
                    </p>


                    <h2>
                        ${item.nama}
                    </h2>


                    <h3>
                        Rp${Number(item.harga).toLocaleString("id-ID")}
                    </h3>


                    <p>
                        ${item.deskripsi}
                    </p>


                    <button
                        class="detail-pesan"
                        onclick="pesanProduk(${item.id})"
                    >
                        Pesan Sekarang
                    </button>

                </div>

            </div>

        </div>

    `;


    detail.classList.add("tampil");

}


// ================================
// TUTUP DETAIL
// ================================

function tutupDetail() {

    const modal =
        document.getElementById(
            "detailModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

        return;

    }


    const detail =
        document.getElementById(
            "detailProduk"
        );


    if (detail) {

        detail.classList.remove(
            "tampil"
        );

    }

}


// ================================
// JUMLAH DETAIL
// ================================

function tambahJumlahDetail() {

    window.jumlahDetailSaatIni =
        (window.jumlahDetailSaatIni || 1) + 1;


    const jumlah =
        document.getElementById(
            "jumlahDetail"
        );


    if (jumlah) {

        jumlah.textContent =
            window.jumlahDetailSaatIni;

    }

}


function kurangiJumlahDetail() {

    window.jumlahDetailSaatIni =
        window.jumlahDetailSaatIni || 1;


    if (
        window.jumlahDetailSaatIni > 1
    ) {

        window.jumlahDetailSaatIni--;

    }


    const jumlah =
        document.getElementById(
            "jumlahDetail"
        );


    if (jumlah) {

        jumlah.textContent =
            window.jumlahDetailSaatIni;

    }

}


// ================================
// KERANJANG
// ================================

let keranjang = [];


function tambahKeKeranjang(id) {

    const item =
        produk.find(function(product) {

            return product.id === id;

        });


    if (!item) {

        return;

    }


    if (item.status_po !== "buka") {

        tampilkanNotifikasi(
            `${item.nama} sedang tidak membuka PO.`
        );

        return;

    }


    if (item.stok <= 0) {

        tampilkanNotifikasi(
            `${item.nama} sedang habis.`
        );

        return;

    }


    const sudahAda =
        keranjang.find(function(product) {

            return product.id === id;

        });


    if (sudahAda) {

        if (
            sudahAda.jumlah >=
            item.stok
        ) {

            tampilkanNotifikasi(
                `Stok ${item.nama} hanya tersisa ${item.stok}.`
            );

            return;

        }


        sudahAda.jumlah++;

    }


    else {

        keranjang.push({

            id: item.id,

            nama: item.nama,

            harga: item.harga,

            jumlah: 1

        });

    }


    updateKeranjang();


    tampilkanNotifikasi(
        `${item.nama} berhasil ditambahkan ke keranjang.`
    );

}


// ================================
// TAMBAH DETAIL KE KERANJANG
// ================================

function tambahDetailKeKeranjang(id) {

    const jumlah =
        window.jumlahDetailSaatIni || 1;


    for (
        let i = 0;
        i < jumlah;
        i++
    ) {

        tambahKeKeranjang(id);

    }


    tutupDetail();

}


// ================================
// UPDATE KERANJANG
// ================================

function updateKeranjang() {

    const isi =
        document.getElementById(
            "isiKeranjang"
        );


    const jumlah =
        document.getElementById(
            "jumlahKeranjang"
        );


    const total =
        document.getElementById(
            "totalHarga"
        );


    if (
        !isi ||
        !jumlah ||
        !total
    ) {

        return;

    }


    isi.innerHTML = "";


    let totalHarga = 0;

    let jumlahProduk = 0;


    keranjang.forEach(
        function(item) {

            const subtotal =
                item.harga *
                item.jumlah;


            totalHarga +=
                subtotal;


            jumlahProduk +=
                item.jumlah;


            isi.innerHTML += `

                <div class="item-keranjang">

                    <div>

                        <strong>
                            ${item.nama}
                        </strong>

                        <p>
                            Rp${item.harga.toLocaleString("id-ID")}
                        </p>

                    </div>


                    <div class="jumlah-produk">

                        <button
                            onclick="kurangiJumlah(${item.id})"
                        >
                            −
                        </button>


                        <span>
                            ${item.jumlah}
                        </span>


                        <button
                            onclick="tambahJumlah(${item.id})"
                        >
                            +
                        </button>

                    </div>


                    <strong>
                        Rp${subtotal.toLocaleString("id-ID")}
                    </strong>


                    <button
                        class="hapus-item"
                        onclick="hapusProduk(${item.id})"
                    >
                        Hapus
                    </button>

                </div>

            `;

        }
    );


    jumlah.textContent =
        jumlahProduk;


    total.textContent =
        "Rp" +
        totalHarga.toLocaleString(
            "id-ID"
        );

}


// ================================
// TAMBAH JUMLAH KERANJANG
// ================================

function tambahJumlah(id) {

    const item =
        keranjang.find(function(product) {

            return product.id === id;

        });


    if (item) {

        item.jumlah++;

    }


    updateKeranjang();

}


// ================================
// KURANGI JUMLAH KERANJANG
// ================================

function kurangiJumlah(id) {

    const item =
        keranjang.find(function(product) {

            return product.id === id;

        });


    if (item) {

        item.jumlah--;


        if (
            item.jumlah <= 0
        ) {

            hapusProduk(id);

            return;

        }

    }


    updateKeranjang();

}


// ================================
// HAPUS PRODUK DARI KERANJANG
// ================================

function hapusProduk(id) {

    keranjang =
        keranjang.filter(
            function(item) {

                return item.id !== id;

            }
        );


    updateKeranjang();

}


// ================================
// BUKA KERANJANG
// ================================

function bukaKeranjang() {

    const keranjangElement =
        document.getElementById(
            "keranjang"
        );


    if (keranjangElement) {

        keranjangElement.classList.add(
            "tampil"
        );

    }

}


// ================================
// TUTUP KERANJANG
// ================================

function tutupKeranjang() {

    const keranjangElement =
        document.getElementById(
            "keranjang"
        );


    if (keranjangElement) {

        keranjangElement.classList.remove(
            "tampil"
        );

    }

}


// ================================
// CHECKOUT WHATSAPP
// ================================

function checkoutWhatsApp() {

    if (
        keranjang.length === 0
    ) {

        alert(
            "Keranjang masih kosong."
        );

        return;

    }


    let pesan =
        "Halo, saya ingin memesan:\n\n";


    let totalHarga = 0;


    keranjang.forEach(
        function(item) {

            const subtotal =
                item.harga *
                item.jumlah;


            totalHarga +=
                subtotal;


            pesan +=
                `${item.nama} x${item.jumlah} - Rp${subtotal.toLocaleString("id-ID")}\n`;

        }
    );


    pesan +=
        `\nTotal: Rp${totalHarga.toLocaleString("id-ID")}`;


    const nomorWhatsApp =
        "6285887568636";


    const url =
        `https://wa.me/${nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;


    window.open(
        url,
        "_blank"
    );

}


// ================================
// NOTIFIKASI
// ================================

function tampilkanNotifikasi(pesan) {

    const notifikasi =
        document.getElementById(
            "notifikasi"
        );


    const pesanNotifikasi =
        document.getElementById(
            "pesanNotifikasi"
        );


    if (
        !notifikasi ||
        !pesanNotifikasi
    ) {

        return;

    }


    pesanNotifikasi.textContent =
        pesan;


    notifikasi.classList.add(
        "tampil"
    );


    setTimeout(
        function() {

            notifikasi.classList.remove(
                "tampil"
            );

        },
        3000
    );

}


// ================================
// FORM KONTAK
// ================================

const formKontak =
    document.getElementById(
        "formKontak"
    );


if (formKontak) {

    formKontak.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const nama =
                document.getElementById(
                    "nama"
                ).value;


            const nomor =
                document.getElementById(
                    "nomor"
                ).value;


            const pesan =
                document.getElementById(
                    "pesan"
                ).value;


            const nomorToko =
                "6285887568636";


            const teks =
                `Halo Chococanaa!

Nama: ${nama}
Nomor WhatsApp: ${nomor}

Pesan:
${pesan}`;


            const url =
                `https://wa.me/${nomorToko}?text=${encodeURIComponent(teks)}`;


            window.open(
                url,
                "_blank"
            );

        }
    );

}


// ================================
// MENU MOBILE
// ================================

const menuToggle =
    document.getElementById(
        "menuToggle"
    );


const mainNav =
    document.getElementById(
        "mainNav"
    );


if (
    menuToggle &&
    mainNav
) {

    menuToggle.addEventListener(
        "click",
        function() {

            mainNav.classList.toggle(
                "menu-open"
            );

        }
    );


    const menuLinks =
        mainNav.querySelectorAll("a");


    menuLinks.forEach(
        function(link) {

            link.addEventListener(
                "click",
                function() {

                    mainNav.classList.remove(
                        "menu-open"
                    );

                }
            );

        }
    );

}


// ================================
// AMBIL PRODUK DARI DATABASE
// SAAT WEBSITE DIBUKA
// ================================

ambilProduk();