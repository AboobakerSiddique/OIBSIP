import { Link } from "react-router-dom";
import { PizzaSliceIcon } from "../components/common/icons";

export function NotFoundPage() {
  return (
    <div className="container section text-center" style={{ maxWidth: 420, margin: "0 auto" }}>
      <div style={{ width: 80, margin: "0 auto 1.5rem", opacity: 0.6 }}>
        <PizzaSliceIcon />
      </div>
      <h1>This slice is gone</h1>
      <p className="text-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn--primary">
        Back to Bella Pizza
      </Link>
    </div>
  );
}

export default NotFoundPage;
