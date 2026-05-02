"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";

const G  = "#1a8a4a";
const G2 = "#2ea55f";
const CARD_SHADOW = "0 2px 8px rgba(0,0,0,0.06)";

const SURAHS = [
  { n:1,  name:"Al-Fatihah",   ar:"الفاتحة",    a:7   },
  { n:2,  name:"Al-Baqarah",   ar:"البقرة",      a:286 },
  { n:3,  name:"Al-Imran",     ar:"آل عمران",    a:200 },
  { n:4,  name:"An-Nisa",      ar:"النساء",      a:176 },
  { n:5,  name:"Al-Maidah",    ar:"المائدة",     a:120 },
  { n:6,  name:"Al-Anam",      ar:"الأنعام",     a:165 },
  { n:7,  name:"Al-Araf",      ar:"الأعراف",     a:206 },
  { n:8,  name:"Al-Anfal",     ar:"الأنفال",     a:75  },
  { n:9,  name:"At-Tawbah",    ar:"التوبة",      a:129 },
  { n:10, name:"Yunus",        ar:"يونس",        a:109 },
  { n:11, name:"Hud",          ar:"هود",         a:123 },
  { n:12, name:"Yusuf",        ar:"يوسف",        a:111 },
  { n:13, name:"Ar-Rad",       ar:"الرعد",       a:43  },
  { n:14, name:"Ibrahim",      ar:"إبراهيم",     a:52  },
  { n:15, name:"Al-Hijr",      ar:"الحجر",       a:99  },
  { n:16, name:"An-Nahl",      ar:"النحل",       a:128 },
  { n:17, name:"Al-Isra",      ar:"الإسراء",     a:111 },
  { n:18, name:"Al-Kahf",      ar:"الكهف",       a:110 },
  { n:19, name:"Maryam",       ar:"مريم",        a:98  },
  { n:20, name:"Ta-Ha",        ar:"طه",          a:135 },
  { n:21, name:"Al-Anbiya",    ar:"الأنبياء",    a:112 },
  { n:22, name:"Al-Hajj",      ar:"الحج",        a:78  },
  { n:23, name:"Al-Muminun",   ar:"المؤمنون",    a:118 },
  { n:24, name:"An-Nur",       ar:"النور",       a:64  },
  { n:25, name:"Al-Furqan",    ar:"الفرقان",     a:77  },
  { n:26, name:"Ash-Shuara",   ar:"الشعراء",     a:227 },
  { n:27, name:"An-Naml",      ar:"النمل",       a:93  },
  { n:28, name:"Al-Qasas",     ar:"القصص",       a:88  },
  { n:29, name:"Al-Ankabut",   ar:"العنكبوت",    a:69  },
  { n:30, name:"Ar-Rum",       ar:"الروم",       a:60  },
  { n:31, name:"Luqman",       ar:"لقمان",       a:34  },
  { n:32, name:"As-Sajdah",    ar:"السجدة",      a:30  },
  { n:33, name:"Al-Ahzab",     ar:"الأحزاب",     a:73  },
  { n:34, name:"Saba",         ar:"سبأ",         a:54  },
  { n:35, name:"Fatir",        ar:"فاطر",        a:45  },
  { n:36, name:"Ya-Sin",       ar:"يس",          a:83  },
  { n:37, name:"As-Saffat",    ar:"الصافات",     a:182 },
  { n:38, name:"Sad",          ar:"ص",           a:88  },
  { n:39, name:"Az-Zumar",     ar:"الزمر",       a:75  },
  { n:40, name:"Ghafir",       ar:"غافر",        a:85  },
  { n:41, name:"Fussilat",     ar:"فصلت",        a:54  },
  { n:42, name:"Ash-Shura",    ar:"الشورى",      a:53  },
  { n:43, name:"Az-Zukhruf",   ar:"الزخرف",      a:89  },
  { n:44, name:"Ad-Dukhan",    ar:"الدخان",      a:59  },
  { n:45, name:"Al-Jathiyah",  ar:"الجاثية",     a:37  },
  { n:46, name:"Al-Ahqaf",     ar:"الأحقاف",     a:35  },
  { n:47, name:"Muhammad",     ar:"محمد",        a:38  },
  { n:48, name:"Al-Fath",      ar:"الفتح",       a:29  },
  { n:49, name:"Al-Hujurat",   ar:"الحجرات",     a:18  },
  { n:50, name:"Qaf",          ar:"ق",           a:45  },
  { n:51, name:"Ad-Dhariyat",  ar:"الذاريات",    a:60  },
  { n:52, name:"At-Tur",       ar:"الطور",       a:49  },
  { n:53, name:"An-Najm",      ar:"النجم",       a:62  },
  { n:54, name:"Al-Qamar",     ar:"القمر",       a:55  },
  { n:55, name:"Ar-Rahman",    ar:"الرحمن",      a:78  },
  { n:56, name:"Al-Waqiah",    ar:"الواقعة",     a:96  },
  { n:57, name:"Al-Hadid",     ar:"الحديد",      a:29  },
  { n:58, name:"Al-Mujadilah", ar:"المجادلة",    a:22  },
  { n:59, name:"Al-Hashr",     ar:"الحشر",       a:24  },
  { n:60, name:"Al-Mumtahanah",ar:"الممتحنة",    a:13  },
  { n:61, name:"As-Saf",       ar:"الصف",        a:14  },
  { n:62, name:"Al-Jumuah",    ar:"الجمعة",      a:11  },
  { n:63, name:"Al-Munafiqun", ar:"المنافقون",   a:11  },
  { n:64, name:"At-Taghabun",  ar:"التغابن",     a:18  },
  { n:65, name:"At-Talaq",     ar:"الطلاق",      a:12  },
  { n:66, name:"At-Tahrim",    ar:"التحريم",     a:12  },
  { n:67, name:"Al-Mulk",      ar:"الملك",       a:30  },
  { n:68, name:"Al-Qalam",     ar:"القلم",       a:52  },
  { n:69, name:"Al-Haqqah",    ar:"الحاقة",      a:52  },
  { n:70, name:"Al-Maarij",    ar:"المعارج",     a:44  },
  { n:71, name:"Nuh",          ar:"نوح",         a:28  },
  { n:72, name:"Al-Jinn",      ar:"الجن",        a:28  },
  { n:73, name:"Al-Muzzammil", ar:"المزمل",      a:20  },
  { n:74, name:"Al-Muddaththir",ar:"المدثر",     a:56  },
  { n:75, name:"Al-Qiyamah",   ar:"القيامة",     a:40  },
  { n:76, name:"Al-Insan",     ar:"الإنسان",     a:31  },
  { n:77, name:"Al-Mursalat",  ar:"المرسلات",    a:50  },
  { n:78, name:"An-Naba",      ar:"النبأ",       a:40  },
  { n:79, name:"An-Naziat",    ar:"النازعات",    a:46  },
  { n:80, name:"Abasa",        ar:"عبس",         a:42  },
  { n:81, name:"At-Takwir",    ar:"التكوير",     a:29  },
  { n:82, name:"Al-Infitar",   ar:"الانفطار",    a:19  },
  { n:83, name:"Al-Mutaffifin",ar:"المطففين",    a:36  },
  { n:84, name:"Al-Inshiqaq",  ar:"الانشقاق",    a:25  },
  { n:85, name:"Al-Buruj",     ar:"البروج",      a:22  },
  { n:86, name:"At-Tariq",     ar:"الطارق",      a:17  },
  { n:87, name:"Al-Ala",       ar:"الأعلى",      a:19  },
  { n:88, name:"Al-Ghashiyah", ar:"الغاشية",     a:26  },
  { n:89, name:"Al-Fajr",      ar:"الفجر",       a:30  },
  { n:90, name:"Al-Balad",     ar:"البلد",       a:20  },
  { n:91, name:"Ash-Shams",    ar:"الشمس",       a:15  },
  { n:92, name:"Al-Layl",      ar:"الليل",       a:21  },
  { n:93, name:"Ad-Duha",      ar:"الضحى",       a:11  },
  { n:94, name:"Ash-Sharh",    ar:"الشرح",       a:8   },
  { n:95, name:"At-Tin",       ar:"التين",       a:8   },
  { n:96, name:"Al-Alaq",      ar:"العلق",       a:19  },
  { n:97, name:"Al-Qadr",      ar:"القدر",       a:5   },
  { n:98, name:"Al-Bayyinah",  ar:"البينة",      a:8   },
  { n:99, name:"Az-Zalzalah",  ar:"الزلزلة",     a:8   },
  { n:100,name:"Al-Adiyat",    ar:"العاديات",    a:11  },
  { n:101,name:"Al-Qariah",    ar:"القارعة",     a:11  },
  { n:102,name:"At-Takathur",  ar:"التكاثر",     a:8   },
  { n:103,name:"Al-Asr",       ar:"العصر",       a:3   },
  { n:104,name:"Al-Humazah",   ar:"الهمزة",      a:9   },
  { n:105,name:"Al-Fil",       ar:"الفيل",       a:5   },
  { n:106,name:"Quraysh",      ar:"قريش",        a:4   },
  { n:107,name:"Al-Maun",      ar:"الماعون",     a:7   },
  { n:108,name:"Al-Kawthar",   ar:"الكوثر",      a:3   },
  { n:109,name:"Al-Kafirun",   ar:"الكافرون",    a:6   },
  { n:110,name:"An-Nasr",      ar:"النصر",       a:3   },
  { n:111,name:"Al-Masad",     ar:"المسد",       a:5   },
  { n:112,name:"Al-Ikhlas",    ar:"الإخلاص",     a:4   },
  { n:113,name:"Al-Falaq",     ar:"الفلق",       a:5   },
  { n:114,name:"An-Nas",       ar:"الناس",       a:6   },
];

