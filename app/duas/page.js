"use client";

import { useState } from "react";
import Link from "next/link";
import BottomNav from "../components/BottomNav";

const G  = "#1a8a4a";
const G2 = "#2ea55f";

/* ─── Duas data ─────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: "all",      label: "All" },
  { id: "morning",  label: "Morning" },
  { id: "evening",  label: "Evening" },
  { id: "prayer",   label: "Prayer" },
  { id: "food",     label: "Food & Drink" },
  { id: "travel",   label: "Travel" },
  { id: "home",     label: "Home" },
  { id: "quran",    label: "Qur\'an" },
  { id: "hardship", label: "Hardship" },
  { id: "gratitude",label: "Gratitude" },
];

const DUAS = [
  /* ── Morning ── */
  {
    id: 1, cat: "morning",
    title: "Waking Up",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdu lillāhil-ladhī aḥyānā ba'da mā amātanā wa-ilayhin-nushūr",
    translation: "All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.",
    source: "Sahih al-Bukhari 6312",
  },
  {
    id: 2, cat: "morning",
    title: "Morning Remembrance",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration: "Aṣbaḥnā wa-aṣbaḥal-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illallāhu waḥdahu lā sharīka lah",
    translation: "We have reached the morning and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without any partner.",
    source: "Sahih Muslim 2723",
  },
  {
    id: 3, cat: "morning",
    title: "Protection in the Morning",
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    transliteration: "Allāhumma bika aṣbaḥnā, wa-bika amsaynā, wa-bika naḥyā, wa-bika namūtu, wa-ilaykan-nushūr",
    translation: "O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die, and unto You is our resurrection.",
    source: "Sunan Abu Dawud 5068",
  },

  /* ── Evening ── */
  {
    id: 4, cat: "evening",
    title: "Evening Remembrance",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration: "Amsaynā wa-amsal-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illallāhu waḥdahu lā sharīka lah",
    translation: "We have reached the evening and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without any partner.",
    source: "Sahih Muslim 2723",
  },
  {
    id: 5, cat: "evening",
    title: "Seeking Refuge in the Evening",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'ūdhu bi-kalimātillāhit-tāmmāti min sharri mā khalaq",
    translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    source: "Sahih Muslim 2709",
  },

  /* ── Prayer ── */
  {
    id: 6, cat: "prayer",
    title: "Before Prayer (Iftitah)",
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
    transliteration: "Subḥānaka Allāhumma wa-biḥamdika, wa-tabārakasmuka, wa-ta'ālā jadduka, wa-lā ilāha ghayruk",
    translation: "Glory is to You O Allah, and praise. Blessed is Your name and exalted is Your majesty. There is no god worthy of worship except You.",
    source: "Sunan Abu Dawud 775",
  },
  {
    id: 7, cat: "prayer",
    title: "After Tashahhud",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliteration: "Allāhumma ṣalli 'alā Muḥammadin wa-'alā āli Muḥammad, kamā ṣallayta 'alā Ibrāhīma wa-'alā āli Ibrāhīm, innaka Ḥamīdun Majīd",
    translation: "O Allah, send prayers upon Muhammad and the family of Muhammad, as You sent prayers upon Ibrahim and the family of Ibrahim. Verily You are full of praise and majesty.",
    source: "Sahih al-Bukhari 3370",
  },
  {
    id: 8, cat: "prayer",
    title: "Before Salam (in prayer)",
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَمِنْ عَذَابِ النَّارِ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ",
    transliteration: "Allāhumma innī a'ūdhu bika min 'adhābil-qabr, wa-min 'adhābin-nār, wa-min fitnatil-maḥyā wal-mamāt, wa-min fitnatil-masīḥid-dajjāl",
    translation: "O Allah, I seek refuge with You from the punishment of the grave, from the punishment of the Fire, from the trials of life and death, and from the evil of the trial of the False Messiah.",
    source: "Sahih al-Bukhari 1377",
  },

  /* ── Food & Drink ── */
  {
    id: 9, cat: "food",
    title: "Before Eating",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillāh",
    translation: "In the name of Allah.",
    source: "Sahih Muslim 2017",
  },
  {
    id: 10, cat: "food",
    title: "After Eating",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    transliteration: "Alḥamdu lillāhil-ladhī aṭ'amanī hādhā wa-razaqanīhi min ghayri ḥawlin minnī wa-lā quwwah",
    translation: "All praise is for Allah who fed me this and provided it for me without any might or power from myself.",
    source: "Sunan Abu Dawud 4023",
  },
  {
    id: 11, cat: "food",
    title: "Before Drinking Water",
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillāh",
    translation: "In the name of Allah.",
    source: "Sunan Ibn Majah 3290",
  },

  /* ── Travel ── */
  {
    id: 12, cat: "travel",
    title: "Leaving the Home",
    arabic: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "Bismillāh, tawakkaltu 'alallāh, wa-lā ḥawla wa-lā quwwata illā billāh",
    translation: "In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.",
    source: "Sunan Abu Dawud 5095",
  },
  {
    id: 13, cat: "travel",
    title: "Entering the Home",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
    transliteration: "Allāhumma innī as'aluka khayral-mawlaji wa-khayral-makhraji, bismillāhi walajna, wa-bismillāhi kharajnā, wa-'alallāhi rabbanā tawakkalnā",
    translation: "O Allah, I ask You for the best of the entrance and the best of the exit. In the name of Allah we enter, in the name of Allah we leave, and upon Allah our Lord we rely.",
    source: "Sunan Abu Dawud 5096",
  },
  {
    id: 14, cat: "travel",
    title: "When Beginning a Journey",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliteration: "Subḥānal-ladhī sakhkhara lanā hādhā wa-mā kunnā lahu muqrinīn, wa-innā ilā rabbinā lamunqalibūn",
    translation: "Glory be to Him Who has subdued this for us, for we were not capable of it ourselves. Verily, to our Lord we are returning.",
    source: "Surah Az-Zukhruf 43:13-14",
  },

  /* ── Home ── */
  {
    id: 15, cat: "home",
    title: "Entering the Masjid",
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allāhummaf-taḥ lī abwāba raḥmatik",
    translation: "O Allah, open the gates of Your mercy for me.",
    source: "Sahih Muslim 713",
  },
  {
    id: 16, cat: "home",
    title: "Leaving the Masjid",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    transliteration: "Allāhumma innī as'aluka min faḍlik",
    translation: "O Allah, I ask You for Your bounty.",
    source: "Sahih Muslim 713",
  },

  /* ── Qur'an ── */
  {
    id: 17, cat: "quran",
    title: "Before Reciting Qur'an",
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    transliteration: "A'ūdhu billāhi minash-shayṭānir-rajīm",
    translation: "I seek refuge in Allah from the accursed devil.",
    source: "Surah An-Nahl 16:98",
  },
  {
    id: 18, cat: "quran",
    title: "Dua for Knowledge",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidnī 'ilmā",
    translation: "My Lord, increase me in knowledge.",
    source: "Surah Ta-Ha 20:114",
  },

  /* ── Hardship ── */
  {
    id: 19, cat: "hardship",
    title: "In Times of Distress",
    arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "Lā ilāha illā anta subḥānaka innī kuntu minaẓ-ẓālimīn",
    translation: "There is no god worthy of worship except You, glory is to You; surely I have been one of the wrongdoers.",
    source: "Surah Al-Anbiya 21:87",
  },
  {
    id: 20, cat: "hardship",
    title: "When Afflicted",
    arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
    transliteration: "Innā lillāhi wa-innā ilayhi rāji'ūn. Allāhumma'-jurnī fī muṣībatī wa-akhlif lī khayran minhā",
    translation: "Surely we belong to Allah and to Him we shall return. O Allah, reward me for my affliction and give me something better than it in exchange.",
    source: "Sahih Muslim 918",
  },
  {
    id: 21, cat: "hardship",
    title: "The Dua of Yunus (AS)",
    arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
    transliteration: "Lā ilāha illā anta subḥānaka innī kuntu minaẓ-ẓālimīn",
    translation: "None has the right to be worshipped but You. Glory is to You. Surely, I have been of the wrongdoers.",
    source: "Surah Al-Anbiya 21:87",
  },
  {
    id: 22, cat: "hardship",
    title: "Seeking Strength",
    arabic: "اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا",
    transliteration: "Allāhumma lā sahla illā mā ja'altahu sahlā, wa-anta taj'alul-ḥuzna idhā shi'ta sahlā",
    translation: "O Allah, there is no ease except what You make easy, and You make the difficult easy if You wish.",
    source: "Ibn Hibban 3/255",
  },

  /* ── Gratitude ── */
  {
    id: 23, cat: "gratitude",
    title: "Thanking Allah",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alḥamdu lillāh",
    translation: "All praise and thanks are for Allah.",
    source: "Surah Al-Fatiha 1:2",
  },
  {
    id: 24, cat: "gratitude",
    title: "Dua for Gratitude",
    arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ",
    transliteration: "Rabbi awzi'nī an ashkura ni'matakal-latī an'amta 'alayya wa-'alā wālidayya wa-an a'mala ṣāliḥan tarḍāh",
    translation: "My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents, and to do righteousness of which You approve.",
    source: "Surah Al-Ahqaf 46:15",
  },
  {
    id: 25, cat: "gratitude",
    title: "After a Blessing",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
    transliteration: "Alḥamdu lillāhil-ladhī bi-ni'matihi tatimmuṣ-ṣāliḥāt",
    translation: "All praise is for Allah by Whose grace good works are completed.",
    source: "Ibn Majah 3803",
  },
];

