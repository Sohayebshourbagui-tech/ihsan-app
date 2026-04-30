export default function Home() {
  const features = [
    {
      title: "Quran Browser",
      icon: "📖",
      description: "Read, search, and reflect on the Quran with ease.",
    },
    {
      title: "Daily Duas",
      icon: "🤲",
      description: "Keep your day anchored with authentic daily supplications.",
    },
    {
      title: "Prayer Times",
      icon: "🕌",
      description: "Stay on track with accurate prayer times for your location.",
    },
    {
      title: "Qibla Direction",
      icon: "🧭",
      description: "Find the Qibla instantly wherever you are.",
    },
    {
      title: "Islamic Calendar",
      icon: "📅",
      description: "Follow important Hijri dates and upcoming Islamic events.",
    },
    {
      title: "Daily Hadith",
      icon: "📜",
      description: "Learn one hadith each day to grow in knowledge and character.",
    },
    {
      title: "Daily Quiz",
      icon: "🧠",
      description: "Strengthen your understanding with short Islamic quizzes.",
    },
    {
      title: "Hifz Tracker",
      icon: "📝",
      description: "Track memorization progress and build steady consistency.",
    },
    {
      title: "Recitation Practice",
      icon: "🎙️",
      description: "Improve recitation confidence through focused daily practice.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <nav className="border-b border-zinc-100">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-xl font-semibold tracking-tight text-[#1a8a4a]">
            Ihsan إحسان
          </span>
          <button className="rounded-full bg-[#1a8a4a] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#15733d]">
            Download App
          </button>
        </div>
      </nav>

      <main>
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-18 pt-20 text-center">
          <h1
            className="max-w-4xl text-4xl leading-tight font-semibold text-[#1a8a4a] md:text-6xl"
            style={{ fontFamily: "'Amiri', 'Times New Roman', serif" }}
          >
            إحسان
          </h1>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 md:text-5xl">
            Your Complete Islamic Companion
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-600 md:text-lg">
            Ihsan brings essential Islamic tools into one calm and beautiful
            experience to support your worship, learning, and daily consistency.
          </p>
          <button className="mt-8 rounded-full bg-[#1a8a4a] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#15733d]">
            Get Started
          </button>
        </section>

        <section className="bg-[#f0faf4] py-18">
          <div className="mx-auto w-full max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#1a8a4a]/40 hover:shadow-md"
              >
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="mt-3 text-lg font-semibold text-zinc-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-100 bg-white py-10">
        <div className="mx-auto w-full max-w-6xl px-6 text-center">
          <p className="text-lg font-semibold text-[#1a8a4a]">Ihsan إحسان</p>
          <p className="mt-2 text-sm text-zinc-600">
            Your complete Islamic companion for worship, learning, and daily
            growth.
          </p>
          <p className="mt-4 text-xs text-zinc-500">
            Built with love for the Ummah • © {new Date().getFullYear()} Ihsan.
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
