# ADR 0004 — Enforce entitlement on the server

**Status:** Accepted · **Context:** a freemium boundary between free and paid content

## Context

The product is freemium: some content is open, and the rest unlocks with a subscription. Any paywall raises the same question — where is the boundary actually enforced? Enforcing it in the client (hiding UI, gating in JavaScript) is convenient but worthless as a control: anyone can read the bundle or call the API directly. Billing state also lives in an external system (the payment provider), which can drift from what the app believes if it is consulted ad hoc.

## Decision

Make entitlement a **server-side decision backed by a single source of truth.** The payment provider's webhooks update an entitlement state in my own database; every request for gated content — whether rendered by a server component or performed through a server action — checks that state on the server before returning anything. The client renders whatever the server allows; it never decides. The concrete boundary (which content is free) lives only in server code and is deliberately not exposed in this public repository.

## Consequences

- **Positive:** the boundary can't be bypassed from the client; billing state has one authoritative home rather than being re-derived per request; the rule can change server-side without shipping new client code.
- **Negative:** correctness now depends on reliable webhook handling and reconciliation (retries, idempotency, and a periodic sweep for edge cases like a subscription that outlives its account).
- **Principle:** a security or entitlement boundary belongs on the server, with one source of truth — the client is a view, never the gatekeeper.
