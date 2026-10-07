# Voicebox narration

Keep the reverse SSH tunnel from your Mac running. Voicebox is reachable from Linux at `http://127.0.0.1:17493`.

The default voice is the Heart preset: profile `32138317-6b28-46d7-b611-66365ca94587`, Kokoro engine, `af_heart`. The client verifies the live preset before generation. No MCP installation is needed; it uses Voicebox's HTTP API.

## Prepare tutorial 1 (no generation)

```bash
bun tutorial/shared/voicebox.ts admin-overview
```

This checks that `narration.txt` matches the scene scripts and writes four request payloads under `tutorial/01-admin-overview/artifacts/voicebox/`. Requests explicitly select Kokoro, disable personality rewriting, normalize volume, and apply no effects. Qwen model settings and instructions are not used.

## Generate when ready

```bash
bun tutorial/shared/voicebox.ts admin-overview --generate
```

This submits each scene sequentially to `POST /generate`, polls `GET /history/{id}`, and downloads `GET /audio/{id}` into:

```text
tutorial/01-admin-overview/audio/01.wav
tutorial/01-admin-overview/audio/02.wav
tutorial/01-admin-overview/audio/03.wav
tutorial/01-admin-overview/audio/04.wav
```

No cue timestamps are needed for separate scene clips. Listen to each clip and check wording, pronunciation, and pacing before rendering. API success alone does not establish narration quality or synchronization with the recording.

The client saves generation IDs immediately and can resume a pending/download-failed scene without submitting it again. On rerun it keeps completed clips whose request and WAV hashes match their receipts, and resumes remaining scenes. It refuses to overwrite existing audio without matching receipts. Do not delete receipts unless you intend to create a new generation. A timeout during the initial POST may leave a generation on the Mac without a local ID; inspect Voicebox history before retrying.

Generated WAV files and request/result receipts are ignored by Git. This command changes neither Voicebox profiles/settings nor application data, and uploads nothing to YouTube. Voicebox will keep generation history on your Mac.

Override the API origin if you use another tunnel port:

```bash
VOICEBOX_URL=http://127.0.0.1:17494 bun tutorial/shared/voicebox.ts admin-overview --generate
```
