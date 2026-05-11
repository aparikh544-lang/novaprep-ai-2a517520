## Problem

The published site (`novaprep-ai.lovable.app`) crashes with `supabaseUrl is required` because the production JS bundle does not contain the Supabase URL or anon key. Locally, these come from `.env`, but `.env` is gitignored, so the publish build sees no env vars and Vite inlines `undefined` for `import.meta.env.VITE_SUPABASE_URL`.

The preview works because preview builds use your local `.env`. Republishing alone won't fix it — the build itself has no values to inject.

## Fix

Provide the values to Vite at build time through a non-gitignored source. The Supabase URL and anon (publishable) key are safe to ship in client code — they're already designed to be public, with RLS enforcing access.

### Step 1 — Add fallbacks in `vite.config.ts` via `define`

Inject the values as build-time constants so they exist even when no `.env` file is present during the publish build:

```ts
define: {
  'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
    process.env.VITE_SUPABASE_URL ?? 'https://vbdtlyatkwtawnqhqhdj.supabase.co'
  ),
  'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '<anon key>'
  ),
  'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify(
    process.env.VITE_SUPABASE_PROJECT_ID ?? 'vbdtlyatkwtawnqhqhdj'
  ),
},
```

This keeps local dev unchanged (it'll still prefer your `.env`) and guarantees the published bundle has working values.

### Step 2 — Republish

After the change, click **Publish → Update**. The new bundle will have a different hash and will contain the Supabase URL, so the blank-blue-page crash goes away.

## Why this is safe

- `VITE_SUPABASE_URL` is just your project's public API endpoint.
- `VITE_SUPABASE_PUBLISHABLE_KEY` is the anon key — it's meant to be embedded in client apps. All real protection comes from RLS policies on your tables (which you already have).
- No private secrets are exposed.

## Out of scope

- Not touching `src/integrations/supabase/client.ts` (auto-generated, must not be edited).
- Not changing `.gitignore` or committing `.env` directly.
