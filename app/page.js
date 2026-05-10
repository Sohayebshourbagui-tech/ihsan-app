"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "./components/BottomNav";
import { BookIcon } from "./components/icons";
import { getReviewStats, getStreak } from "../lib/hifzAnalytics";
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
  const [streak, setStreak]           = useState(0);
  const [mounted, setMounted]         = useState(false);
  const inputRef = useRef(null);

  const dailyVerse = DAILY_VERSES[new Date().getDate() % DAILY_VERSES.length];

  useEffect(() => {
    setMounted(true);
    setLastSurah(getLastMemorizingSurah());
    setReviewStats(getReviewStats());
    setStreak(getStreak());
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

          {/* Streak pill */}
          {mounted && streak > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              background: T.goldLight,
              borderRadius: T.radiusFull,
              padding: "5px 12px",
            }}>
              <span style={{ color: T.gold, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Day</span>
              <span style={{ color: T.amber, fontSize: 13, fontWeight: 800 }}>{streak}</span>
            </div>
          )}
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

        <div className="divider" style={{ margin: "0 24px" }} />

        {/* ── Today's Review ── */}
        {mounted && (
          <div style={{ padding: "24px 20px 0" }}>
            {reviewStats.due > 0 ? (
              <a href="/hifz/review" style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  background: T.greenMuted,
                  borderRadius: T.radiusLg,
                  padding: "24px",
                  border: `1px solid rgba(26,138,74,0.18)`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: 42, fontWeight: 900, color: T.greenDark, lineHeight: 1, letterSpacing: "-1px" }}>
                        {reviewStats.due}
                      </span>
                      <div style={{ fontSize: 14, color: T.green, fontWeight: 600, marginTop: 4 }}>
                        ayah{reviewStats.due !== 1 ? "s" : ""} ready for review
                      </div>
                      {reviewStats.weak > 0 && (
                        <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 6 }}>
                          {reviewStats.weak} weak ayah{reviewStats.weak !== 1 ? "s" : ""} to strengthen
                        </div>
                      )}
                    </div>
                    <div style={{
                      background: T.green,
                      color: T.textInverse,
                      borderRadius: T.radiusMd,
                      padding: "10px 18px",
                      fontSize: 14,
                      fontWeight: 700,
                    }}>
                      Begin →
                    </div>
                  </div>
                </div>
              </a>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "14px 0",
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: T.greenMuted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, color: T.green, fontWeight: 700,
                  flexShrink: 0,
                }}>✓</span>
                <span style={{ fontSize: 14, color: T.textSecondary }}>
                  {reviewStats.nextReviewMs
                    ? `Review queue clear · next in ${formatCountdown(reviewStats.nextReviewMs)}`
                    : "Review queue clear for today"}
                </span>
                <a href="/hifz/review" style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600, color: T.green, textDecoration: "none", flexShrink: 0 }}>
                  Browse →
                </a>
              </div>
            )}
          </div>
        )}

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

        {/* ── Hifz Progress (quiet inline row) ── */}
        {mounted && (
          <div style={{ padding: "24px 20px 0" }}>
            <a href="/hifz" style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "16px 18px",
                background: T.bgCard,
                borderRadius: T.radiusMd,
                border: `1px solid ${T.border}`,
                boxShadow: T.shadowSm,
              }}>
                {/* Book icon */}
                <div style={{
                  flexShrink: 0, width: 42, height: 42, borderRadius: T.radiusSm,
                  background: lastSurah ? T.greenMuted : T.bgSubtle,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <BookIcon color={lastSurah ? T.green : T.textTertiary} size={22} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {lastSurah ? (
                    <>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, marginBottom: 3 }}>
                        {lastSurah.name}
                      </div>
                      <div style={{ fontSize: 12, color: T.textTertiary, marginBottom: 6 }}>
                        {lastSurah.memorized} memorised · {lastSurah.inProgress} in progress
                      </div>
                      <div style={{ height: 4, background: T.bgSubtle, borderRadius: T.radiusFull, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: T.radiusFull,
                          background: T.green,
                          width: `${Math.round((lastSurah.memorized / lastSurah.total) * 100)}%`,
                          transition: "width 0.6s ease",
                        }} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>
                        Start memorising
                      </div>
                      <div style={{ fontSize: 12, color: T.textTertiary, marginTop: 2 }}>
                        Track your hifz surah by surah
                      </div>
                    </>
                  )}
                </div>

                <span style={{ fontSize: 13, fontWeight: 600, color: T.green, flexShrink: 0 }}>
                  {lastSurah ? "Continue" : "Begin"} →
                </span>
              </div>
            </a>
          </div>
        )}

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
