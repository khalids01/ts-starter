# Narration audio

No audio has been generated for this prepared tutorial.

The synchronized pipeline reads the exact short sections in `../production.json`. Each section receives its own Heart/Kokoro WAV. A whole paragraph WAV cannot establish the shorter section boundaries and is not used by this pipeline.

After separate authorization, run `produce.ts audio` as described in the package README. It saves hash-addressed WAVs and resumable Voicebox receipts under `../artifacts/synchronized-audio/`. Capture probes actual WAV durations; rendering holds the matching spotlight for the full speech plus a short pause.

`cues.example.json` remains a reference for the older paragraph renderer. The synchronized pipeline writes measured section captions and `timeline.json`; it does not use guessed paragraph cues. Review captions against the final audio before publishing.
