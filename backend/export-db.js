const fs = require("fs");
const path = require("path");
const db = require("./database");

function sqlText(value) {
    if (value === null || value === undefined) {
        return "NULL";
    }

    return "'" + String(value).replace(/'/g, "''") + "'";
}

const produk = db.prepare(`
    SELECT
        id,
        nama,
        kategori,
        harga,
        gambar,
        deskripsi,
        stok,
        status_po,
        created_at
    FROM produk
    ORDER BY id
`).all();

let sql = "";

sql += "DELETE FROM produk;\n";

for (const p of produk) {
    sql += `
INSERT INTO produk
(id, nama, kategori, harga, gambar, deskripsi, stok, status_po, created_at)
VALUES (
    ${p.id},
    ${sqlText(p.nama)},
    ${sqlText(p.kategori)},
    ${p.harga || 0},
    ${sqlText(p.gambar)},
    ${sqlText(p.deskripsi)},
    ${p.stok || 0},
    ${sqlText(p.status_po || "buka")},
    ${sqlText(p.created_at)}
);
`;
}

const output = path.join(__dirname, "..", "cloudflare", "produk-migration.sql");

fs.writeFileSync(output, sql, "utf8");

console.log("=================================");
console.log("EXPORT DATABASE BERHASIL");
console.log("=================================");
console.log("Jumlah produk:", produk.length);
console.log("File:", output);