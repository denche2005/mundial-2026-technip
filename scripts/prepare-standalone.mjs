/**
 * Tras `npm run build`, empaqueta `.next/standalone` + estáticos en `dist/zip_mundial/`
 * listo para copiar al servidor (Node detrás de IIS ARR, no solo archivos sueltos en wwwroot).
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");
const out = join(root, "dist", "zip_mundial");

if (!existsSync(standalone)) {
  console.error("No existe .next/standalone. Ejecuta antes: npm run build");
  process.exit(1);
}

if (existsSync(out)) rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

cpSync(standalone, out, { recursive: true });
cpSync(join(root, "public"), join(out, "public"), { recursive: true });
cpSync(join(root, ".next", "static"), join(out, ".next", "static"), { recursive: true });

console.log(`\nPaquete listo en: ${out}`);
console.log("En el servidor: variables .env + node server.js (puerto interno) + IIS proxy a /zip_mundial/\n");
