import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { useAuth } from "../lib/AuthContext";
import { ApiClientError } from "../lib/apiClient";
import "./AuthPages.css";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await register(name, email, password);
      // In development the API returns the verification token directly
      // (no email service is wired until Phase 8) — forward it so the
      // verify-email page can pre-fill it for easy manual testing.
      const query = result.verificationToken
        ? `?token=${encodeURIComponent(result.verificationToken)}`
        : "";
      navigate(`/verify-email${query}`, { replace: true });
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
          <h1>Create your account</h1>
          <p className="text-muted">Save your details for faster checkout.</p>

          {error && <p className="field-error" role="alert">{error}</p>}

          <Input
            label="Name"
            type="text"
            name="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <Button type="submit" block loading={loading}>
            Create account
          </Button>
          <div className="auth-page__footer-link">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
