"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import { T } from "../../lib/theme";
import { CalendarEventIcon } from "../components/icons";

const G  = T.green;
const CARD_SHADOW = T.shadowSm;

const HIJRI_MONTHS = [
  "Muharram","Safar","Rabi al-Awwal","Rabi al-Thani",
  "Jumada al-Awwal","Jumada al-Thani","Rajab","Sha'ban",
  "Ramadan","Shawwal","Dhul Qa'dah","Dhul Hijjah",
];

const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const ANNUAL_EVENTS = [
  { key:"1-1",  type:"crescent", name:"Islamic New Year",        hint:"Muharram 1"        },
  { key:"1-10", type:"ornament", name:"Day of Ashura",           hint:"Muharram 10"       },
  { key:"3-12", type:"star",     name:"Mawlid al-Nabi",          hint:"Rabi al-Awwal 12"  },
  { key:"7-27", type:"star",     name:"Isra & Mi'raj",           hint:"Rajab 27"          },
  { key:"8-15", type:"star",     name:"Laylat al-Bara'ah",       hint:"Sha'ban 15"        },
  { key:"9-1",  type:"crescent", name:"Start of Ramadan",        hint:"Ramadan 1"         },
  { key:"9-27", type:"star",     name:"Laylat al-Qadr",          hint:"Ramadan 27"        },
  { key:"10-1", type:"eid",      name:"Eid al-Fitr",             hint:"Shawwal 1"         },
  { key:"12-9", type:"ornament", name:"Day of Arafah",           hint:"Dhul Hijjah 9"     },
  { key:"12-10",type:"eid",      name:"Eid al-Adha",             hint:"Dhul Hijjah 10"    },
  { key:"12-11",type:"ornament", name:"Days of Tashreeq (1st)",  hint:"Dhul Hijjah 11"    },
  { key:"12-12",type:"ornament", name:"Days of Tashreeq (2nd)",  hint:"Dhul Hijjah 12"    },
  { key:"12-13",type:"ornament", name:"Days of Tashreeq (3rd)",  hint:"Dhul Hijjah 13"    },
];

