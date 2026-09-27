import { useState } from "react";
import type { InventoryItem } from "../../types/domain";
import { StockStatusBadge } from "../common/StatusBadge";

interface InventoryRowProps {
  item: InventoryItem;
  onSave: (id: string, patch: { quantity: number; threshold: number }) => Promise<void>;
}

export function InventoryRow({ item, onSave }: InventoryRowProps) {
  const [editing, setEditing] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);
  const [threshold, setThreshold] = useState(item.threshold);
  const [saving, setSaving] = useState(false);

  const updated = new Date(item.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(item.id, { quantity, threshold });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setQuantity(item.quantity);
    setThreshold(item.threshold);
    setEditing(false);
  }

  if (editing) {
    return (
      <tr>
        <td>{item.name}</td>
        <td>{item.category}</td>
        <td>
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{ width: "5rem", padding: "0.3rem 0.5rem" }}
          />
        </td>
        <td>
          <input
            type="number"
            min={0}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            style={{ width: "5rem", padding: "0.3rem 0.5rem" }}
          />
        </td>
        <td colSpan={2}>
          <span className="text-muted">Updated on save</span>
        </td>
        <td>
          <div className="cluster">
            <button className="btn btn--primary btn--sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button className="btn btn--secondary btn--sm" onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{item.name}</td>
      <td>{item.category}</td>
      <td>
        {item.quantity} {item.unit}
      </td>
      <td>
        {item.threshold} {item.unit}
      </td>
      <td>
        <StockStatusBadge status={item.status} />
      </td>
      <td className="text-muted">{updated}</td>
      <td>
        <button className="btn btn--secondary btn--sm" type="button" onClick={() => setEditing(true)}>
          Update
        </button>
      </td>
    </tr>
  );
}

export default InventoryRow;
