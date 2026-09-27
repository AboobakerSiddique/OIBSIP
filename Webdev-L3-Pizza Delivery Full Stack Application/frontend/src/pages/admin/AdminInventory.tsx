import { useEffect, useState } from "react";
import { fetchInventory, updateInventoryItem } from "../../lib/api/adminInventory";
import { InventoryRow } from "../../components/admin/InventoryRow";
import { LoadingState, ErrorState, EmptyState } from "../../components/common/States";
import { useToast } from "../../components/common/Toast";
import type { InventoryItem } from "../../types/domain";
import "./Admin.css";

const CATEGORIES: Array<InventoryItem["category"] | "All"> = [
  "All",
  "Pizza Bases",
  "Sauces",
  "Cheeses",
  "Vegetables",
];

export function AdminInventoryPage() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [items, setItems] = useState<InventoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  function load() {
    setError(null);
    setItems(null);
    fetchInventory()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load inventory"));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(id: string, patch: { quantity: number; threshold: number }) {
    try {
      const updated = await updateInventoryItem(id, patch);
      setItems((prev) => prev?.map((i) => (i.id === id ? updated : i)) ?? null);
      showToast(`${updated.name} updated`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed", "error");
      throw err;
    }
  }

  const filtered = items
    ? category === "All"
      ? items
      : items.filter((i) => i.category === category)
    : [];

  return (
    <div>
      <div className="admin-page-header">
        <h1>Inventory</h1>
      </div>

      <div className="cluster mb-5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`btn btn--sm ${category === c ? "btn--primary" : "btn--secondary"}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {items === null && !error && <LoadingState label="Loading inventory..." />}
      {error && <ErrorState title="Couldn't load inventory" description={error} onRetry={load} />}

      {items && filtered.length === 0 && (
        <EmptyState
          title="No items in this category"
          description="Try a different category, or check back after the next restock."
        />
      )}

      {items && filtered.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <InventoryRow key={item.id} item={item} onSave={handleSave} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminInventoryPage;
