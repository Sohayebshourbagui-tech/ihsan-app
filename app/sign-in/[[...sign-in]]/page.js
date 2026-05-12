import { SignIn } from "@clerk/nextjs";
import { T } from "../../../lib/theme.js";

export const metadata = { title: "Sign In | Ihsan" };

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bgPage,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
      }}
    >
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 26, fontWeight: 800, color: T.textPrimary }}>
            Ihsan
          </span>
          <span
            style={{
              fontFamily: T.fontArabic,
              fontSize: 26,
              color: T.green,
            }}
          >
            إحسان
          </span>
        </div>
        <p style={{ fontSize: 13, color: T.textSecondary, marginTop: 6 }}>
          Your Islamic companion
        </p>
      </div>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
      />
    </div>
  );
}
