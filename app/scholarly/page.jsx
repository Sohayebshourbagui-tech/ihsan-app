"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import BottomNav from "../components/BottomNav";
import { T } from "../../lib/theme";
import { BookIcon, InfoIcon } from "../components/icons";

// ─── Scholarly.AI Premium Colors ─────────────────────────────────────────────
const SC = {
  parchment:      "#f8f5ef",
  forestGreen:    "#163c2f",
  emerald:        "#1f6b4f",
  softGold:       "#c8a96b",
  cream:          "#fffaf5",
  ivory:          "#fdf9f3",
  textDark:       "#2a2420",
  textWarm:       "#6b6562",
  textLight:      "#a89f98",
  borderSubtle:   "#e8e0d6",
  shadowSoft:     "0 1px 3px rgba(42,36,32,0.04), 0 2px 8px rgba(42,36,32,0.06)",
  shadowMedium:   "0 2px 6px rgba(42,36,32,0.06), 0 4px 12px rgba(42,36,32,0.08)",
};

// ─── Suggested Questions ──────────────────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  "What did the Prophet ﷺ say about the importance of prayer?",
  "Are there hadiths about treating parents with kindness?",
  "What is the hadith about smiling being a form of charity?",
  "What did the Prophet ﷺ say about seeking knowledge?",
  "Are there hadiths about the virtues of Ramadan?",
  "What hadiths guide us on caring for neighbors?",
];


