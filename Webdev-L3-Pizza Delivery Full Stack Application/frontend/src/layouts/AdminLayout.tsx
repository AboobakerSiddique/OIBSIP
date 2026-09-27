import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../lib/AdminAuthContext";
import "./AdminLayout.css";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/settings", label: "Settings" },
];

export function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="admin-shell">
      <a href="#admin-main-content" className="skip-link">
        Skip to content
      </a>
      <aside className="admin-sidebar">
        <span className="wordmark">Bella</span>
        <nav>
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          {admin && <div className="admin-sidebar__user">{admin.name}</div>}
          <button className="btn btn--secondary btn--sm admin-sidebar__logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>
      <main className="admin-main" id="admin-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
