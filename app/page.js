"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "./components/BottomNav";
import { T } from "../lib/theme";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const DAILY_VERSES = [
  { ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",                        en: "Indeed, with hardship comes ease.",            ref: "94:6"  },
  { ar: "فَاذْكُرُونِي أَذْكُرْكُمْ",                          en: "Remember Me, and I will remember you.",        ref: "2:152" },
  { ar: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",     en: "Whoever fears Allah, He will find a way out.",  ref: "65:2"  },
  { ar: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",                    en: "Indeed, Allah is with the patient.",            ref: "2:153" },
  { ar: "وَقُل رَّبِّ زِدْنِي عِلْمًا",                        en: "And say: My Lord, increase me in knowledge.",   ref: "20:114"},
  { ar: "وَذَكِّرْ فَإِنَّ الذِّكْرَى تَنفَعُ الْمُؤْمِنِينَ", en: "Remind, for reminders benefit the believers.", ref: "51:55" },
  { ar: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",            en: "Seek help through patience and prayer.",        ref: "2:45"  },
];

function parseMinutes(timeStr) {
  const [h, m] = timeStr.split(" ")[0].split(":").map(Number);
  return h * 60 + m;
}

function toAmPm(timeStr) {
  const [h, m] = timeStr.split(" ")[0].split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function nextPrayerFrom(timings) {
  const cur = new Date().getHours() * 60 + new Date().getMinutes();
  return PRAYERS.find((p) => parseMinutes(timings[p]) > cur) || PRAYERS[0];
}

export default function Home() {
  const router = useRouter();
  const [query, setQuery]           = useState("");
  const [prayerData, setPrayerData] = useState(null);
  const [prayerErr, setPrayerErr]   = useState("");
  const inputRef = useRef(null);

  const dailyVerse = DAILY_VERSES[new Date().getDate() % DAILY_VERSES.length];

  useEffect(() => {
    if (!navigator.geolocation) { setPrayerErr("Geolocation unavailable"); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        try {
          const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=4`);
          const json = await res.json();
          setPrayerData(json.data);
        } catch { setPrayerErr("Could not load prayer times"); }
      },
      () => setPrayerErr("Enable location for prayer times"),
    );
  }, []);

  function handleAsk(e) {
    e.preventDefault();
    const q = query.trim();
    if (q) sessionStorage.setItem("scholarly_init_q", q);
    router.push("/scholarly");
  }

  const nextPrayer = prayerData ? nextPrayerFrom(prayerData.timings) : null;
  const hijri      = prayerData?.date?.hijri;
  const hijriStr   = hijri ? `${hijri.day} ${hijri.month.en} ${hijri.year} AH` : "";

  return (
    <div style={{ minHeight: "100vh", background: T.bgPage, paddingBottom: 80 }}>

      {/* ── Header bar ── */}
      <header style={{
        background: T.bgCard,
        borderBottom: `1px solid ${T.border}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: 680, margin: "0 auto",
          padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Wordmark */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: T.textPrimary, letterSpacing: "-0.3px" }}>
                Ihsan
              </span>
              <span style={{ fontFamily: T.fontArabic, fontSize: 18, color: T.green, fontWeight: 400 }}>
                إحسان
              </span>
            </div>
            {hijriStr && (
              <div style={{ fontSize: 11, color: T.textTertiary, marginTop: 1 }}>
                {hijriStr}
              </div>
            )}
          </div>

        </div>
      </header>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* ── Daily Verse — spiritual anchor ── */}
        <div style={{ padding: "36px 24px 28px", textAlign: "center" }}>
          <p style={{
            fontFamily: T.fontArabic,
            fontSize: 26,
            direction: "rtl",
            lineHeight: 2.2,
            color: T.textPrimary,
            margin: "0 0 12px",
          }}>
            {dailyVerse.ar}
          </p>
          <p style={{
            fontSize: 14,
            color: T.textSecondary,
            fontStyle: "italic",
            lineHeight: 1.7,
            margin: "0 0 10px",
          }}>
            {dailyVerse.en}
          </p>
          <span style={{ fontSize: 11, color: T.green, fontWeight: 600, letterSpacing: "0.04em" }}>
            {dailyVerse.ref}
          </span>
        </div>

        {/* ── Ask Scholarly.AI ── */}
        <div style={{ padding: "24px 20px 0" }}>
          <form onSubmit={handleAsk}>
            <div style={{
              display: "flex", alignItems: "center",
              background: T.bgInset,
              border: `1.5px solid ${T.border}`,
              borderRadius: T.radiusMd,
              padding: "0 6px 0 16px",
              transition: "border-color 0.18s, box-shadow 0.18s",
            }}
              onFocusCapture={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,138,74,0.08)"; }}
              onBlurCapture={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
            >
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="What does the Quran say about…"
                style={{
                  flex: 1, border: "none", background: "transparent",
                  fontSize: 15, color: T.textPrimary, padding: "15px 0",
                  fontFamily: "inherit", outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  flexShrink: 0, width: 40, height: 40,
                  background: query.trim() ? T.green : T.bgSubtle,
                  color: query.trim() ? T.textInverse : T.textTertiary,
                  border: "none", borderRadius: T.radiusSm,
                  fontSize: 16, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                →
              </button>
            </div>
          </form>
        </div>

        {/* ── Prayer Times ── */}
        <div style={{ padding: "24px 20px 0" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.textTertiary, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
            Prayer Times
          </div>
          {prayerErr ? (
            <p style={{ fontSize: 13, color: T.textTertiary, margin: 0, padding: "8px 0" }}>{prayerErr}</p>
          ) : !prayerData ? (
            <div style={{ display: "flex", gap: 6 }}>
              {PRAYERS.map(p => (
                <div key={p} style={{
                  flex: 1, height: 52, borderRadius: T.radiusSm,
                  background: T.bgSubtle,
                }} className="animate-shimmer" />
              ))}
            </div>
          ) : (
            <div style={{
              display: "flex", gap: 4,
              background: T.bgSubtle,
              borderRadius: T.radiusMd,
              padding: 4,
            }}>
              {PRAYERS.map(p => {
                const active = p === nextPrayer;
                return (
                  <div key={p} style={{
                    flex: 1, padding: "8px 4px", borderRadius: T.radiusSm, textAlign: "center",
                    background: active ? T.green : "transparent",
                    transition: "background 0.2s",
                  }}>
                    <div style={{
                      fontSize: 9, fontWeight: 700,
                      color: active ? "rgba(255,255,255,0.75)" : T.textTertiary,
                      textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4,
                    }}>
                      {p}
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 600,
                      color: active ? T.textInverse : T.textSecondary,
                    }}>
                      {toAmPm(prayerData.timings[p])}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ height: 16 }} />
      </div>

      <BottomNav />
    </div>
  );
}