const GRADE_COLORS = {
  Sahih: { bg: `rgba(200,169,107,0.1)`, text: SC.softGold, label: "Sahih · صحيح" },
  Hasan: { bg: `rgba(31,107,79,0.1)`, text: SC.emerald, label: "Hasan · حسن" },
  Daif:  { bg: `rgba(107,101,98,0.1)`, text: SC.textWarm, label: "Da'if · ضعيف" },
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
      background: SC.ivory,
      border: `1px solid ${SC.borderSubtle}`, borderLeft: `3px solid ${SC.softGold}`,
      borderRadius: 8, padding: "14px 14px 14px 16px", marginTop: 8,
      boxShadow: SC.shadowSoft,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: SC.forestGreen }}>{citation.collection}</span>
          <span style={{ fontFamily: "Amiri Quran, serif", fontSize: 13, color: SC.textWarm, direction: "rtl" }}>{citation.arabic_name}</span>
        </div>
        <div style={{ display: "flex", gap: 10, fontSize: 12, color: SC.textWarm, marginBottom: 3, flexWrap: "wrap" }}>
          {citation.book && <span style={{ fontStyle: "italic" }}>{citation.book} (Book {citation.book_number})</span>}
          <span style={{ fontWeight: 600, color: SC.forestGreen }}>Hadith #{citation.hadith_number}</span>
        </div>
        {citation.narrator && (
          <div style={{ fontSize: 12, color: SC.textWarm, marginBottom: 5 }}>
            Narrated by <strong>{citation.narrator}</strong>
          </div>
        )}
        {citation.preview && (
          <div style={{ fontSize: 12, color: SC.textDark, fontStyle: "italic", marginBottom: 7, lineHeight: 1.5 }}>
            "{citation.preview}..."
          </div>
        )}
        <span style={{
          display: "inline-block", fontSize: 11, fontWeight: 600,
          padding: "3px 12px", borderRadius: 20,
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
  const isUser   = message.role === "user";
  const [expanded, setExpanded] = useState(false);

  const formatText = (text) =>
    (text || "").split(/\n\n+/).map((para, i) => {
      const withSup = para.replace(
        /\[(\d+)\]/g,
        `<sup style="font-size:11px;color:${SC.softGold};background:rgba(200,169,107,0.1);padding:0 3px;border-radius:3px;font-weight:700">[$1]</sup>`
      );
      const withBold = withSup.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      const isArabic = /[؀-ۿ]/.test(para);
      return (
        <p
          key={i}
          style={{
            margin: "0 0 10px", lineHeight: 1.8,
            fontFamily: isArabic ? "Amiri Quran, serif" : "inherit",
            fontSize: isArabic ? 18 : "inherit",
            direction: isArabic ? "rtl" : "ltr",
            textAlign: isArabic ? "right" : "left",
          }}
          dangerouslySetInnerHTML={{ __html: withBold }}
        />
      );
    });

  // What text to display: during streaming show accumulating summary;
  // after streaming show summary (collapsed) or detail (expanded).
  const displayText = isStreaming
    ? message.content
    : expanded
      ? (message.detail || message.summary || message.content)
      : (message.summary || message.content);

  const canExpand = !isUser && !isStreaming && message.detail && message.detail !== message.summary;

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
        background: isUser ? SC.cream : SC.ivory,
        border: isUser ? `2px solid ${SC.forestGreen}` : `1px solid ${SC.borderSubtle}`,
        boxShadow: isUser ? SC.shadowSoft : "none",
      }}>
        {isUser ? "🧕" : "📚"}
      </div>

      <div style={{
        maxWidth: "min(580px, 80%)",
        borderRadius: 12,
        padding: "14px 18px",
        fontSize: 15,
        lineHeight: 1.7,
        background: isUser ? SC.forestGreen : SC.cream,
        color: isUser ? "#fff" : SC.textDark,
        border: isUser ? "none" : `1px solid ${SC.borderSubtle}`,
        boxShadow: SC.shadowSoft,
        borderBottomRightRadius: isUser ? 4 : 12,
        borderBottomLeftRadius: isUser ? 12 : 4,
      }}>
        <div style={expanded ? { animation: "fadeIn 0.2s ease" } : {}}>
          {formatText(displayText)}
        </div>

        {isStreaming && (
          <span style={{
            display: "inline-block", width: 2, height: "1em",
            background: SC.forestGreen, marginLeft: 3, verticalAlign: "text-bottom",
            animation: "blink 0.8s infinite",
          }} />
        )}

        {canExpand && (
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              display: "block", marginTop: 10,
              background: "none", border: "none", padding: 0,
              fontSize: 13, fontWeight: 700, color: SC.forestGreen,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {expanded ? "Show less ↑" : "Read full answer →"}
          </button>
        )}

        {!isUser && expanded && message.citations?.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${SC.borderSubtle}`, animation: "fadeIn 0.2s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, color: SC.forestGreen, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 10 }}>
              <BookIcon color={SC.forestGreen} size={14} strokeWidth={2} />
              Sources & References
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
      padding: "40px 20px", textAlign: "center",
    }}>
      {/* Logo */}
      <svg width={48} height={48} viewBox="0 0 48 48" fill="none" style={{ marginBottom: 28 }}>
        <circle cx="24" cy="24" r="22" stroke={SC.softGold} strokeWidth={2} />
        <circle cx="24" cy="24" r="20" fill={SC.forestGreen} opacity={0.05} />
        <text x="24" y="32" textAnchor="middle" fontFamily="Amiri Quran" fontSize="28" fill={SC.softGold} fontWeight="700">
          ع
        </text>
      </svg>

      <h2 style={{ fontSize: 24, fontWeight: 700, color: SC.forestGreen, margin: "0 0 10px" }}>Ask Islamic Scholar</h2>

      <p style={{ fontFamily: "Amiri Quran, serif", fontSize: 18, color: SC.softGold, margin: "0 0 16px", direction: "rtl", lineHeight: 1.8 }}>
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </p>

      <p style={{ fontSize: 15, color: SC.textWarm, lineHeight: 1.7, maxWidth: 480, margin: "0 0 32px", fontStyle: "italic" }}>
        Ask questions about the Qur'an, Hadith, Islamic teachings, or personal spiritual guidance.
      </p>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 12, width: "100%", maxWidth: 600, marginBottom: 24,
      }}>
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => onSuggest(q)}
            style={{
              background: SC.cream,
              border: `1px solid ${SC.borderSubtle}`,
              borderRadius: 20, padding: "16px 20px",
              fontSize: 15, fontWeight: 500, color: SC.textDark, textAlign: "center",
              cursor: "pointer", lineHeight: 1.5, transition: "all 0.2s ease-out",
              fontFamily: "inherit",
              boxShadow: SC.shadowSoft,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = SC.ivory;
              e.currentTarget.style.borderColor = SC.emerald;
              e.currentTarget.style.boxShadow = SC.shadowMedium;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = SC.cream;
              e.currentTarget.style.borderColor = SC.borderSubtle;
              e.currentTarget.style.boxShadow = SC.shadowSoft;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>{q}</span>
          </button>
        ))}
      </div>

      <div style={{
        display: "flex", gap: 10, alignItems: "flex-start",
        background: SC.ivory, border: `1px solid ${SC.borderSubtle}`,
        borderRadius: 8, padding: "12px 16px",
        fontSize: 13, color: SC.textWarm, maxWidth: 480, textAlign: "left", lineHeight: 1.6,
      }}>
        <InfoIcon color={SC.forestGreen} size={16} />
        <span>Scholarly only answers from authenticated hadith sources. For personal matters, always consult a qualified Islamic scholar.</span>
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

    const userMsg     = { role: "user", content: userText };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);

    const assistantIdx = updatedMsgs.length;
    setMessages(prev => [...prev, { role: "assistant", content: "", summary: "", detail: "", citations: [] }]);
    setStreamingIdx(assistantIdx);

    try {
      const res  = await fetch("/api/scholarly", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: updatedMsgs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      // Stream summary word-by-word (short, feels instant)
      const words = (data.summary || data.detail || "").split(" ");
      let accumulated = "";
      for (let i = 0; i < words.length; i++) {
        accumulated += (i === 0 ? "" : " ") + words[i];
        const snap = accumulated;
        setMessages(prev => {
          const updated = [...prev];
          updated[assistantIdx] = { role: "assistant", content: snap, summary: "", detail: "", citations: [] };
          return updated;
        });
        await new Promise(r => setTimeout(r, 18 + Math.random() * 16));
      }

      // Reveal full message with expand capability
      setMessages(prev => {
        const updated = [...prev];
        updated[assistantIdx] = {
          role:      "assistant",
          content:   data.summary || data.detail || "",
          summary:   data.summary || "",
          detail:    data.detail  || "",
          citations: data.citations ?? [],
        };
        return updated;
      });
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[assistantIdx] = {
          role: "assistant", content: "I'm sorry, I'm unable to answer right now. Please try again in a moment.",
          summary: "", detail: "", citations: [],
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
      setStreamingIdx(null);
      inputRef.current?.focus();
    }
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: SC.parchment, fontFamily: "inherit", paddingBottom: 58 }}>
      <style>{`
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        .input-wrap { transition: border-color 0.2s, box-shadow 0.2s; }
        .send-btn:hover:not(:disabled) { background: ${SC.forestGreen} !important; }
      `}</style>

      {/* ── Premium Header ── */}
      <header style={{
        flexShrink: 0,
        background: SC.cream,
        borderBottom: `1px solid ${SC.borderSubtle}`,
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px",
        }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: SC.forestGreen }}>Scholarly.AI</div>
            <div style={{ fontSize: 11, color: SC.textLight, marginTop: 2 }}>Hadith-based guidance</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {messages.length > 0 && (
              <button onClick={clearChat} style={{
                background: "transparent", border: `1px solid ${SC.borderSubtle}`,
                color: SC.textWarm, fontSize: 12, padding: "6px 14px",
                borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.2s ease-out",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = SC.forestGreen;
                e.currentTarget.style.color = SC.forestGreen;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = SC.borderSubtle;
                e.currentTarget.style.color = SC.textWarm;
              }}>
                New Chat
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Chat area ── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", background: SC.parchment }}>
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

      {/* ── Floating Input Pill ── */}
      <div style={{
        flexShrink: 0, padding: "12px 20px",
        paddingBottom: `calc(10px + env(safe-area-inset-bottom, 0px))`,
        background: `rgba(248,245,239,0.95)`,
        backdropFilter: "blur(8px)",
        borderTop: `1px solid ${SC.borderSubtle}`,
      }}>
        <div
          className="input-wrap"
          style={{
            display: "flex", gap: 8, alignItems: "flex-end",
            maxWidth: 700, margin: "0 auto",
            background: SC.cream,
            border: `1px solid ${inputFocused ? SC.forestGreen : SC.borderSubtle}`,
            borderRadius: 24, padding: "0 8px 0 0",
            boxShadow: inputFocused ? `0 0 0 3px rgba(22,60,47,0.1)` : SC.shadowSoft,
            transition: "all 0.2s ease-out",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Ask your question…"
            disabled={isLoading}
            rows={1}
            style={{
              flex: 1, border: "none", background: "transparent",
              fontSize: 15, color: SC.textDark, outline: "none",
              lineHeight: 1.5, resize: "none", fontFamily: "inherit",
              padding: "14px 12px 14px 18px",
              minHeight: 48, maxHeight: 140, overflow: "hidden",
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
              flexShrink: 0, width: 36, height: 36,
              marginBottom: 6,
              background: SC.forestGreen,
              color: "#fff", border: "none", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: !input.trim() || isLoading ? 0.5 : 1,
              transition: "all 0.18s ease-out",
            }}
            onMouseEnter={e => !isLoading && !input.trim() && (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
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
      </div>

      <BottomNav />
    </div>
  );
}
