# How's DS production deployment

## 1. Verify locally

```bash
node --env-file=.env.local scripts/check-env.mjs
npm run migrate
npm run verify
```

## 2. Vercel project

Import the repository into Vercel and add every runtime variable listed in `.env.example` under Project Settings → Environment Variables. Use the real production values from `.env.local`; never upload `.env.local` itself.

Run `npm run migrate` from a trusted terminal or CI job against the production `DATABASE_URL` before the first deployment and whenever a new numbered SQL migration is added. `npm run build` intentionally does not mutate the database.

## 3. Domain

Attach `how-is-ds.ultradominon.com` in Vercel. Add the DNS record shown by Vercel at the domain provider, then set `APP_URL=https://how-is-ds.ultradominon.com` and redeploy.

## 4. Evolution API webhook

Configure the Evolution instance to POST message-status events to:

```text
https://how-is-ds.ultradominon.com/api/webhooks/evolution
```

Send the configured `EVOLUTION_WEBHOOK_SECRET` as the `x-webhook-secret` header. The endpoint rejects missing or incorrect secrets and records sent, delivered, read, or failed states by the provider message ID.

## 5. Smoke test

1. Sign in as owner and replace any temporary password.
2. Confirm only assigned projects appear for manager and client accounts.
3. Open a project, change a task, and confirm progress rolls up.
4. Generate, edit, and publish a test report.
5. Use Notifications → Send test for one controlled email and WhatsApp recipient.
6. Confirm webhook delivery state changes in Notifications.
7. Switch to French and check the owner, manager, and client flows on a mobile viewport.

## Secrets

Rotate any credential that has ever been committed or shared outside the private deployment environment. Remove one-time `SEED_*` values from Vercel after initial account creation.
