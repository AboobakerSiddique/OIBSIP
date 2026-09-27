import { useEffect, useState } from "react";
import { fetchSettings, updateSettings } from "../../lib/api/adminSettings";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { LoadingState, ErrorState } from "../../components/common/States";
import { useToast } from "../../components/common/Toast";
import "./Admin.css";

export function AdminSettingsPage() {
  const { showToast } = useToast();
  const [notifyEmail, setNotifyEmail] = useState("");
  const [defaultThreshold, setDefaultThreshold] = useState(10);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setError(null);
    fetchSettings()
      .then((settings) => {
        setNotifyEmail(settings.notifyEmail);
        setDefaultThreshold(settings.defaultThreshold);
        setLoaded(true);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load settings"));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({ notifyEmail, defaultThreshold });
      showToast("Settings saved");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save settings", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1>Settings</h1>
      </div>

      {!loaded && !error && <LoadingState label="Loading settings..." />}
      {error && <ErrorState title="Couldn't load settings" description={error} onRetry={load} />}

      {loaded && (
        <form
          className="admin-table-wrap card--padded"
          style={{ maxWidth: 420 }}
          onSubmit={handleSubmit}
        >
          <h3>Low-stock notifications</h3>
          <p className="text-muted" style={{ fontSize: "0.85rem" }}>
            Alerts are sent automatically when an item drops to or below its
            threshold, with at least a cooldown period between repeat alerts
            for the same item.
          </p>
          <Input
            label="Default threshold (units)"
            type="number"
            name="defaultThreshold"
            value={defaultThreshold}
            onChange={(e) => setDefaultThreshold(Number(e.target.value))}
            min={0}
          />
          <Input
            label="Notify email"
            type="email"
            name="notifyEmail"
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            placeholder="staff@bellapizza.com"
          />
          <Button type="submit" loading={saving}>
            Save settings
          </Button>
        </form>
      )}
    </div>
  );
}

export default AdminSettingsPage;
