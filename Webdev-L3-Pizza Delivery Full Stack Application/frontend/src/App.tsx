import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { ToastProvider } from "./components/common/Toast";
import { AuthProvider } from "./lib/AuthContext";
import { AdminAuthProvider } from "./lib/AdminAuthContext";
import { OrderDraftProvider } from "./lib/OrderDraftContext";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <OrderDraftProvider>
            <RouterProvider router={router} />
          </OrderDraftProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
