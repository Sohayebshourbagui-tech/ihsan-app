import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Ihsan | Quran Companion",
  description: "Scholarly AI · Quran · Hadith · Prayer Times",
  appleWebApp: { capable: true, statusBarStyle: "default" },
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1a8a4a",
          colorBackground: "#faf8f3",
          colorInputBackground: "#f0ece2",
          colorText: "#1c1917",
          colorTextSecondary: "#57534e",
          borderRadius: "14px",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        },
        elements: {
          card: { boxShadow: "0 2px 12px rgba(28,25,23,0.08)", border: "1px solid #e8e3d8" },
          formButtonPrimary: { backgroundColor: "#1a8a4a" },
          footerActionLink: { color: "#1a8a4a" },
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap"
            rel="stylesheet"
          />
          <meta name="theme-color" content="#faf8f3" />
        </head>
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
