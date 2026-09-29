import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8"
};

createServer(async (request, response) => {
  try {
    if (!new Set(["GET", "HEAD"]).has(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
      return;
    }
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relative = pathname === "/" ? "/index.html" : pathname;
    const file = resolve(root, `.${relative}`);
    const localPath = relativePath(root, file);
    const isAppAsset = ["index.html", "styles.css", "favicon.svg"].includes(localPath)
      || (localPath.startsWith(`src${sep}`) && extname(localPath) === ".js");
    if (localPath.startsWith("..") || isAbsolute(localPath) || !isAppAsset) {
      response.writeHead(404).end("Not found");
      return;
    }
    if ((await stat(file)).isDirectory()) {
      response.writeHead(403).end("Directory listing disabled");
      return;
    }
    response.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer"
    });
    response.end(request.method === "HEAD" ? undefined : await readFile(file));
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Nexus running at http://127.0.0.1:${port}`);
});

function relativePath(base, target) {
  return relative(base, target).split(sep).join(sep);
}
