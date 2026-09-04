const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("./database");

const app = express();

const PORT = process.env.PORT || 3000;


// ========================================
// FOLDER
// ========================================

const folderUploads =
    path.join(__dirname, "uploads");

const folderImage =
    path.join(__dirname, "..", "image");

const folderImages =
    path.join(__dirname, "..", "images");

// ========================================
// BUAT FOLDER UPLOAD JIKA BELUM ADA
// ========================================

if (!fs.existsSync(folderUploads)) {

    fs.mkdirSync(
        folderUploads,
        {
            recursive: true
        }
    );

}


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.static(path.join(__dirname, "..")));

app.get("/admin/login.html", function(req, res) {
    res.sendFile(
        path.join(__dirname, "..", "admin", "login.html")
    );
});




// ========================================
// FOLDER GAMBAR LAMA
// ========================================

// image/Cheesecake.jpg
app.use(
    "/image",
    express.static(folderImage)
);


// images/cheesecake.jpg
app.use(
    "/images",
    express.static(folderImages)
);


// ========================================
// FOLDER GAMBAR UPLOAD
// ========================================

// /uploads/nama-file.jpg
app.use(
    "/uploads",
    express.static(folderUploads)
);


// ========================================
// KONFIGURASI MULTER
// ========================================

const storage =
    multer.diskStorage({

        destination: function(
            req,
            file,
            cb
        ) {

            cb(
                null,
                folderUploads
            );

        },


        filename: function(
            req,
            file,
            cb
        ) {

            const namaFile =
                Date.now() +
                "-" +
                file.originalname
                    .replace(/\s+/g, "-");


            cb(
                null,
                namaFile
            );

        }

    });


const upload =
    multer({
        storage: storage
    });


// ========================================
// HALAMAN UTAMA
// ========================================

app.get("/", function(req, res) {

    res.sendFile(
        path.join(
            __dirname,
            "..",
            "index.html"
        )
    );

});


// ========================================
// TEST BACKEND
// ========================================

app.get("/api", function(req, res) {

    res.json({

        message:
            "Backend Chococanaa berhasil berjalan!"

    });

});


// ========================================
// GET SEMUA PRODUK
// ========================================

app.get(
    "/api/produk",
    function(req, res) {

        try {

            const produk =
                db
                    .prepare(
                        "SELECT * FROM produk ORDER BY id DESC"
                    )
                    .all();


            res.json(produk);

        }

        catch(error) {

            console.error(
                "Gagal mengambil produk:",
                error
            );


            res.status(500).json({

                message:
                    "Gagal mengambil data produk."

            });

        }

    }
);


// ========================================
// GET SATU PRODUK
// ========================================

app.get(
    "/api/produk/:id",
    function(req, res) {

        try {

            const id =
                Number(req.params.id);


            const produk =
                db
                    .prepare(
                        "SELECT * FROM produk WHERE id = ?"
                    )
                    .get(id);


            if (!produk) {

                return res.status(404).json({

                    message:
                        "Produk tidak ditemukan."

                });

            }


            res.json(produk);

        }

        catch(error) {

            console.error(error);


            res.status(500).json({

                message:
                    "Gagal mengambil produk."

            });

        }

    }
);


// ========================================
// UPLOAD GAMBAR
// ========================================

app.post(
    "/api/upload",
    upload.single("gambar"),
    function(req, res) {

        try {

            if (!req.file) {

                return res.status(400).json({

                    message:
                        "Gambar belum dipilih."

                });

            }


            const urlGambar =
                "/uploads/" +
                req.file.filename;


            console.log(
                "Gambar berhasil diupload:",
                urlGambar
            );


            res.json({

                message:
                    "Gambar berhasil diupload.",

                gambar:
                    urlGambar

            });

        }

        catch(error) {

            console.error(
                "Upload gagal:",
                error
            );


            res.status(500).json({

                message:
                    "Gagal mengupload gambar."

            });

        }

    }
);


// ========================================
// TAMBAH PRODUK
// ========================================

