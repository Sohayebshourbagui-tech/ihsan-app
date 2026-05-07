"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "./components/BottomNav";
import { getReviewStats } from "../lib/hifzAnalytics";

const G  = "#1a8a4a";
const G2 = "#2ea55f";
const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const SURAHS = [
  { n:1,  name:"Al-Fatihah"    }, { n:2,  name:"Al-Baqarah"   },
  { n:3,  name:"Al-Imran"     }, { n:4,  name:"An-Nisa"       },
  { n:5,  name:"Al-Maidah"    }, { n:6,  name:"Al-Anam"       },
  { n:7,  name:"Al-Araf"      }, { n:8,  name:"Al-Anfal"      },
  { n:9,  name:"At-Tawbah"    }, { n:10, name:"Yunus"         },
  { n:11, name:"Hud"          }, { n:12, name:"Yusuf"         },
  { n:13, name:"Ar-Rad"       }, { n:14, name:"Ibrahim"       },
  { n:15, name:"Al-Hijr"      }, { n:16, name:"An-Nahl"       },
  { n:17, name:"Al-Isra"      }, { n:18, name:"Al-Kahf"       },
  { n:19, name:"Maryam"       }, { n:20, name:"Ta-Ha"         },
  { n:21, name:"Al-Anbiya"    }, { n:22, name:"Al-Hajj"       },
  { n:23, name:"Al-Muminun"   }, { n:24, name:"An-Nur"        },
  { n:25, name:"Al-Furqan"    }, { n:26, name:"Ash-Shuara"    },
  { n:27, name:"An-Naml"      }, { n:28, name:"Al-Qasas"      },
  { n:29, name:"Al-Ankabut"   }, { n:30, name:"Ar-Rum"        },
  { n:31, name:"Luqman"       }, { n:32, name:"As-Sajdah"     },
  { n:33, name:"Al-Ahzab"     }, { n:34, name:"Saba"          },
  { n:35, name:"Fatir"        }, { n:36, name:"Ya-Sin"        },
  { n:37, name:"As-Saffat"    }, { n:38, name:"Sad"           },
  { n:39, name:"Az-Zumar"     }, { n:40, name:"Ghafir"        },
  { n:41, name:"Fussilat"     }, { n:42, name:"Ash-Shura"     },
  { n:43, name:"Az-Zukhruf"   }, { n:44, name:"Ad-Dukhan"     },
  { n:45, name:"Al-Jathiyah"  }, { n:46, name:"Al-Ahqaf"      },
  { n:47, name:"Muhammad"     }, { n:48, name:"Al-Fath"       },
  { n:49, name:"Al-Hujurat"   }, { n:50, name:"Qaf"           },
  { n:51, name:"Ad-Dhariyat"  }, { n:52, name:"At-Tur"        },
  { n:53, name:"An-Najm"      }, { n:54, name:"Al-Qamar"      },
  { n:55, name:"Ar-Rahman"    }, { n:56, name:"Al-Waqiah"     },
  { n:57, name:"Al-Hadid"     }, { n:58, name:"Al-Mujadilah"  },
  { n:59, name:"Al-Hashr"     }, { n:60, name:"Al-Mumtahanah" },
  { n:61, name:"As-Saf"       }, { n:62, name:"Al-Jumuah"     },
  { n:63, name:"Al-Munafiqun" }, { n:64, name:"At-Taghabun"   },
  { n:65, name:"At-Talaq"     }, { n:66, name:"At-Tahrim"     },
  { n:67, name:"Al-Mulk"      }, { n:68, name:"Al-Qalam"      },
  { n:69, name:"Al-Haqqah"    }, { n:70, name:"Al-Maarij"     },
  { n:71, name:"Nuh"          }, { n:72, name:"Al-Jinn"       },
  { n:73, name:"Al-Muzzammil" }, { n:74, name:"Al-Muddaththir"},
  { n:75, name:"Al-Qiyamah"   }, { n:76, name:"Al-Insan"      },
  { n:77, name:"Al-Mursalat"  }, { n:78, name:"An-Naba"       },
  { n:79, name:"An-Naziat"    }, { n:80, name:"Abasa"         },
  { n:81, name:"At-Takwir"    }, { n:82, name:"Al-Infitar"    },
  { n:83, name:"Al-Mutaffifin"}, { n:84, name:"Al-Inshiqaq"   },
  { n:85, name:"Al-Buruj"     }, { n:86, name:"At-Tariq"      },
  { n:87, name:"Al-Ala"       }, { n:88, name:"Al-Ghashiyah"  },
  { n:89, name:"Al-Fajr"      }, { n:90, name:"Al-Balad"      },
  { n:91, name:"Ash-Shams"    }, { n:92, name:"Al-Layl"       },
  { n:93, name:"Ad-Duha"      }, { n:94, name:"Ash-Sharh"     },
  { n:95, name:"At-Tin"       }, { n:96, name:"Al-Alaq"       },
  { n:97, name:"Al-Qadr"      }, { n:98, name:"Al-Bayyinah"   },
  { n:99, name:"Az-Zalzalah"  }, { n:100,name:"Al-Adiyat"     },
  { n:101,name:"Al-Qariah"    }, { n:102,name:"At-Takathur"   },
  { n:103,name:"Al-Asr"       }, { n:104,name:"Al-Humazah"    },
  { n:105,name:"Al-Fil"       }, { n:106,name:"Quraysh"       },
  { n:107,name:"Al-Maun"      }, { n:108,name:"Al-Kawthar"    },
  { n:109,name:"Al-Kafirun"   }, { n:110,name:"An-Nasr"       },
  { n:111,name:"Al-Masad"     }, { n:112,name:"Al-Ikhlas"     },
  { n:113,name:"Al-Falaq"     }, { n:114,name:"An-Nas"        },
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

function formatCountdown(ms) {
  if (!ms || ms <= 0) return null;
  const h = Math.floor(ms / (60 * 60 * 1000));
  const m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getLastMemorizingSurah() {
  if (typeof window === "undefined") return null;
  let best = null, bestCount = 0;
  SURAHS.forEach(s => {
    try {
      const saved = localStorage.getItem(`hifz_${s.n}`);
      if (!saved) return;
      const arr = JSON.parse(saved);
      const active = arr.filter(v => v > 0).length;
      if (active > bestCount) {
        bestCount = active;
        const memorized = arr.filter(v => v === 2).length;
        const inProgress = arr.filter(v => v === 1).length;
        best = { ...s, memorized, inProgress, total: arr.length };
      }
    } catch {}
  });
  return best;
}

export default function Home() {
  const router = useRouter();
  const [query, setQuery]             = useState("");
  const [prayerData, setPrayerData]   = useState(null);
  const [prayerErr, setPrayerErr]     = useState("");
  const [lastSurah, setLastSurah]     = useState(null);
  const [reviewStats, setReviewStats] = useState({ due: 0, weak: 0, nextReviewMs: null });
  const [mounted, setMounted]         = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    setLastSurah(getLastMemorizingSurah());
    setReviewStats(getReviewStats());
  }, []);

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
    <>
      <style>{`
        .ask-input:focus { outline: none; }
        .ask-input::placeholder { color: #a0aec0; }
        .send-btn:hover:not(:disabled) { background: #157a3c !important; }
        .practice-btn:hover { background: ${G} !important; color: #fff !important; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f8f9fa", paddingBottom: 70 }}>

        {/* ── Top bar ── */}
        <nav style={{
          background: `linear-gradient(135deg, #157a3c 0%, ${G} 55%, ${G2} 100%)`,
          width: "100%",
          boxShadow: "0 2px 16px rgba(26,138,74,0.28)",
          position: "relative",
          overflow: "hidden",
        }}>
          <GeoPattern id="geoNav" opacity={0.13} />
          <div style={{
            maxWidth: 680, margin: "0 auto", padding: "14px 20px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            position: "relative", zIndex: 1,
          }}>
            <div>
              <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, lineHeight: 1.15 }}>
                Ihsan <span style={{ fontFamily: "Amiri, serif", fontWeight: 400 }}>إحسان</span>
              </div>
              {hijriStr && (
                <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 11, marginTop: 3, letterSpacing: "0.03em" }}>
                  {hijriStr}
                </div>
              )}
            </div>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 24 }}>☽</span>
          </div>
        </nav>

        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* ── Scholarly.AI Prompt ── */}
          <div style={{ padding: "28px 20px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: G, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 10 }}>
              Scholarly.Ai ✦
            </p>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 20, lineHeight: 1.25, letterSpacing: "-0.3px" }}>
              Ask any Islamic question
            </p>
            <form onSubmit={handleAsk} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{
                flex: 1, display: "flex", alignItems: "center",
                background: "#fff",
                border: "2px solid #e5e7eb",
                borderRadius: 14,
                padding: "0 14px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                transition: "border-color 0.2s",
              }}
                onFocusCapture={e => e.currentTarget.style.borderColor = G}
                onBlurCapture={e => e.currentTarget.style.borderColor = "#e5e7eb"}
              >
                <input
                  ref={inputRef}
                  className="ask-input"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Ask any Islamic question..."
                  style={{
                    flex: 1, border: "none", background: "transparent",
                    fontSize: 15, color: "#111827", padding: "14px 0",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              <button
                type="submit"
                className="send-btn"
                style={{
                  flexShrink: 0, width: 48, height: 48,
                  background: G, color: "#fff",
                  border: "none", borderRadius: 12,
                  fontSize: 20, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(26,138,74,0.35)",
                  transition: "background 0.15s",
                }}
              >
                ➤
              </button>
            </form>
          </div>

          <div style={{ height: 4, background: "#f0f0f0", margin: "0 20px", borderRadius: 99 }} />

          {/* ── Continue Memorizing ── */}
          <div style={{ padding: "20px 20px 0" }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: G, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 12 }}>
              Hifz Progress
            </p>
            {mounted && lastSurah ? (
              <div style={{
                background: "#fff",
                borderRadius: 16,
                padding: "18px 18px 16px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                border: `1px solid ${G}18`,
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  flexShrink: 0, width: 50, height: 50, borderRadius: 12,
                  background: `linear-gradient(135deg, ${G}, ${G2})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 22,
                }}>📖</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", marginBottom: 2 }}>
                    {lastSurah.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                    {lastSurah.memorized} memorized · {lastSurah.inProgress} in progress
                  </div>
                  <div style={{ height: 5, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 999,
                      background: `linear-gradient(90deg, ${G}, ${G2})`,
                      width: `${Math.round((lastSurah.memorized / lastSurah.total) * 100)}%`,
                    }} />
                  </div>
                </div>
                <a href="/hifz" style={{ textDecoration: "none", flexShrink: 0 }}>
                  <div className="practice-btn" style={{
                    background: "#ecfdf3", color: G,
                    border: `1px solid ${G}30`,
                    fontWeight: 700, fontSize: 12,
                    padding: "9px 14px", borderRadius: 10,
                    whiteSpace: "nowrap", cursor: "pointer",
                    transition: "all 0.15s",
                  }}>
                    Practice
                  </div>
                </a>
              </div>
            ) : (
              <div style={{
                background: "#fff",
                borderRadius: 16,
                padding: "18px 18px 16px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                border: `1px solid ${G}18`,
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  flexShrink: 0, width: 50, height: 50, borderRadius: 12,
                  background: "#f3f4f6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                }}>📖</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 3 }}>
                    Start memorizing the Quran
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>Track your hifz progress surah by surah</div>
                </div>
                <a href="/hifz" style={{ textDecoration: "none", flexShrink: 0 }}>
                  <div className="practice-btn" style={{
                    background: "#ecfdf3", color: G,
                    border: `1px solid ${G}30`,
                    fontWeight: 700, fontSize: 12,
                    padding: "9px 14px", borderRadius: 10,
                    whiteSpace: "nowrap", cursor: "pointer",
                    transition: "all 0.15s",
                  }}>
                    Begin
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* ── Today's Review ── */}
          {mounted && (
            <div style={{ padding: "16px 20px 0" }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: G, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 12 }}>
                Today's Review
              </p>
              <a href="/hifz/review" style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: "16px 18px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  border: `1px solid ${G}18`,
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{
                    flexShrink: 0, width: 50, height: 50, borderRadius: 12,
                    background: reviewStats.due > 0
                      ? "linear-gradient(135deg, #dc2626, #ef4444)"
                      : `linear-gradient(135deg, ${G}, ${G2})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 22,
                  }}>
                    🔁
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", marginBottom: 2 }}>
                      {reviewStats.due > 0
                        ? `${reviewStats.due} ayah${reviewStats.due !== 1 ? "s" : ""} due for review`
                        : "Review queue is clear ✓"}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {reviewStats.due > 0 && reviewStats.weak > 0
                        ? `${reviewStats.weak} weak ayah${reviewStats.weak !== 1 ? "s" : ""} to strengthen`
                        : reviewStats.nextReviewMs
                          ? `Next review in ${formatCountdown(reviewStats.nextReviewMs)}`
                          : "Tap to review weak ayahs"}
                    </div>
                  </div>
                  <div style={{
                    flexShrink: 0,
                    background: reviewStats.due > 0 ? "#fef2f2" : "#ecfdf3",
                    color: reviewStats.due > 0 ? "#dc2626" : G,
                    border: `1px solid ${reviewStats.due > 0 ? "#dc262630" : G + "30"}`,
                    fontWeight: 700, fontSize: 12,
                    padding: "9px 14px", borderRadius: 10,
                    whiteSpace: "nowrap",
                  }}>
                    {reviewStats.due > 0 ? "Begin →" : "Browse"}
                  </div>
                </div>
              </a>
            </div>
          )}

          <div style={{ height: 20 }} />
          <div style={{ height: 4, background: "#f0f0f0", margin: "0 20px", borderRadius: 99 }} />

          {/* ── Prayer Times ── */}
          <div style={{ padding: "20px 20px 0" }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: G, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 12 }}>
              Prayer Times
            </p>
            {prayerErr ? (
              <div style={{ padding: "14px 16px", background: "#fff", borderRadius: 12, fontSize: 13, color: "#9ca3af" }}>
                {prayerErr}
              </div>
            ) : !prayerData ? (
              <div style={{
                background: "#fff", borderRadius: 12, padding: "12px 16px",
                display: "flex", gap: 8,
              }}>
                {PRAYERS.map(p => (
                  <div key={p} style={{
                    flex: 1, height: 44, borderRadius: 8,
                    background: "#f3f4f6", animation: "pulse 1.5s infinite",
                  }} />
                ))}
              </div>
            ) : (
              <div style={{
                background: "#fff",
                borderRadius: 12,
                padding: "10px 10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                display: "flex", gap: 6,
              }}>
                {PRAYERS.map(p => {
                  const active = p === nextPrayer;
                  return (
                    <div key={p} style={{
                      flex: 1, padding: "8px 4px", borderRadius: 8, textAlign: "center",
                      background: active ? G : "transparent",
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: active ? "rgba(255,255,255,0.8)" : "#9ca3af", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {p}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: active ? "#fff" : "#374151" }}>
                        {toAmPm(prayerData.timings[p])}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ height: 24 }} />

        </div>

        <BottomNav />
      </div>
    </>
  );
}
