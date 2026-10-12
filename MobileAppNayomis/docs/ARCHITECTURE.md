# Phase 2 architecture

## Boundaries

`app` owns composition roots: Hilt modules and root/main navigation. `core` owns reusable infrastructure and visual primitives. `feature` owns screen-specific state and UI. Future features should depend on `core`, while `core` must not depend on feature packages.

## Navigation

The root graph has `splash`, `onboarding`, `main`, `login`, and `register`. The nested five-tab graph remains inside `main`; auth screens never enter that graph. Profile requests pass through `ProtectedDestinationGuard`. A guest request stores `profile`, opens root login, and successful authentication returns to Profile while removing the completed login form. Splash restores the real server-authoritative session after onboarding state is read.

## Data and dependency injection

Hilt supplies singleton Retrofit/OkHttp, Room, Preferences DataStore, Keystore storage, connectivity observation, and dispatcher qualifiers. Interfaces are used at stateful/external boundaries (preferences, session storage/repository, connectivity); simple framework objects are injected directly.

Room v1 contains only `internal_metadata`, reserved for application/cache housekeeping. It contains no menu, customer, cart, order, rewards, or tracking records. Schemas export to `app/schemas`.

## Networking and errors

Each flavor supplies a BuildConfig base URL. `AuthApi` matches the verified register, login, and current-customer envelopes. `DefaultAuthRepository` maps DTOs to `Customer`, owns application-level `AuthenticationState`, and contains Retrofit/error/session orchestration. OkHttp adds bearer tokens only to non-public requests. A protected 401 clears the session once and publishes an expiry event; interceptors never navigate or retry.

## Security

`KeystoreSessionStorage` encrypts the access token, server-derived expiry, and required customer/session identifier using AES-256-GCM. No password, profile, payment data, or unverified refresh token is persisted. `JwtSessionParser` decodes only `exp` and identity for local lifecycle checks; `/students/me` remains authoritative. Malformed, expired, undecryptable, or unauthorized sessions are cleared.

## Design system

The initial system is light-only: brand/semantic colors, system-safe typography, 12dp standard surfaces, an 8dp spacing scale, 48dp interaction targets, and reusable loading/error/empty/offline/session-expired panels. Approved font resources and a complete dark theme can be added later without changing feature APIs.
