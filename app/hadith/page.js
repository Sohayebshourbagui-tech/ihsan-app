"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";

const GREEN = "#1a8a4a";
const CARD_SHADOW = "0 2px 8px rgba(0,0,0,0.06)";

const COLLECTIONS = [
  {
    name: "Sahih Bukhari",
    slug: "bukhari",
    description: "Most rigorously authenticated hadith collection.",
    count: 7563,
  },
  {
    name: "Sahih Muslim",
    slug: "muslim",
    description: "Highly authentic narrations with precise chains.",
    count: 7190,
  },
  {
    name: "Sunan Abu Dawud",
    slug: "abudawud",
    description: "Focused on legal and practical rulings.",
    count: 5274,
  },
  {
    name: "Jami at-Tirmidhi",
    slug: "tirmidhi",
    description: "Hadith with scholarly grading and commentary notes.",
    count: 3956,
  },
  {
    name: "Sunan an-Nasa'i",
    slug: "nasai",
    description: "Strong narration standards with fiqh relevance.",
    count: 5761,
  },
  {
    name: "Sunan Ibn Majah",
    slug: "ibnmajah",
    description: "Widely used source in hadith literature.",
    count: 4341,
  },
];

function GradeBadge({ grade }) {
  if (!grade) return null;
  const color = grade.toLowerCase().includes("sahih") ? GREEN : "#b45309";
  return (
    <span
      style={{
        background: grade.toLowerCase().includes("sahih") ? "#ecfdf3" : "#fef3c7",
        color,
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 999,
        border: `1px solid ${color}33`,
      }}
    >
      {grade}
    </span>
  );
}

function HadithCard({ item, showArabic = true }) {
  return (
    <article
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderLeft: `3px solid ${GREEN}`,
        borderRadius: 10,
        padding: "12px 14px",
      }}
    >
      {item.arabicText ? (
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 18,
            fontFamily: "Amiri, serif",
            lineHeight: 1.9,
            color: "#1f2937",
            direction: "rtl",
            textAlign: "right",
          }}
        >
          {item.arabicText}
        </p>
      ) : null}

      {item.narrator ? (
        <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "#4b5563", fontStyle: "italic" }}>
          {item.narrator}
        </p>
      ) : null}

      <p style={{ margin: "0 0 10px", fontSize: 15, lineHeight: 1.75, color: "#374151" }}>
        {item.englishText || "No hadith text available."}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        <GradeBadge grade={item.grade} />
        {item.chapter ? (
          <span style={{ fontSize: 12, color: "#6b7280" }}>{item.chapter}</span>
        ) : null}
        {item.hadithNumber ? (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              fontWeight: 700,
              color: "#9ca3af",
            }}
          >
            #{item.hadithNumber}
          </span>
        ) : null}
      </div>
    </article>
  );
}

