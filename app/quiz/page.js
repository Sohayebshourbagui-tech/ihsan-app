"use client";

import { useState } from "react";
import Link from "next/link";

const G  = "#1a8a4a";
const G2 = "#2ea55f";
const CARD_SHADOW = "0 2px 8px rgba(0,0,0,0.06)";

const QUESTIONS = [
  {
    q: "How many surahs are in the Quran?",
    opts: ["112","113","114","115"],
    ans: 2, cat: "Quran",
  },
  {
    q: "Which is the longest surah in the Quran?",
    opts: ["Al-Imran","Al-Baqarah","An-Nisa","Al-Araf"],
    ans: 1, cat: "Quran",
  },
  {
    q: "Which surah is known as the 'Heart of the Quran'?",
    opts: ["Al-Fatihah","Al-Ikhlas","Ya-Sin","Al-Kahf"],
    ans: 2, cat: "Quran",
  },
  {
    q: "How many ayahs are in Surah Al-Fatihah?",
    opts: ["5","6","7","8"],
    ans: 2, cat: "Quran",
  },
  {
    q: "Which surah was the first to be revealed to the Prophet ﷺ?",
    opts: ["Al-Fatihah","Al-Muddaththir","Al-Alaq","Al-Baqarah"],
    ans: 2, cat: "Quran",
  },
  {
    q: "Who compiled Sahih Bukhari?",
    opts: ["Imam Muslim","Imam Ahmad","Imam Bukhari","Imam Abu Dawud"],
    ans: 2, cat: "Hadith",
  },
  {
    q: "What does 'Sahih' mean in hadith terminology?",
    opts: ["Weak","Authentic","Rare","Forged"],
    ans: 1, cat: "Hadith",
  },
  {
    q: "Which hadith collection was compiled by Imam Muslim?",
    opts: ["Al-Muwatta","Sunan Abu Dawud","Sahih Muslim","Sunan an-Nasai"],
    ans: 2, cat: "Hadith",
  },
  {
    q: "What are the 'Kutub al-Sittah'?",
    opts: ["The 6 pillars of faith","The 6 major hadith collections","Six chapters of Quran","Six types of prayer"],
    ans: 1, cat: "Hadith",
  },
  {
    q: "How many pillars of Islam are there?",
    opts: ["3","4","5","6"],
    ans: 2, cat: "Fiqh",
  },
  {
    q: "What is the Nisab threshold for Zakah on gold?",
    opts: ["50 grams","70 grams","85 grams","100 grams"],
    ans: 2, cat: "Fiqh",
  },
  {
    q: "Which obligatory prayer is performed just before sunrise?",
    opts: ["Isha","Tahajjud","Fajr","Duha"],
    ans: 2, cat: "Fiqh",
  },
  {
    q: "What is the Islamic term for scholarly consensus?",
    opts: ["Qiyas","Ijtihad","Ijma","Fatwa"],
    ans: 2, cat: "Fiqh",
  },
  {
    q: "How many times must one complete Tawaf around the Kaaba?",
    opts: ["3","5","7","9"],
    ans: 2, cat: "Fiqh",
  },
  {
    q: "In which year was Prophet Muhammad ﷺ born?",
    opts: ["560 CE","570 CE","580 CE","590 CE"],
    ans: 1, cat: "History",
  },
  {
    q: "In which city was the Prophet Muhammad ﷺ born?",
    opts: ["Medina","Taif","Jerusalem","Mecca"],
    ans: 3, cat: "History",
  },
  {
    q: "What is the Hijra?",
    opts: ["The first revelation","The migration from Mecca to Medina","The Battle of Badr","The conquest of Mecca"],
    ans: 1, cat: "History",
  },
  {
    q: "Who was the first person to accept Islam?",
    opts: ["Abu Bakr","Ali ibn Abi Talib","Khadijah bint Khuwaylid","Umar ibn al-Khattab"],
    ans: 2, cat: "History",
  },
  {
    q: "Who was the first Caliph after the Prophet ﷺ?",
    opts: ["Umar ibn al-Khattab","Ali ibn Abi Talib","Uthman ibn Affan","Abu Bakr as-Siddiq"],
    ans: 3, cat: "History",
  },
  {
    q: "Which is considered the first major battle of Islam?",
    opts: ["Battle of Uhud","Battle of Khandaq","Battle of Badr","Battle of Hunayn"],
    ans: 2, cat: "History",
  },
];

