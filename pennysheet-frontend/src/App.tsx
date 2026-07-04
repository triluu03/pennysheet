import { createContext, useContext, useMemo, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ToastProvider from "./components/Toast";
import DetailsPage from "./pages/Details";
import Home from "./pages/Home";
import UserPage from "./pages/User";

interface AppContextType {
  startDate: Date;
  endDate: Date;
  nLastMonths: number;
  setNLastMonths: React.Dispatch<React.SetStateAction<number>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * App provider containing the global context/states of the app.
 */
function AppProvider({ children }: { children: React.ReactNode }) {
  const [nLastMonths, setNLastMonths] = useState<number>(3);

  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - nLastMonths);
    startDate.setDate(1);

    return { startDate, endDate: now };
  }, [nLastMonths]);

  return (
    <AppContext.Provider value={{ startDate, endDate, nLastMonths, setNLastMonths }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}

/**
 * Main app.
 */
export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/details" element={<DetailsPage />} />
              <Route path="/user" element={<UserPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}
