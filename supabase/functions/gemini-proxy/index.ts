import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

serve(async (req: Request) => {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

  if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response("Missing env vars", { status: 500 });
  }

  const body = await req.json();

  const geminiResponse = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: body.prompt || "Tell me a joke about SQL." }
            ]
          }
        ]
      })
    }
  );

  const data = await geminiResponse.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
});
