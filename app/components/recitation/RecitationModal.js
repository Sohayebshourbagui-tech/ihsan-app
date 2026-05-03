"use client";

import { useEffect, useRef, useState } from "react";
import MicButton      from "./MicButton";
import TranscriptView from "./TranscriptView";
import { compareAyah } from "../../../lib/arabic";

const G = "#1a8a4a";

export default function RecitationModal({ ayah, surahName, surahNumber, ayahNumber, onClose, onResult }) {
  const [listening,  setListening]  = useState(false);
  const [transcript, setTranscript] = useState("");
  const [comparison, setComparison] = useState(null);
  const [error,      setError]      = useState(null);
  const [supported,  setSupported]  = useState(true);

  const recognitionRef  = useRef(null);
  const transcriptRef   = useRef("");   // mirrors transcript state; avoids stale closures in onend
  const closingRef      = useRef(false); // suppresses comparison when modal is dismissed

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const r = new SR();
    r.lang            = "ar-SA";
    r.interimResults  = true;
    r.continuous      = true;
    r.maxAlternatives = 1;

    r.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
      transcriptRef.current = text;
    };

    r.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError("Microphone permission denied. Please allow access and try again.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Try again.");
      } else if (event.error === "network") {
        setError("Network error. Check your connection.");
      } else {
        setError(`Recognition error: ${event.error}`);
      }
      setListening(false);
    };

    r.onend = () => {
      setListening(false);
      if (!closingRef.current && transcriptRef.current) {
        const result = compareAyah(ayah, transcriptRef.current);
        setComparison(result);
        onResult?.({ surah: surahNumber, ayah: ayahNumber, score: result.score, passed: result.passed });
      }
    };

    recognitionRef.current = r;

    return () => {
      closingRef.current = true;
      try { r.abort(); } catch { /* ignore */ }
    };
  }, [ayah]);

  function toggleListening() {
    if (!supported) return;
    if (listening) {
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
      setListening(false);
    } else {
      setTranscript("");
      transcriptRef.current = "";
      setComparison(null);
      setError(null);
      try {
        recognitionRef.current?.start();
        setListening(true);
      } catch {
        setError("Could not start microphone. Please try again.");
      }
    }
  }

  function handleClose() {
    closingRef.current = true;
    try { recognitionRef.current?.abort(); } catch { /* ignore */ }
    setListening(false);
    onClose();
  }

  const showTryAgain = Boolean(comparison) && !listening;

  return (
    <>
      <style>{`
        @keyframes sheet-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .recitation-sheet {
          animation: sheet-up 0.28s cubic-bezier(0.32,0.72,0,1);
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          zIndex: 1000, backdropFilter: "blur(2px)",
        }}
      />

      {/* Bottom sheet */}
      <div
        className="recitation-sheet"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          zIndex: 1001,
          display: "flex", justifyContent: "center",
        }}
      >
        <div style={{
          width: "100%", maxWidth: 680,
          background: "#fff",
          borderRadius: "24px 24px 0 0",
          padding: "12px 20px 36px",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          maxHeight: "85vh",
          overflowY: "auto",
        }}>
          {/* Drag handle */}
          <div style={{
            width: 36, height: 4, background: "#e5e7eb",
            borderRadius: 99, margin: "0 auto 16px",
          }}/>

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", marginBottom: 18,
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: G,
                          letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Recitation
              </p>
              <h3 style={{ margin: "3px 0 0", fontSize: 17, fontWeight: 800, color: "#111827" }}>
                {surahName} · Ayah {ayahNumber}
              </h3>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "#f3f4f6", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 16, color: "#6b7280", flexShrink: 0,
              }}
            >✕</button>
          </div>

          {/* Transcript + comparison view */}
          <TranscriptView
            expected={ayah}
            transcript={transcript}
            listening={listening}
            comparison={comparison}
          />

          {/* Error message */}
          {error && (
            <div style={{
              marginTop: 10, background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 10, padding: "10px 14px",
            }}>
              <p style={{ margin: 0, fontSize: 13, color: "#dc2626" }}>{error}</p>
            </div>
          )}

          {/* Controls */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 10, marginTop: 24,
          }}>
            <MicButton
              listening={listening}
              disabled={!supported}
              onClick={toggleListening}
            />
            <p style={{ margin: 0, fontSize: 12, color: listening ? "#dc2626" : "#9ca3af", fontWeight: 600 }}>
              {listening ? "Tap to stop" : comparison ? "Tap to recite again" : "Tap to recite"}
            </p>

            {showTryAgain && (
              <button
                onClick={toggleListening}
                style={{
                  marginTop: 4, padding: "9px 24px",
                  background: "#f9fafb", border: "1.5px solid #e5e7eb",
                  borderRadius: 10, fontSize: 13, fontWeight: 700,
                  color: "#374151", cursor: "pointer",
                }}
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
