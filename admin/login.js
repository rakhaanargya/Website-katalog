// ========================================
// LOGIN ADMIN
// ========================================

const formLogin = document.getElementById("formLogin");

if (formLogin) {

    formLogin.addEventListener("submit", async function (event) {

        event.preventDefault();

        const username = document
            .getElementById("username")
            .value
            .trim();

        const password = document
            .getElementById("password")
            .value;

        const pesanLogin =
            document.getElementById("pesanLogin");


        // ========================================
        // VALIDASI INPUT
        // ========================================

        if (!username || !password) {

            pesanLogin.textContent =
                "Username dan password wajib diisi.";

            pesanLogin.style.color = "red";

            return;
        }


        // ========================================
        // LOGIN KE BACKEND
        // ========================================

        try {

            const response = await fetch(
                "/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            );


            const data = await response.json();


            // ========================================
            // LOGIN BERHASIL
            // ========================================

            if (response.ok) {

                pesanLogin.textContent =
                    "Login berhasil!";

                pesanLogin.style.color = "green";


                // Simpan status login
                localStorage.setItem(
                    "adminLogin",
                    "true"
                );

                localStorage.setItem(
                    "adminUsername",
                    data.username
                );


                // Pindah ke halaman admin
                setTimeout(function () {

                    window.location.href = "index.html";

                }, 500);

            }


            // ========================================
            // LOGIN GAGAL
            // ========================================

            else {

                pesanLogin.textContent =
                    data.message ||
                    "Username atau password salah.";

                pesanLogin.style.color = "red";

            }

        }


        // ========================================
        // SERVER TIDAK TERHUBUNG
        // ========================================

        catch (error) {

            console.error(
                "Error login:",
                error
            );

            pesanLogin.textContent =
                "Tidak dapat terhubung ke server.";

            pesanLogin.style.color = "red";

        }

    });

}