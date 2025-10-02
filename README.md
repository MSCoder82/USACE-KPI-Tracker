<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1jdC6VV5wE5Xbjqsm1l5FP2vLAJ3R_FxJ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create an `.env.local` file (or update the existing one) in the project root with the following values:

   ```bash
   GEMINI_API_KEY="<your Gemini API key>"
   VITE_SUPABASE_URL="<your Supabase project URL>"
   VITE_SUPABASE_ANON_KEY="<your Supabase anon key>" # or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
   ```

   > **Note:** Vite only exposes environment variables prefixed with `VITE_`. Without these variables the authentication client cannot initialize and the sign-in screen will not render.

   If you simply need to review the authentication UI without wiring up Supabase yet, append `?auth-preview=1` to the preview URL (or `/#/?auth-preview=1` when using hash routing). This toggles an interactive demo mode that keeps form submissions disabled until real Supabase credentials are configured.

   ### Why the Supabase URL & anon key live in `.env.local`

   Supabase's anon key is intentionally designed to be public. It is the same credential that ships in Supabase's own quick-start examples and it only grants the permissions defined in your project's `auth` policies. This means:

   * Keeping the anon key in `.env.local` (or setting it as an environment variable in your hosting provider's dashboard) does **not** leak elevated privileges.
   * Secrets that must remain private&mdash;such as the service-role key or third-party API tokens&mdash;should be stored with `supabase secrets set ...` and accessed from [Edge Functions](https://supabase.com/docs/guides/functions) or other server-side code. These secrets are **not** available to the browser bundle.
   * When deploying, configure `VITE_SUPABASE_URL` and either `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` in your hosting platform's environment-variable settings instead of committing them to version control. Vite injects the values at build time so they never need to appear in your source files.

   In short, you still create the `.env.local` file for local development, but you rely on your deployment platform's environment-variable management for production builds while sensitive credentials remain in Supabase's managed secrets.

3. Run the app:
   `npm run dev`
