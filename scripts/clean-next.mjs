/**
 * Borra `.next` para resolver ENOENT en caché webpack (edge-server-development,
 * client-development, etc.) tras builds parciales o dos `next dev` a la vez.
 */
import fs from "node:fs";
import path from "node:path";

const nextDir = path.join(process.cwd(), ".next");
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log("Eliminado:", nextDir);
} else {
  console.log("No existe .next — nada que limpiar.");
}
