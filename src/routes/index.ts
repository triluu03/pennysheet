import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter([
  { path: "/login", Component: LoginPage },
  {
    Component: ProtectedRoute,
    children: [{ path: "/", Component: HomePage }]
  }
]);

export default router;
