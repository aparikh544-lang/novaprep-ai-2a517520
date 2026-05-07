## Switch question generation to Groq

### Step 0 — Rotate the leaked key (you do this)
The key you pasted is now public. In the Groq console, **revoke `gsk_VmY7…E3M4`** and create a new one. Don't paste the new key in chat — I'll open a secure secret prompt for it.

### Step 1 — Store the new key as a backend secret
I'll request a secret named `GROQ_API_KEY` via the secure secret tool. You paste the freshly rotated key there. It's only readable by edge functions, never exposed to the browser or codebase.

### Step 2 — Update `supabase/functions/generate-questions/index.ts`
- Replace the Lovable AI gateway URL with Groq's OpenAI-compatible endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Swap auth header to use `GROQ_API_KEY`
- Swap the model fallback chain from Gemini models to Groq models:
  - Primary: `llama-3.3-70b-versatile` (high quality, fast)
  - Fallback: `llama-3.1-8b-instant` (ultra-fast safety net)
- Keep everything else identical: tool-calling schema, batching, concurrency, timeouts, daily cap, JWT auth, CORS. Groq supports OpenAI-style `tools` + `tool_choice`, so the existing `return_questions` function call works as-is.
- Update the 402 error message (Groq uses different billing language) and keep 429 handling.

### Step 3 — Leave Lovable AI code path removable
No other function uses `LOVABLE_API_KEY`, so once Groq works you can ignore the Lovable AI balance entirely. The free $1/month will still be there if you ever want to switch back.

### Notes
- Groq's free tier is generous (thousands of requests/day on Llama 3.x) and very fast — usually faster than Gemini Flash.
- No frontend changes needed; `generate-questions.ts` and all callers stay the same.
- I won't touch `bump_ai_usage` — your per-user daily cap of 40 calls still applies.

### What I need from you before I implement
1. Confirm you've **rotated** the leaked key in Groq.
2. Approve this plan — I'll then prompt you to paste the new `GROQ_API_KEY` securely.
