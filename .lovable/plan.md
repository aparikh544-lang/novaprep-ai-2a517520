## Goal
Make drills/tests generate reliably with OpenRouter and stop failing the whole session when the provider briefly rate-limits a batch.

## Plan
1. Reduce pressure on the provider in `generate-questions`
   - Lower batch concurrency so the function stops sending overlapping batch requests.
   - Tune batch sizing/request strategy for large sessions so a 44–54 question module is less likely to trigger provider 429s.

2. Add resilient retry handling for provider rate limits
   - Treat OpenRouter 429s as retryable with short backoff instead of immediate hard failure.
   - Keep the existing model fallback chain, but make it retry safely before giving up.

3. Prevent one bad batch from killing the whole session
   - Return as many valid questions as possible from successful batches.
   - If the total is short, either top up with smaller follow-up requests or fail only when the session truly cannot reach the minimum usable question count.

4. Improve the frontend failure path in `TestSession`
   - Show a clearer user-facing error for temporary provider throttling.
   - Avoid the current abrupt bounce back to `/practice` when a recoverable generation issue happens.

5. Validate the drill/test flow end-to-end
   - Re-test the same large generation path that currently fails.
   - Confirm the response no longer dies on a single OpenRouter 429 and that Math/Reading/full-session requests still return the expected section-specific questions.

## Technical details
- Files likely involved:
  - `supabase/functions/generate-questions/index.ts`
  - `src/lib/generate-questions.ts`
  - `src/pages/TestSession.tsx`
- Root cause confirmed from the live request: POST to `generate-questions` returned `429` with `{"error":"Rate limits exceeded, please try again shortly."}` for a `count: 50` Math request.
- Constraint respected: do not switch to Groq; keep OpenRouter as the provider.