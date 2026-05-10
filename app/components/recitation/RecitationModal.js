"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MicButton      from "./MicButton";
import TranscriptView from "./TranscriptView";
import { compareAyah, compareRecitation } from "../../../lib/arabic";
import { withBismillah }                  from "../../../lib/quran";
import { T } from "../../../lib/theme";

export default function RecitationModal({
  ayah, surahName, surahNumber, ayahNumber,
  onClose, onResult,
  onNextAyah, hasNextAyah,
  autoStart = false,
}) {
  const expectedText = withBismillah(surahNumber, ayahNumber, ayah);

  const [listening,  setListening]  = useState(false);
  const [transcript, setTranscript] = useState("");
  const [comparison, setComparison] = useState(null);
  const [error,      setError]      = useState(null);
  const [supported,  setSupported]  = useState(true);

  const recognitionRef = useRef(null);
  const transcriptRef  = useRef("");
  const closingRef     = useRef(false);
  const comparedRef    = useRef(false);

  const liveWords = useMemo(() => {
    if (!listening || !transcript.trim()) return null;
    const expWords = expectedText.split(/\s+/).filter(Boolean);
    const recWords = transcript.split(/\s+/).filter(Boolean);
    if (recWords.length === 0) return null;
    return compareRecitation(expWords, recWords, { isLive: true, threshold: 0.5 });
  }, [listening, transcript, expectedText]);

  function runComparison() {
    if (closingRef.current || !transcriptRef.current || comparedRef.current) return;
    comparedRef.current = true;
    const result = compareAyah(expectedText, transcriptRef.current);
    setComparison(result);
    onResult?.({ surah: surahNumber, ayah: ayahNumber, score: result.score, passed: result.passed });
  }

  useEffect(() => {
    closingRef.current = false;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const r = new SR();
    r.lang = "ar-SA"; r.interimResults = true; r.continuous = true; r.maxAlternatives = 1;

    r.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) text += event.results[i][0].transcript;
      setTranscript(text);
      transcriptRef.current = text;
    };

    r.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow and try again.");
      } else if (event.error === "no-speech") {
        if (transcriptRef.current) runComparison();
        else setError("No speech detected. Try again.");
      } else if (event.error === "network") {
        setError("Network error. Check your connection.");
      } else {
        setError(`Recognition error: ${event.error}`);
      }
      setListening(false);
    };

    r.onend = () => { setListening(false); runComparison(); };
    recognitionRef.current = r;

    if (autoStart) {
      try { r.start(); setListening(true); } catch { /* ignore */ }
    }

    return () => { closingRef.current = true; try { r.abort(); } catch { /* ignore */ } };
  }, [ayah]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleListening() {
    if (!supported) return;
    if (listening) {
      runComparison();
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
      setListening(false);
    } else {
      setTranscript(""); transcriptRef.current = "";
      setComparison(null); comparedRef.current = false;
      setError(null);
      try { recognitionRef.current?.start(); setListening(true); }
      catch { setError("Could not start microphone. Please try again."); }
    }
  }

  function handleClose() {
    closingRef.current = true;
    try { recognitionRef.current?.abort(); } catch { /* ignore */ }
    setListening(false);
    onClose();
  }

  const hasResult    = comparison != null && !listening;
  const showNextAyah = hasResult && hasNextAyah;

  return (
    <>
      <style>{`
        .recitation-sheet { animation: sheetUp 0.28s cubic-bezier(0.32,0.72,0,1); }
      `}</style>

      {/* Backdrop */}
      <div onClick={handleClose} style={{
        position: "fixed", inset: 0,
        background: "rgba(28,25,23,0.45)",
        zIndex: 1000, backdropFilter: "blur(3px)",
      }} />

      {/* Bottom sheet */}
      <div className="recitation-sheet" style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        zIndex: 1001, display: "flex", justifyContent: "center",
      }}>
        <div style={{
          width: "100%", maxWidth: 680,
          background: T.bgPage,
          borderRadius: "22px 22px 0 0",
          padding: "12px 20px 40px",
          boxShadow: `0 -8px 40px rgba(28,25,23,0.16)`,
          maxHeight: "88vh", overflowY: "auto",
        }}>
          {/* Drag handle */}
          <div style={{
            width: 36, height: 4,
            background: T.borderStrong,
            borderRadius: T.radiusFull,
            margin: "0 auto 18px",
          }} />

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: T.textPrimary }}>
                {surahName}
              </h3>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: T.textTertiary }}>
                Ayah {ayahNumber}
              </p>
            </div>
            <button onClick={handleClose} style={{
              width: 32, height: 32, borderRadius: "50%",
              background: T.bgSubtle, border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 14, color: T.textSecondary, flexShrink: 0,
            }}>✕</button>
          </div>

          <TranscriptView
            expected={expectedText}
            transcript={transcript}
            listening={listening}
            comparison={comparison}
            liveWords={liveWords}
          />

          {error && (
            <div style={{
              marginTop: 12,
              background: T.redBg, border: `1px solid rgba(192,57,43,0.2)`,
              borderRadius: T.radiusSm, padding: "10px 14px",
            }}>
              <p style={{ margin: 0, fontSize: 13, color: T.red }}>{error}</p>
            </div>
          )}

          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 28 }}>
            <MicButton listening={listening} disabled={!supported} onClick={toggleListening} />
            <p style={{ margin: 0, fontSize: 12, color: listening ? T.red : T.textTertiary, fontWeight: 600 }}>
              {listening ? "Tap to stop" : comparison ? "Tap to recite again" : "Tap to begin"}
            </p>

            {showNextAyah && (
              <button onClick={onNextAyah} style={{
                marginTop: 4, padding: "14px",
                background: T.green,
                border: "none", borderRadius: T.radiusMd,
                fontSize: 15, fontWeight: 700,
                color: T.textInverse, cursor: "pointer",
                width: "100%", fontFamily: "inherit",
              }}>
                Next Ayah →
              </button>
            )}

            {hasResult && (
              <button onClick={toggleListening} style={{
                padding: "11px",
                background: "transparent",
                border: "none",
                fontSize: 14, fontWeight: 600,
                color: T.green,
                cursor: "pointer",
                width: "100%",
                fontFamily: "inherit",
              }}>
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
