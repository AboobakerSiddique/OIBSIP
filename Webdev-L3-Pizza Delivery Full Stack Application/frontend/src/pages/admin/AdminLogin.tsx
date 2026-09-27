import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { useAdminAuth } from "../../lib/AdminAuthContext";
import { ApiClientError } from "../../lib/apiClient";
import "../AuthPages.css";

export function AdminLoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
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
      navigate("/admin", { replace: true });
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
          <div className="text-muted" style={{ marginTop: "0.25rem" }}>Staff Login</div>
        </div>
        <form className="card card--auth" onSubmit={handleSubmit}>
          <h1>Admin sign in</h1>
          <p className="text-muted">Restricted to Bella Pizza staff.</p>

          {error && <p className="field-error" role="alert">{error}</p>}

          <Input
            label="Admin email"
            type="email"
            name="email"
            placeholder="staff@bellapizza.com"
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
          <Button type="submit" block loading={loading}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