export default function HadithPage() {
  const [hadith,            setHadith]            = useState(null);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState("");
  const [activeCollection,  setActiveCollection]  = useState(null);
  const [collectionHadiths, setCollectionHadiths] = useState([]);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [collectionError,   setCollectionError]   = useState("");
  const [searchQuery,       setSearchQuery]       = useState("");
  const [searchResults,     setSearchResults]     = useState(null); // null = not searched yet
  const [searchLoading,     setSearchLoading]     = useState(false);
  const [searchError,       setSearchError]       = useState("");
  const [numQuery,          setNumQuery]          = useState("");
  const [numBook,           setNumBook]           = useState("");
  const [numResults,        setNumResults]        = useState(null);
  const [numLoading,        setNumLoading]        = useState(false);
  const [numError,          setNumError]          = useState("");
  const debounceRef = useRef(null);

  const fetchRandomHadith = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/hadith", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to fetch hadith.");
      setHadith(data.hadith);
    } catch (err) {
      setError(err.message || "Could not load hadith right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRandomHadith();
  }, [fetchRandomHadith]);

  const fetchCollectionHadiths = useCallback(async (slug, append = false) => {
    try {
      setCollectionLoading(true);
      setCollectionError("");
      if (!append) setActiveCollection(slug);

      const page = append ? Math.ceil(collectionHadiths.length / 10) + 1 : 1;
      const response = await fetch(`/api/hadith/${slug}?count=10&page=${page}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to fetch collection hadiths.");

      setCollectionHadiths(prev => append ? [...prev, ...data.hadiths] : data.hadiths);
    } catch (err) {
      setCollectionError(err.message || "Could not load hadith collection.");
    } finally {
      setCollectionLoading(false);
    }
  }, [collectionHadiths.length]);

  function handleSearchChange(e) {
    const q = e.target.value;
    setSearchQuery(q);
    clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setSearchResults(null);
      setSearchError("");
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError("");
        const res  = await fetch(`/api/hadith/search?q=${encodeURIComponent(q.trim())}&count=10`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Search failed.");
        setSearchResults(data.hadiths);
      } catch (err) {
        setSearchError(err.message || "Search failed.");
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500);
  }

  async function searchByNumber() {
    const n = numQuery.trim();
    if (!n || isNaN(Number(n)) || Number(n) <= 0) return;
    setNumLoading(true);
    setNumError("");
    setNumResults(null);
    try {
      const qs = new URLSearchParams({ n });
      if (numBook) qs.set("book", numBook);
      const res  = await fetch(`/api/hadith/number?${qs}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Not found.");
      setNumResults(data.hadiths);
    } catch (err) {
      setNumError(err.message || "Could not fetch hadith.");
    } finally {
      setNumLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", paddingBottom: 70 }}>
      <nav
        style={{
          background: "linear-gradient(135deg, #16753d 0%, #1a8a4a 55%, #2ca45f 100%)",
          boxShadow: "0 2px 16px rgba(26,138,74,0.28)",
        }}
      >
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 700, margin: 0 }}>Hadith</h1>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.45)",
              borderRadius: 999,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ← Back Home
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "26px 20px 50px" }}>
        {/* Search bar */}
        <div style={{ marginBottom: 18 }}>
          <input
            type="search"
            placeholder="Search hadiths in English…"
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 16px",
              fontSize: 15,
              borderRadius: 12,
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              outline: "none",
              boxShadow: CARD_SHADOW,
            }}
          />
          {searchLoading && (
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#9ca3af" }}>Searching…</p>
          )}
          {searchError && (
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#b91c1c" }}>{searchError}</p>
          )}
        </div>

        {/* Search results */}
        {searchResults !== null && (
          <section style={{ marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 17, color: "#111827" }}>
              {searchResults.length === 0
                ? `No results for "${searchQuery}"`
                : `Results for "${searchQuery}"`}
            </h3>
            {searchResults.length > 0 && (
              <div style={{ display: "grid", gap: 10 }}>
                {searchResults.map((item, i) => (
                  <HadithCard key={`search-${item.id ?? i}`} item={item} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Number search */}
        <section
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: CARD_SHADOW,
            padding: 18,
            marginBottom: 18,
          }}
        >
          <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 800, color: GREEN,
                      letterSpacing: "0.07em", textTransform: "uppercase" }}>
            Search by Hadith Number
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="number"
              min="1"
              placeholder="e.g. 26"
              value={numQuery}
              onChange={e => setNumQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchByNumber()}
              style={{
                flex: "1 1 80px", minWidth: 80, maxWidth: 120,
                padding: "10px 12px", fontSize: 15,
                borderRadius: 10, border: "1.5px solid #e5e7eb",
                outline: "none", boxSizing: "border-box",
              }}
            />
            <select
              value={numBook}
              onChange={e => setNumBook(e.target.value)}
              style={{
                flex: "2 1 160px",
                padding: "10px 12px", fontSize: 14,
                borderRadius: 10, border: "1.5px solid #e5e7eb",
                background: "#fff", outline: "none",
                color: numBook ? "#111827" : "#9ca3af",
              }}
            >
              <option value="">All collections</option>
              {COLLECTIONS.map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={searchByNumber}
              disabled={numLoading || !numQuery.trim()}
              style={{
                flex: "0 0 auto",
                padding: "10px 20px", fontSize: 14, fontWeight: 700,
                borderRadius: 10, border: "none",
                background: numLoading || !numQuery.trim() ? "#e5e7eb" : GREEN,
                color: numLoading || !numQuery.trim() ? "#9ca3af" : "#fff",
                cursor: numLoading || !numQuery.trim() ? "default" : "pointer",
              }}
            >
              {numLoading ? "Searching…" : "Search"}
            </button>
          </div>

          {numError && (
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "#b91c1c" }}>{numError}</p>
          )}

          {numResults !== null && (
            <div style={{ marginTop: 14 }}>
              {numResults.length === 0 ? (
                <p style={{ margin: 0, fontSize: 14, color: "#9ca3af" }}>
                  No hadiths found for number {numQuery}.
                </p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {numResults.map((item, i) => (
                    <HadithCard key={`num-${item.id ?? i}`} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Hadith of the Day */}
        <section
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: CARD_SHADOW,
            padding: 22,
            marginBottom: 18,
            borderLeft: `4px solid ${GREEN}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 20, color: "#1f2937" }}>Hadith of the Day</h2>
            <button
              type="button"
              onClick={fetchRandomHadith}
              disabled={loading}
              style={{
                border: "none",
                borderRadius: 999,
                background: GREEN,
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                padding: "10px 16px",
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Loading..." : "Random Hadith"}
            </button>
          </div>

          {error ? (
            <p style={{ margin: 0, color: "#b91c1c", fontSize: 14 }}>{error}</p>
          ) : loading && !hadith ? (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ height: 16, background: "#efefef", borderRadius: 6 }} />
              <div style={{ height: 16, background: "#efefef", borderRadius: 6 }} />
              <div style={{ height: 16, width: "75%", background: "#efefef", borderRadius: 6 }} />
            </div>
          ) : hadith ? (
            <>
              {hadith.arabicText ? (
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 20,
                    fontFamily: "Amiri, serif",
                    lineHeight: 1.9,
                    color: "#1f2937",
                    direction: "rtl",
                    textAlign: "right",
                  }}
                >
                  {hadith.arabicText}
                </p>
              ) : null}

              {hadith.narrator ? (
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "#4b5563", fontStyle: "italic" }}>
                  {hadith.narrator}
                </p>
              ) : null}

              <p style={{ margin: "0 0 12px", fontSize: 16, lineHeight: 1.9, color: "#374151" }}>
                {hadith.englishText}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <GradeBadge grade={hadith.grade} />
                {hadith.chapter ? (
                  <span style={{ fontSize: 12, color: "#6b7280" }}>{hadith.chapter}</span>
                ) : null}
                {hadith.source ? (
                  <span style={{ fontSize: 13, color: "#6b7280" }}>{hadith.source}</span>
                ) : null}
              </div>
            </>
          ) : null}
        </section>

        {/* Collections grid */}
        <section>
          <h3 style={{ margin: "0 0 12px", fontSize: 18, color: "#111827" }}>
            Major Hadith Collections
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {COLLECTIONS.map((collection) => (
              <button
                key={collection.slug}
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults(null);
                  fetchCollectionHadiths(collection.slug);
                }}
                style={{
                  textAlign: "left",
                  border: `1.5px solid ${activeCollection === collection.slug ? GREEN : "#e5e7eb"}`,
                  borderRadius: 14,
                  background: "#fff",
                  boxShadow: CARD_SHADOW,
                  padding: 16,
                  cursor: "pointer",
                }}
              >
                <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#111827" }}>
                  {collection.name}
                </p>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                  {collection.description}
                </p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: GREEN }}>
                  {collection.count.toLocaleString()} hadiths
                </p>
              </button>
            ))}
          </div>

          {activeCollection ? (
            <div
              style={{
                marginTop: 16,
                background: "#fff",
                borderRadius: 14,
                boxShadow: CARD_SHADOW,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <h4 style={{ margin: 0, fontSize: 17, color: "#111827" }}>
                  {COLLECTIONS.find((c) => c.slug === activeCollection)?.name}
                </h4>
                <button
                  type="button"
                  onClick={() => fetchCollectionHadiths(activeCollection, true)}
                  disabled={collectionLoading}
                  style={{
                    border: "none",
                    borderRadius: 999,
                    background: GREEN,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "8px 14px",
                    cursor: collectionLoading ? "wait" : "pointer",
                    opacity: collectionLoading ? 0.7 : 1,
                  }}
                >
                  {collectionLoading ? "Loading..." : "Load more"}
                </button>
              </div>

              {collectionError ? (
                <p style={{ margin: 0, color: "#b91c1c", fontSize: 14 }}>{collectionError}</p>
              ) : null}

              {collectionLoading && collectionHadiths.length === 0 ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {[1, 2, 3].map(n => (
                    <div key={n} style={{ height: 80, background: "#efefef", borderRadius: 10 }} />
                  ))}
                </div>
              ) : collectionHadiths.length === 0 ? (
                <p style={{ margin: 0, fontSize: 14, color: "#9ca3af" }}>No hadiths found.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {collectionHadiths.map((item, index) => (
                    <HadithCard key={`${activeCollection}-${item.id ?? index}`} item={item} />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
