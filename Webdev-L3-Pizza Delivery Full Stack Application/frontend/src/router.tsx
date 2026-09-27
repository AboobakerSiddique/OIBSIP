import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { RequireUser, RequireAdmin } from "./components/common/RouteGuards";

import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import VerifyEmailPage from "./pages/VerifyEmail";
import ForgotPasswordPage from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";
import NotFoundPage from "./pages/NotFound";

import DashboardPage from "./pages/user/Dashboard";
import PizzaCatalogPage from "./pages/user/PizzaCatalog";
import PizzaDetailsPage from "./pages/user/PizzaDetails";
import BuilderPage from "./pages/user/Builder";
import CheckoutPage from "./pages/user/Checkout";
import OrderSuccessPage from "./pages/user/OrderSuccess";
import OrdersPage from "./pages/user/Orders";
import OrderDetailsPage from "./pages/user/OrderDetails";

import AdminLoginPage from "./pages/admin/AdminLogin";
import AdminDashboardPage from "./pages/admin/AdminDashboard";
import AdminInventoryPage from "./pages/admin/AdminInventory";
import AdminOrdersPage from "./pages/admin/AdminOrders";
import AdminOrderDetailsPage from "./pages/admin/AdminOrderDetails";
import AdminSettingsPage from "./pages/admin/AdminSettings";

// Public browsing (home, menu, pizza details, the builder) stays open —
// login is only required once the user commits to checking out or
// viewing account-specific data. Admin routes are a fully separate
// auth boundary from user routes; neither guard can satisfy the other.
export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },

      { path: "/pizzas", element: <PizzaCatalogPage /> },
      { path: "/pizzas/:id", element: <PizzaDetailsPage /> },
      { path: "/build", element: <BuilderPage /> },

      {
        path: "/dashboard",
        element: (
          <RequireUser>
            <DashboardPage />
          </RequireUser>
        ),
      },
      {
        path: "/checkout",
        element: (
          <RequireUser>
            <CheckoutPage />
          </RequireUser>
        ),
      },
      {
        path: "/order-success",
        element: (
          <RequireUser>
            <OrderSuccessPage />
          </RequireUser>
        ),
      },
      {
        path: "/orders",
        element: (
          <RequireUser>
            <OrdersPage />
          </RequireUser>
        ),
      },
      {
        path: "/orders/:id",
        element: (
          <RequireUser>
            <OrderDetailsPage />
          </RequireUser>
        ),
      },
    ],
  },
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/admin",
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "inventory", element: <AdminInventoryPage /> },
      { path: "orders", element: <AdminOrdersPage /> },
      { path: "orders/:id", element: <AdminOrderDetailsPage /> },
      { path: "settings", element: <AdminSettingsPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
