export default {

    async fetch(request, env) {

        const url = new URL(request.url);

        // ================================
        // TEST WORKER
        // ================================

        if (
            url.pathname === "/api" &&
            request.method === "GET"
        ) {

            return Response.json({
                message: "Backend Cloudflare Chococanaa berhasil berjalan!"
            });

        }


        // ================================
        // GET SEMUA PRODUK
        // ================================

        if (
            url.pathname === "/api/produk" &&
            request.method === "GET"
        ) {

            try {

                const { results } =
                    await env.chococanaa_db
                        .prepare(`
                            SELECT *
                            FROM produk
                            ORDER BY id DESC
                        `)
                        .all();

                return Response.json(results);

            } catch (error) {

                console.error(error);

                return Response.json(
                    {
                        message: "Gagal mengambil data produk.",
                        error: error.message
                    },
                    {
                        status: 500
                    }
                );

            }

        }


        // ================================
        // PRODUK BERDASARKAN ID
        // ================================

        const produkMatch =
            url.pathname.match(/^\/api\/produk\/(\d+)$/);


        // ================================
        // GET PRODUK
        // ================================

        if (
            produkMatch &&
            request.method === "GET"
        ) {

            try {

                const id =
                    Number(produkMatch[1]);

                const produk =
                    await env.chococanaa_db
                        .prepare(`
                            SELECT *
                            FROM produk
                            WHERE id = ?
                        `)
                        .bind(id)
                        .first();


                if (!produk) {

                    return Response.json(
                        {
                            message: "Produk tidak ditemukan."
                        },
                        {
                            status: 404
                        }
                    );

                }


                return Response.json(produk);

            } catch (error) {

                console.error(error);

                return Response.json(
                    {
                        message: "Gagal mengambil produk.",
                        error: error.message
                    },
                    {
                        status: 500
                    }
                );

            }

        }


        // ================================
        // TAMBAH PRODUK
        // ================================

        if (
            url.pathname === "/api/produk" &&
            request.method === "POST"
        ) {

            try {

                const {
                    nama,
                    kategori,
                    harga,
                    gambar,
                    deskripsi,
                    stok,
                    status_po
                } = await request.json();


                if (!nama || !kategori || !harga) {

                    return Response.json(
                        {
                            message:
                                "Nama, kategori, dan harga wajib diisi."
                        },
                        {
                            status: 400
                        }
                    );

                }


                const hasil =
                    await env.chococanaa_db
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
                        .bind(
                            nama,
                            kategori,
                            harga,
                            gambar || "",
                            deskripsi || "",
                            stok || 0,
                            status_po || "buka"
                        )
                        .run();


                return Response.json(
                    {
                        message:
                            "Produk berhasil ditambahkan.",
                        id: hasil.meta.last_row_id
                    },
                    {
                        status: 201
                    }
                );

            } catch (error) {

                console.error(error);

                return Response.json(
                    {
                        message:
                            "Gagal menambahkan produk.",
                        error: error.message
                    },
                    {
                        status: 500
                    }
                );

            }

        }


        // ================================
        // EDIT PRODUK
        // ================================

        if (
            produkMatch &&
            request.method === "PUT"
        ) {

            try {

                const id =
                    Number(produkMatch[1]);


                const {
                    nama,
                    kategori,
                    harga,
                    gambar,
                    deskripsi,
                    stok,
                    status_po
                } = await request.json();


                const produk =
                    await env.chococanaa_db
                        .prepare(`
                            SELECT *
                            FROM produk
                            WHERE id = ?
                        `)
                        .bind(id)
                        .first();


                if (!produk) {

                    return Response.json(
                        {
                            message:
                                "Produk tidak ditemukan."
                        },
                        {
                            status: 404
                        }
                    );

                }


                await env.chococanaa_db
                    .prepare(`
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
                    .bind(
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
                    )
                    .run();


                return Response.json({
                    message:
                        "Produk berhasil diperbarui."
                });

            } catch (error) {

                console.error(error);

                return Response.json(
                    {
                        message:
                            "Gagal memperbarui produk.",
                        error: error.message
                    },
                    {
                        status: 500
                    }
                );

            }

        }


        // ================================
        // HAPUS PRODUK
        // ================================

        if (
            produkMatch &&
            request.method === "DELETE"
        ) {

            try {

                const id =
                    Number(produkMatch[1]);


                const hasil =
                    await env.chococanaa_db
                        .prepare(`
                            DELETE FROM produk
                            WHERE id = ?
                        `)
                        .bind(id)
                        .run();


                if (hasil.meta.changes === 0) {

                    return Response.json(
                        {
                            message:
                                "Produk tidak ditemukan."
                        },
                        {
                            status: 404
                        }
                    );

                }


                return Response.json({
                    message:
                        "Produk berhasil dihapus."
                });

            } catch (error) {

                console.error(error);

                return Response.json(
                    {
                        message:
                            "Gagal menghapus produk.",
                        error: error.message
                    },
                    {
                        status: 500
                    }
                );

            }

        }


        // ================================
        // LOGIN
        // ================================

        if (
            url.pathname === "/api/login" &&
            request.method === "POST"
        ) {

            try {

                const {
                    username,
                    password
                } = await request.json();


                if (!username || !password) {

                    return Response.json(
                        {
                            message:
                                "Username dan password wajib diisi."
                        },
                        {
                            status: 400
                        }
                    );

                }


                const user =
                    await env.chococanaa_db
                        .prepare(`
                            SELECT *
                            FROM users
                            WHERE username = ?
                        `)
                        .bind(username)
                        .first();


                if (
                    !user ||
                    user.password !== password
                ) {

                    return Response.json(
                        {
                            message:
                                "Username atau password salah."
                        },
                        {
                            status: 401
                        }
                    );

                }


                return Response.json({

                    message:
                        "Login berhasil.",

                    username:
                        user.username,

                    role:
                        user.role

                });

            } catch (error) {

                console.error(error);

                return Response.json(
                    {
                        message:
                            "Terjadi kesalahan saat login.",
                        error: error.message
                    },
                    {
                        status: 500
                    }
                );

            }

        }


        // ================================
        // WEBSITE
        // ================================

        return env.ASSETS.fetch(request);

    }

};