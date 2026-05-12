"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { T } from "../../lib/theme.js";
import BottomNav from "../components/BottomNav.js";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    dailyGoal: 5,
    preferredReciter: "Mishary Rashid Al-Afasy",
    notificationsEnabled: true,
    prayerNotifications: true,
    language: "en",
  });

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then(({ profile }) => {
        if (profile) {
          setProfile(profile);
          setForm({
            dailyGoal: profile.dailyGoal,
            preferredReciter: profile.preferredReciter,
            notificationsEnabled: profile.notificationsEnabled,
            prayerNotifications: profile.prayerNotifications,
            language: profile.language,
          });
        }
      })
      .catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const { profile: updated } = await res.json();
      setProfile(updated);
    } finally {
      setSaving(false);
    }
  }

  if (!isLoaded) {
    return (
      <div style={{ minHeight: "100vh", background: T.bgPage, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: `3px solid ${T.greenMuted}`, borderTopColor: T.green, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const labelStyle = { fontSize: 13, fontWeight: 600, color: T.textSecondary, marginBottom: 6, display: "block" };
  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: T.radiusMd, border: `1px solid ${T.border}`, background: T.bgInset, color: T.textPrimary, fontSize: 15, outline: "none", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: T.bgPage, paddingBottom: 80 }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt="avatar"
              style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: `2px solid ${T.greenMuted}` }}
            />
          )}
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: T.textPrimary }}>{user?.fullName ?? "—"}</div>
            <div style={{ fontSize: 13, color: T.textSecondary }}>{user?.primaryEmailAddress?.emailAddress}</div>
          </div>
        </div>

        {/* Preferences card */}
        <div style={{ background: T.bgCard, borderRadius: T.radiusLg, border: `1px solid ${T.border}`, padding: "20px 20px 24px", boxShadow: T.shadowSm }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, marginBottom: 20 }}>Preferences</div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Daily goal (pages)</label>
            <input
              type="number"
              min={1}
              max={60}
              value={form.dailyGoal}
              onChange={(e) => setForm((f) => ({ ...f, dailyGoal: parseInt(e.target.value) || 1 }))}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Preferred reciter</label>
            <input
              type="text"
              value={form.preferredReciter}
              onChange={(e) => setForm((f) => ({ ...f, preferredReciter: e.target.value }))}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Language</label>
            <select
              value={form.language}
              onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
              style={inputStyle}
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="fr">French</option>
              <option value="ur">Urdu</option>
              <option value="tr">Turkish</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {[
              { key: "notificationsEnabled", label: "Enable notifications" },
              { key: "prayerNotifications",  label: "Prayer time reminders" },
            ].map(({ key, label }) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  style={{ width: 18, height: 18, accentColor: T.green }}
                />
                <span style={{ fontSize: 14, color: T.textPrimary }}>{label}</span>
              </label>
            ))}
          </div>

          <button
            onClick={save}
            disabled={saving}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: T.radiusMd,
              background: saving ? T.greenMuted : T.green,
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              cursor: saving ? "default" : "pointer",
            }}
          >
            {saving ? "Saving…" : "Save preferences"}
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
