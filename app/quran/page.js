"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";

const G = "#1a8a4a";
const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ";
const BISMILLAH_EN = "In the name of Allah, the Entirely Merciful, the Especially Merciful.";


function WordSpan({ word, tooltip }) {
  if (!tooltip) return <>{word}</>;
  return (
    <span className="word-wrap">
      {word}
      <span className="tooltip">{tooltip}</span>
    </span>
  );
}

function AyahEndMarker({ n }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 26,
        height: 26,
        borderRadius: "50%",
        border: `1.5px solid ${G}`,
        color: G,
        fontSize: 9,
        fontFamily: "system-ui, sans-serif",
        verticalAlign: "middle",
        margin: "0 4px",
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {n}
    </span>
  );
}

export default function QuranPage() {
  const [surahs, setSurahs] = useState([]);
  const [search, setSearch] = useState("");
  const [surahNum, setSurahNum] = useState(1);
  const [mode, setMode] = useState("verse");

  const [arabic, setArabic] = useState(null);
  const [transl, setTransl] = useState(null);
  const [wordMap, setWordMap] = useState({});
  const [loadingSurahs, setLoadingSurahs] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then((r) => r.json())
      .then((d) => {
        setSurahs(d.data);
        setLoadingSurahs(false);
      })
      .catch(() => {
        setError("Failed to load surah list.");
        setLoadingSurahs(false);
      });
  }, []);

  useEffect(() => {
    setLoadingContent(true);
    setError("");
    setArabic(null);
    setTransl(null);
    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`).then((r) => r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/en.sahih`).then((r) => r.json()),
    ])
      .then(([a, t]) => {
        if (a.status !== "OK" || t.status !== "OK") throw new Error();
        setArabic(a.data);
        setTransl(t.data);
      })
      .catch(() => setError("Failed to load surah content."))
      .finally(() => setLoadingContent(false));
  }, [surahNum]);

  useEffect(() => {
    setWordMap({});
    fetch(
      `https://api.quran.com/api/v4/verses/by_chapter/${surahNum}` +
      `?words=true&word_fields=text_uthmani,translation_text&word_translation=true&per_page=300`
    )
      .then((r) => r.json())
      .then((data) => {
        const map = {};
        (data.verses || []).forEach((verse) => {
          map[verse.verse_number] = (verse.words || [])
            .filter((w) => w.char_type_name !== "end")
            .map((w) => ({
              text: w.text_uthmani,
              translation: w.translation_text || w.translation?.text || null,
            }));
        });
        setWordMap(map);
      })
      .catch(() => {}); // silent — tooltips simply won't show if this fails
  }, [surahNum]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return surahs;
    return surahs.filter(
      (s) =>
        s.number.toString().includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        (s.englishNameTranslation || "").toLowerCase().includes(q)
    );
  }, [surahs, search]);

  const meta = surahs.find((s) => s.number === surahNum);
  const ayahsAr = arabic?.ayahs || [];
  const ayahsEn = transl?.ayahs || [];

  // Returns the word list for an ayah from the quran.com word-by-word data.
  // Only skips Bismillah words if the quran.com data actually includes them
  // (detected by checking whether the first word contains بِسْمِ).
  function getWordList(ayah) {
    const words = wordMap[ayah.numberInSurah];
    if (!words) return null;
    if (surahNum !== 1 && surahNum !== 9 && ayah.numberInSurah === 1) {
      if (words[0]?.text?.includes("بِسْمِ")) return words.slice(4);
    }
    return words;
  }

  function getAyahText(ayah) {
    if (surahNum === 1 || surahNum === 9 || ayah.numberInSurah !== 1) return ayah.text;
    const words = ayah.text.trim().split(/\s+/);
    if (words[0]?.includes("بِسْمِ")) return words.slice(4).join(" ");
    return ayah.text;
  }

  function selectSurah(n) {
    setSurahNum(n);
    setSearch("");
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { opacity: 1; }
          50%  { opacity: 0.45; }
          100% { opacity: 1; }
        }
        .sk { animation: shimmer 1.6s ease-in-out infinite; background: #f3f4f6; border-radius: 6px; }
        .sb-btn:hover { background: #f0faf4 !important; }
        .mode-btn:hover { opacity: 0.85; }
        .surah-link { text-decoration: none; }
        .word-wrap { position: relative; display: inline-block; cursor: default; }
        .word-wrap .tooltip {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          background: #1a1a1a;
          color: #fff;
          font-size: 12px;
          font-family: system-ui, sans-serif;
          font-weight: 400;
          padding: 4px 10px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s ease;
          z-index: 100;
          direction: ltr;
          text-align: center;
        }
        .word-wrap:hover { background: #f0faf4; border-radius: 3px; }
        .word-wrap:hover .tooltip { opacity: 1; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#fff", color: "#111" }}>

        {/* ───── Sidebar ───── */}
        <aside
          style={{
            position: "fixed",
            top: 0, left: 0, bottom: 0, width: 280,
            borderRight: "1px solid #e5e7eb",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            zIndex: 20,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 12px 10px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search surah…"
              style={{
                width: "100%",
                padding: "9px 14px",
                borderRadius: 24,
                border: "1px solid #e5e7eb",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
                background: "#f9fafb",
                color: "#111",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ overflowY: "auto", flex: 1, padding: "6px 8px 20px" }}>
            {loadingSurahs
              ? Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={i}
                    className="sk"
                    style={{ height: 52, marginBottom: 4, borderRadius: 10 }}
                  />
                ))
              : filtered.map((s) => {
                  const active = s.number === surahNum;
                  return (
                    <button
                      key={s.number}
                      onClick={() => selectSurah(s.number)}
                      className={active ? undefined : "sb-btn"}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "9px 10px",
                        borderRadius: 10,
                        border: "none",
                        background: active ? G : "transparent",
                        color: active ? "#fff" : "#374151",
                        cursor: "pointer",
                        textAlign: "left",
                        marginBottom: 2,
                        transition: "background 0.12s",
                        fontFamily: "inherit",
                      }}
                    >
                      <span
                        style={{
                          minWidth: 28, height: 28, borderRadius: "50%",
                          background: active ? "rgba(255,255,255,0.22)" : "#f3f4f6",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700,
                          color: active ? "#fff" : G,
                          flexShrink: 0,
                        }}
                      >
                        {s.number}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>
                          {s.englishName}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.3, marginTop: 2 }}>
                          {s.englishNameTranslation}
                        </div>
                      </div>
                    </button>
                  );
                })}
          </div>
        </aside>

        {/* ───── Main ───── */}
        <main style={{ marginLeft: 280, flex: 1, background: "#fff" }}>

          {/* Top bar */}
          <div
            style={{
              position: "sticky", top: 0, zIndex: 10,
              background: "#fff",
              borderBottom: "1px solid #e5e7eb",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 36px",
            }}
          >
            <Link
              href="/"
              className="surah-link"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                color: G, fontSize: 13, fontWeight: 500,
                padding: "6px 16px", borderRadius: 20,
                border: `1px solid ${G}`, lineHeight: 1,
              }}
            >
              ← Home
            </Link>

            <div style={{ display: "inline-flex", background: "#f3f4f6", borderRadius: 24, padding: 3 }}>
              {[
                ["verse", "Verse by Verse"],
                ["arabic", "Arabic"],
                ["translation", "Translation"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className="mode-btn"
                  style={{
                    padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 500,
                    background: mode === id ? G : "transparent",
                    color: mode === id ? "#fff" : "#6b7280",
                    transition: "background 0.15s, color 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ maxWidth: 750, margin: "0 auto", padding: "52px 28px 100px" }}>

            {error && (
              <div
                style={{
                  background: "#fef2f2", color: "#dc2626",
                  padding: "12px 16px", borderRadius: 10,
                  fontSize: 14, marginBottom: 24,
                }}
              >
                {error}
              </div>
            )}

            {/* ── Surah header ── */}
            <header
              style={{
                textAlign: "center",
                marginBottom: 52,
                paddingBottom: 44,
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              {/* Arabic surah name */}
              <div
                style={{
                  fontFamily: "Amiri, serif",
                  fontWeight: 400,
                  fontSize: 56,
                  lineHeight: 1.5,
                  color: "#111",
                  direction: "rtl",
                  marginBottom: 10,
                  minHeight: 70,
                }}
              >
                {meta?.name || arabic?.name || ""}
              </div>

              <div style={{ fontWeight: 700, fontSize: 22, color: "#111", marginBottom: 6 }}>
                {meta?.englishName || arabic?.englishName || ""}
              </div>

              <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: surahNum !== 9 ? 32 : 0 }}>
                {meta
                  ? `${meta.englishNameTranslation} · ${meta.numberOfAyahs} verses · ${meta.revelationType}`
                  : ""}
              </div>

              {surahNum !== 1 && surahNum !== 9 && (
                <>
                  <div
                    style={{
                      fontFamily: "Amiri, serif",
                      fontWeight: 400,
                      fontSize: 30,
                      direction: "rtl",
                      lineHeight: 2.2,
                      color: "#1a1a1a",
                      marginBottom: 6,
                    }}
                  >
                    {BISMILLAH}
                  </div>
                  <div style={{ fontSize: 12, color: "#bbb", fontStyle: "italic" }}>
                    {BISMILLAH_EN}
                  </div>
                </>
              )}
            </header>

            {/* ── Loading skeletons ── */}
            {loadingContent && (
              <div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} style={{ padding: "30px 0", borderBottom: "1px solid #f9fafb" }}>
                    <div className="sk" style={{ height: 38, width: "88%", marginLeft: "auto", marginBottom: 16 }} />
                    <div className="sk" style={{ height: 17, width: "78%", marginBottom: 8 }} />
                    <div className="sk" style={{ height: 17, width: "60%" }} />
                  </div>
                ))}
              </div>
            )}

            {/* ── Arabic (mushaf) mode — paginated ── */}
            {!loadingContent && mode === "arabic" && (() => {
              // Group ayahsAr by mushaf page number (each ayah carries a .page field)
              const pages = [];
              for (const ayah of ayahsAr) {
                const last = pages[pages.length - 1];
                if (last && last.num === ayah.page) {
                  last.ayahs.push(ayah);
                } else {
                  pages.push({ num: ayah.page, ayahs: [ayah] });
                }
              }
              return (
                <div>
                  {pages.map(({ num, ayahs: pAyahs }, pi) => (
                    <div key={num}>
                      <div
                        style={{
                          background: "#fff",
                          border: "1px solid #e8e8e8",
                          borderRadius: 6,
                          padding: "48px 36px 36px",
                          boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "Amiri, serif",
                            fontWeight: 400,
                            fontSize: 26,
                            lineHeight: 2.8,
                            direction: "rtl",
                            textAlign: "center",
                            color: "#111",
                            margin: 0,
                          }}
                        >
                          {pAyahs.map((ayah) => {
                            const wl = getWordList(ayah);
                            return (
                              <span key={ayah.number}>
                                {wl
                                  ? wl.map((w, wi) => (
                                      <span key={wi}>
                                        <WordSpan word={w.text} tooltip={w.translation} />{" "}
                                      </span>
                                    ))
                                  : getAyahText(ayah)}{" "}
                                <AyahEndMarker n={ayah.numberInSurah} />
                                {" "}
                              </span>
                            );
                          })}
                        </p>
                        <div
                          style={{
                            textAlign: "center",
                            marginTop: 28,
                            paddingTop: 16,
                            borderTop: "1px solid #f0f0f0",
                            color: "#bbb",
                            fontSize: 12,
                            letterSpacing: "0.08em",
                          }}
                        >
                          {num}
                        </div>
                      </div>
                      {pi < pages.length - 1 && (
                        <div style={{ height: 1, background: "#f0f0f0", margin: "28px 0" }} />
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* ── Verse by verse mode ── */}
            {!loadingContent && mode === "verse" && (
              <div>
                {ayahsAr.map((ayah, i) => (
                  <div
                    key={ayah.number}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "64px 1fr",
                      gap: "0 20px",
                      padding: "32px 0",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {/* Reference */}
                    <div style={{ paddingTop: 8, display: "flex", justifyContent: "center" }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          border: `1.5px solid ${G}`,
                          color: G,
                          fontSize: 9,
                          fontWeight: 700,
                          flexShrink: 0,
                          letterSpacing: "-0.3px",
                        }}
                      >
                        {surahNum}:{ayah.numberInSurah}
                      </span>
                    </div>

                    {/* Arabic + translation */}
                    <div>
                      <p
                        style={{
                          fontFamily: "Amiri, serif",
                          fontWeight: 400,
                          fontSize: 28,
                          lineHeight: 2.5,
                          direction: "rtl",
                          textAlign: "right",
                          color: "#111",
                          margin: "0 0 18px",
                        }}
                      >
                        {getAyahText(ayah)}
                      </p>
                      <p style={{ fontSize: 15, lineHeight: 1.78, color: "#4b5563", margin: 0 }}>
                        {ayahsEn[i]?.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Translation only mode ── */}
            {!loadingContent && mode === "translation" && (
              <div>
                {ayahsEn.map((ayah) => (
                  <div
                    key={ayah.number}
                    style={{
                      display: "flex",
                      gap: 20,
                      padding: "24px 0",
                      borderBottom: "1px solid #f3f4f6",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        minWidth: 30, height: 30, borderRadius: "50%",
                        border: `1.5px solid ${G}`, color: G,
                        fontSize: 11, fontWeight: 700,
                        flexShrink: 0, marginTop: 3,
                      }}
                    >
                      {ayah.numberInSurah}
                    </span>
                    <p style={{ fontSize: 16, lineHeight: 1.82, color: "#374151", margin: 0 }}>
                      {ayah.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
