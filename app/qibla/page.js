"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";

const G  = "#1a8a4a";
const G2 = "#2ea55f";

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

/* ── helpers ───────────────────────────────────────────────────── */

function calcQibla(userLat, userLng) {
  const lat1 = userLat * Math.PI / 180;
  const lat2 = KAABA_LAT * Math.PI / 180;
  const dLng = (KAABA_LNG - userLng) * Math.PI / 180;
  const x = Math.sin(dLng) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
}

function calcDistance(lat1, lng1) {
  const R = 6371;
  const dLat = (KAABA_LAT - lat1) * Math.PI / 180;
  const dLng = (KAABA_LNG - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(KAABA_LAT * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function dirLabel(deg) {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

/* ── GeoPattern (matches app-wide style) ───────────────────────── */

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

/* ── Compass ────────────────────────────────────────────────────── */

function CompassDial({ qiblaAngle, deviceHeading, hasOrientation }) {
  const size = 280;
  const cx   = size / 2;
  const cy   = size / 2;
  const outerR = 128;

  /*
   * ringRot:   counter-rotates the dial so N always points to real-world North.
   * needleRot: absolute angle of the Qibla relative to the current screen "up".
   *            When needleRot == 0 the user is facing exactly toward Qibla.
   */
  const ringRot   = -deviceHeading;
  const needleRot = qiblaAngle - deviceHeading;

  const cardinals = [
    { label: "N", angle: 0,   color: "#e53e3e", fs: 15, fw: 800 },
    { label: "E", angle: 90,  color: "#555",    fs: 13, fw: 700 },
    { label: "S", angle: 180, color: "#555",    fs: 13, fw: 700 },
    { label: "W", angle: 270, color: "#555",    fs: 13, fw: 700 },
  ];

  const intercardinals = [
    { label: "NE", angle: 45  },
    { label: "SE", angle: 135 },
    { label: "SW", angle: 225 },
    { label: "NW", angle: 315 },
  ];

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>

      {/* Ambient glow behind the dial */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: size + 28, height: size + 28,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${G}1a 0%, transparent 65%)`,
        pointerEvents: "none",
      }} />

      {/* ── Compass ring – counter-rotates with device heading ── */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `rotate(${ringRot}deg)`,
        transition: hasOrientation ? "transform 0.08s linear" : "none",
      }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <radialGradient id="qFaceBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f4f6f4" />
            </radialGradient>
          </defs>

          {/* Dial face */}
          <circle cx={cx} cy={cy} r={outerR} fill="url(#qFaceBg)" />
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#dedede" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={outerR - 20} fill="none" stroke="#f0f0f0" strokeWidth="1" />

          {/* Tick marks (every 5°, emphasis at 10° and 30°) */}
          {Array.from({ length: 72 }, (_, i) => {
            const deg  = i * 5;
            const rad  = deg * Math.PI / 180;
            const is30 = deg % 30 === 0;
            const is10 = deg % 10 === 0;
            const len  = is30 ? 13 : is10 ? 8 : 5;
            const r1   = outerR - 2;
            const r2   = r1 - len;
            return (
              <line key={i}
                x1={cx + r1 * Math.sin(rad)} y1={cy - r1 * Math.cos(rad)}
                x2={cx + r2 * Math.sin(rad)} y2={cy - r2 * Math.cos(rad)}
                stroke={is30 ? "#aaa" : is10 ? "#ccc" : "#e5e5e5"}
                strokeWidth={is30 ? 1.5 : 1}
              />
            );
          })}

          {/* Cardinal labels */}
          {cardinals.map(({ label, angle, color, fs, fw }) => {
            const rad = angle * Math.PI / 180;
            const d   = outerR - 26;
            return (
              <text key={label}
                x={cx + d * Math.sin(rad)} y={cy - d * Math.cos(rad) + fs * 0.36}
                textAnchor="middle" fill={color}
                fontSize={fs} fontWeight={fw}
                fontFamily="system-ui,-apple-system,sans-serif"
              >{label}</text>
            );
          })}

          {/* Intercardinal labels */}
          {intercardinals.map(({ label, angle }) => {
            const rad = angle * Math.PI / 180;
            const d   = outerR - 28;
            return (
              <text key={label}
                x={cx + d * Math.sin(rad)} y={cy - d * Math.cos(rad) + 4}
                textAnchor="middle" fill="#c0c0c0"
                fontSize={9} fontWeight={500}
                fontFamily="system-ui,-apple-system,sans-serif"
              >{label}</text>
            );
          })}
        </svg>
      </div>

      {/* ── Qibla needle – points toward Qibla direction ── */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `rotate(${needleRot}deg)`,
        transition: hasOrientation ? "transform 0.1s linear" : "transform 0.45s ease-out",
      }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <filter id="qNeedleGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={G} floodOpacity="0.5" />
            </filter>
            <linearGradient id="qNeedleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor={G2} />
              <stop offset="100%" stopColor={G}  />
            </linearGradient>
          </defs>

          {/* Upper (Qibla) needle — gradient green */}
          <polygon
            points={`${cx},${cy - 88} ${cx + 9},${cy + 16} ${cx},${cy + 4} ${cx - 9},${cy + 16}`}
            fill="url(#qNeedleGrad)"
            filter="url(#qNeedleGlow)"
          />
          {/* Lower (opposite) needle — gray */}
          <polygon
            points={`${cx},${cy + 20} ${cx + 6},${cy + 48} ${cx},${cy + 41} ${cx - 6},${cy + 48}`}
            fill="#d1d5db"
          />
          {/* Pivot cap */}
          <circle cx={cx} cy={cy} r={10} fill="white" stroke="#e0e0e0" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r={4.5} fill={G} />

          {/* Kaaba emoji at needle tip */}
          <text x={cx} y={cy - 94} textAnchor="middle" fontSize={22} style={{ userSelect: "none" }}>🕋</text>
        </svg>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function QiblaPage() {
  const [status, setStatus]       = useState("loading");  // loading | denied | granted
  const [city, setCity]           = useState("");
  const [qiblaAngle, setQiblaAngle] = useState(0);
  const [distance, setDistance]   = useState(0);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [hasOrientation, setHasOrientation] = useState(false);
  const [orientPerm, setOrientPerm] = useState("unknown"); // unknown | granted | denied | unavailable

  /* ── Geolocation ── */
  useEffect(() => {
    if (!navigator.geolocation) { setStatus("denied"); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        setQiblaAngle(calcQibla(lat, lng));
        setDistance(calcDistance(lat, lng));
        setStatus("granted");
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const d = await r.json();
          const a = d.address || {};
          setCity(a.city || a.town || a.county || a.state || "");
        } catch { /* city is optional */ }
      },
      () => setStatus("denied")
    );
  }, []);

  /* ── DeviceOrientation — detect capability ── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof DeviceOrientationEvent === "undefined") {
      setOrientPerm("unavailable"); return;
    }
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      setOrientPerm("unknown"); // iOS 13+ — needs user gesture
    } else {
      setOrientPerm("granted"); // Android / desktop — attach immediately
    }
  }, []);

  /* ── DeviceOrientation — attach listener when permission is granted ── */
  useEffect(() => {
    if (orientPerm !== "granted") return;

    let prev     = null;
    let smooth   = 0;

    function handleOrientation(e) {
      const raw = e.webkitCompassHeading != null
        ? e.webkitCompassHeading
        : (360 - (e.alpha || 0)) % 360;

      // Accumulate delta to avoid 359→0 wrap-around snapping
      if (prev !== null) {
        let delta = raw - prev;
        if (delta >  180) delta -= 360;
        if (delta < -180) delta += 360;
        smooth += delta;
      } else {
        smooth = raw;
      }
      prev = raw;
      setDeviceHeading(smooth);
      setHasOrientation(true);
    }

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, [orientPerm]);

  /* ── iOS permission request ── */
  async function requestCompassPermission() {
    try {
      const result = await DeviceOrientationEvent.requestPermission();
      setOrientPerm(result === "granted" ? "granted" : "denied");
    } catch {
      setOrientPerm("denied");
    }
  }

  return (
    <>
      <style>{`::-webkit-scrollbar { display: none; }`}</style>

      <div style={{ minHeight: "100vh", background: "#f8f9fa", paddingBottom: 70 }}>

        {/* ── Navbar ── */}
        <nav style={{
          background: `linear-gradient(135deg, #157a3c 0%, ${G} 55%, ${G2} 100%)`,
          width: "100%",
          boxShadow: "0 2px 16px rgba(26,138,74,0.32)",
          position: "relative", overflow: "hidden",
        }}>
          <GeoPattern id="qNavGeo" opacity={0.13} />
          <div style={{
            maxWidth: 680, margin: "0 auto", padding: "13px 20px 15px",
            display: "flex", alignItems: "center", gap: 12,
            position: "relative", zIndex: 1,
          }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 16, cursor: "pointer",
              }}>←</div>
            </Link>
            <div>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>Qibla</div>
              <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 11, marginTop: 2 }}>
                Direction to the Kaaba
              </div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 22 }}>🧭</div>
          </div>
        </nav>

        <div style={{ maxWidth: 680, margin: "0 auto", paddingBottom: 60 }}>

          {/* ── Loading ── */}
          {status === "loading" && (
            <div style={{
              background: "#fff", margin: "20px 16px 0",
              borderRadius: 16, padding: "60px 24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#444", marginBottom: 6 }}>
                Getting your location…
              </p>
              <p style={{ fontSize: 13, color: "#aaa" }}>
                Allow location access when prompted
              </p>
            </div>
          )}

          {/* ── Permission denied ── */}
          {status === "denied" && (
            <div style={{
              background: "#fff", margin: "20px 16px 0",
              borderRadius: 16, padding: "52px 24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              textAlign: "center",
              borderTop: "4px solid #e53e3e",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 10 }}>
                Location Access Required
              </p>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, maxWidth: 300, margin: "0 auto" }}>
                Enable location permissions in your browser settings and reload the page to find the Qibla direction.
              </p>
            </div>
          )}

          {/* ── Granted ── */}
          {status === "granted" && (
            <>
              {/* Compass card */}
              <div style={{
                background: "#fff", margin: "16px 16px 0",
                borderRadius: 20, padding: "26px 20px 22px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                textAlign: "center",
              }}>
                <p style={{
                  fontSize: 11, fontWeight: 800, color: G,
                  letterSpacing: "0.09em", textTransform: "uppercase",
                  marginBottom: 24,
                }}>Qibla Direction</p>

                <CompassDial
                  qiblaAngle={qiblaAngle}
                  deviceHeading={deviceHeading}
                  hasOrientation={hasOrientation}
                />

                {/* Degree badge */}
                <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
                  <div style={{
                    background: `${G}0f`, border: `1px solid ${G}28`,
                    borderRadius: 12, padding: "10px 28px",
                    display: "inline-flex", alignItems: "center", gap: 12,
                  }}>
                    <span style={{ fontSize: 26, fontWeight: 900, color: G, letterSpacing: "-0.5px" }}>
                      {Math.round(qiblaAngle)}°
                    </span>
                    <span style={{ fontSize: 13, color: "#555", fontWeight: 600 }}>
                      from North &middot; {dirLabel(qiblaAngle)}
                    </span>
                  </div>
                </div>

                {/* Orientation status */}
                {orientPerm === "unknown" && (
                  <button
                    onClick={requestCompassPermission}
                    style={{
                      marginTop: 18,
                      display: "inline-flex", alignItems: "center", gap: 7,
                      background: G, color: "#fff", border: "none",
                      borderRadius: 10, padding: "11px 22px",
                      fontSize: 13, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    🔄 Enable Live Compass
                  </button>
                )}
                {orientPerm === "denied" && (
                  <p style={{ marginTop: 14, fontSize: 12, color: "#aaa" }}>
                    Compass sensor access denied — static direction shown
                  </p>
                )}
                {orientPerm === "unavailable" && (
                  <p style={{ marginTop: 14, fontSize: 12, color: "#aaa" }}>
                    No compass sensor — rotate manually to the angle shown above
                  </p>
                )}
                {hasOrientation && (
                  <p style={{ marginTop: 14, fontSize: 12, color: G, fontWeight: 700 }}>
                    ● Live compass active — rotate until 🕋 points straight up
                  </p>
                )}
              </div>

              {/* Stats grid */}
              <div style={{
                margin: "12px 16px 0",
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10,
              }}>
                {[
                  { icon: "🌍", value: `${distance.toLocaleString()} km`, label: "Distance" },
                  { icon: "📍", value: city || "Detected",                label: "Location"    },
                  { icon: "🧭", value: `${Math.round(qiblaAngle)}°`,      label: "Qibla Angle" },
                ].map(({ icon, value, label }) => (
                  <div key={label} style={{
                    background: "#fff", borderRadius: 14,
                    padding: "14px 10px", textAlign: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                    <div style={{
                      fontSize: 13, fontWeight: 800, color: "#1a1a1a",
                      marginBottom: 3, wordBreak: "break-word",
                    }}>{value}</div>
                    <div style={{
                      fontSize: 10, color: "#999",
                      textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600,
                    }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* How to use */}
              <div style={{
                background: "#fff", margin: "12px 16px 0",
                borderRadius: 16, borderLeft: `4px solid ${G}`,
                padding: "18px 18px 14px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}>
                <p style={{
                  fontSize: 11, fontWeight: 800, color: G,
                  letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 12,
                }}>How to Use</p>
                {[
                  ["📱", "Hold your phone flat and level in your palm."],
                  ["🔄", "Slowly rotate your body until the 🕋 needle points straight up."],
                  ["📡", "On mobile, the compass ring rotates live with your device heading."],
                  ["💻", "On desktop, use the degree shown above to orient yourself manually."],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                    <span style={{ fontSize: 13, color: "#555", lineHeight: 1.65 }}>{text}</span>
                  </div>
                ))}
              </div>

              {/* Quran ayah banner */}
              <div style={{
                background: `linear-gradient(135deg, #0d5e2e 0%, #146e38 45%, ${G} 100%)`,
                margin: "12px 16px 0", borderRadius: 16,
                padding: "22px 22px 20px",
                boxShadow: "0 4px 20px rgba(13,94,46,0.28)",
                position: "relative", overflow: "hidden",
              }}>
                <GeoPattern id="qMeccaGeo" opacity={0.10} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <p style={{
                    fontFamily: "Amiri, serif", fontSize: 20,
                    color: "rgba(255,255,255,0.88)",
                    direction: "rtl", textAlign: "right",
                    lineHeight: 1.9, marginBottom: 10,
                  }}>
                    وَمِنْ حَيْثُ خَرَجْتَ فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ
                  </p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.65, margin: 0 }}>
                    "Wherever you go out from, turn your face toward al-Masjid al-Haram." — Al-Baqarah 2:150
                  </p>
                </div>
              </div>

              <div style={{ height: 20 }} />
            </>
          )}

        </div>
      </div>
      <BottomNav />
    </>
  );
}
