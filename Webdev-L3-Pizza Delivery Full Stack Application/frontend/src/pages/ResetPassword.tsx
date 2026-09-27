import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { apiClient, ApiClientError } from "../lib/apiClient";
import "./AuthPages.css";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/auth/reset-password", { token, password });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong");
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
        <form className="card card--auth" onSubmit={handleSubmit}>
          <h1>Set a new password</h1>

          {error && <p className="field-error" role="alert">{error}</p>}

          {!searchParams.get("token") && (
            <Input
              label="Reset token"
              type="text"
              name="token"
              placeholder="Paste the token from your email"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          )}
          <Input
            label="New password"
            type="password"
            name="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <Input
            label="Confirm password"
            type="password"
            name="confirmPassword"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" block loading={loading}>
            Update password
          </Button>
          <div className="auth-page__footer-link">
            <Link to="/login">Back to log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
