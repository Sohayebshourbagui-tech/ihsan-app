"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const G  = "#1a8a4a";
const G2 = "#2ea55f";
const CARD_SHADOW = "0 2px 8px rgba(0,0,0,0.06)";

const HIJRI_MONTHS = [
  "Muharram","Safar","Rabi al-Awwal","Rabi al-Thani",
  "Jumada al-Awwal","Jumada al-Thani","Rajab","Sha'ban",
  "Ramadan","Shawwal","Dhul Qa'dah","Dhul Hijjah",
];

const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const ANNUAL_EVENTS = [
  { key:"1-1",  icon:"🌙", name:"Islamic New Year",        hint:"Muharram 1"        },
  { key:"1-10", icon:"🌿", name:"Day of Ashura",           hint:"Muharram 10"       },
  { key:"3-12", icon:"⭐", name:"Mawlid al-Nabi",          hint:"Rabi al-Awwal 12"  },
  { key:"7-27", icon:"✨", name:"Isra & Mi'raj",           hint:"Rajab 27"          },
  { key:"8-15", icon:"🌟", name:"Laylat al-Bara'ah",       hint:"Sha'ban 15"        },
  { key:"9-1",  icon:"🌙", name:"Start of Ramadan",        hint:"Ramadan 1"         },
  { key:"9-27", icon:"💫", name:"Laylat al-Qadr",          hint:"Ramadan 27"        },
  { key:"10-1", icon:"🎉", name:"Eid al-Fitr",             hint:"Shawwal 1"         },
  { key:"12-9", icon:"🕋", name:"Day of Arafah",           hint:"Dhul Hijjah 9"     },
  { key:"12-10",icon:"🎊", name:"Eid al-Adha",             hint:"Dhul Hijjah 10"    },
  { key:"12-11",icon:"🗓", name:"Days of Tashreeq (1st)",  hint:"Dhul Hijjah 11"    },
  { key:"12-12",icon:"🗓", name:"Days of Tashreeq (2nd)",  hint:"Dhul Hijjah 12"    },
  { key:"12-13",icon:"🗓", name:"Days of Tashreeq (3rd)",  hint:"Dhul Hijjah 13"    },
];

const EVENT_MAP = Object.fromEntries(ANNUAL_EVENTS.map(e => [e.key, e.name]));

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

