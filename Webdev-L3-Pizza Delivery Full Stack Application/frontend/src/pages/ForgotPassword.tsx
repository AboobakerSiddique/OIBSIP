import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { apiClient } from "../lib/apiClient";
import "./AuthPages.css";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post<{ data?: { resetToken?: string | null } }>(
        "/auth/forgot-password",
        { email }
      );
      // Dev-mode convenience: the API returns the reset token directly
      // until Phase 8 wires real email delivery.
      if (res.data?.resetToken) {
        navigate(`/reset-password?token=${encodeURIComponent(res.data.resetToken)}`);
        return;
      }
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div>
        <div className="auth-page__wordmark">
          <span className="wordmark">Bella</span>
        </div>
        {sent ? (
          <div className="card card--auth text-center">
            <h1>Check your inbox</h1>
            <p className="text-muted">If that account exists, a reset link is on its way.</p>
            <Link to="/login" className="auth-page__footer-link">
              Back to log in
            </Link>
          </div>
        ) : (
          <form className="card card--auth" onSubmit={handleSubmit}>
            <h1>Reset your password</h1>
            <p className="text-muted">We'll email you a link to set a new one.</p>
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" block loading={loading}>
              Send reset link
            </Button>
            <div className="auth-page__footer-link">
              <Link to="/login">Back to log in</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