/* ─── Components ──────────────────────────────────────────────── */
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

function DuaCard({ dua }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="dua-card"
      onClick={() => setExpanded(e => !e)}
      style={{
        background: "#fff",
        borderRadius: 14,
        borderLeft: `4px solid ${G}`,
        padding: "18px 18px 16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        cursor: "pointer",
        transition: "box-shadow 0.15s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{dua.title}</span>
        <span style={{ fontSize: 16, color: G, opacity: 0.7, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "none" }}>
          ⌄
        </span>
      </div>

      {/* Arabic text — always visible */}
      <p style={{
        fontFamily: "Amiri, serif",
        fontWeight: 400,
        fontSize: 22,
        direction: "rtl",
        textAlign: "right",
        lineHeight: 2,
        color: "#0d0d0d",
        margin: 0,
      }}>
        {dua.arabic}
      </p>

      {/* Expanded: transliteration + translation + source */}
      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f0f0f0" }}>
          <p style={{ fontSize: 13, color: "#888", fontStyle: "italic", lineHeight: 1.6, marginBottom: 10 }}>
            {dua.transliteration}
          </p>
          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.72, marginBottom: 10 }}>
            {dua.translation}
          </p>
          <span style={{
            display: "inline-block",
            fontSize: 11, fontWeight: 700, color: G,
            background: `${G}12`,
            padding: "3px 10px",
            borderRadius: 20,
          }}>
            {dua.source}
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function DuasPage() {
  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery]         = useState("");

  const filtered = DUAS.filter(d => {
    const inCat  = activeCat === "all" || d.cat === activeCat;
    const q      = query.toLowerCase();
    const inSearch = !q || d.title.toLowerCase().includes(q) || d.translation.toLowerCase().includes(q) || d.arabic.includes(q);
    return inCat && inSearch;
  });

  return (
    <>
      <style>{`
        .dua-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.10) !important; }
        .cat-pill:hover { border-color: ${G} !important; color: ${G} !important; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f8f9fa", paddingBottom: 70 }}>

        {/* Navbar */}
        <nav style={{
          background: `linear-gradient(135deg, #157a3c 0%, ${G} 55%, ${G2} 100%)`,
          width: "100%",
          boxShadow: "0 2px 16px rgba(26,138,74,0.32)",
          position: "relative",
          overflow: "hidden",
        }}>
          <GeoPattern id="geoNav" opacity={0.13} />
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
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>Duas</div>
              <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 11, marginTop: 2 }}>
                {DUAS.length} supplications
              </div>
            </div>
            <div style={{ marginLeft: "auto", fontFamily: "Amiri, serif", color: "rgba(255,255,255,0.5)", fontSize: 22 }}>
              🤲
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: 680, margin: "0 auto", paddingBottom: 60 }}>

          {/* Search */}
          <div style={{ background: "#fff", padding: "14px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                fontSize: 14, color: "#bbb", pointerEvents: "none",
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search duas…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  border: "1px solid #e8e8e8",
                  borderRadius: 10,
                  fontSize: 14,
                  outline: "none",
                  background: "#f8f9fa",
                  color: "#1a1a1a",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Category pills */}
          <div style={{ background: "#fff", padding: "10px 20px 12px", borderBottom: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2 }}>
              {CATEGORIES.map(cat => {
                const active = cat.id === activeCat;
                return (
                  <button
                    key={cat.id}
                    className="cat-pill"
                    onClick={() => setActiveCat(cat.id)}
                    style={{
                      flexShrink: 0,
                      padding: "6px 14px",
                      borderRadius: 20,
                      border: `1px solid ${active ? G : "#e0e0e0"}`,
                      background: active ? G : "#fff",
                      color: active ? "#fff" : "#555",
                      fontSize: 12,
                      fontWeight: active ? 700 : 400,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.12s",
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dua list */}
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#bbb", fontSize: 14 }}>
                No duas found.
              </div>
            ) : (
              filtered.map(dua => <DuaCard key={dua.id} dua={dua} />)
            )}
          </div>

        </div>
      </div>
      <BottomNav />
    </>
  );
}
