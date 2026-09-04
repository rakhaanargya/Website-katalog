const Database = require("better-sqlite3");


// ================================
// BUAT / BUKA DATABASE
// ================================

const db = new Database("database.db");


// ================================
// BUAT TABEL PRODUK
// ================================

db.exec(`
    CREATE TABLE IF NOT EXISTS produk (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        nama TEXT NOT NULL,

        kategori TEXT NOT NULL,

        harga INTEGER NOT NULL,

        gambar TEXT,

        deskripsi TEXT,

        stok INTEGER DEFAULT 0,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP

    )
`);


// ================================
// TAMBAHKAN STATUS PO
// ================================

try {

    db.exec(`
        ALTER TABLE produk
        ADD COLUMN status_po TEXT DEFAULT 'buka'
    `);

} catch (error) {

    // Kolom sudah ada, tidak masalah

}


// ================================
// DATA PRODUK AWAL
// ================================

const jumlahProduk =
    db
        .prepare(
            "SELECT COUNT(*) AS jumlah FROM produk"
        )
        .get();


if (jumlahProduk.jumlah === 0) {

    const tambahProduk = db.prepare(`
        INSERT INTO produk
        (
            nama,
            kategori,
            harga,
            gambar,
            deskripsi,
            stok
        )
        VALUES
        (
            @nama,
            @kategori,
            @harga,
            @gambar,
            @deskripsi,
            @stok
        )
    `);


    const produkAwal = [

        {
            nama: "Brownies Cheesecake",

            kategori: "Brownies",

            harga: 60000,

            gambar: "image/Cheesecake.jpg",

            deskripsi:
                "Brownies cokelat lembut dengan balutan keju premium di bagian atas.",

            stok: 10
        },


        {
            nama: "Brownies Insert Cheese",

            kategori: "Brownies",

            harga: 57000,

            gambar: "image/InsertCheese.jpg",

            deskripsi:
                "Brownies cokelat dengan keju yang creamy di bagian dalamnya.",

            stok: 10
        },


        {
            nama: "Cheesecake Original",

            kategori: "Cheesecake",

            harga: 65000,

            gambar: "images/cheesecake.jpg",

            deskripsi:
                "Cheesecake lembut dengan rasa creamy.",

            stok: 10
        },


        {
            nama: "Chocolate Cookies",

            kategori: "Cookies",

            harga: 35000,

            gambar: "images/cookies.jpg",

            deskripsi:
                "Cookies cokelat renyah dengan rasa manis yang pas.",

            stok: 10
        }

    ];


    for (const item of produkAwal) {

        tambahProduk.run(item);

    }


    console.log(
        "Produk awal berhasil dimasukkan ke database."
    );

}


// ================================
// BUAT TABEL USERS
// ================================

db.exec(`
    CREATE TABLE IF NOT EXISTS users (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        username TEXT NOT NULL UNIQUE,

        password TEXT NOT NULL,

        role TEXT DEFAULT 'admin',

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP

    )
`);


// ================================
// BUAT USER ADMIN AWAL
// ================================

const jumlahUser =
    db
        .prepare(
            "SELECT COUNT(*) AS jumlah FROM users"
        )
        .get();


if (jumlahUser.jumlah === 0) {

    db.prepare(`
        INSERT INTO users
        (
            username,
            password,
            role
        )
        VALUES
        (
            ?,
            ?,
            ?
        )
    `).run(
        "admin",
        "admin123",
        "admin"
    );


    console.log(
        "User admin berhasil dibuat."
    );

}


// ================================
// EXPORT DATABASE
// ================================

module.exports = db;