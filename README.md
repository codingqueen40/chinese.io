# chinese.io

Public showcase of reusable building blocks extracted from a production Mandarin-learning SaaS, with an engineering case study. Curated and maintained by **Codingqueen40**.

> This is the public showcase repository. It contains **only** extracted, self-contained packages and a written case study. No private application code, credentials, analytics keys, pricing rules, affiliate data or personal information live here — by design.

## Packages

| Package | What it is | Status |
|---------|------------|--------|
| [`pinyin-tone-colors`](./packages/pinyin-tone-colors) | Colour Mandarin hanzi & pinyin by tone — zero-dependency core + optional React component. | ✅ Available |
| `adaptive-placement` *(planned)* | Domain-agnostic “staircase” adaptive level-test engine. Pure logic, fully unit-tested. | 🔜 Next |
| `streak-flame` *(planned)* | Animated CSS streak flame with tiered intensity and `prefers-reduced-motion` support. | 🔜 Planned |

## Engineering case study *(in progress)*

A write-up of how the underlying app is built: a server-first **Next.js** application with React Server Components and Tailwind, spaced-repetition scheduling via `ts-fsrs`, a PostgreSQL data layer, self-hosted authentication (**Better Auth**) and **Stripe** billing — deployed on EU-hosted infrastructure for a GDPR-aligned, sovereign stack. Includes an architecture diagram, a testing philosophy, and a set of architecture decision records written as narrative (principles, not production values).

## Principles for what goes public

Everything here is reviewed before publication: no `.env` files or secrets, no payment keys, no exact access-gating thresholds or prices, no proprietary datasets, and no personal or corporate identifying data. Decision records describe the *reasoning* (for example, “entitlement is enforced server-side”), never the concrete values used in the private product.

## License

[MIT](./LICENSE) © Codingqueen40 — each package also carries its own MIT license.
