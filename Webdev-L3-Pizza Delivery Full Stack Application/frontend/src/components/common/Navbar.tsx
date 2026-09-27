import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import "./Navbar.css";

const LINKS = [
  { to: "/pizzas", label: "Menu" },
  { to: "/build", label: "Build Your Own" },
  { to: "/orders", label: "My Orders" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { status, user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand" onClick={() => setOpen(false)}>
          <span className="wordmark">Bella</span>
          <small>1990</small>
        </NavLink>

        <button
          className="navbar__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>

        <ul className={`navbar__links ${open ? "open" : ""}`}>
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar__actions">
          {status === "authenticated" && user ? (
            <>
              <NavLink to="/dashboard" className="navbar__login btn btn--secondary btn--sm">
                {user.name.split(" ")[0]}
              </NavLink>
              <button className="btn btn--ghost btn--sm" style={{ color: "var(--cream-light)" }} onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn--secondary btn--sm navbar__login">
              Log in
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
