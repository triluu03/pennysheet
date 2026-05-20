import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SpacetimeExamplePage from "../pages/SpacetimeExamplePage";
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter([
  { path: "/login", Component: LoginPage },
  {
    Component: ProtectedRoute,
    children: [
      { path: "/", Component: HomePage },
      { path: "/example", Component: SpacetimeExamplePage }
    ]
  }
]);

export default router;
