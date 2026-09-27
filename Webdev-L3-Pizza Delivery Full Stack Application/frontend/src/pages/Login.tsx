import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { useAuth } from "../lib/AuthContext";
import { ApiClientError } from "../lib/apiClient";
import "./AuthPages.css";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
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
          <h1>Welcome back</h1>
          <p className="text-muted">Log in to track your orders.</p>

          {error && <p className="field-error" role="alert">{error}</p>}

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Link to="/forgot-password" className="btn btn--ghost btn--sm" style={{ marginBottom: "1rem" }}>
            Forgot password?
          </Link>
          <Button type="submit" block loading={loading}>
            Log in
          </Button>
          <div className="auth-page__footer-link">
            New here? <Link to="/register">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
