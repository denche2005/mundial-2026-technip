/**
 * Instala dependencias sin tener `npm` en el PATH: descarga el paquete oficial
 * `npm` desde el registry, lo extrae con `tar` (incluido en Windows 10+) y
 * ejecuta `npm install` con node sobre npm-cli.js.
 *
 * Uso (desde la raíz del proyecto):
 *   node scripts/bootstrap-npm-install.mjs
 */
import { execFileSync, spawnSync } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import https from "node:https";
import { finished } from "node:stream/promises";

const NPM_VERSION = "10.9.2";
const ROOT = process.cwd();
const WORK = join(tmpdir(), `npm-bootstrap-${NPM_VERSION}`);

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const out = createWriteStream(destPath);
    https
      .get(url, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          const loc = res.headers.location;
          res.resume();
          out.close();
          if (!loc) return reject(new Error("Redirect sin Location"));
          return resolve(download(loc, destPath));
        }
        if (res.statusCode !== 200) {
          res.resume();
          out.close();
          return reject(new Error(`HTTP ${res.statusCode} al descargar ${url}`));
        }
        res.pipe(out);
        finished(out).then(resolve, reject);
      })
      .on("error", (err) => {
        out.close();
        reject(err);
      });
  });
}

async function main() {
  const url = `https://registry.npmjs.org/npm/-/npm-${NPM_VERSION}.tgz`;
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(WORK, { recursive: true });
  const tgz = join(WORK, "npm.tgz");
  console.log(`Descargando npm ${NPM_VERSION}…`);
  await download(url, tgz);
  console.log("Extrayendo con tar…");
  execFileSync("tar", ["-xzf", tgz, "-C", WORK], { stdio: "inherit" });
  const npmCli = join(WORK, "package", "bin", "npm-cli.js");
  if (!existsSync(npmCli)) {
    throw new Error(`No se encontró ${npmCli} tras extraer el tarball`);
  }
  console.log("Ejecutando npm install en el proyecto…");
  const nodeBinDir = dirname(process.execPath);
  const pathPrefix = `${nodeBinDir}${delimiter}${process.env.PATH ?? ""}`;
  const r = spawnSync(process.execPath, [npmCli, "install", "--no-fund", "--no-audit"], {
    cwd: ROOT,
    stdio: "inherit",
    env: {
      ...process.env,
      PATH: pathPrefix,
      npm_config_yes: "true",
    },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log("Listo: node_modules generado.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