app.post(
    "/api/produk",
    function(req, res) {

        try {

            const {
                nama,
                kategori,
                harga,
                gambar,
                deskripsi,
                stok,
                status_po
            } = req.body;


            if (
                !nama ||
                !kategori ||
                !harga
            ) {

                return res.status(400).json({

                    message:
                        "Nama, kategori, dan harga wajib diisi."

                });

            }


            const hasil =
                db
                    .prepare(`
                        INSERT INTO produk
                        (
                            nama,
                            kategori,
                            harga,
                            gambar,
                            deskripsi,
                            stok,
                            status_po
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `)
                    .run(

                        nama,
                        kategori,
                        harga,

                        gambar || "",

                        deskripsi || "",

                        stok || 0,

                        status_po || "buka"

                    );


            res.status(201).json({

                message:
                    "Produk berhasil ditambahkan.",

                id:
                    hasil.lastInsertRowid

            });

        }

        catch(error) {

            console.error(
                "Gagal menambahkan produk:",
                error
            );


            res.status(500).json({

                message:
                    "Gagal menambahkan produk."

            });

        }

    }
);


// ========================================
// EDIT PRODUK
// ========================================

app.put(
    "/api/produk/:id",
    function(req, res) {

        try {

            const id =
                Number(req.params.id);


            const {
                nama,
                kategori,
                harga,
                gambar,
                deskripsi,
                stok,
                status_po
            } = req.body;


            const produk =
                db
                    .prepare(
                        "SELECT * FROM produk WHERE id = ?"
                    )
                    .get(id);


            if (!produk) {

                return res.status(404).json({

                    message:
                        "Produk tidak ditemukan."

                });

            }


            db.prepare(`
                UPDATE produk

                SET
                    nama = ?,
                    kategori = ?,
                    harga = ?,
                    gambar = ?,
                    deskripsi = ?,
                    stok = ?,
                    status_po = ?

                WHERE id = ?
            `)
            .run(

                nama,

                kategori,

                harga,

                gambar !== undefined
                    ? gambar
                    : produk.gambar,

                deskripsi || "",

                stok || 0,

                status_po || "buka",

                id

            );


            res.json({

                message:
                    "Produk berhasil diperbarui."

            });

        }

        catch(error) {

            console.error(
                "Gagal mengedit produk:",
                error
            );


            res.status(500).json({

                message:
                    "Gagal memperbarui produk."

            });

        }

    }
);


// ========================================
// HAPUS PRODUK
// ========================================

app.delete(
    "/api/produk/:id",
    function(req, res) {

        try {

            const id =
                Number(req.params.id);


            const hasil =
                db
                    .prepare(
                        "DELETE FROM produk WHERE id = ?"
                    )
                    .run(id);


            if (
                hasil.changes === 0
            ) {

                return res.status(404).json({

                    message:
                        "Produk tidak ditemukan."

                });

            }


            res.json({

                message:
                    "Produk berhasil dihapus."

            });

        }

        catch(error) {

            console.error(
                "Gagal menghapus produk:",
                error
            );


            res.status(500).json({

                message:
                    "Gagal menghapus produk."

            });

        }

    }
);


// ========================================
// LOGIN ADMIN
// ========================================

app.post(
    "/api/login",
    function(req, res) {

        try {

            const {
                username,
                password
            } = req.body;


            if (
                !username ||
                !password
            ) {

                return res.status(400).json({

                    message:
                        "Username dan password wajib diisi."

                });

            }


            const user =
                db
                    .prepare(`
                        SELECT *
                        FROM users
                        WHERE username = ?
                    `)
                    .get(username);


            if (!user) {

                return res.status(401).json({

                    message:
                        "Username atau password salah."

                });

            }


            if (
                user.password !== password
            ) {

                return res.status(401).json({

                    message:
                        "Username atau password salah."

                });

            }


            res.json({

                message:
                    "Login berhasil.",

                username:
                    user.username,

                role:
                    user.role

            });

        }

        catch(error) {

            console.error(
                "Login error:",
                error
            );


            res.status(500).json({

                message:
                    "Terjadi kesalahan saat login."

            });

        }

    }
);


// ========================================
// GET SEMUA USER
// ========================================

