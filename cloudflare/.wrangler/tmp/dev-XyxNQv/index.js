var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// index.js
var index_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api" && request.method === "GET") {
      return Response.json({
        message: "Backend Cloudflare Chococanaa berhasil berjalan!"
      });
    }
    if (url.pathname === "/api/produk" && request.method === "GET") {
      try {
        const { results } = await env.chococanaa_db.prepare(`
                            SELECT *
                            FROM produk
                            ORDER BY id DESC
                        `).all();
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
    const produkMatch = url.pathname.match(/^\/api\/produk\/(\d+)$/);
    if (produkMatch && request.method === "GET") {
      try {
        const id = Number(produkMatch[1]);
        const produk = await env.chococanaa_db.prepare(`
                            SELECT *
                            FROM produk
                            WHERE id = ?
                        `).bind(id).first();
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
    if (url.pathname === "/api/produk" && request.method === "POST") {
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
              message: "Nama, kategori, dan harga wajib diisi."
            },
            {
              status: 400
            }
          );
        }
        const hasil = await env.chococanaa_db.prepare(`
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
                        `).bind(
          nama,
          kategori,
          harga,
          gambar || "",
          deskripsi || "",
          stok || 0,
          status_po || "buka"
        ).run();
        return Response.json(
          {
            message: "Produk berhasil ditambahkan.",
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
            message: "Gagal menambahkan produk.",
            error: error.message
          },
          {
            status: 500
          }
        );
      }
    }
    if (produkMatch && request.method === "PUT") {
      try {
        const id = Number(produkMatch[1]);
        const {
          nama,
          kategori,
          harga,
          gambar,
          deskripsi,
          stok,
          status_po
        } = await request.json();
        const produk = await env.chococanaa_db.prepare(`
                            SELECT *
                            FROM produk
                            WHERE id = ?
                        `).bind(id).first();
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
        await env.chococanaa_db.prepare(`
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
                    `).bind(
          nama,
          kategori,
          harga,
          gambar !== void 0 ? gambar : produk.gambar,
          deskripsi || "",
          stok || 0,
          status_po || "buka",
          id
        ).run();
        return Response.json({
          message: "Produk berhasil diperbarui."
        });
      } catch (error) {
        console.error(error);
        return Response.json(
          {
            message: "Gagal memperbarui produk.",
            error: error.message
          },
          {
            status: 500
          }
        );
      }
    }
    if (produkMatch && request.method === "DELETE") {
      try {
        const id = Number(produkMatch[1]);
        const hasil = await env.chococanaa_db.prepare(`
                            DELETE FROM produk
                            WHERE id = ?
                        `).bind(id).run();
        if (hasil.meta.changes === 0) {
          return Response.json(
            {
              message: "Produk tidak ditemukan."
            },
            {
              status: 404
            }
          );
        }
        return Response.json({
          message: "Produk berhasil dihapus."
        });
      } catch (error) {
        console.error(error);
        return Response.json(
          {
            message: "Gagal menghapus produk.",
            error: error.message
          },
          {
            status: 500
          }
        );
      }
    }
    if (url.pathname === "/api/login" && request.method === "POST") {
      try {
        const {
          username,
          password
        } = await request.json();
        if (!username || !password) {
          return Response.json(
            {
              message: "Username dan password wajib diisi."
            },
            {
              status: 400
            }
          );
        }
        const user = await env.chococanaa_db.prepare(`
                            SELECT *
                            FROM users
                            WHERE username = ?
                        `).bind(username).first();
        if (!user || user.password !== password) {
          return Response.json(
            {
              message: "Username atau password salah."
            },
            {
              status: 401
            }
          );
        }
        return Response.json({
          message: "Login berhasil.",
          username: user.username,
          role: user.role
        });
      } catch (error) {
        console.error(error);
        return Response.json(
          {
            message: "Terjadi kesalahan saat login.",
            error: error.message
          },
          {
            status: 500
          }
        );
      }
    }
    return env.ASSETS.fetch(request);
  }
};

// ../../Users/RAKHAA/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../Users/RAKHAA/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-cGa08a/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = index_default;

// ../../Users/RAKHAA/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-cGa08a/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
