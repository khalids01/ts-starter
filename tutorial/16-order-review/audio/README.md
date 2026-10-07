# Audio input

Provide one narration file per scene: `01.wav`, `02.wav`, `03.wav`, `04.wav` (MP3 and M4A also work). Read the corresponding paragraphs in `../narration.txt`, without headings. Keep a short natural pause at the end.

Alternatively provide `narration.wav` (or `.mp3`/`.m4a`) plus `cues.json` with the exact start/end seconds for each paragraph. Use `cues.example.json` as its structure; fill times from the supplied audio, never guessed timestamps.
