"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import BottomNav from "../components/BottomNav";

const G  = "#1a8a4a";
const G2 = "#2ea55f";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  "What did the Prophet ﷺ say about the importance of prayer?",
  "Are there hadiths about treating parents with kindness?",
  "What is the hadith about smiling being a form of charity?",
  "What did the Prophet ﷺ say about seeking knowledge?",
  "Are there hadiths about the virtues of Ramadan?",
  "What hadiths guide us on caring for neighbors?",
];

const MOCK_RESPONSES = [
  {
    text: `Bismillah. The Prophet ﷺ placed prayer as the second pillar of Islam, emphasizing it immediately after the declaration of faith [1].\n\nHe ﷺ said that the first matter a servant will be questioned about on the Day of Judgment is his prayer. If it is sound, all his deeds will be sound, and if corrupt, all will be corrupt [2].\n\nThe scholars note that this hadith establishes prayer as the criterion by which all other deeds are measured — making it the cornerstone of a believer's life.`,
    citations: [
      { id: 1, collection: "Sahih al-Bukhari", arabic_name: "صحيح البخاري", book: "Book of Faith", book_number: 2, hadith_number: 8, narrator: "Ibn Umar", grade: "Sahih", preview: "Islam is built upon five pillars..." },
      { id: 2, collection: "Jami' at-Tirmidhi", arabic_name: "جامع الترمذي", book: "Book of Prayer", book_number: 2, hadith_number: 413, narrator: "Abu Hurairah", grade: "Sahih", preview: "The first matter a servant will be questioned..." },
    ],
  },
  {
    text: `Bismillah, dear seeker. The Prophet ﷺ said: "Your smiling in the face of your brother is an act of charity (sadaqah)" [1].\n\nThis narration is a beautiful example of how Islam elevates the simplest human gestures to acts of worship. The Prophet ﷺ enumerated many such acts — removing harm from the road, offering a kind word — as forms of sadaqah accessible to every believer regardless of wealth.\n\nThe scholars note that this hadith teaches that charity is not limited to money. Every act that brings another person joy carries spiritual reward with Allah.`,
    citations: [
      { id: 1, collection: "Jami' at-Tirmidhi", arabic_name: "جامع الترمذي", book: "Book of Righteousness", book_number: 27, hadith_number: 1956, narrator: "Abu Dharr al-Ghifari", grade: "Sahih", preview: "Your smiling in the face of your brother is charity..." },
    ],
  },
  {
    text: `Bismillah. The Prophet ﷺ placed kindness to parents immediately after worship of Allah, indicating its supreme importance [1].\n\nWhen asked which deed is most beloved to Allah, he ﷺ replied: "Prayer at its proper time." Then: "Kindness to parents." Then: "Jihad in the way of Allah" [2].\n\nThis ordering is profound — it places serving one's parents above even striving in the path of Allah. The scholars derive that for most believers in ordinary times, serving parents with sincerity is among the greatest acts of worship available to them.`,
    citations: [
      { id: 1, collection: "Sahih al-Bukhari", arabic_name: "صحيح البخاري", book: "Book of Good Manners", book_number: 78, hadith_number: 5971, narrator: "Abdullah ibn Masud", grade: "Sahih", preview: "Which deed is most beloved to Allah..." },
      { id: 2, collection: "Sahih Muslim", arabic_name: "صحيح مسلم", book: "Book of Virtue", book_number: 45, hadith_number: 2549, narrator: "Abu Hurairah", grade: "Sahih", preview: "Kindness to parents comes after prayer..." },
    ],
  },
  {
    text: `Bismillah. The Prophet ﷺ said: "Seeking knowledge is an obligation upon every Muslim" [1].\n\nThis hadith, reported by Ibn Majah, is one of the most cited in Islamic scholarship. The word used — faridah — denotes a religious obligation, placing the pursuit of knowledge in the same category as prayer and fasting.\n\nScholars explain that the knowledge referred to here is primarily religious knowledge — understanding one's obligations to Allah. However, many scholars extend this to beneficial worldly knowledge that enables a person to fulfill their duties and serve their community [2].`,
    citations: [
      { id: 1, collection: "Sunan Ibn Majah", arabic_name: "سنن ابن ماجه", book: "Book of Sunnah", book_number: 1, hadith_number: 224, narrator: "Anas ibn Malik", grade: "Hasan", preview: "Seeking knowledge is an obligation upon every Muslim..." },
      { id: 2, collection: "Riyad as-Salihin", arabic_name: "رياض الصالحين", book: "Book of Knowledge", book_number: 13, hadith_number: 1381, narrator: "Various", grade: "Sahih", preview: "When a man dies, his deeds come to an end except for three..." },
    ],
  },
];

