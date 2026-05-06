/**
 * Speech recognition provider pattern.
 *
 * Current provider: WebSpeechProvider (browser Web Speech API).
 *
 * TODO: Swap to GoogleCloudProvider once GOOGLE_CLOUD_API_KEY is set.
 *   - Google Cloud STT with Chirp model is significantly more accurate for Arabic
 *   - Change PROVIDER constant below to "google" and set the key in .env.local
 *
 * TODO: OpenAI Whisper (/api/speech-to-text with Whisper endpoint) as a final upgrade.
 *   - Best overall Arabic accuracy, low latency with streaming
 */

const PROVIDER = "web"; // "web" | "google"

// ── WebSpeechProvider ─────────────────────────────────────────────────────────

export class WebSpeechProvider {
  /**
   * @param {{ onWords: (words: string[]) => void, onInterim: (text: string) => void }} opts
   */
  constructor({ onWords, onInterim }) {
    this._onWords   = onWords;
    this._onInterim = onInterim;
    this._r         = null;
    this._running   = false;
    this._finalText = "";
  }

  start() {
    const SR = typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) throw new Error("Speech recognition not supported in this browser.");

    const r = new SR();
    r.lang            = "ar-SA";
    r.interimResults  = true;
    r.continuous      = true;
    r.maxAlternatives = 1;

    r.onresult = event => {
      let final   = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) final   += event.results[i][0].transcript + " ";
        else                          interim += event.results[i][0].transcript;
      }
      if (final !== this._finalText) {
        this._finalText = final;
        this._onWords?.(final.trim().split(/\s+/).filter(Boolean));
      }
      this._onInterim?.(interim);
    };

    r.onerror = event => {
      // "no-speech" is normal — auto-restart keeps the session alive.
      if (event.error !== "no-speech" && event.error !== "aborted") {
        console.warn("SpeechRecognition error:", event.error);
      }
      if (this._running && event.error !== "not-allowed") {
        try { r.start(); } catch {}
      }
    };

    // Auto-restart on end so recognition stays continuous even across pauses.
    r.onend = () => {
      if (this._running) {
        try { r.start(); } catch {}
      }
    };

    this._r       = r;
    this._running = true;
    this._finalText = "";
    r.start();
  }

  stop() {
    this._running = false;
    try { this._r?.stop(); } catch {}
  }

  abort() {
    this._running = false;
    try { this._r?.abort(); } catch {}
  }

  reset() {
    this._finalText = "";
  }
}

// ── GoogleCloudProvider (stub) ────────────────────────────────────────────────
// TODO: Implement using the Cloud Speech-to-Text v2 API with the Chirp model.
// Records audio via MediaRecorder, sends chunks to /api/speech-to-text every 3 s,
// merges returned word arrays and calls onWords.

export class GoogleCloudProvider {
  constructor({ onWords, onInterim }) {
    this._onWords   = onWords;
    this._onInterim = onInterim;
  }

  start() {
    throw new Error(
      "GoogleCloudProvider is not yet implemented. " +
      "Set GOOGLE_CLOUD_API_KEY in .env.local and implement audio recording."
    );
  }

  stop()  {}
  abort() {}
  reset() {}
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function createSpeechProvider(opts) {
  return PROVIDER === "google"
    ? new GoogleCloudProvider(opts)
    : new WebSpeechProvider(opts);
}
