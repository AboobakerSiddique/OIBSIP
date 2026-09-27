import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/common/Button";
import { apiClient, ApiClientError } from "../lib/apiClient";
import "./AuthPages.css";

type Status = "idle" | "verifying" | "success" | "error";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token");
  const [status, setStatus] = useState<Status>(tokenFromUrl ? "verifying" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!tokenFromUrl) return;
    apiClient
      .post("/auth/verify-email", { token: tokenFromUrl })
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setError(err instanceof ApiClientError ? err.message : "Verification failed");
      });
  }, [tokenFromUrl]);

  async function handleResend() {
    if (!resendEmail) return;
    try {
      await apiClient.post("/auth/resend-verification", { email: resendEmail });
      setResendSent(true);
    } catch {
      setResendSent(true); // Same response either way — don't reveal account existence.
    }
  }

  return (
    <div className="auth-page">
      <div>
        <div className="auth-page__wordmark">
          <span className="wordmark">Bella</span>
        </div>
        <div className="card card--auth text-center">
          {status === "success" && (
            <>
              <h1>You're verified</h1>
              <p className="text-muted">Your account is active. You can log in now.</p>
              <Link to="/login" className="btn btn--primary btn--block">
                Log in
              </Link>
            </>
          )}

          {status === "verifying" && (
            <>
              <h1>Verifying...</h1>
              <p className="text-muted">Confirming your email address.</p>
            </>
          )}

          {(status === "idle" || status === "error") && (
            <>
              <h1>Check your inbox</h1>
              <p className="text-muted">
                {status === "error"
                  ? error ?? "That link is invalid or expired. Request a new one below."
                  : "We sent a verification link to your email. Click it to activate your account."}
              </p>

              {resendSent ? (
                <p className="text-muted">If that account exists and is unverified, a new link has been sent.</p>
              ) : (
                <div className="field">
                  <label htmlFor="resend-email">Resend to</label>
                  <input
                    id="resend-email"
                    type="email"
                    placeholder="you@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                  />
                </div>
              )}

              {!resendSent && (
                <Button variant="secondary" block onClick={handleResend}>
                  Resend email
                </Button>
              )}
            </>
          )}

          <div className="auth-page__footer-link">
            <Link to="/login">Back to log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
