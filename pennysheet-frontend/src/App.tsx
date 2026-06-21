import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import DetailsPage from "./pages/Details";
import Home from "./pages/Home";

/**
 * Main app.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/details" element={<DetailsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
