# ADR 0002 — Adopt a proven spaced-repetition library instead of rolling my own

**Status:** Accepted · **Context:** spaced repetition is the core loop

## Context

The heart of the product is the daily review loop, which needs a spaced-repetition scheduler. Modern algorithms like FSRS are the result of large-scale data analysis and years of refinement; a naive hand-rolled scheduler (or a re-implementation of an older algorithm) would be both worse for learners and a long-lived source of subtle bugs. Scheduling is exactly the kind of well-solved, high-stakes problem where "build it myself" is the wrong instinct.

## Decision

Use a mature, permissively licensed FSRS implementation (`ts-fsrs`, MIT) for scheduling. Keep my own code to a thin, well-typed adapter that maps the app's four rating buttons onto the library and persists the resulting scheduling state per user and per card — and keep that adapter pure so it can be unit-tested without a database.

## Consequences

- **Positive:** learners get a state-of-the-art schedule from day one; the scheduling surface I own is small and testable; upstream improvements come essentially for free.
- **Negative:** a dependency on an external library and its release cadence; I must understand its model well enough to adapt it correctly rather than treating it as a black box.
- **Principle:** buy (or adopt) the well-solved algorithm; build only the thin, testable seam that connects it to your domain.
