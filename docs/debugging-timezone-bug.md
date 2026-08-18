# Debugging: the daily quota that reset at the wrong moment

> **What this is** — a write-up of one bug fix, from symptom to hardening.
> Written to be published as-is: no secrets, no pricing, no commercial
> thresholds, no personal data.
> **Fix**: commit `474c20d` in the app, 2026-08-01 — 2 files, 59 insertions.

---

## Context, in three sentences

The app is a spaced-repetition tool for Chinese vocabulary. Every day a learner
gets their due cards plus a quota of **new cards** — capped, because the
overload is what makes people quit.

That quota resets "every day". The whole bug lives in what "day" means.

---

## 1. The symptom, as a user would have hit it

Nobody reported it. That is the first interesting thing about this bug: it was
**silent**, and it would likely have stayed silent for a long time.

Here is what a learner in Hong Kong would have seen. They study in the evening
and finish their new-card quota. Next morning at 7am they open the app:
**no new cards**. The counter still thinks it is yesterday. They have to wait
until 8am for the day to roll over.

A learner in Los Angeles gets the opposite, and worse: their day starts at
**5pm the previous evening**. Studying after dinner eats into tomorrow's quota.

No error, no crash, nothing in the logs. Just an app that "counts days wrong" —
exactly the kind of behaviour a user blames on themselves before reporting it.

---

## 2. Why it stayed invisible

Three reasons stacked up, and together they explain how it survived months of
development.

**Development happens in Paris.** In summer Paris is UTC+2. The gap between
"UTC midnight" and "local midnight" is two hours — a window between midnight and
2am that nobody tests in.

**The code announced its own debt.** The comment read:

```ts
// Timezone: UTC for now (real user timezone in 4.7 streaks).
function startOfDayUtc(d: Date): Date { … }
```

Honest, but a `// for now` raises no alarm. It was even tracked as technical
debt — so it was *known*, just filed as cosmetic, because nobody had measured
what it actually did.

**The rest of the app already did this correctly.** A `day.ts` module existed,
tested, handling civil days per IANA timezone including DST transitions. The
streak feature and the dashboard both used it. Only the review queue had rolled
its own. The surrounding consistency hid the outlier.

---

## 3. The investigation

The starting point was not a bug report but a technical-debt review: *"migrate
the review queue from UTC to the user's timezone"* — one line in the project
tracker.

The useful first question was not *how do I fix this* — the fix was obvious —
but **is this worth fixing at all**. Debt filed as cosmetic can legitimately
stay that way.

Hence the decision to **measure before fixing**.

### The measurement

A ten-line script comparing old and new computation for the same instant: a user
opening the app at **7am local time**, in three timezones.

```
Asia/Hong_Kong        old(UTC)=2026-08-01T00:00Z   new=2026-08-01T16:00Z   ⚠️ DIFFERENT
Europe/Paris          old(UTC)=2026-08-02T00:00Z   new=2026-08-01T22:00Z   ⚠️ DIFFERENT
America/Los_Angeles   old(UTC)=2026-08-02T00:00Z   new=2026-08-02T07:00Z   ⚠️ DIFFERENT
```

The result changed the priority of the task.

- **Hong Kong**: the old computation placed the start of day **31 hours** before
  the current instant. The window swallowed the whole local previous day, so
  yesterday's cards counted against today's quota — which therefore looked
  already spent.
- **Los Angeles**: day started at 5pm the previous evening.
- **Paris**: two hours off. Marginal, but **wrong too**.

**All three timezones were wrong, including the development one and the default
one.** This was not an exotic edge case. It was the nominal behaviour,
everywhere.

---

## 4. Root cause

The code computed the start of day like this:

```ts
new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
```

That is UTC midnight of the current UTC day. Correct if every user lives in
Greenwich.

The cause was not ignorance of timezones — the project had already solved that
problem elsewhere. It was **duplication**: a local helper, written early to
unblock a feature, never replaced by the dedicated module that appeared later.
The `timeZone` column had existed in the database for weeks, and its schema
comment even announced this module as its future consumer.

Every piece was already there. They had simply never been connected.

---

## 5. The fix

Minimal, because the correct logic already existed:

```diff
-// Timezone: UTC for now (real user timezone in 4.7 streaks).
-function startOfDayUtc(d: Date): Date {
-  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
-}
+const FALLBACK_TIME_ZONE = "Europe/Paris";

-      select: { startLevel: true, dailyGoal: true },
+      select: { startLevel: true, dailyGoal: true, timeZone: true },

-    where: { userId, createdAt: { gte: startOfDayUtc(now) } },
+    where: { userId, createdAt: { gte: startOfDayInTZ(now, timeZone) } },
```

Two deliberate details:

- **The fallback is not UTC** but the same value as the schema default. If the
  user row cannot be read, we degrade to something consistent with the rest of
  the system — not to the bug we just fixed.
- **Deleting the local helper is the real fix.** As long as it existed, it could
  be reused somewhere else.

Checking the problem exists nowhere else:

```bash
grep -rn "getUTCDate\|Date.UTC(" src/ --exclude="*.test.ts" --exclude-dir=generated
# → no matches
```

---

## 6. Hardening — the most useful part

The fix moved a responsibility: `day.ts` now backed the review queue for
**any timezone a user picks**, while its 12 tests only covered `Europe/Paris`.

Fixing a bug by relocating the risk is not fixing a bug. Five tests were added,
chosen for what they cover rather than for the count:

| Case | Why this one |
|---|---|
| `Asia/Hong_Kong` (UTC+8) | Positive offset, **no** DST — the case that broke |
| `America/Los_Angeles`, summer (UTC−7) | **Negative offset**: a classic source of sign errors |
| `America/Los_Angeles`, winter (UTC−8) | Same zone, different offset by season |
| Two users, same instant | Hong Kong is already "tomorrow" while Los Angeles is still "yesterday" |

The last one matters most: it **documents the stake** rather than a value. It
states that two people at the same instant must see their quota reset at
different moments — which is precisely the business rule the code was breaking.

Total: **17 tests** on the module; full suite at 135 at the time of the fix.

---

## 7. What this one taught

**Tracked debt is not assessed debt.** This was written down, in the tracker and
in the code, and it would have stayed there. What changed its priority was not a
closer reading — it was a ten-line script that turned "known approximation" into
"31 hours off in Hong Kong".

**A development environment can hide an entire class of bugs.** Working at UTC+2
made this nearly invisible. That is not specific to timezones: it holds for any
assumption your dev machine happens to make true — locale, case-insensitive
filesystem, zero network latency.

**Duplication is a risk, not just inelegance.** There was no knowledge gap here:
the correct module existed, tested, used elsewhere. One forgotten copy was
enough to produce wrong behaviour in 100% of timezones.

**Fixing means checking you did not relocate the risk.** The module inheriting a
responsibility has to be tested for that responsibility — otherwise you have
traded a known bug for a future one.

---

## Appendix — reproducing the measurement

```ts
import { startOfDayInTZ } from "@/lib/day";

const utcMidnight = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

for (const [tz, local] of [
  ["Asia/Hong_Kong",      "2026-08-02T07:00:00+08:00"],
  ["Europe/Paris",        "2026-08-02T07:00:00+02:00"],
  ["America/Los_Angeles", "2026-08-02T07:00:00-07:00"],
] as const) {
  const now = new Date(local);
  console.log(tz, utcMidnight(now).toISOString(), startOfDayInTZ(now, tz).toISOString());
}
```