app.get(
    "/api/users",
    function(req, res) {

        try {

            const users =
                db
                    .prepare(`
                        SELECT
                            id,
                            username,
                            role,
                            created_at
                        FROM users
                        ORDER BY id DESC
                    `)
                    .all();


            res.json(users);

        }

        catch(error) {

            console.error(
                "Gagal mengambil user:",
                error
            );


            res.status(500).json({

                message:
                    "Gagal mengambil data user."

            });

        }

    }
);


// ========================================
// TAMBAH USER
// ========================================

app.post(
    "/api/users",
    function(req, res) {

        try {

            const {
                username,
                password,
                role
            } = req.body;


            if (
                !username ||
                !password
            ) {

                return res.status(400).json({

                    message:
                        "Username dan password wajib diisi."

                });

            }


            const hasil =
                db
                    .prepare(`
                        INSERT INTO users
                        (
                            username,
                            password,
                            role
                        )
                        VALUES (?, ?, ?)
                    `)
                    .run(

                        username,

                        password,

                        role || "admin"

                    );


            res.status(201).json({

                message:
                    "User berhasil ditambahkan.",

                id:
                    hasil.lastInsertRowid

            });

        }

        catch(error) {

            console.error(error);


            if (
                error.message.includes(
                    "UNIQUE constraint failed"
                )
            ) {

                return res.status(400).json({

                    message:
                        "Username sudah digunakan."

                });

            }


            res.status(500).json({

                message:
                    "Gagal menambahkan user."

            });

        }

    }
);


// ========================================
// HAPUS USER
// ========================================

app.delete(
    "/api/users/:id",
    function(req, res) {

        try {

            const id =
                Number(req.params.id);


            const user =
                db
                    .prepare(`
                        SELECT *
                        FROM users
                        WHERE id = ?
                    `)
                    .get(id);


            if (!user) {

                return res.status(404).json({

                    message:
                        "User tidak ditemukan."

                });

            }


            const jumlahAdmin =
                db
                    .prepare(`
                        SELECT COUNT(*) AS jumlah
                        FROM users
                        WHERE role = 'admin'
                    `)
                    .get();


            if (
                user.role === "admin" &&
                jumlahAdmin.jumlah <= 1
            ) {

                return res.status(400).json({

                    message:
                        "Admin terakhir tidak boleh dihapus."

                });

            }


            db.prepare(`
                DELETE FROM users
                WHERE id = ?
            `)
            .run(id);


            res.json({

                message:
                    "User berhasil dihapus."

            });

        }

        catch(error) {

            console.error(error);


            res.status(500).json({

                message:
                    "Gagal menghapus user."

            });

        }

    }
);


// ========================================
// EDIT USER
// ========================================

app.put(
    "/api/users/:id",
    function(req, res) {

        try {

            const id =
                Number(req.params.id);


            const {
                username,
                password,
                role
            } = req.body;


            const user =
                db
                    .prepare(`
                        SELECT *
                        FROM users
                        WHERE id = ?
                    `)
                    .get(id);


            if (!user) {

                return res.status(404).json({

                    message:
                        "User tidak ditemukan."

                });

            }


            if (!username) {

                return res.status(400).json({

                    message:
                        "Username wajib diisi."

                });

            }


            if (password) {

                db.prepare(`
                    UPDATE users

                    SET
                        username = ?,
                        password = ?,
                        role = ?

                    WHERE id = ?
                `)
                .run(

                    username,

                    password,

                    role || "admin",

                    id

                );

            }

            else {

                db.prepare(`
                    UPDATE users

                    SET
                        username = ?,
                        role = ?

                    WHERE id = ?
                `)
                .run(

                    username,

                    role || "admin",

                    id

                );

            }


            res.json({

                message:
                    "User berhasil diperbarui."

            });

        }

        catch(error) {

            console.error(error);


            if (
                error.message.includes(
                    "UNIQUE constraint failed"
                )
            ) {

                return res.status(400).json({

                    message:
                        "Username sudah digunakan."

                });

            }


            res.status(500).json({

                message:
                    "Gagal memperbarui user."

            });

        }

    }
);


// ========================================
// JALANKAN SERVER
// ========================================

app.get("/tes-saya", function(req, res) {
    res.send("SERVER YANG INI SEDANG BERJALAN");
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server berjalan di port ${PORT}`);
});

