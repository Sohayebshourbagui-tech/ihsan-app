"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

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

function normalizeHadithPayload(payload) {
  const raw = payload?.data ?? payload ?? {};
  const text =
    raw.hadith_english ||
    raw.hadithEnglish ||
    raw.text ||
    raw.hadith ||
    "No hadith text available.";
  const source = raw.refno || raw.reference || raw.book || "Reference unavailable";
  const collection =
    raw.bookName || raw.collection || raw.book || "Sahih Bukhari";

  return { text, source, collection };
}

export default function HadithPage() {
  const [hadith, setHadith] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCollection, setActiveCollection] = useState(null);
  const [collectionHadiths, setCollectionHadiths] = useState([]);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [collectionError, setCollectionError] = useState("");

  const fetchRandomHadith = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/hadith", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to fetch hadith.");
      setHadith(normalizeHadithPayload(data));
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
      if (!append) {
        setActiveCollection(slug);
      }

      const response = await fetch(`/api/hadith/${slug}?count=10`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to fetch collection hadiths.");

      const normalized = (data.data || []).map((item) => normalizeHadithPayload(item));
      setCollectionHadiths((prev) => (append ? [...prev, ...normalized] : normalized));
    } catch (err) {
      setCollectionError(err.message || "Could not load hadith collection.");
    } finally {
      setCollectionLoading(false);
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
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
          ) : (
            <>
              <p style={{ margin: "0 0 12px", fontSize: 16, lineHeight: 1.9, color: "#374151" }}>
                {hadith?.text}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <span
                  style={{
                    background: "#ecfdf3",
                    color: GREEN,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "5px 9px",
                    borderRadius: 999,
                  }}
                >
                  {hadith?.collection || "Collection"}
                </span>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{hadith?.source}</span>
              </div>
            </>
          )}
        </section>

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
                onClick={() => fetchCollectionHadiths(collection.slug)}
                style={{
                  textAlign: "left",
                  border: "1px solid #e5e7eb",
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

              <div style={{ display: "grid", gap: 10 }}>
                {collectionHadiths.map((item, index) => (
                  <article
                    key={`${item.source}-${index}`}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderLeft: `3px solid ${GREEN}`,
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <p style={{ margin: "0 0 8px", fontSize: 15, lineHeight: 1.75, color: "#374151" }}>
                      {item.text}
                    </p>
                    <span
                      style={{
                        display: "inline-block",
                        background: "#ecfdf3",
                        color: GREEN,
                        borderRadius: 999,
                        padding: "4px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {item.collection} • {item.source}
                    </span>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
