"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { T } from "../../lib/theme.js";
import BottomNav from "../components/BottomNav.js";

function SubscriptionBadge({ plan }) {
  const isPremium = plan === "PREMIUM";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: T.radiusFull,
        fontSize: 12,
        fontWeight: 700,
        background: isPremium ? T.greenMuted : T.bgSubtle,
        color: isPremium ? T.greenDark : T.textSecondary,
      }}
    >
      {isPremium ? "Premium" : "Free"}
    </span>
  );
}

function CheckoutBanner() {
  const searchParams = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");
  if (checkoutStatus !== "success") return null;
  return (
    <div
      style={{
        background: T.greenMuted,
        border: `1px solid ${T.green}`,
        borderRadius: T.radiusMd,
        padding: "12px 16px",
        marginBottom: 16,
        fontSize: 14,
        color: T.greenDark,
        fontWeight: 600,
      }}
    >
      Welcome to Ihsan Premium! Your subscription is now active.
    </div>
  );
}

function SettingsContent() {
  const { user, isLoaded } = useUser();
  const [subscription, setSubscription] = useState(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    fetch("/api/stripe/subscription-status")
      .then((r) => r.json())
      .then(({ plan }) => setSubscription(plan ?? "FREE"))
      .catch(() => setSubscription("FREE"));
  }, []);

  async function openPortal() {
    setLoadingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoadingPortal(false);
    }
  }

  async function openCheckout() {
    setLoadingCheckout(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoadingCheckout(false);
    }
  }

  if (!isLoaded) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: T.bgPage,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: `3px solid ${T.greenMuted}`,
            borderTopColor: T.green,
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }

  const sectionStyle = {
    background: T.bgCard,
    borderRadius: T.radiusLg,
    border: `1px solid ${T.border}`,
    padding: "20px",
    boxShadow: T.shadowSm,
    marginBottom: 16,
  };
  const headingStyle = {
    fontSize: 15,
    fontWeight: 700,
    color: T.textPrimary,
    marginBottom: 14,
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px" }}>
      <div
        style={{ fontSize: 20, fontWeight: 800, color: T.textPrimary, marginBottom: 24 }}
      >
        Settings
      </div>

      <Suspense fallback={null}>
        <CheckoutBanner />
      </Suspense>

      {/* Account */}
      <div style={sectionStyle}>
        <div style={headingStyle}>Account</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt=""
              style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
            />
          )}
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary }}>
              {user?.fullName ?? "—"}
            </div>
            <div style={{ fontSize: 13, color: T.textSecondary }}>
              {user?.primaryEmailAddress?.emailAddress}
            </div>
          </div>
        </div>
        <SignOutButton>
          <button
            style={{
              padding: "9px 18px",
              borderRadius: T.radiusMd,
              border: `1px solid ${T.border}`,
              background: "transparent",
              color: T.red,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </SignOutButton>
      </div>

      {/* Subscription */}
      <div style={sectionStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div style={headingStyle}>Subscription</div>
          <SubscriptionBadge plan={subscription} />
        </div>

        {subscription === "PREMIUM" ? (
          <div>
            <p style={{ fontSize: 14, color: T.textSecondary, marginBottom: 14 }}>
              You have unlimited Scholarly AI queries and access to all premium features.
            </p>
            <button
              onClick={openPortal}
              disabled={loadingPortal}
              style={{
                padding: "10px 18px",
                borderRadius: T.radiusMd,
                border: `1px solid ${T.border}`,
                background: "transparent",
                color: T.textPrimary,
                fontSize: 14,
                fontWeight: 600,
                cursor: loadingPortal ? "default" : "pointer",
              }}
            >
              {loadingPortal ? "Loading…" : "Manage subscription"}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 14, color: T.textSecondary, marginBottom: 16 }}>
              Free plan: 3 Scholarly AI questions total. Upgrade for unlimited access.
            </p>
            <button
              onClick={openCheckout}
              disabled={loadingCheckout}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: T.radiusMd,
                background: loadingCheckout ? T.greenMuted : T.green,
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                border: "none",
                cursor: loadingCheckout ? "default" : "pointer",
              }}
            >
              {loadingCheckout ? "Redirecting…" : "Upgrade to Premium — $9.99/mo"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div style={{ minHeight: "100vh", background: T.bgPage, paddingBottom: 80 }}>
      <Suspense fallback={null}>
        <SettingsContent />
      </Suspense>
      <BottomNav />
    </div>
  );
}