const TOTAL_AYAHS = SURAHS.reduce((s, r) => s + r.a, 0); // 6236

const STATUS = { NONE:0, PROGRESS:1, MEMORIZED:2 };

const STATUS_STYLE = {
  [STATUS.NONE]:      { bg:"#f3f4f6", border:"#e5e7eb", color:"#9ca3af", label:"Not Started" },
  [STATUS.PROGRESS]:  { bg:"#fef9c3", border:"#fde68a", color:"#b45309", label:"In Progress"  },
  [STATUS.MEMORIZED]: { bg:"#dcfce7", border:"#86efac", color:"#15803d", label:"Memorized"    },
};

function lsKey(n) { return `hifz_${n}`; }

function loadProgress(surah) {
  if (typeof window === "undefined") return new Array(surah.a).fill(STATUS.NONE);
  try {
    const saved = localStorage.getItem(lsKey(surah.n));
    if (saved) {
      const arr = JSON.parse(saved);
      if (arr.length === surah.a) return arr;
    }
  } catch { /* ignore */ }
  return new Array(surah.a).fill(STATUS.NONE);
}

function saveProgress(surahNum, progress) {
  try { localStorage.setItem(lsKey(surahNum), JSON.stringify(progress)); } catch { /* ignore */ }
}

function loadAllStats() {
  if (typeof window === "undefined") return { memorized: 0, inProgress: 0 };
  let memorized = 0, inProgress = 0;
  SURAHS.forEach(s => {
    try {
      const saved = localStorage.getItem(lsKey(s.n));
      if (saved) {
        const arr = JSON.parse(saved);
        arr.forEach(v => {
          if (v === STATUS.MEMORIZED) memorized++;
          else if (v === STATUS.PROGRESS) inProgress++;
        });
      }
    } catch { /* ignore */ }
  });
  return { memorized, inProgress };
}

