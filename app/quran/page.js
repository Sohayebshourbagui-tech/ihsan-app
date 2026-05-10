"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import { T } from "../../lib/theme";

// ── SVG page cache ───────────────────────────────────────────────────────────
const svgCache = new Map();
let translationsCache = null;
let translationsLoading = false;
const translationsCallbacks = [];

function loadTranslations() {
  if (translationsCache) return Promise.resolve(translationsCache);
  return new Promise((resolve) => {
    translationsCallbacks.push(resolve);
    if (!translationsLoading) {
      translationsLoading = true;
      fetch("/translations/sahih.json")
        .then(r => r.json())
        .then(data => {
          translationsCache = data;
          translationsCallbacks.forEach(cb => cb(data));
          translationsCallbacks.length = 0;
        })
        .catch(() => {
          translationsCache = {};
          translationsCallbacks.forEach(cb => cb({}));
          translationsCallbacks.length = 0;
        });
    }
  });
}

function SvgPage({ pageNum }) {
  const [svgText, setSvgText] = useState(svgCache.get(pageNum) ?? null);

  useEffect(() => {
    if (svgCache.has(pageNum)) { setSvgText(svgCache.get(pageNum)); return; }
    const file = String(pageNum).padStart(3, "0");
    fetch(`/mushaf-pages/${file}.svg`)
      .then(r => r.text())
      .then(text => { svgCache.set(pageNum, text); setSvgText(text); })
      .catch(() => setSvgText(null));
  }, [pageNum]);

  if (!svgText) {
    return (
      <div style={{
        background: "#f9f5e8",
        border: `1px solid ${T.border}`,
        borderRadius: T.radiusSm,
        padding: 48, textAlign: "center", minHeight: 300,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ color: T.textTertiary, fontFamily: T.fontArabic, fontSize: 18 }}>
          جارٍ التحميل…
        </span>
      </div>
    );
  }

  const responsive = svgText
    .replace(/\s+width="[^"]*"/, ' width="100%"')
    .replace(/\s+height="[^"]*"/, "");

  return (
    <div style={{
      background: "#f9f5e8",
      border: `1px solid ${T.border}`,
      borderRadius: T.radiusSm,
      overflow: "hidden",
      boxShadow: T.shadowSm,
    }}
      dangerouslySetInnerHTML={{ __html: responsive }}
    />
  );
}

const BISMILLAH    = "بِسْمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ";
const BISMILLAH_EN = "In the name of Allah, the Entirely Merciful, the Especially Merciful.";

