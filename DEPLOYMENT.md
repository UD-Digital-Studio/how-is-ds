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

## 6. Notification troubleshooting

Every failed delivery is recorded in Notifications with its reason, and emails
the project's managers — or the owner, if the project has none. Three causes
account for most of them.

**`Evolution API request failed (401)`.** `EVOLUTION_API_KEY` is not a key the
Evolution server accepts. Check it against an endpoint that does not involve the
instance, so a failure rules the instance name out at the same time:

```bash
curl -s -H "apikey: $EVOLUTION_API_KEY" "$EVOLUTION_API_URL/instance/fetchInstances"
```

A 401 there means the key itself is wrong: take the server's global
`AUTHENTICATION_API_KEY`, or the instance token from the Evolution manager UI.
Update it in `.env.local` **and** in the Vercel environment — production reads its
own copy, so fixing one does not fix the other.

**`This number has no WhatsApp account.`** No form of the recipient's number is
registered. Confirm before editing the client:

```bash
curl -s -X POST -H "apikey: $EVOLUTION_API_KEY" -H "Content-Type: application/json" \
  -d '{"numbers":["+237XXXXXXXXX"]}' \
  "$EVOLUTION_API_URL/chat/whatsappNumbers/$EVOLUTION_INSTANCE"
```

`exists: false` is authoritative — the instance must be `state: open` for the
answer to mean anything, which `instance/connectionState` will tell you. Note
that the sender already tries the pre-2014 Cameroon form of a number on its own,
so this error means neither form exists; the fix is a corrected number, not a
code change.

**A delivery stuck at `SENT`.** The message left, but no status event came back.
The instance is not posting to `/api/webhooks/evolution`, or its
`x-webhook-secret` does not match `EVOLUTION_WEBHOOK_SECRET`. Re-check step 4.

## Secrets

Rotate any credential that has ever been committed or shared outside the private deployment environment. Remove one-time `SEED_*` values from Vercel after initial account creation.
