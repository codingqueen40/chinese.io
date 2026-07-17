# chinese.io

Public showcase of reusable building blocks extracted from a production Mandarin-learning SaaS, with an engineering case study. Curated and maintained by **Codingqueen40**.

> This is the public showcase repository. It contains **only** extracted, self-contained packages and a written case study. No private application code, credentials, analytics keys, pricing rules, affiliate data or personal information live here — by design.

## Packages

| Package | What it is | Status |
|---------|------------|--------|
| [`pinyin-tone-colors`](./packages/pinyin-tone-colors) | Colour Mandarin hanzi & pinyin by tone — zero-dependency core + optional React component. | ✅ Available |
| [`adaptive-placement`](./packages/adaptive-placement) | Domain-agnostic “staircase” adaptive level-test engine. Pure logic, fully unit-tested. | ✅ Available |
| [`streak-flame`](./packages/streak-flame) | Animated CSS streak flame with tiered intensity and `prefers-reduced-motion` support. | ✅ Available |

## Engineering case study

**→ Read the [case study](./docs/case-study.md).**

A write-up of how the underlying app is built: a server-first **Next.js** application with React Server Components and Tailwind, spaced-repetition scheduling via `ts-fsrs`, a PostgreSQL data layer, self-hosted authentication (**Better Auth**) and **Stripe** billing — deployed on EU-hosted infrastructure for a GDPR-aligned, sovereign stack. It covers the architecture (with a diagram), the testing philosophy, and the reasoning behind the load-bearing decisions:

- [ADR 0001 — An EU-sovereign, self-hosted-auth stack](./docs/adr/0001-eu-sovereign-stack.md)
- [ADR 0002 — Adopt a proven spaced-repetition library instead of rolling my own](./docs/adr/0002-adopt-fsrs.md)
- [ADR 0003 — Pre-generate audio in batch rather than calling live TTS](./docs/adr/0003-batch-precomputed-audio.md)
- [ADR 0004 — Enforce entitlement on the server](./docs/adr/0004-server-enforced-entitlement.md)

## Principles for what goes public

Everything here is reviewed before publication: no `.env` files or secrets, no payment keys, no exact access-gating thresholds or prices, no proprietary datasets, and no personal or corporate identifying data. Decision records describe the *reasoning* (for example, “entitlement is enforced server-side”), never the concrete values used in the private product.

## License

[MIT](./LICENSE) © Codingqueen40 — each package also carries its own MIT license.
