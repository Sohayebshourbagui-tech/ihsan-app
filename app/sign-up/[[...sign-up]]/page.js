import { SignUp } from "@clerk/nextjs";
import { T } from "../../../lib/theme.js";

export const metadata = { title: "Sign Up | Ihsan" };

export default function SignUpPage() {
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
          Join your Islamic companion
        </p>
      </div>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/"
      />
    </div>
  );
}