function GeoPattern({ id, opacity = 0.12 }) {
  return (
    <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity, pointerEvents:"none" }}
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={id} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M30 2 L58 30 L30 58 L2 30 Z" fill="none" stroke="white" strokeWidth="0.8"/>
          <path d="M30 16 L44 30 L30 44 L16 30 Z" fill="none" stroke="white" strokeWidth="0.5"/>
          <circle cx="30" cy="30" r="2"   fill="white"/>
          <circle cx="0"  cy="0"  r="1.5" fill="white"/>
          <circle cx="60" cy="0"  r="1.5" fill="white"/>
          <circle cx="0"  cy="60" r="1.5" fill="white"/>
          <circle cx="60" cy="60" r="1.5" fill="white"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`}/>
    </svg>
  );
}

export default function HifzPage() {
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [progress,      setProgress]      = useState([]);
  const [stats,         setStats]         = useState({ memorized:0, inProgress:0 });
  const [search,        setSearch]        = useState("");
  const [mounted,       setMounted]       = useState(false);

  useEffect(() => {
    setMounted(true);
    setStats(loadAllStats());
  }, []);

  const selectSurah = useCallback((surah) => {
    setSelectedSurah(surah);
    setProgress(loadProgress(surah));
  }, []);

  function toggleAyah(idx) {
    setProgress(prev => {
      const next = [...prev];
      next[idx] = (next[idx] + 1) % 3;
      saveProgress(selectedSurah.n, next);
      setStats(loadAllStats());
      return next;
    });
  }

  function markAll(status) {
    if (!selectedSurah) return;
    const next = new Array(selectedSurah.a).fill(status);
    setProgress(next);
    saveProgress(selectedSurah.n, next);
    setStats(loadAllStats());
  }

  const surahMemorized  = progress.filter(v => v === STATUS.MEMORIZED).length;
  const surahInProgress = progress.filter(v => v === STATUS.PROGRESS).length;
  const surahPct = selectedSurah ? Math.round((surahMemorized / selectedSurah.a) * 100) : 0;
  const totalPct  = Math.round((stats.memorized / TOTAL_AYAHS) * 100);

  const filtered = SURAHS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ar.includes(search) ||
    String(s.n).includes(search)
  );

  return (
    <>
      <style>{`::-webkit-scrollbar{display:none}`}</style>
      <div style={{ minHeight:"100vh", background:"#f8f9fa", paddingBottom:70 }}>

        {/* Navbar */}
        <nav style={{
          background:`linear-gradient(135deg,#157a3c 0%,${G} 55%,${G2} 100%)`,
          width:"100%", boxShadow:"0 2px 16px rgba(26,138,74,0.32)",
          position:"relative", overflow:"hidden",
        }}>
          <GeoPattern id="hifzNav" opacity={0.13}/>
          <div style={{
            maxWidth:680, margin:"0 auto", padding:"13px 20px 15px",
            display:"flex", alignItems:"center", gap:12, position:"relative", zIndex:1,
          }}>
            <Link href="/" style={{ textDecoration:"none" }}>
              <div style={{
                width:32, height:32, borderRadius:"50%",
                background:"rgba(255,255,255,0.18)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"#fff", fontSize:16, cursor:"pointer",
              }}>←</div>
            </Link>
            <div>
              <div style={{ color:"#fff", fontSize:18, fontWeight:700, lineHeight:1.2 }}>Hifz Tracker</div>
              <div style={{ color:"rgba(255,255,255,0.62)", fontSize:11, marginTop:2 }}>Quran memorisation progress</div>
            </div>
            <div style={{ marginLeft:"auto", fontSize:22 }}>📖</div>
          </div>
        </nav>

        <div style={{ maxWidth:680, margin:"0 auto", paddingBottom:60 }}>

          {/* Overall stats banner */}
          <div style={{
            background:`linear-gradient(135deg,#0d5e2e 0%,${G} 100%)`,
            margin:"16px 16px 0", borderRadius:20, padding:"22px 20px",
            boxShadow:"0 4px 20px rgba(26,138,74,0.28)",
            position:"relative", overflow:"hidden",
          }}>
            <GeoPattern id="hifzStats" opacity={0.10}/>
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <p style={{
                    fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.7)",
                    letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:4,
                  }}>Overall Progress</p>
                  <p style={{ fontSize:28, fontWeight:900, color:"#fff", lineHeight:1 }}>
                    {mounted ? stats.memorized.toLocaleString() : "—"}
                    <span style={{ fontSize:14, fontWeight:600, opacity:0.7 }}>/{TOTAL_AYAHS.toLocaleString()}</span>
                  </p>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginTop:3 }}>
                    ayahs memorised
                  </p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontSize:36, fontWeight:900, color:"#fff", lineHeight:1 }}>
                    {mounted ? totalPct : 0}%
                  </p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>complete</p>
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ height:8, background:"rgba(255,255,255,0.2)", borderRadius:999, overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:999, background:"rgba(255,255,255,0.85)",
                  width:`${mounted ? totalPct : 0}%`, transition:"width 0.4s ease",
                }}/>
              </div>
              {mounted && stats.inProgress > 0 && (
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:8 }}>
                  {stats.inProgress.toLocaleString()} ayahs in progress
                </p>
              )}
            </div>
          </div>

          {/* Status legend */}
          <div style={{
            margin:"12px 16px 0", display:"grid",
            gridTemplateColumns:"repeat(3,1fr)", gap:8,
          }}>
            {Object.entries(STATUS_STYLE).map(([k, s]) => (
              <div key={k} style={{
                background:s.bg, border:`1px solid ${s.border}`,
                borderRadius:10, padding:"10px 8px", textAlign:"center",
              }}>
                <div style={{ fontSize:11, fontWeight:700, color:s.color }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Surah search + selector */}
          <div style={{
            background:"#fff", margin:"12px 16px 0", borderRadius:16,
            boxShadow:CARD_SHADOW, padding:"16px",
          }}>
            <h3 style={{ margin:"0 0 12px", fontSize:16, fontWeight:700, color:"#111827" }}>
              Select a Surah
            </h3>
            <input
              type="text"
              placeholder="Search by name or number…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width:"100%", padding:"10px 14px", borderRadius:10,
                border:"1.5px solid #e5e7eb", fontSize:14, color:"#374151",
                outline:"none", boxSizing:"border-box", marginBottom:10,
                fontFamily:"inherit",
              }}
            />
            <div style={{ maxHeight:260, overflowY:"auto" }}>
              {filtered.map(s => {
                const saved = mounted ? (() => {
                  try {
                    const d = localStorage.getItem(lsKey(s.n));
                    if (!d) return 0;
                    return JSON.parse(d).filter(v => v === STATUS.MEMORIZED).length;
                  } catch { return 0; }
                })() : 0;
                const pct = Math.round((saved / s.a) * 100);
                const active = selectedSurah?.n === s.n;
                return (
                  <button key={s.n} onClick={() => selectSurah(s)} style={{
                    display:"flex", alignItems:"center", width:"100%",
                    textAlign:"left", border:"none",
                    background: active ? "#ecfdf3" : "transparent",
                    borderRadius:10, padding:"10px 10px",
                    cursor:"pointer", gap:12,
                    borderLeft: active ? `3px solid ${G}` : "3px solid transparent",
                  }}>
                    <span style={{
                      minWidth:32, fontSize:12, fontWeight:800, color:"#9ca3af",
                    }}>{s.n}.</span>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontSize:14, fontWeight:700, color: active ? G : "#111827" }}>
                          {s.name}
                        </span>
                        <span style={{ fontSize:11, fontWeight:700, color: G }}>
                          {pct > 0 ? `${pct}%` : ""}
                        </span>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
                        <span style={{ fontSize:11, color:"#9ca3af" }}>{s.a} ayahs</span>
                        <span style={{ fontFamily:"Amiri,serif", fontSize:13, color:"#374151" }}>{s.ar}</span>
                      </div>
                      {pct > 0 && (
                        <div style={{ height:3, background:"#e5e7eb", borderRadius:999, marginTop:4, overflow:"hidden" }}>
                          <div style={{ height:"100%", background:G, borderRadius:999, width:`${pct}%` }}/>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected surah detail */}
          {selectedSurah && (
            <>
              {/* Surah header */}
              <div style={{
                background:"#fff", margin:"12px 16px 0", borderRadius:16,
                boxShadow:CARD_SHADOW, padding:"18px 16px",
                borderLeft:`4px solid ${G}`,
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div>
                    <h3 style={{ margin:"0 0 2px", fontSize:18, fontWeight:800, color:"#111827" }}>
                      {selectedSurah.name}
                    </h3>
                    <p style={{
                      margin:"0 0 4px", fontFamily:"Amiri,serif", fontSize:20,
                      color:"#374151", direction:"rtl",
                    }}>{selectedSurah.ar}</p>
                    <p style={{ margin:0, fontSize:12, color:"#9ca3af" }}>
                      Surah {selectedSurah.n} · {selectedSurah.a} ayahs
                    </p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ margin:0, fontSize:28, fontWeight:900, color:G }}>{surahPct}%</p>
                    <p style={{ margin:0, fontSize:11, color:"#9ca3af" }}>memorised</p>
                  </div>
                </div>

                {/* Surah progress bar */}
                <div style={{ height:8, background:"#f3f4f6", borderRadius:999, overflow:"hidden", marginBottom:10 }}>
                  <div style={{
                    height:"100%", borderRadius:999,
                    background:`linear-gradient(90deg,${G},${G2})`,
                    width:`${surahPct}%`, transition:"width 0.3s ease",
                  }}/>
                </div>

                <div style={{ display:"flex", gap:8, fontSize:12, color:"#6b7280", marginBottom:14 }}>
                  <span style={{ color:"#15803d", fontWeight:700 }}>✓ {surahMemorized} memorised</span>
                  {surahInProgress > 0 && (
                    <span style={{ color:"#b45309", fontWeight:700 }}>⟳ {surahInProgress} in progress</span>
                  )}
                  <span>{selectedSurah.a - surahMemorized - surahInProgress} not started</span>
                </div>

                {/* Quick actions */}
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => markAll(STATUS.MEMORIZED)} style={{
                    flex:1, border:`1px solid ${G}`, background:"#ecfdf3",
                    color:G, borderRadius:8, padding:"8px",
                    fontSize:12, fontWeight:700, cursor:"pointer",
                  }}>Mark All Memorised</button>
                  <button onClick={() => markAll(STATUS.NONE)} style={{
                    flex:1, border:"1px solid #e5e7eb", background:"#f9fafb",
                    color:"#6b7280", borderRadius:8, padding:"8px",
                    fontSize:12, fontWeight:700, cursor:"pointer",
                  }}>Reset</button>
                </div>
              </div>

              {/* Ayah grid */}
              <div style={{
                background:"#fff", margin:"12px 16px 0", borderRadius:16,
                boxShadow:CARD_SHADOW, padding:"16px",
              }}>
                <p style={{
                  margin:"0 0 12px", fontSize:11, fontWeight:800, color:G,
                  textTransform:"uppercase", letterSpacing:"0.08em",
                }}>Tap an ayah to cycle its status</p>
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(auto-fill,minmax(40px,1fr))",
                  gap:5,
                }}>
                  {progress.map((status, idx) => {
                    const s = STATUS_STYLE[status];
                    return (
                      <button key={idx} onClick={() => toggleAyah(idx)} title={`Ayah ${idx+1}`} style={{
                        height:40, borderRadius:7,
                        background:s.bg, border:`1.5px solid ${s.border}`,
                        color:s.color, fontSize:11, fontWeight:700,
                        cursor:"pointer", transition:"transform 0.1s,background 0.15s",
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {!selectedSurah && (
            <div style={{
              background:"#fff", margin:"12px 16px 0", borderRadius:16,
              boxShadow:CARD_SHADOW, padding:"36px 20px",
              textAlign:"center",
            }}>
              <div style={{ fontSize:42, marginBottom:12 }}>📖</div>
              <p style={{ fontSize:15, fontWeight:700, color:"#374151", marginBottom:6 }}>
                Select a surah to start tracking
              </p>
              <p style={{ fontSize:13, color:"#9ca3af" }}>
                Tap any surah above to view and update your memorisation progress
              </p>
            </div>
          )}

          <div style={{ height:20 }}/>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