const GRADE_COLORS = {
  Sahih: { bg: "#d1fae5", text: "#065f46", label: "Sahih · صحيح" },
  Hasan: { bg: "#fef9c3", text: "#713f12", label: "Hasan · حسن" },
  Daif:  { bg: "#fee2e2", text: "#991b1b", label: "Da'if · ضعيف" },
};

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

// ─── Citation Card ─────────────────────────────────────────────────────────
function CitationCard({ citation }) {
  const grade = GRADE_COLORS[citation.grade] || GRADE_COLORS["Sahih"];
  return (
    <div style={{
      display: "flex", gap: 12,
      background: "#f0faf4",
      border: "1px solid #bbf7d0", borderLeft: `3px solid ${G}`,
      borderRadius: 10, padding: "12px 14px", marginTop: 8,
    }}>
      <div style={{
        flexShrink: 0, width: 26, height: 26,
        background: G, color: "white", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, marginTop: 2,
      }}>
        {citation.id}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#1a202c" }}>{citation.collection}</span>
          <span style={{ fontFamily: "serif", fontSize: 13, color: "#4a5568", direction: "rtl" }}>{citation.arabic_name}</span>
        </div>
        <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#718096", marginBottom: 3, flexWrap: "wrap" }}>
          {citation.book && <span style={{ fontStyle: "italic" }}>{citation.book} (Book {citation.book_number})</span>}
          <span style={{ fontWeight: 600, color: G }}>Hadith #{citation.hadith_number}</span>
        </div>
        {citation.narrator && (
          <div style={{ fontSize: 12, color: "#4a5568", marginBottom: 5 }}>
            Narrated by <strong>{citation.narrator}</strong>
          </div>
        )}
        {citation.preview && (
          <div style={{ fontSize: 12, color: "#2d3748", fontStyle: "italic", marginBottom: 7, lineHeight: 1.5 }}>
            "{citation.preview}..."
          </div>
        )}
        <span style={{
          display: "inline-block", fontSize: 11, fontWeight: 600,
          padding: "2px 10px", borderRadius: 20,
          background: grade.bg, color: grade.text,
        }}>
          {grade.label}
        </span>
      </div>
    </div>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────
function MessageBubble({ message, isStreaming }) {
  const isUser = message.role === "user";

  const formatText = (text) =>
    text.split(/\n\n+/).map((para, i) => {
      const withSup = para.replace(
        /\[(\d+)\]/g,
        `<sup style="font-size:11px;color:${G};background:#d1fae5;padding:0 3px;border-radius:3px;font-weight:700">[$1]</sup>`
      );
      const withBold = withSup.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      const isArabic = /[؀-ۿ]/.test(para);
      return (
        <p
          key={i}
          style={{
            margin: "0 0 10px", lineHeight: 1.8,
            fontFamily: isArabic ? "serif" : "inherit",
            fontSize: isArabic ? 20 : "inherit",
            direction: isArabic ? "rtl" : "ltr",
            textAlign: isArabic ? "right" : "left",
          }}
          dangerouslySetInnerHTML={{ __html: withBold }}
        />
      );
    });

  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      marginBottom: 24,
      flexDirection: isUser ? "row-reverse" : "row",
    }}>
      <div style={{
        flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 17, marginTop: 4,
        background: isUser ? "#f0fdf4" : `linear-gradient(135deg,${G},#0d6035)`,
        border: isUser ? `2px solid ${G}` : "none",
        boxShadow: isUser ? "none" : "0 2px 8px rgba(26,138,74,0.25)",
      }}>
        {isUser ? "🧕" : "📚"}
      </div>

      <div style={{
        maxWidth: "min(580px, 80%)",
        borderRadius: 16,
        padding: "14px 18px",
        fontSize: 14,
        background: isUser ? G : "#ffffff",
        color: isUser ? "#fff" : "#1a202c",
        border: isUser ? "none" : `1px solid #d1fae5`,
        boxShadow: isUser ? `0 2px 12px rgba(26,138,74,0.2)` : "0 2px 12px rgba(0,0,0,0.04)",
        borderBottomRightRadius: isUser ? 4 : 16,
        borderBottomLeftRadius: isUser ? 16 : 4,
      }}>
        {formatText(message.content)}

        {isStreaming && (
          <span style={{
            display: "inline-block", width: 2, height: "1em",
            background: G, marginLeft: 3, verticalAlign: "text-bottom",
            animation: "blink 0.8s infinite",
          }} />
        )}

        {!isUser && message.citations?.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px dashed #bbf7d0` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: G, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>
              📖 Sources & References
            </div>
            {message.citations.map((c, i) => (
              <CitationCard key={i} citation={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Welcome Screen ────────────────────────────────────────────────────────
function WelcomeScreen({ onSuggest }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 20px", textAlign: "center",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: `linear-gradient(135deg,${G},#0d6035)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32, marginBottom: 20,
        boxShadow: "0 8px 28px rgba(26,138,74,0.25)",
      }}>📚</div>

      <h2 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Scholarly.AI</h2>

      <p style={{ fontFamily: "serif", fontSize: 20, color: G, margin: "0 0 14px", direction: "rtl", lineHeight: 1.8 }}>
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </p>

      <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, maxWidth: 460, margin: "0 0 28px" }}>
        Ask about the prophetic tradition. Every answer is grounded in authentic hadith literature with full citations and references.
      </p>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 10, width: "100%", maxWidth: 600, marginBottom: 20,
      }}>
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => onSuggest(q)}
            style={{
              background: "#f0faf4",
              border: `1px solid #bbf7d0`,
              borderLeft: `3px solid ${G}`,
              borderRadius: 12, padding: "11px 13px",
              fontSize: 13, color: G, textAlign: "left",
              cursor: "pointer", lineHeight: 1.5, transition: "all 0.18s",
              display: "flex", alignItems: "flex-start", gap: 8,
              fontFamily: "inherit",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#dcfce7";
              e.currentTarget.style.borderColor = G;
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(26,138,74,0.12)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#f0faf4";
              e.currentTarget.style.borderColor = "#bbf7d0";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <span style={{ fontSize: 14, flexShrink: 0 }}>🌙</span>
            <span>{q}</span>
          </button>
        ))}
      </div>

      <div style={{
        display: "flex", gap: 8, alignItems: "flex-start",
        background: "#f0faf4", border: `1px solid #bbf7d0`,
        borderRadius: 10, padding: "10px 14px",
        fontSize: 12, color: "#166534", maxWidth: 460, textAlign: "left", lineHeight: 1.5,
      }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>ℹ️</span>
        <span>Scholarly only answers from hadith sources. Questions outside this scope will be gently redirected.</span>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function ScholarlyPage() {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [streamingIdx, setStreamingIdx] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  const mockIndexRef   = useRef(0);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const userText = (text || input).trim();
    if (!userText || isLoading) return;
    setInput("");
    setIsLoading(true);

    const userMsg = { role: "user", content: userText };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);

    const assistantIdx = updatedMsgs.length;
    const mock = MOCK_RESPONSES[mockIndexRef.current % MOCK_RESPONSES.length];
    mockIndexRef.current++;

    setMessages(prev => [...prev, { role: "assistant", content: "", citations: [] }]);
    setStreamingIdx(assistantIdx);

    const words = mock.text.split(" ");
    let accumulated = "";
    for (let i = 0; i < words.length; i++) {
      accumulated += (i === 0 ? "" : " ") + words[i];
      const snap = accumulated;
      setMessages(prev => {
        const updated = [...prev];
        updated[assistantIdx] = { role: "assistant", content: snap, citations: [] };
        return updated;
      });
      await new Promise(r => setTimeout(r, 25 + Math.random() * 20));
    }

    setMessages(prev => {
      const updated = [...prev];
      updated[assistantIdx] = { role: "assistant", content: mock.text, citations: mock.citations };
      return updated;
    });

    setIsLoading(false);
    setStreamingIdx(null);
    inputRef.current?.focus();
  }, [input, messages, isLoading]);

  useEffect(() => {
    const initQ = sessionStorage.getItem("scholarly_init_q");
    if (initQ) {
      sessionStorage.removeItem("scholarly_init_q");
      sendMessage(initQ);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearChat = () => {
    setMessages([]);
    setIsLoading(false);
    setStreamingIdx(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#fff", fontFamily: "inherit", paddingBottom: 58 }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .input-wrap { transition: border-color 0.2s, box-shadow 0.2s; }
        .send-btn:hover:not(:disabled) { background: #157a3c !important; }
        .clear-btn:hover { background: rgba(255,255,255,0.25) !important; }
      `}</style>

      {/* ── Green gradient header ── */}
      <div style={{
        flexShrink: 0,
        background: `linear-gradient(135deg, #157a3c 0%, ${G} 55%, ${G2} 100%)`,
        boxShadow: "0 2px 16px rgba(26,138,74,0.32)",
        position: "relative",
        overflow: "hidden",
      }}>
        <GeoPattern id="geoScholarlyHeader" opacity={0.11} />
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "13px 22px 15px",
          position: "relative", zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>📚</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                Scholarly.AI
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                Hadith-based Islamic Knowledge
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.28)",
              color: "#fff", fontSize: 11, fontWeight: 600,
              padding: "5px 11px", borderRadius: 20,
            }}>📖 10 Collections</div>
            {messages.length > 0 && (
              <button onClick={clearChat} className="clear-btn" style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                color: "rgba(255,255,255,0.9)", fontSize: 12, padding: "5px 13px",
                borderRadius: 20, cursor: "pointer", fontFamily: "inherit",
              }}>🗑️ New Chat</button>
            )}
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 22, marginLeft: 4 }}>☽</span>
          </div>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: "#fff" }}>
        {messages.length === 0 ? (
          <WelcomeScreen onSuggest={sendMessage} />
        ) : (
          <div style={{ maxWidth: 760, margin: "0 auto", width: "100%", padding: "24px 20px" }}>
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} isStreaming={isLoading && i === streamingIdx} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Input bar ── */}
      <div style={{
        flexShrink: 0, padding: "12px 20px 10px",
        background: "#fff", borderTop: "1px solid #ececec",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.04)",
      }}>
        <div
          className="input-wrap"
          style={{
            display: "flex", gap: 10, alignItems: "flex-end",
            maxWidth: 700, margin: "0 auto",
            background: "#fff",
            border: `1px solid ${inputFocused ? G : "#e0e0e0"}`,
            borderRadius: 14, padding: "0 10px 0 0",
            boxShadow: inputFocused ? `0 0 0 3px rgba(26,138,74,0.08)` : "none",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Ask about hadith, Sunnah, or prophetic guidance..."
            disabled={isLoading}
            rows={1}
            style={{
              flex: 1, border: "none", background: "transparent",
              fontSize: 14, color: "#111827", outline: "none",
              lineHeight: 1.5, resize: "none", fontFamily: "inherit",
              padding: "16px 8px 16px 18px",
              minHeight: 52, maxHeight: 160, overflow: "hidden",
            }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="send-btn"
            style={{
              flexShrink: 0, width: 38, height: 38,
              marginBottom: 8,
              background: G,
              color: "#fff", border: "none", borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: !input.trim() || isLoading ? 0.55 : 1,
              transition: "opacity 0.18s, background 0.18s",
            }}
          >
            {isLoading ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5"/>
                <path d="M12 3a9 9 0 019 9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                </path>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "#a0aec0", margin: "7px auto 0", maxWidth: 700 }}>
          Scholarly answers exclusively from authenticated hadith. Always consult a qualified scholar for personal matters.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
