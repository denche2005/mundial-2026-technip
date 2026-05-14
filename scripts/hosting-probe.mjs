/**
 * Comprueba si una URL sirve una app Next.js con Node (SSR / Server Actions)
 * o solo archivos estáticos. Uso:
 *   node scripts/hosting-probe.mjs
 *   node scripts/hosting-probe.mjs https://es001vs0062/zip_mundial/
 *
 * En redes con proxy SSL, si falla el fetch: NODE_EXTRA_CA_CERTS=corp.pem
 * o (solo diagnóstico) NODE_TLS_REJECT_UNAUTHORIZED=0 node ...
 */
import https from "node:https";
import http from "node:http";

const urlArg = process.argv[2];

function printStaticVsNodeGuide() {
  console.log(`
=== Porra Technip — guía rápida estático vs Node ===

Esta app usa Server Actions (registro/login) y cookies desde el servidor.
NO basta con copiar HTML suelto a wwwroot sin un proceso Node detrás.

Señales de que SÍ hay Node / Next detrás:
  - Cabecera "x-powered-by: Next.js" (a veces oculta en prod)
  - Respuesta HTML con chunks _next/static que cargan y rutas /app funcionan
  - POST de Server Actions devuelve RSC (no 404 de IIS en rutas dinámicas)

Señales de solo estático:
  - Solo listado de ficheros, 403, o index.html sin rutas /login /register
  - Navegar a /register da 404 del servidor web (no página Next)

Siguiente paso si solo hay estático: pedir a IT reverse proxy (ARR) a un
puerto local con "next start", o hosting con Node; ver docs internos.
`);
}

async function probeUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    console.error("URL inválida:", raw);
    process.exit(1);
  }
  const lib = u.protocol === "https:" ? https : http;
  const opts = {
    method: "GET",
    hostname: u.hostname,
    port: u.port || (u.protocol === "https:" ? 443 : 80),
    path: u.pathname + u.search,
    headers: { Accept: "text/html", "User-Agent": "mundial-hosting-probe/1" },
    timeout: 12_000,
    rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "0",
  };

  await new Promise((resolve, reject) => {
    const req = lib.request(opts, (res) => {
      const headers = res.headers;
      const xpb = headers["x-powered-by"];
      const ct = headers["content-type"];
      console.log("\n--- Resultado GET", u.href, "---");
      console.log("Status:", res.statusCode);
      console.log("Content-Type:", ct ?? "(ninguno)");
      console.log("x-powered-by:", xpb ?? "(ninguno — normal si lo ocultan)");
      if (String(ct || "").includes("text/html") && res.statusCode === 200) {
        if (/__NEXT_DATA__|_next\/static|Next\.js/i.test(xpb || "")) {
          console.log("Pista: cabecera sugiere Next.js.");
        }
        console.log(
          "Pista: abre la URL en el navegador y prueba /login y /register; si cargan formularios y el registro falla solo por red/API, suele haber Node.",
        );
      }
      res.resume();
      resolve();
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("timeout"));
    });
    req.end();
  }).catch((e) => {
    console.error("\nFetch falló:", e.message);
    console.error(
      "Si es certificado TLS corporativo, prueba NODE_EXTRA_CA_CERTS=... o NODE_TLS_REJECT_UNAUTHORIZED=0 solo para esta prueba.",
    );
    process.exitCode = 1;
  });
}

printStaticVsNodeGuide();
if (urlArg) {
  await probeUrl(urlArg);
} else {
  console.log("(Pasa una URL como argumento para un GET de diagnóstico.)\n");
}
