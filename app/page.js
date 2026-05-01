"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const G  = "#1a8a4a";
const G2 = "#2ea55f";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const FEATURES = [
  { emoji: "📖", name: "Quran",      href: "/quran",      bg: "#EBF5FF", circle: "#BFDBFE" },
  { emoji: "🤲", name: "Duas",       href: "/duas",       bg: "#F5F0FF", circle: "#DDD6FE" },
  { emoji: "🧭", name: "Qibla",      href: "/qibla",      bg: "#ECFDF5", circle: "#A7F3D0" },
  { emoji: "📜", name: "Hadith",     href: "/hadith",     bg: "#FFFBEB", circle: "#FDE68A" },
  { emoji: "📅", name: "Calendar",   href: "/calendar",   bg: "#FFF1F2", circle: "#FECDD3" },
  { emoji: "🧠", name: "Quiz",       href: "/quiz",       bg: "#F0FDF4", circle: "#BBF7D0" },
  { emoji: "📝", name: "Hifz",       href: "/hifz",       bg: "#EEF2FF", circle: "#C7D2FE" },
  { emoji: "🎙️", name: "Recitation", href: "/recitation", bg: "#FFF7ED", circle: "#FED7AA" },
];

/* Repeating diamond + dot geometric pattern rendered as an SVG overlay */
function GeoPattern({ id, opacity = 0.12 }) {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity, pointerEvents: "none" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={id} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30 2 L58 30 L30 58 L2 30 Z" fill="none" stroke="white" strokeWidth="0.8" />
          <path d="M30 16 L44 30 L30 44 L16 30 Z" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="30" cy="30" r="2"   fill="white" />
          <circle cx="0"  cy="0"  r="1.5" fill="white" />
          <circle cx="60" cy="0"  r="1.5" fill="white" />
          <circle cx="0"  cy="60" r="1.5" fill="white" />
          <circle cx="60" cy="60" r="1.5" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

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

function Sk({ w = "100%", h = 14, radius = 4, dark = false }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: dark ? "rgba(255,255,255,0.2)" : "#efefef",
    }} />
  );
}

const gap = <div style={{ height: 10, background: "#f8f9fa" }} />;

