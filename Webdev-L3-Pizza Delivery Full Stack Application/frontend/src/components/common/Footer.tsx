import { Link } from "react-router-dom";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="wordmark">Bella Pizza</span>
          <p>
            Hand-stretched dough, slow-cooked sauce, and a menu built the way
            it was in 1990 — now delivered to your door.
          </p>
        </div>

        <div>
          <h4>Menu</h4>
          <ul>
            <li>
              <Link to="/pizzas">Our pizzas</Link>
            </li>
            <li>
              <Link to="/build">Build your own</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4>Account</h4>
          <ul>
            <li>
              <Link to="/orders">My orders</Link>
            </li>
            <li>
              <Link to="/login">Log in</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} Bella Pizza. Since 1990.</span>
        <Link to="/admin/login">Staff login</Link>
      </div>
    </footer>
  );
}

export default Footer;