const EVENT_MAP = Object.fromEntries(ANNUAL_EVENTS.map(e => [e.key, e.name]));


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
      <div style={{ minHeight:"100vh", background:T.bgPage, paddingBottom:70 }}>

        {/* Header */}
        <header style={{
          background: T.bgCard,
          borderBottom: `1px solid ${T.border}`,
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{
            maxWidth:680, margin:"0 auto", padding:"14px 20px",
            display:"flex", alignItems:"center", gap:14,
          }}>
            <Link href="/" style={{ textDecoration:"none", color:T.textSecondary, fontSize:20, lineHeight:1 }}>←</Link>
            <div>
              <div style={{ fontSize:17, fontWeight:700, color:T.textPrimary }}>Islamic Calendar</div>
              <div style={{ fontSize:11, color:T.textTertiary, marginTop:1 }}>Hijri dates & Islamic events</div>
            </div>
          </div>
        </header>

        <div style={{ maxWidth:680, margin:"0 auto", paddingBottom:60 }}>

          {/* Today card */}
          {hijriToday && (
            <div style={{
              background: T.bgCard,
              margin:"16px 16px 0", borderRadius:T.radiusMd, padding:"24px 22px",
              border: `1px solid ${T.border}`,
              boxShadow: T.shadowSm,
              textAlign:"center",
            }}>
              <p style={{
                fontSize:11, fontWeight:700, color:T.textTertiary,
                letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8,
              }}>Today</p>
              <p style={{ fontSize:52, fontWeight:800, color:T.green, lineHeight:1, marginBottom:4 }}>
                {hijriToday.day}
              </p>
              <p style={{ fontSize:18, fontWeight:700, color:T.textPrimary, marginBottom:4 }}>
                {hijriToday.monthName} {hijriToday.year} AH
              </p>
              <p style={{ fontSize:13, color:T.textTertiary }}>
                {hijriToday.weekday}
                {gregToday && ` · ${gregToday.day}/${gregToday.month}/${gregToday.year} CE`}
              </p>
            </div>
          )}

          {/* Calendar card */}
          <div style={{
            background:T.bgCard, margin:"12px 16px 0", borderRadius:T.radiusMd,
            border:`1px solid ${T.border}`, boxShadow:CARD_SHADOW, padding:"18px 14px",
          }}>
            {/* Month nav */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <button onClick={() => navMonth(-1)} style={{
                border:`1px solid ${T.border}`, background:T.bgSubtle, borderRadius:T.radiusSm,
                width:34, height:34, fontSize:18, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", color:T.textSecondary,
              }}>‹</button>
              <h3 style={{ margin:0, fontSize:17, fontWeight:700, color:T.textPrimary }}>
                {viewMonth ? `${HIJRI_MONTHS[viewMonth.month-1]} ${viewMonth.year} AH` : "Loading…"}
              </h3>
              <button onClick={() => navMonth(1)} style={{
                border:`1px solid ${T.border}`, background:T.bgSubtle, borderRadius:T.radiusSm,
                width:34, height:34, fontSize:18, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", color:T.textSecondary,
              }}>›</button>
            </div>

            {/* Weekday headers */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:6 }}>
              {WEEKDAYS.map(d => (
                <div key={d} style={{
                  textAlign:"center", fontSize:11, fontWeight:700,
                  color: d === "Fri" ? T.green : T.textTertiary,
                  textTransform:"uppercase", letterSpacing:"0.04em", padding:"4px 0",
                }}>{d}</div>
              ))}
            </div>

            {loading ? (
              <div style={{ height:180, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:13, color:T.textTertiary }}>Loading calendar…</span>
              </div>
            ) : calError ? (
              <p style={{ textAlign:"center", color:T.red, fontSize:13, padding:"20px 0" }}>{calError}</p>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
                {calDays.map((day, idx) => {
                  if (!day) return <div key={`e${idx}`}/>;
                  const event   = EVENT_MAP[`${viewMonth?.month}-${day}`];
                  const today   = isToday(day);
                  const isFri   = idx % 7 === 5;
                  return (
                    <div key={day} title={event || ""} style={{
                      textAlign:"center", borderRadius:T.radiusSm, padding:"7px 2px",
                      background: today ? T.green : event ? T.greenMuted : "transparent",
                      border: today ? "none" : event ? `1px solid ${T.green}44` : "1px solid transparent",
                    }}>
                      <span style={{
                        fontSize:13, fontWeight: today ? 800 : 600,
                        color: today ? "#fff" : isFri ? T.green : T.textPrimary,
                        display:"block",
                      }}>{day}</span>
                      {event && !today && (
                        <span style={{
                          display:"block", width:4, height:4, borderRadius:"50%",
                          background:T.green, margin:"3px auto 0",
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
            background:T.bgCard, margin:"12px 16px 0", borderRadius:T.radiusMd,
            border:`1px solid ${T.border}`, boxShadow:CARD_SHADOW, padding:"18px 16px",
          }}>
            <h3 style={{ margin:"0 0 14px", fontSize:16, fontWeight:700, color:T.textPrimary }}>
              Events — {viewMonth ? HIJRI_MONTHS[viewMonth.month-1] : ""}
            </h3>
            {monthEvents.length === 0 ? (
              <p style={{ fontSize:14, color:T.textTertiary, margin:0 }}>No special events this month.</p>
            ) : (
              <div style={{ display:"grid", gap:2 }}>
                {monthEvents.map(ev => (
                  <div key={ev.key} style={{
                    display:"flex", alignItems:"center", gap:12,
                    padding:"10px 0", borderBottom:`1px solid ${T.border}`,
                  }}>
                    <div style={{
                      minWidth:38, height:38, borderRadius:T.radiusSm,
                      background: ev.type === "eid" ? T.goldLight : T.greenMuted,
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      <CalendarEventIcon type={ev.type} size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:T.textPrimary }}>{ev.name}</div>
                      <div style={{ fontSize:11, color:T.textTertiary, marginTop:1 }}>{ev.hint}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Annual reference */}
          <div style={{
            background:T.bgCard, margin:"12px 16px 0", borderRadius:T.radiusMd,
            border:`1px solid ${T.border}`, boxShadow:CARD_SHADOW, padding:"18px 16px",
          }}>
            <h3 style={{ margin:"0 0 14px", fontSize:16, fontWeight:700, color:T.textPrimary }}>
              Annual Islamic Events
            </h3>
            <div style={{ display:"grid", gap:0 }}>
              {ANNUAL_EVENTS.filter(e => !["12-11","12-12","12-13"].includes(e.key)).map(ev => (
                <div key={ev.key} style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"9px 0", borderBottom:`1px solid ${T.border}`,
                }}>
                  <span style={{ width:26, flexShrink:0, display:"flex", alignItems:"center" }}>
                    <CalendarEventIcon type={ev.type} size={18} />
                  </span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:T.textPrimary }}>{ev.name}</div>
                    <div style={{ fontSize:11, color:T.textTertiary, marginTop:1 }}>{ev.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height:20 }}/>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
