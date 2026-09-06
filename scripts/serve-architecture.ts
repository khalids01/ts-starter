import { join, normalize, resolve } from "node:path";

const architectureRoot = resolve(import.meta.dir, "../architecture");

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function contentType(pathname: string) {
  const extension = pathname.slice(pathname.lastIndexOf("."));
  return contentTypes[extension] ?? "application/octet-stream";
}

const server = Bun.serve({
  port: 3007,
  async fetch(request) {
    const pathname = decodeURIComponent(new URL(request.url).pathname);
    const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const filePath = normalize(join(architectureRoot, relativePath));

    if (!filePath.startsWith(`${architectureRoot}/`)) {
      return new Response("Invalid path", { status: 400 });
    }

    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(file, {
      headers: { "Content-Type": contentType(filePath) },
    });
  },
});

console.log(`Architecture hub: http://localhost:${server.port}`);
