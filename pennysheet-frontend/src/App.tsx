import { createContext, useContext, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_CLASSIFICATIONS,
  type TransactionCategory,
  type TransactionClassification
} from "./api/endpoints/transactions";
import Layout from "./components/Layout";
import ToastProvider from "./components/Toast";
import DetailsPage from "./pages/Details";
import Home from "./pages/Home";
import ImportRequestsPage from "./pages/ImportRequests";
import UserPage from "./pages/User";

interface AppContextType {
  startDate: Date;
  setStartDate: React.Dispatch<React.SetStateAction<Date>>;
  endDate: Date;
  setEndDate: React.Dispatch<React.SetStateAction<Date>>;
  categories: TransactionCategory[];
  setCategories: React.Dispatch<React.SetStateAction<TransactionCategory[]>>;
  classifications: TransactionClassification[];
  setClassifications: React.Dispatch<React.SetStateAction<TransactionClassification[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * App provider containing the global context/states of the app.
 */
function AppProvider({ children }: { children: React.ReactNode }) {
  const now = new Date();
  const last3Months = new Date(now);
  last3Months.setMonth(now.getMonth() - 3);
  last3Months.setDate(1);

  const [startDate, setStartDate] = useState<Date>(last3Months);
  const [endDate, setEndDate] = useState<Date>(now);

  const [categories, setCategories] = useState<TransactionCategory[]>([
    ...TRANSACTION_CATEGORIES.filter(
      category => category !== "Investments" && category !== "Excluded"
    )
  ]);
  const [classifications, setClassifications] = useState<TransactionClassification[]>([
    ...TRANSACTION_CLASSIFICATIONS.filter(classification => classification !== "excluded")
  ]);

  return (
    <AppContext.Provider
      value={{
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        categories,
        setCategories,
        classifications,
        setClassifications
      }}
    >
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
              <Route path="/requests" element={<ImportRequestsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}