const CAT_COLORS = {
  Quran:   { bg:"#eff6ff", color:"#2563eb" },
  Hadith:  { bg:"#fef3c7", color:"#d97706" },
  Fiqh:    { bg:"#ecfdf3", color: G        },
  History: { bg:"#fdf4ff", color:"#9333ea" },
};

function grade(score) {
  if (score >= 18) return { label:"Excellent",       emoji:"🏆", color:"#15803d" };
  if (score >= 15) return { label:"Very Good",       emoji:"⭐", color:G        };
  if (score >= 12) return { label:"Good",            emoji:"👍", color:"#2563eb" };
  if (score >= 8)  return { label:"Average",         emoji:"📚", color:"#d97706" };
  return              { label:"Needs Improvement", emoji:"💪", color:"#b91c1c" };
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

export default function QuizPage() {
  const [phase,    setPhase]    = useState("start");   // start | quiz | result
  const [current,  setCurrent]  = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers,  setAnswers]  = useState([]);

  function startQuiz() {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setPhase("quiz");
  }

  function pickAnswer(idx) {
    if (selected !== null) return;
    setSelected(idx);
  }

  function nextQuestion() {
    const newAnswers = [...answers, selected];
    if (current + 1 >= QUESTIONS.length) {
      setAnswers(newAnswers);
      setPhase("result");
    } else {
      setAnswers(newAnswers);
      setCurrent(c => c + 1);
      setSelected(null);
    }
  }

  const score = answers.filter((a, i) => a === QUESTIONS[i].ans).length;
  const q     = QUESTIONS[current];

  return (
    <>
      <style>{`::-webkit-scrollbar{display:none}`}</style>
      <div style={{ minHeight:"100vh", background:"#f8f9fa" }}>

        {/* Navbar */}
        <nav style={{
          background:`linear-gradient(135deg,#157a3c 0%,${G} 55%,${G2} 100%)`,
          width:"100%", boxShadow:"0 2px 16px rgba(26,138,74,0.32)",
          position:"relative", overflow:"hidden",
        }}>
          <GeoPattern id="quizNav" opacity={0.13}/>
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
              <div style={{ color:"#fff", fontSize:18, fontWeight:700, lineHeight:1.2 }}>Islamic Quiz</div>
              <div style={{ color:"rgba(255,255,255,0.62)", fontSize:11, marginTop:2 }}>
                Quran · Hadith · Fiqh · History
              </div>
            </div>
            <div style={{ marginLeft:"auto", fontSize:22 }}>🎓</div>
          </div>
        </nav>

        <div style={{ maxWidth:680, margin:"0 auto", paddingBottom:60 }}>

          {/* ── START SCREEN ── */}
          {phase === "start" && (
            <div style={{ padding:"32px 16px 0" }}>
              <div style={{
                background:"#fff", borderRadius:20, boxShadow:CARD_SHADOW,
                padding:"36px 28px", textAlign:"center",
              }}>
                <div style={{ fontSize:56, marginBottom:16 }}>🎓</div>
                <h2 style={{ margin:"0 0 10px", fontSize:24, fontWeight:800, color:"#111827" }}>
                  Islamic Knowledge Quiz
                </h2>
                <p style={{ margin:"0 0 24px", fontSize:15, color:"#6b7280", lineHeight:1.7 }}>
                  Test your knowledge of the Quran, Hadith, Fiqh, and Islamic history with 20 multiple-choice questions.
                </p>
                <div style={{
                  display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:28,
                }}>
                  {Object.entries(CAT_COLORS).map(([cat, style]) => (
                    <div key={cat} style={{
                      background:style.bg, borderRadius:12,
                      padding:"14px 12px", textAlign:"center",
                    }}>
                      <div style={{ fontSize:13, fontWeight:700, color:style.color }}>{cat}</div>
                      <div style={{ fontSize:11, color:"#9ca3af", marginTop:3 }}>
                        {QUESTIONS.filter(qq => qq.cat === cat).length} questions
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={startQuiz} style={{
                  background:`linear-gradient(135deg,${G},${G2})`,
                  color:"#fff", border:"none", borderRadius:14,
                  padding:"15px 48px", fontSize:16, fontWeight:800,
                  cursor:"pointer", boxShadow:`0 4px 14px ${G}55`,
                }}>
                  Start Quiz
                </button>
              </div>
            </div>
          )}

          {/* ── QUIZ SCREEN ── */}
          {phase === "quiz" && (
            <div style={{ padding:"20px 16px 0" }}>

              {/* Progress bar */}
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:"#6b7280" }}>
                    Question {current + 1} of {QUESTIONS.length}
                  </span>
                  <span style={{
                    fontSize:12, fontWeight:700,
                    background: CAT_COLORS[q.cat].bg,
                    color: CAT_COLORS[q.cat].color,
                    padding:"2px 8px", borderRadius:999,
                  }}>{q.cat}</span>
                </div>
                <div style={{ height:6, background:"#e5e7eb", borderRadius:999, overflow:"hidden" }}>
                  <div style={{
                    height:"100%", borderRadius:999,
                    background:`linear-gradient(90deg,${G},${G2})`,
                    width:`${((current + 1) / QUESTIONS.length) * 100}%`,
                    transition:"width 0.3s ease",
                  }}/>
                </div>
              </div>

              {/* Question card */}
              <div style={{
                background:"#fff", borderRadius:18, boxShadow:CARD_SHADOW,
                padding:"24px 22px 20px",
              }}>
                <p style={{
                  margin:"0 0 24px", fontSize:18, fontWeight:700,
                  color:"#111827", lineHeight:1.55,
                }}>{q.q}</p>

                <div style={{ display:"grid", gap:10 }}>
                  {q.opts.map((opt, idx) => {
                    let bg = "#fff", border = "1.5px solid #e5e7eb", color = "#374151";
                    if (selected !== null) {
                      if (idx === q.ans) {
                        bg = "#dcfce7"; border = "1.5px solid #16a34a"; color = "#15803d";
                      } else if (idx === selected && idx !== q.ans) {
                        bg = "#fee2e2"; border = "1.5px solid #dc2626"; color = "#b91c1c";
                      }
                    }
                    return (
                      <button key={idx} onClick={() => pickAnswer(idx)} style={{
                        textAlign:"left", background:bg, border, color,
                        borderRadius:12, padding:"14px 16px",
                        fontSize:15, fontWeight:600, cursor: selected !== null ? "default" : "pointer",
                        transition:"all 0.15s ease",
                        display:"flex", alignItems:"center", gap:12,
                      }}>
                        <span style={{
                          minWidth:28, height:28, borderRadius:"50%",
                          background: selected !== null && idx === q.ans ? "#16a34a"
                                    : selected !== null && idx === selected && idx !== q.ans ? "#dc2626"
                                    : "#f3f4f6",
                          color: (selected !== null && (idx === q.ans || idx === selected)) ? "#fff" : "#9ca3af",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:13, fontWeight:800, flexShrink:0,
                        }}>
                          {selected !== null && idx === q.ans ? "✓"
                           : selected !== null && idx === selected && idx !== q.ans ? "✗"
                           : String.fromCharCode(65 + idx)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {selected !== null && (
                  <button onClick={nextQuestion} style={{
                    marginTop:20, width:"100%",
                    background:`linear-gradient(135deg,${G},${G2})`,
                    color:"#fff", border:"none", borderRadius:12,
                    padding:"14px", fontSize:15, fontWeight:800, cursor:"pointer",
                  }}>
                    {current + 1 < QUESTIONS.length ? "Next Question →" : "See Results"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── RESULT SCREEN ── */}
          {phase === "result" && (() => {
            const g = grade(score);
            return (
              <div style={{ padding:"24px 16px 0" }}>
                {/* Score banner */}
                <div style={{
                  background:`linear-gradient(135deg,#0d5e2e 0%,${G} 100%)`,
                  borderRadius:20, padding:"30px 24px", textAlign:"center",
                  boxShadow:"0 4px 20px rgba(26,138,74,0.28)",
                  position:"relative", overflow:"hidden", marginBottom:14,
                }}>
                  <GeoPattern id="resultGeo" opacity={0.10}/>
                  <div style={{ position:"relative", zIndex:1 }}>
                    <div style={{ fontSize:48, marginBottom:8 }}>{g.emoji}</div>
                    <div style={{ fontSize:44, fontWeight:900, color:"#fff", lineHeight:1 }}>
                      {score}<span style={{ fontSize:22, fontWeight:600, opacity:0.7 }}>/{QUESTIONS.length}</span>
                    </div>
                    <div style={{ fontSize:15, fontWeight:700, color:"rgba(255,255,255,0.9)", marginTop:6 }}>
                      {g.label}
                    </div>
                    <div style={{ fontSize:13, color:"rgba(255,255,255,0.6)", marginTop:4 }}>
                      {Math.round((score / QUESTIONS.length) * 100)}% correct
                    </div>
                  </div>
                </div>

                {/* Restart */}
                <button onClick={startQuiz} style={{
                  display:"block", width:"calc(100% - 0px)", marginBottom:14,
                  background:`linear-gradient(135deg,${G},${G2})`,
                  color:"#fff", border:"none", borderRadius:14,
                  padding:"14px", fontSize:15, fontWeight:800,
                  cursor:"pointer", boxShadow:`0 4px 14px ${G}44`,
                }}>
                  Try Again
                </button>

                {/* Review */}
                <div style={{ background:"#fff", borderRadius:16, boxShadow:CARD_SHADOW, padding:"18px 16px" }}>
                  <h3 style={{ margin:"0 0 14px", fontSize:16, fontWeight:700, color:"#111827" }}>
                    Answer Review
                  </h3>
                  <div style={{ display:"grid", gap:8 }}>
                    {QUESTIONS.map((qq, i) => {
                      const correct = answers[i] === qq.ans;
                      return (
                        <div key={i} style={{
                          borderRadius:12, overflow:"hidden",
                          border:`1px solid ${correct ? "#bbf7d0" : "#fecaca"}`,
                        }}>
                          <div style={{
                            background: correct ? "#f0fdf4" : "#fff5f5",
                            padding:"10px 14px",
                            display:"flex", gap:10, alignItems:"flex-start",
                          }}>
                            <span style={{
                              fontSize:13, fontWeight:800, flexShrink:0, marginTop:2,
                              color: correct ? "#15803d" : "#b91c1c",
                            }}>{correct ? "✓" : "✗"}</span>
                            <div style={{ flex:1 }}>
                              <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:600, color:"#1f2937" }}>
                                {qq.q}
                              </p>
                              {!correct && (
                                <p style={{ margin:0, fontSize:12, color:"#15803d" }}>
                                  Correct: {qq.opts[qq.ans]}
                                </p>
                              )}
                              <span style={{
                                display:"inline-block", marginTop:4,
                                fontSize:10, fontWeight:700, padding:"2px 6px", borderRadius:999,
                                background: CAT_COLORS[qq.cat].bg,
                                color: CAT_COLORS[qq.cat].color,
                              }}>{qq.cat}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </>
  );
}
