import { resolve, sep } from "node:path";

export async function serveBuiltClient(request: Request, clientDirectory: string) {
  if (!["GET", "HEAD"].includes(request.method)) return null;
  let pathname: string;
  try { pathname = decodeURIComponent(new URL(request.url).pathname); }
  catch { return new Response("Not found", { status: 404 }); }
  const root = resolve(clientDirectory);
  const path = resolve(root, "." + pathname);
  if (path === root) return null;
  if (!path.startsWith(root + sep) || pathname.includes("\0")) {
    return new Response("Not found", { status: 404 });
  }
  const file = Bun.file(path);
  if (!await file.exists()) return null;
  const immutable = pathname.startsWith("/assets/") && /-[\w-]{8,}\.[\w]+$/.test(pathname);
  return new Response(request.method === "HEAD" ? null : file, {
    headers: {
      "content-type": file.type,
      "content-length": String(file.size),
      "cache-control": immutable ? "public, max-age=31536000, immutable" : "public, max-age=300",
      "x-content-type-options": "nosniff",
    },
  });
}