function toArabicIndic(n) {
  return String(n).replace(/[0-9]/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
}

export default function QuranPage() {
  const [surahs,       setSurahs]       = useState([]);
  const [search,       setSearch]       = useState("");
  const [surahNum,     setSurahNum]     = useState(1);
  const [mode,         setMode]         = useState("verse");
  const [arabic,       setArabic]       = useState(null);
  const [translations, setTranslations] = useState(translationsCache);
  const [loadingSurahs,  setLoadingSurahs]  = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then(r => r.json())
      .then(d => { setSurahs(d.data); setLoadingSurahs(false); })
      .catch(() => { setError("Failed to load surah list."); setLoadingSurahs(false); });
  }, []);

  useEffect(() => {
    if (!translationsCache) loadTranslations().then(setTranslations);
  }, []);

  useEffect(() => {
    setLoadingContent(true); setError(""); setArabic(null);
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`)
      .then(r => r.json())
      .then(a => { if (a.status !== "OK") throw new Error(); setArabic(a.data); })
      .catch(() => setError("Failed to load surah content."))
      .finally(() => setLoadingContent(false));
  }, [surahNum]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return surahs;
    return surahs.filter(s =>
      s.number.toString().includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      (s.englishNameTranslation || "").toLowerCase().includes(q)
    );
  }, [surahs, search]);

  const meta     = surahs.find(s => s.number === surahNum);
  const ayahsAr  = arabic?.ayahs || [];

  function getTranslation(ayahNum) {
    return translations?.[`${surahNum}:${ayahNum}`]?.t ?? "";
  }

  function getAyahText(ayah) {
    if (surahNum === 1 || surahNum === 9 || ayah.numberInSurah !== 1) return ayah.text;
    const words = ayah.text.trim().split(/\s+/);
    if (words[0]?.includes("بِسْمِ")) return words.slice(4).join(" ");
    return ayah.text;
  }

  function selectSurah(n) {
    setSurahNum(n); setSearch("");
    window.scrollTo({ top: 0 });
  }

  return (
    <>
      <style>{`
        .sk { animation: shimmer 1.6s ease-in-out infinite; background: ${T.bgSubtle}; border-radius: 6px; }
        .sb-btn:hover { background: ${T.bgSubtle} !important; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: T.bgPage, color: T.textPrimary }}>

        {/* ── Sidebar ── */}
        <aside style={{
          position: "fixed",
          top: 0, left: 0, bottom: 0, width: 280,
          borderRight: `1px solid ${T.border}`,
          background: T.bgCard,
          display: "flex", flexDirection: "column",
          zIndex: 20, overflow: "hidden",
        }}>
          {/* Search */}
          <div style={{ padding: "14px 12px 10px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search surah…"
              style={{
                width: "100%", padding: "9px 14px",
                borderRadius: T.radiusFull,
                border: `1px solid ${T.border}`,
                fontSize: 13, outline: "none",
                boxSizing: "border-box",
                background: T.bgInset,
                color: T.textPrimary, fontFamily: "inherit",
              }}
            />
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1, padding: "6px 8px 80px" }}>
            {loadingSurahs
              ? Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="sk" style={{ height: 48, marginBottom: 4, borderRadius: T.radiusSm }} />
                ))
              : filtered.map(s => {
                  const active = s.number === surahNum;
                  return (
                    <button
                      key={s.number}
                      onClick={() => selectSurah(s.number)}
                      className={active ? undefined : "sb-btn"}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", padding: "9px 10px",
                        borderRadius: T.radiusSm,
                        border: "none",
                        background: active ? T.greenMuted : "transparent",
                        color: active ? T.greenDark : T.textPrimary,
                        cursor: "pointer", textAlign: "left",
                        marginBottom: 2,
                        transition: "background 0.12s",
                        fontFamily: "inherit",
                      }}
                    >
                      <span style={{ minWidth: 26, fontSize: 11, fontWeight: 600, color: active ? T.green : T.textTertiary, flexShrink: 0 }}>
                        {s.number}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{s.englishName}</div>
                        <div style={{ fontSize: 11, color: T.textTertiary, lineHeight: 1.3, marginTop: 1 }}>
                          {s.englishNameTranslation}
                        </div>
                      </div>
                    </button>
                  );
                })}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ marginLeft: 280, flex: 1, background: T.bgPage }}>

          {/* Top bar */}
          <div style={{
            position: "sticky", top: 0, zIndex: 10,
            background: T.bgCard,
            borderBottom: `1px solid ${T.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 32px",
          }}>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: T.textSecondary, fontSize: 13, fontWeight: 500,
              textDecoration: "none",
            }}>
              ← Home
            </Link>

            {/* Mode selector */}
            <div style={{ display: "inline-flex", background: T.bgSubtle, borderRadius: T.radiusFull, padding: 3 }}>
              {[["verse", "Verse by Verse"], ["arabic", "Arabic"], ["translation", "Translation"]].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  style={{
                    padding: "6px 16px", borderRadius: T.radiusFull, border: "none",
                    cursor: "pointer", fontSize: 12, fontWeight: 500,
                    background: mode === id ? T.green : "transparent",
                    color: mode === id ? T.textInverse : T.textSecondary,
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
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 28px 120px" }}>

            {error && (
              <div style={{
                background: T.redBg, color: T.red,
                padding: "12px 16px", borderRadius: T.radiusSm,
                fontSize: 14, marginBottom: 24,
              }}>
                {error}
              </div>
            )}

            {/* Surah header */}
            <header style={{ textAlign: "center", marginBottom: 48, paddingBottom: 40, borderBottom: `1px solid ${T.border}` }}>
              <div style={{
                fontFamily: T.fontArabic,
                fontSize: 52, lineHeight: 1.5,
                color: T.textPrimary, direction: "rtl",
                marginBottom: 10, minHeight: 68,
              }}>
                {meta?.name || arabic?.name || ""}
              </div>
              <div style={{ fontWeight: 700, fontSize: 22, color: T.textPrimary, marginBottom: 6 }}>
                {meta?.englishName || arabic?.englishName || ""}
              </div>
              <div style={{ fontSize: 13, color: T.textTertiary, marginBottom: surahNum !== 9 ? 28 : 0 }}>
                {meta ? `${meta.englishNameTranslation} · ${meta.numberOfAyahs} verses · ${meta.revelationType}` : ""}
              </div>

              {surahNum !== 1 && surahNum !== 9 && (
                <>
                  <div style={{ fontFamily: T.fontArabic, fontSize: 28, direction: "rtl", lineHeight: 2.2, color: T.textPrimary, marginBottom: 6 }}>
                    {BISMILLAH}
                  </div>
                  <div style={{ fontSize: 12, color: T.textTertiary, fontStyle: "italic" }}>{BISMILLAH_EN}</div>
                </>
              )}
            </header>

            {/* Loading skeletons */}
            {loadingContent && (
              <div>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ padding: "28px 0", borderBottom: `1px solid ${T.border}` }}>
                    <div className="sk" style={{ height: 36, width: "88%", marginLeft: "auto", marginBottom: 14 }} />
                    <div className="sk" style={{ height: 16, width: "78%", marginBottom: 7 }} />
                    <div className="sk" style={{ height: 16, width: "60%" }} />
                  </div>
                ))}
              </div>
            )}

            {/* Arabic (SVG mushaf) */}
            {!loadingContent && mode === "arabic" && (() => {
              const pageNums = [...new Set(ayahsAr.map(a => a.page))];
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {pageNums.map(num => <SvgPage key={num} pageNum={num} />)}
                </div>
              );
            })()}

            {/* Verse by verse */}
            {!loadingContent && mode === "verse" && (
              <div>
                {ayahsAr.map(ayah => (
                  <div key={ayah.number} style={{ padding: "32px 0", borderBottom: `1px solid ${T.border}` }}>
                    <p style={{
                      fontFamily: T.fontArabic,
                      fontSize: 30, lineHeight: 2.4,
                      direction: "rtl", textAlign: "center",
                      color: T.textPrimary, margin: "0 0 18px",
                    }}>
                      {getAyahText(ayah)}
                      {" "}
                      <span style={{ fontFamily: T.fontArabic, color: T.textTertiary, fontSize: "0.72em" }}>
                        ﴿{toArabicIndic(ayah.numberInSurah)}﴾
                      </span>
                    </p>
                    <p style={{
                      fontSize: 15, lineHeight: 1.8, color: T.textSecondary,
                      margin: 0,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.green, marginRight: 8 }}>
                        {surahNum}:{ayah.numberInSurah}
                      </span>
                      {getTranslation(ayah.numberInSurah)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Translation only */}
            {!loadingContent && mode === "translation" && (
              <div>
                {ayahsAr.map(ayah => (
                  <div key={ayah.number} style={{
                    display: "flex", gap: 20, padding: "22px 0",
                    borderBottom: `1px solid ${T.border}`, alignItems: "flex-start",
                  }}>
                    <span style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      minWidth: 28, height: 28, borderRadius: "50%",
                      background: T.greenMuted, color: T.green,
                      fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 3,
                    }}>
                      {ayah.numberInSurah}
                    </span>
                    <p style={{ fontSize: 15, lineHeight: 1.82, color: T.textSecondary, margin: 0 }}>
                      {getTranslation(ayah.numberInSurah)}
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