export default function Home() {
  const [prayerData, setPrayerData] = useState(null);
  const [city, setCity]             = useState("");
  const [prayerErr, setPrayerErr]   = useState("");
  const [ayah, setAyah]             = useState(null);
  const [hadith, setHadith]         = useState(null);
  const [hadithErr, setHadithErr]   = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) { setPrayerErr("Geolocation unavailable"); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        try {
          const [pRes, gRes] = await Promise.all([
            fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=4`),
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`),
          ]);
          const pJson = await pRes.json();
          const gJson = await gRes.json();
          setPrayerData(pJson.data);
          const a = gJson.address || {};
          setCity(a.city || a.town || a.county || a.state || "");
        } catch { setPrayerErr("Could not load prayer times"); }
      },
      () => setPrayerErr("Enable location to see prayer times"),
    );
  }, []);

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/ayah/random/editions/quran-uthmani,en.sahih")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.data)) setAyah(d.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("https://random-hadith-generator.vercel.app/bukhari/")
      .then(r => r.json())
      .then(d => {
        if (d.data?.hadith_english) setHadith(d.data);
        else setHadithErr(true);
      })
      .catch(() => setHadithErr(true));
  }, []);

  const nextPrayer  = prayerData ? nextPrayerFrom(prayerData.timings) : null;
  const arabicAyah  = ayah?.[0];
  const englishAyah = ayah?.[1];
  const hijri       = prayerData?.date?.hijri;
  const hijriStr    = hijri ? `${hijri.day} ${hijri.month.en} ${hijri.year} AH` : "";

  return (
    <>
      <style>{`
        .feat-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .feat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.10) !important; }
        .feat-card:hover .feat-name { color: ${G} !important; }
        .ask-btn { transition: all 0.15s ease; }
        .ask-btn:hover { background: ${G} !important; color: #fff !important; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>

        {/* ── Navbar ── */}
        <nav style={{
          background: `linear-gradient(135deg, #157a3c 0%, ${G} 55%, ${G2} 100%)`,
          width: "100%",
          boxShadow: "0 2px 16px rgba(26,138,74,0.32)",
          position: "relative",
          overflow: "hidden",
        }}>
          <GeoPattern id="geoNav" opacity={0.13} />
          <div style={{
            maxWidth: 680, margin: "0 auto", padding: "13px 20px 15px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            position: "relative", zIndex: 1,
          }}>
            <div>
              <div style={{ color: "#fff", fontSize: 19, fontWeight: 700, lineHeight: 1.2 }}>
                Ihsan <span style={{ fontFamily: "Amiri, serif", fontWeight: 400 }}>إحسان</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 11, marginTop: 3, letterSpacing: "0.03em" }}>
                {hijriStr}
              </div>
            </div>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 22 }}>☽</span>
          </div>
        </nav>

        {/* ── Feed ── */}
        <div style={{ maxWidth: 680, margin: "0 auto", paddingBottom: 60 }}>

          {/* Prayer Times */}
          <div style={{
            background: `linear-gradient(135deg, #146e38 0%, ${G} 50%, ${G2} 100%)`,
            padding: "22px 20px 20px",
            boxShadow: "0 4px 20px rgba(26,138,74,0.22)",
            position: "relative",
            overflow: "hidden",
          }}>
            <GeoPattern id="geoPrayer" opacity={0.09} />
            <div style={{ position: "relative", zIndex: 1 }}>
              {prayerErr ? (
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0 }}>{prayerErr}</p>
              ) : !prayerData ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Sk w={150} h={13} dark />
                  <Sk w={220} h={38} radius={6} dark />
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    {PRAYERS.map(p => <Sk key={p} w="100%" h={52} radius={10} dark />)}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.58)", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: 5 }}>
                      Next Prayer{city && ` · ${city}`}
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                      <span style={{ fontSize: 38, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.1 }}>{nextPrayer}</span>
                      <span style={{ fontSize: 20, color: "rgba(255,255,255,0.78)", fontWeight: 500 }}>{toAmPm(prayerData.timings[nextPrayer])}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {PRAYERS.map(p => {
                      const active = p === nextPrayer;
                      return (
                        <div key={p} style={{
                          flex: 1, padding: "10px 6px", borderRadius: 10, textAlign: "center",
                          background: active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)",
                          border: `1px solid ${active ? "rgba(255,255,255,0.44)" : "rgba(255,255,255,0.12)"}`,
                        }}>
                          <div style={{ fontSize: 10, color: active ? "#fff" : "rgba(255,255,255,0.58)", fontWeight: active ? 700 : 400, marginBottom: 3 }}>{p}</div>
                          <div style={{ fontSize: 12, color: active ? "#fff" : "rgba(255,255,255,0.72)", fontWeight: active ? 700 : 400 }}>{toAmPm(prayerData.timings[p])}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {gap}

          {/* Features 4×2 */}
          <div style={{ background: "#fff", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: G, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 14 }}>Explore</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {FEATURES.map(({ emoji, name, href, bg, circle }) => (
                <Link key={href} href={href} style={{ textDecoration: "none" }}>
                  <div
                    className="feat-card"
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: 9, padding: "16px 8px 14px",
                      borderRadius: 14,
                      background: bg,
                      borderLeft: `3px solid ${G}28`,
                      cursor: "pointer",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%",
                      background: circle,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20,
                    }}>
                      {emoji}
                    </div>
                    <span className="feat-name" style={{ fontSize: 12, fontWeight: 600, color: "#2a2a2a", textAlign: "center" }}>{name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {gap}

          {/* Ayah of the Day */}
          <div style={{
            background: "#fff",
            borderLeft: `4px solid ${G}`,
            padding: "20px 22px 20px 18px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Watermark quotation mark */}
            <div style={{
              position: "absolute", top: -8, right: 10,
              fontSize: 140, fontFamily: "Amiri, serif",
              color: G, opacity: 0.055, lineHeight: 1,
              pointerEvents: "none", userSelect: "none",
            }}>﴿</div>
            <p style={{ fontSize: 11, fontWeight: 800, color: G, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 14, position: "relative" }}>
              Ayah of the Day
            </p>
            {!arabicAyah ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <Sk w="100%" h={22} />
                <Sk w="80%"  h={22} />
                <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 5 }}>
                  <Sk w="100%" h={13} />
                  <Sk w="70%"  h={13} />
                </div>
              </div>
            ) : (
              <>
                <p style={{ fontFamily: "Amiri, serif", fontWeight: 400, fontSize: 24, direction: "rtl", textAlign: "right", lineHeight: 2.05, color: "#0d0d0d", marginBottom: 12, position: "relative" }}>
                  {arabicAyah.text}
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.72, color: "#606060", marginBottom: 10 }}>
                  {englishAyah?.text}
                </p>
                <p style={{ fontSize: 12, fontWeight: 700, color: G }}>
                  {arabicAyah.surah?.englishName} · {arabicAyah.surah?.number}:{arabicAyah.numberInSurah}
                </p>
              </>
            )}
          </div>

          {gap}

          {/* Hadith of the Day */}
          <div style={{
            background: "#fff",
            borderLeft: `4px solid ${G}`,
            padding: "20px 22px 20px 18px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Decorative calligraphy mark */}
            <div style={{
              position: "absolute", bottom: 10, right: 14,
              fontFamily: "Amiri, serif",
              fontSize: 52, color: G, opacity: 0.06, lineHeight: 1,
              pointerEvents: "none", userSelect: "none",
            }}>ﷺ</div>
            <p style={{ fontSize: 11, fontWeight: 800, color: G, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 14 }}>
              Hadith of the Day
            </p>
            {hadithErr ? (
              <p style={{ fontSize: 13, color: "#bbb", fontStyle: "italic" }}>Could not load hadith. Try again later.</p>
            ) : !hadith ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Sk w="95%"  h={13} />
                <Sk w="100%" h={13} />
                <Sk w="85%"  h={13} />
                <Sk w="60%"  h={13} />
              </div>
            ) : (
              <>
                {hadith.header && (
                  <p style={{ fontSize: 12, color: "#aaa", fontStyle: "italic", marginBottom: 10, lineHeight: 1.5 }}>
                    {hadith.header}
                  </p>
                )}
                <p style={{ fontSize: 14, lineHeight: 1.82, color: "#444", marginBottom: 10 }}>
                  {hadith.hadith_english}
                </p>
                <p style={{ fontSize: 12, fontWeight: 700, color: G }}>
                  {hadith.bookName}{hadith.refno ? ` · ${hadith.refno}` : ""}
                </p>
              </>
            )}
          </div>

          {gap}

          {/* Scholarly AI Banner */}
          <div style={{
            background: `linear-gradient(135deg, #0d5e2e 0%, #146e38 45%, ${G} 100%)`,
            margin: "0 16px",
            borderRadius: 16,
            padding: "24px 22px",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
            boxShadow: "0 6px 28px rgba(13,94,46,0.38)",
            position: "relative",
            overflow: "hidden",
          }}>
            <GeoPattern id="geoScholar" opacity={0.13} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 5, letterSpacing: "-0.2px" }}>
                Scholarly.Ai <span style={{ fontSize: 14, opacity: 0.9 }}>✦</span>
              </p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                Ask any Islamic question from authentic sources
              </p>
            </div>
            <Link href="/scholarly" style={{ textDecoration: "none", flexShrink: 0, position: "relative", zIndex: 1 }}>
              <div className="ask-btn" style={{
                background: "#fff", color: G,
                fontWeight: 700, fontSize: 13,
                padding: "10px 20px", borderRadius: 22,
                whiteSpace: "nowrap",
                boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
              }}>
                Ask →
              </div>
            </Link>
          </div>

          <div style={{ height: 20 }} />

        </div>
      </div>
    </>
  );
}
