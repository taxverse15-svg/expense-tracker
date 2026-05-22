const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzfZ6-noStSW3dG6JARwy3dmu9bSGSG8ZjP0FaGuFAmZIOUiWoMvwZK83uoGDuVCURh/exec";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/submit") {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders() });
      }

      if (request.method === "POST") {
        return proxyToGoogleScript(request);
      }

      return new Response("Method not allowed", { status: 405, headers: corsHeaders() });
    }

    return env.ASSETS.fetch(request);
  },
};

async function proxyToGoogleScript(request: Request): Promise<Response> {
  try {
    const body = await request.text();

    const gasResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      redirect: "follow",
    });

    const text = await gasResponse.text();

    return new Response(text, {
      status: gasResponse.ok ? 200 : gasResponse.status,
      headers: {
        ...corsHeaders(),
        "Content-Type": gasResponse.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Proxy request failed";
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 502,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

interface Env {
  ASSETS: Fetcher;
}
