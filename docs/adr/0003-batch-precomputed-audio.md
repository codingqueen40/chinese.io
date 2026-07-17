# ADR 0003 — Pre-generate audio in batch rather than calling live TTS

**Status:** Accepted · **Context:** native-quality audio on every card

## Context

Every review card needs native-quality spoken audio for the word and its example sentence, with correct tones and correct readings for polyphonic characters. The obvious approach — call a text-to-speech API live when a card is shown — is simple but wrong for this case: the vocabulary is a **finite, known set**, so paying (in latency and money) to synthesise the same handful of items over and over, on every review, is pure waste. Pronunciation accuracy also matters more than expressive "narration," which points to a different tool than a live conversational voice.

## Decision

Treat audio as a **build-time asset, not a runtime call.** Generate the audio for the entire finite vocabulary **once**, in batch, using a synthesis engine that allows explicit phonetic control (to force correct tones and disambiguate polyphones), store the files in EU object storage keyed by a stable identifier, and serve them statically. No TTS call happens at review time.

## Consequences

- **Positive:** zero recurring TTS cost and zero runtime latency; the audio can be reviewed for pronunciation quality before it ships; it works offline later without changes.
- **Negative:** regeneration is a deliberate batch step when the vocabulary grows; storage of the generated files must be managed.
- **Principle:** when the input space is finite and known, precompute once and serve — don't pay per request for a fixed answer.