export default function CalendarPage() {
  const [hijriToday, setHijriToday]   = useState(null);
  const [gregToday,  setGregToday]    = useState(null);
  const [viewMonth,  setViewMonth]    = useState(null);
  const [calDays,    setCalDays]      = useState([]);
  const [loading,    setLoading]      = useState(true);
  const [calError,   setCalError]     = useState("");

  useEffect(() => { fetchToday(); }, []);

  useEffect(() => {
    if (viewMonth) buildCalendar(viewMonth.month, viewMonth.year);
  }, [viewMonth]);

  async function fetchToday() {
    try {
      const now  = new Date();
      const dd   = String(now.getDate()).padStart(2,"0");
      const mm   = String(now.getMonth()+1).padStart(2,"0");
      const yyyy = now.getFullYear();
      setGregToday({ day: now.getDate(), month: now.getMonth()+1, year: yyyy });
      const res  = await fetch(`https://api.aladhan.com/v1/gToH?date=${dd}-${mm}-${yyyy}`);
      const data = await res.json();
      const h    = data.data.hijri;
      const hm   = parseInt(h.month.number);
      const hy   = parseInt(h.year);
      setHijriToday({
        day:       parseInt(h.day),
        month:     hm,
        year:      hy,
        monthName: h.month.en,
        weekday:   h.weekday.en,
      });
      setViewMonth({ month: hm, year: hy });
    } catch {
      setLoading(false);
      setCalError("Could not load Hijri date. Check your connection.");
    }
  }

  const buildCalendar = useCallback(async (hMonth, hYear) => {
    setLoading(true);
    setCalError("");
    try {
      const r1   = await fetch(`https://api.aladhan.com/v1/hToG/1/${hMonth}/${hYear}`);
      const d1   = await r1.json();
      if (d1.code !== 200) throw new Error("API error");
      const p    = d1.data.gregorian.date.split("-");
      const start = new Date(parseInt(p[2]), parseInt(p[1])-1, parseInt(p[0])).getDay();

      let len = 30;
      try {
        const r30 = await fetch(`https://api.aladhan.com/v1/hToG/30/${hMonth}/${hYear}`);
        const d30 = await r30.json();
        if (d30.code === 200 && parseInt(d30.data.hijri.month.number) !== hMonth) len = 29;
      } catch { len = 29; }

      const days = [];
      for (let i = 0; i < start; i++) days.push(null);
      for (let d = 1; d <= len; d++) days.push(d);
      setCalDays(days);
    } catch {
      setCalError("Could not load calendar for this month.");
    } finally {
      setLoading(false);
    }
  }, []);

  function navMonth(dir) {
    if (!viewMonth) return;
    let { month, year } = viewMonth;
    month += dir;
    if (month > 12) { month = 1;  year++; }
    if (month < 1)  { month = 12; year--; }
    setViewMonth({ month, year });
  }

  const monthEvents = viewMonth
    ? ANNUAL_EVENTS.filter(e => parseInt(e.key.split("-")[0]) === viewMonth.month)
    : [];

  const isToday = (d) =>
    hijriToday && viewMonth &&
    hijriToday.day === d &&
    hijriToday.month === viewMonth.month &&
    hijriToday.year === viewMonth.year;

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
          <GeoPattern id="calNav" opacity={0.13}/>
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
              <div style={{ color:"#fff", fontSize:18, fontWeight:700, lineHeight:1.2 }}>Islamic Calendar</div>
              <div style={{ color:"rgba(255,255,255,0.62)", fontSize:11, marginTop:2 }}>Hijri dates & Islamic events</div>
            </div>
            <div style={{ marginLeft:"auto", fontSize:22 }}>📅</div>
          </div>
        </nav>

        <div style={{ maxWidth:680, margin:"0 auto", paddingBottom:60 }}>

          {/* Today card */}
          {hijriToday && (
            <div style={{
              background:`linear-gradient(135deg,#0d5e2e 0%,${G} 100%)`,
              margin:"16px 16px 0", borderRadius:20, padding:"24px 22px",
              boxShadow:"0 4px 20px rgba(26,138,74,0.28)",
              position:"relative", overflow:"hidden", textAlign:"center",
            }}>
              <GeoPattern id="calToday" opacity={0.10}/>
              <div style={{ position:"relative", zIndex:1 }}>
                <p style={{
                  fontSize:11, fontWeight:800, color:"rgba(255,255,255,0.7)",
                  letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:6,
                }}>Today</p>
                <p style={{ fontSize:52, fontWeight:900, color:"#fff", lineHeight:1, marginBottom:4 }}>
                  {hijriToday.day}
                </p>
                <p style={{ fontSize:20, fontWeight:700, color:"rgba(255,255,255,0.92)", marginBottom:4 }}>
                  {hijriToday.monthName} {hijriToday.year} AH
                </p>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>
                  {hijriToday.weekday}
                  {gregToday && ` · ${gregToday.day}/${gregToday.month}/${gregToday.year} CE`}
                </p>
              </div>
            </div>
          )}

          {/* Calendar card */}
          <div style={{
            background:"#fff", margin:"12px 16px 0", borderRadius:16,
            boxShadow:CARD_SHADOW, padding:"18px 14px",
          }}>
            {/* Month nav */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <button onClick={() => navMonth(-1)} style={{
                border:"none", background:"#f3f4f6", borderRadius:8,
                width:34, height:34, fontSize:18, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", color:"#374151",
              }}>‹</button>
              <h3 style={{ margin:0, fontSize:17, fontWeight:700, color:"#111827" }}>
                {viewMonth ? `${HIJRI_MONTHS[viewMonth.month-1]} ${viewMonth.year} AH` : "Loading…"}
              </h3>
              <button onClick={() => navMonth(1)} style={{
                border:"none", background:"#f3f4f6", borderRadius:8,
                width:34, height:34, fontSize:18, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", color:"#374151",
              }}>›</button>
            </div>

            {/* Weekday headers */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:6 }}>
              {WEEKDAYS.map(d => (
                <div key={d} style={{
                  textAlign:"center", fontSize:11, fontWeight:700,
                  color: d === "Fri" ? G : "#9ca3af",
                  textTransform:"uppercase", letterSpacing:"0.04em", padding:"4px 0",
                }}>{d}</div>
              ))}
            </div>

            {loading ? (
              <div style={{ height:180, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:13, color:"#9ca3af" }}>Loading calendar…</span>
              </div>
            ) : calError ? (
              <p style={{ textAlign:"center", color:"#b91c1c", fontSize:13, padding:"20px 0" }}>{calError}</p>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
                {calDays.map((day, idx) => {
                  if (!day) return <div key={`e${idx}`}/>;
                  const event   = EVENT_MAP[`${viewMonth?.month}-${day}`];
                  const today   = isToday(day);
                  const isFri   = idx % 7 === 5;
                  return (
                    <div key={day} title={event || ""} style={{
                      textAlign:"center", borderRadius:8, padding:"7px 2px",
                      background: today ? G : event ? "#ecfdf3" : "transparent",
                      border: today ? "none" : event ? `1px solid ${G}44` : "1px solid transparent",
                      cursor: event ? "default" : "default",
                    }}>
                      <span style={{
                        fontSize:13, fontWeight: today ? 800 : 600,
                        color: today ? "#fff" : isFri ? G : "#374151",
                        display:"block",
                      }}>{day}</span>
                      {event && !today && (
                        <span style={{
                          display:"block", width:4, height:4, borderRadius:"50%",
                          background:G, margin:"3px auto 0",
                        }}/>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Events this month */}
          <div style={{
            background:"#fff", margin:"12px 16px 0", borderRadius:16,
            boxShadow:CARD_SHADOW, padding:"18px 16px", borderLeft:`4px solid ${G}`,
          }}>
            <h3 style={{ margin:"0 0 14px", fontSize:16, fontWeight:700, color:"#111827" }}>
              Events — {viewMonth ? HIJRI_MONTHS[viewMonth.month-1] : ""}
            </h3>
            {monthEvents.length === 0 ? (
              <p style={{ fontSize:14, color:"#9ca3af", margin:0 }}>No special events this month.</p>
            ) : (
              <div style={{ display:"grid", gap:2 }}>
                {monthEvents.map(ev => (
                  <div key={ev.key} style={{
                    display:"flex", alignItems:"center", gap:12,
                    padding:"10px 0", borderBottom:"1px solid #f3f4f6",
                  }}>
                    <div style={{
                      minWidth:38, height:38, borderRadius:10,
                      background:"#ecfdf3",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:18,
                    }}>{ev.icon}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:"#111827" }}>{ev.name}</div>
                      <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>{ev.hint}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Annual reference */}
          <div style={{
            background:"#fff", margin:"12px 16px 0", borderRadius:16,
            boxShadow:CARD_SHADOW, padding:"18px 16px",
          }}>
            <h3 style={{ margin:"0 0 14px", fontSize:16, fontWeight:700, color:"#111827" }}>
              📌 Annual Islamic Events
            </h3>
            <div style={{ display:"grid", gap:0 }}>
              {ANNUAL_EVENTS.filter(e => !["12-11","12-12","12-13"].includes(e.key)).map(ev => (
                <div key={ev.key} style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"9px 0", borderBottom:"1px solid #f9fafb",
                }}>
                  <span style={{ fontSize:18, width:26, flexShrink:0 }}>{ev.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#111827" }}>{ev.name}</div>
                    <div style={{ fontSize:11, color:"#9ca3af", marginTop:1 }}>{ev.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height:20 }}/>
        </div>
      </div>
    </>
  );
}
