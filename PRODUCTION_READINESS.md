# AfriBet production readiness

## Current release status

The repository is deployable as a hardened **preview/staging application**. It is not approved for a real-money public launch. Production starts with `BETTING_ENABLED=false`; this fail-closed default is intentional.

For a database-free public showcase only, `PUBLIC_PREVIEW_MODE=true` permits
volatile catalog storage while all write capabilities remain disabled. Do not
use that mode for a real service or as a substitute for `DATABASE_URL`.

The engineering baseline now includes PostgreSQL persistence, migrations, strict request validation, protected operator routes, rate limits, security headers, origin restrictions, full-ID bearer tickets, secure demo randomness, graceful shutdown, health checks, lazy-loaded pages, optimized images, and automated checks.

## Mandatory launch gates

These items require business, regulatory, security, or third-party decisions and cannot be truthfully completed from source code alone:

- Gambling licence and jurisdiction-by-jurisdiction legal approval.
- KYC, age verification, sanctions screening, AML monitoring, source-of-funds workflows, and regulatory reporting.
- Geolocation/geofencing and VPN/proxy risk policy.
- Payment service provider integration, segregated player funds, reconciliation, chargebacks, withdrawals, and audited ledger accounting.
- Independent RNG/game certification and a signed, immutable draw publication process. The demo draw endpoint is not a certified RNG.
- Responsible-gaming controls: deposit/wager/loss/time limits, cooling-off, self-exclusion, reality checks, affordability/risk intervention, and support escalation.
- Player accounts with MFA/recovery, session security, device/risk controls, and privacy/consent workflows.
- Published terms, game rules, payout rules, privacy/cookie notices, complaints/ADR, and retention/deletion policies reviewed by counsel.
- Independent penetration test, threat model, dependency/SBOM review, backup restore drill, incident-response exercise, observability/SLOs, and 24/7 operational ownership.
- Content moderation, reporting, blocking, abuse handling, and authenticated identities before community posting is enabled.
- Load, failover, concurrency, and settlement-idempotency tests against the selected production database and payment/RNG providers.

Do not set `BETTING_ENABLED=true` until the accountable owners sign off every applicable gate.

## Deployment checklist

1. Provision a TLS-enforced PostgreSQL database and set `DATABASE_URL`.
2. Run `npm ci` and `npm run verify` in CI.
3. Apply the checked-in migration with `npm run db:migrate` or, for controlled non-production environments, `npm run db:push`.
4. Set a high-entropy `ADMIN_API_KEY`; never expose it to frontend code.
5. Set `ALLOWED_ORIGINS` only when cross-origin API access is required.
6. Deploy with `BETTING_ENABLED=false`, `COMMUNITY_POSTING_ENABLED=false`, and `DEMO_DRAW_GENERATION_ENABLED=false`.
7. Verify `/api/health`, security headers, logs, alerts, database backups, and restore procedures.
8. Complete the mandatory launch gates, then enable only the reviewed capabilities.

## Operator API

Protected routes accept `Authorization: Bearer <ADMIN_API_KEY>` or `X-Admin-Key`. Protected operations include result publication/generation, configuration, aggregate bets/winnings, inquiries, statistics, code creation, and Aviator lifecycle operations. Prefer a private operator service rather than exposing these routes through a public browser.

The protected `/admin` control centre uses the same credential and keeps it in
browser `sessionStorage` only. It provides audited feature switches, compliance
evidence/status tracking, risk limits, verified result publication, promotion
codes, operational metrics, inquiries, and an operator audit trail. Runtime
changes require PostgreSQL and are rejected while `PUBLIC_PREVIEW_MODE=true`.
Bet placement cannot become active until every launch gate is complete.

## Data model notes

- Money is stored as PostgreSQL `numeric(14,2)` rather than floating-point `real`.
- Odds and multipliers use fixed-precision numeric columns.
- A unique winning record per bet prevents duplicate payout records.
- A result must be published after the bet timestamp to settle that bet.
- Ticket IDs are full UUID bearer secrets. The old enumerable eight-character lookup was removed.
- Published odds are treated as the player contract; no hidden house-edge deduction is applied after a win.

## Known engineering follow-ups

- Replace client-triggered settlement checks with a transactional server-side settlement job when the production draw service is selected.
- Add authenticated player ownership before exposing account-level histories across devices.
- Add integration tests against an ephemeral PostgreSQL instance and end-to-end tests for critical player/operator journeys.
- Remove legacy, unused demo pages once product routing is finalized.
