import { NextResponse } from "next/server";

/**
 * POST /api/speech-to-text
 *
 * Accepts: { audio: string (base64), encoding: string, sampleRate: number, language: string }
 * Returns: { transcript: string, words: string[] }
 *
 * TODO: Implement with Google Cloud Speech-to-Text v2 (Chirp model) for best Arabic accuracy.
 * TODO: OpenAI Whisper as alternative — send the audio buffer to the Whisper API endpoint.
 *
 * To enable: set GOOGLE_CLOUD_API_KEY in .env.local
 */
export async function POST(request) {
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Set GOOGLE_CLOUD_API_KEY in .env.local to enable server-side STT." },
      { status: 501 }
    );
  }

  try {
    const { audio, encoding = "WEBM_OPUS", sampleRate = 48000, language = "ar-SA" } = await request.json();

    if (!audio) {
      return NextResponse.json({ error: "Missing audio field." }, { status: 400 });
    }

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            encoding,
            sampleRateHertz:      sampleRate,
            languageCode:         language,
            enableWordTimeOffsets: false,
            model:                "latest_long",
          },
          audio: { content: audio },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json({ error: err.error?.message ?? "STT request failed." }, { status: 502 });
    }

    const data       = await response.json();
    const transcript = data.results?.[0]?.alternatives?.[0]?.transcript ?? "";
    const words      = transcript.trim().split(/\s+/).filter(Boolean);

    return NextResponse.json({ transcript, words });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
