## Why it works in bolt.new but not here
The code can be identical across both apps and still behave differently because backend secrets are environment-specific and are not stored in GitHub.

I verified the live backend here and found:
- The hosted backend is healthy.
- The deployed `generate-questions` function returns `500` with: `OPENROUTER_API_KEY not configured`.
- This project’s runtime secrets currently do not include `OPENROUTER_API_KEY`.

That means bolt.new likely has the OpenRouter secret configured, while this Lovable project does not.

## Plan
1. Re-add `OPENROUTER_API_KEY` to this project’s backend secrets.
2. Re-test the deployed `generate-questions` function directly in this environment.
3. If needed, redeploy the function so it picks up the restored secret.
4. Validate the drill/test flow from the app to confirm the error is gone.

## Technical details
- GitHub syncs code, not backend secret values.
- This environment-specific secret is read in the edge function via `Deno.env.get("OPENROUTER_API_KEY")`.
- Current live response from the deployed function here: `{"error":"OPENROUTER_API_KEY not configured"}`.
- So this is not a CORS issue and not a code-difference issue; it is a deployment/environment configuration mismatch.