# Backend integration and security audit

Audit source: the real Express/Mongoose implementation under `../backend`, inspected 2026-07-12. The existing Kotlin app remained read-only.

## Verified safe customer contract

- API prefix: `/api/`
- Register: `POST students/register` with `name`, `email`, `password`
- Login: `POST students/login` with `email`, `password`
- Current customer: authenticated `GET students/me`
- Password constraint: 6–128 characters
- Customer JWT: `studentId`, `email`, `role`, `iat`, `exp`; default lifetime 24 hours
- No refresh token, revocation, or server logout endpoint
- Registration does not authenticate automatically

The Flutter app uses only these authentication endpoints. It never stores passwords, never logs request bodies or authorization headers, and treats local JWT decoding only as lifecycle metadata. Server signature verification remains authoritative.

## Public data currently usable

- `GET food` and `GET food/:id`
- `GET pickup-points`
- `GET reviews/food/:foodItemId`

Menu IDs, prices, availability, dietary fields, allergens, and pickup slots are mapped from MongoDB responses. Missing images, badges, reviews, or gallery content are shown as unavailable instead of invented.

## Blocking backend gaps

The following legacy endpoints trust path/body `studentId` values or lack authenticated customer ownership checks:

- `advanced-orders/place`
- `advanced-orders/validate-checkout`
- `advanced-orders/student/:studentId`
- `advanced-orders/student/:studentId/pickup-points`
- `advanced-orders/wallet/:studentId`
- existing order retrieval/cancellation routes

`advanced-orders/place` also has no idempotency-key contract and supports wallet payment only. The client therefore does not place orders or expose wallet mutations through these endpoints. This prevents cross-customer access, duplicate charge/order risk, and fake client-selected ownership.

Required server work before enabling placement:

1. Attach customer JWT middleware.
2. Derive the account/parent identity from `req.customer`; ignore caller-selected owner IDs.
3. Add parent-owned student resources with add/edit/default/archive operations and immutable historical ownership.
4. Validate cart IDs, current prices, availability, days, quantities, allergies, dates, cutoff, pickup and slot capacity, payment eligibility, and total transactionally.
5. Accept and persist a scoped idempotency key for final placement.
6. Return stable error codes and structured price/unavailable-item changes.
7. Expose authenticated current-customer active/history order feeds and ownership-checked cancellation/reorder/review eligibility.

Other missing contracts:

- No customer tracking snapshot/stream endpoint or backend-issued SAFE/WARNING/CRITICAL/OFFLINE classification
- DeliveryBox lacks the full humidity/lid/rough-handling/staleness customer schema
- No notifications feed or approved Firebase project configuration
- No reward transactions/catalogue/redemption rules
- No profile update/settings, parent/student ownership, gallery, contact, or backend-controlled opening-status endpoints
- Reviews do not enforce the requested ten-character comment in the schema/controller and identify an order, not an immutable order-item reference

## Client behavior for gaps

The app presents explicit unavailable/empty states. It never:

- sends final orders while offline;
- creates a fake card form or payment success;
- trusts Drift prices as final;
- modifies points or wallet balances;
- displays old sensor values as live;
- makes a local HACCP/food-acceptance decision;
- uses the insecure student-ID feeds merely because the current UI knows its own ID.

## Production actions

- Replace placeholder hosts with approved HTTPS endpoints.
- Add restricted CORS origins and reverse-proxy TLS at the backend.
- Configure release signing outside source control.
- Add Maps/FCM packages and platform credentials only after approved projects and customer endpoints exist.
- Add lifecycle-aware streaming/FCM for tracking; do not use aggressive background polling.
