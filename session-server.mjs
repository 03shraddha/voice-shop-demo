import { createServer } from "node:http";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Use absolute path so the server works regardless of cwd
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env.local") });

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  // Health check — useful for debugging ("curl http://localhost:3211/health")
  if (req.method === "GET" && url.pathname === "/health") {
    const keyLoaded = Boolean(process.env.OPENAI_API_KEY);
    sendJson(res, 200, { ok: true, apiKeyLoaded: keyLoaded });
    return;
  }

  if (req.method !== "POST" || url.pathname !== "/session") {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[session-server] OPENAI_API_KEY is not set. Check .env.local");
    sendJson(res, 500, { error: "OPENAI_API_KEY is missing. Add it to .env.local" });
    return;
  }

  try {
    const contentType = req.headers["content-type"];
    const body = await readBody(req);

    const upstream = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...(contentType ? { "Content-Type": contentType } : {}),
      },
      body,
    });

    const responseBody = await upstream.text();

    if (!upstream.ok) {
      console.error(`[session-server] OpenAI returned ${upstream.status}: ${responseBody}`);
    }

    res.writeHead(upstream.status, {
      "Content-Type": upstream.headers.get("content-type") ?? "application/sdp; charset=utf-8",
    });
    res.end(responseBody);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("[session-server] Error:", message);
    sendJson(res, 500, { error: message });
  }
});

const PORT = 3211;
server.listen(PORT, () => {
  const keyLoaded = Boolean(process.env.OPENAI_API_KEY);
  console.log(`Session proxy listening on http://localhost:${PORT}`);
  if (!keyLoaded) {
    console.warn("  WARNING: OPENAI_API_KEY not found in .env.local");
  } else {
    console.log("  OPENAI_API_KEY loaded OK");
  }
  console.log("  Health check: curl http://localhost:3211/health");
});
