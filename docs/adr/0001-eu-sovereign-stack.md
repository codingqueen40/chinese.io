# ADR 0001 — An EU-sovereign, self-hosted-auth stack

**Status:** Accepted · **Context:** solo-built consumer SaaS, operated from the EU

## Context

The fastest way to ship a modern web app is the popular US-centric stack: a US serverless host, a US managed database, and a US managed authentication provider. It's excellent developer experience. But this app is operated from the EU and sells to consumers, so where user data physically lives — and who can be compelled to hand it over — is a design requirement, not a detail. A stack where accounts and personal data sit with US-headquartered providers maximises exposure to extraterritorial data-access regimes and multiplies the number of cross-border transfers I have to justify.

## Decision

Host the whole application — compute **and** database — on EU infrastructure, and **self-host authentication** so user records live in my own EU database rather than with a third-party identity provider. Keep third-party US dependencies to the minimum the product genuinely needs, and where one is unavoidable (payments), send it the least personal data possible and keep the authoritative copy in my own database.

## Consequences

- **Positive:** data residency is under my control; the number of cross-border transfers to document drops to the essential minimum; there's no auth vendor lock-in, and no per-seat auth bill as usage grows.
- **Negative:** self-hosted auth is more code to own and secure than a managed provider; the EU platform ecosystem is smaller, so some conveniences must be assembled rather than bought.
- **Principle:** treat data residency and sovereignty as architectural constraints chosen up front, not as compliance work bolted on later.

## Notes

This is also an honest CV signal: building a GDPR-aligned, sovereign stack is a deliberate engineering competence, not an accident of tooling.
