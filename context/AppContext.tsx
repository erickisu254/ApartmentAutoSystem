import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  Property,
  Unit,
  Tenant,
  Payment,
  Note,
  Expense,
  MaintenanceTicket,
} from "../types";

const API_BASE = "http://localhost:3001/api";

interface AppContextType {
  properties: Property[];
  units: Unit[];
  tenants: Tenant[];
  payments: Payment[];
  expenses: Expense[];
  maintenanceTickets: MaintenanceTicket[];
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Auth
  isAuthenticated: boolean;
  login: (username: string, pass: string) => Promise;
  logout: () => void;
  updateCredentials: (newUsername: string, newPass: string) => void;
  checkPassword: (pass: string) => boolean;

  // Actions
  addProperty: (p: Property) => Promise;
  updateProperty: (p: Property) => Promise;
  deleteProperty: (id: string) => Promise;
  addUnit: (u: Unit) => Promise;
  updateUnit: (u: Unit) => Promise;
  deleteUnit: (id: string) => Promise;
  addTenant: (t: Tenant) => Promise;
  updateTenant: (t: Tenant) => Promise;
  deleteTenant: (id: string) => Promise;
  restoreTenant: (id: string) => Promise;
  signLease: (tenantId: string, signatureDataUrl: string) => Promise;
  recordPayment: (p: Payment) => Promise;
  addExpense: (e: Expense) => Promise;
  updateExpense: (e: Expense) => Promise;
  deleteExpense: (id: string) => Promise;
  addMaintenanceTicket: (ticket: MaintenanceTicket) => Promise;
  updateMaintenanceTicket: (ticket: MaintenanceTicket) => Promise;
  deleteMaintenanceTicket: (id: string) => Promise;
  convertTicketToExpense: (ticketId: string, actualCost: number) => Promise;
  addNote: (
    targetId: string,
    note: Note,
    targetType: "tenant" | "unit",
  ) => Promise;
  resetToDemoData: () => Promise;
}

const AppContext = createContext(undefined);

export const AppProvider = (props: { children: ReactNode }) => {
  const { children } = props;

  const [token, setToken] = useState(() =>
    localStorage.getItem("propMinds_token"),
  );
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("propMinds_theme") === "dark",
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("propMinds_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("propMinds_theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(API_BASE + endpoint, { ...options, headers });

    if (res.status === 401 || res.status === 403) {
      logout();
      throw new Error("Authentication failed. The void rejects your token.");
    }
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  };

  const fetchAllData = useCallback(async () => {
    if (!token) return;
    try {
      const [p, u, t, pay, e, m] = await Promise.all([
        apiFetch("/properties"),
        apiFetch("/units"),
        apiFetch("/tenants"),
        apiFetch("/payments"),
        apiFetch("/expenses"),
        apiFetch("/maintenance"),
      ]);
      setProperties(p);
      setUnits(u);
      setTenants(t);
      setPayments(pay);
      setExpenses(e);
      setMaintenanceTickets(m);
    } catch (err) {
      console.error("Failed to sync with database:", err);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) fetchAllData();
  }, [isAuthenticated, fetchAllData]);

  const login = async (username: string, pass: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: pass }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("propMinds_token", data.token);
        setToken(data.token);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login attempt failed:", err);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem("propMinds_token");
    setProperties([]);
    setUnits([]);
    setTenants([]);
    setPayments([]);
    setExpenses([]);
    setMaintenanceTickets([]);
  };

  const updateCredentials = async (newUsername: string, newPass: string) => {
    console.warn("Credential update requires dedicated backend profile route.");
  };

  const checkPassword = (pass: string) => true;

  const resetToDemoData = async () => {
    await fetchAllData();
  };

  const addProperty = async (p: Property) => {
    await apiFetch("/properties", { method: "POST", body: JSON.stringify(p) });
    await fetchAllData();
  };

  const updateProperty = async (p: Property) => {
    await apiFetch(`/properties/${p.id}`, {
      method: "PUT",
      body: JSON.stringify(p),
    });
    await fetchAllData();
  };

  const deleteProperty = async (id: string) => {
    await apiFetch(`/properties/${id}`, { method: "DELETE" });
    await fetchAllData();
  };

  const addUnit = async (u: Unit) => {
    await apiFetch("/units", { method: "POST", body: JSON.stringify(u) });
    await fetchAllData();
  };

  const updateUnit = async (u: Unit) => {
    await apiFetch(`/units/${u.id}`, {
      method: "PUT",
      body: JSON.stringify(u),
    });
    await fetchAllData();
  };

  const deleteUnit = async (id: string) => {
    await apiFetch(`/units/${id}`, { method: "DELETE" });
    await fetchAllData();
  };

  const addTenant = async (t: Tenant) => {
    await apiFetch("/tenants", { method: "POST", body: JSON.stringify(t) });
    await fetchAllData();
  };

  const updateTenant = async (t: Tenant) => {
    await apiFetch(`/tenants/${t.id}`, {
      method: "PUT",
      body: JSON.stringify(t),
    });
    await fetchAllData();
  };

  const deleteTenant = async (id: string) => {
    await apiFetch(`/tenants/${id}`, { method: "DELETE" });
    await fetchAllData();
  };

  const restoreTenant = async (id: string) => {
    await apiFetch(`/tenants/${id}/restore`, { method: "POST" });
    await fetchAllData();
  };

  const signLease = async (tenantId: string, signatureDataUrl: string) => {
    await apiFetch(`/tenants/${tenantId}/sign-lease`, {
      method: "POST",
      body: JSON.stringify({ signatureDataUrl }),
    });
    await fetchAllData();
  };

  const recordPayment = async (p: Payment) => {
    await apiFetch("/payments", { method: "POST", body: JSON.stringify(p) });
    await fetchAllData();
  };

  const addExpense = async (e: Expense) => {
    await apiFetch("/expenses", { method: "POST", body: JSON.stringify(e) });
    await fetchAllData();
  };

  const updateExpense = async (e: Expense) => {
    await apiFetch(`/expenses/${e.id}`, {
      method: "PUT",
      body: JSON.stringify(e),
    });
    await fetchAllData();
  };

  const deleteExpense = async (id: string) => {
    await apiFetch(`/expenses/${id}`, { method: "DELETE" });
    await fetchAllData();
  };

  const addMaintenanceTicket = async (ticket: MaintenanceTicket) => {
    await apiFetch("/maintenance", {
      method: "POST",
      body: JSON.stringify(ticket),
    });
    await fetchAllData();
  };

  const updateMaintenanceTicket = async (ticket: MaintenanceTicket) => {
    await apiFetch(`/maintenance/${ticket.id}`, {
      method: "PUT",
      body: JSON.stringify(ticket),
    });
    await fetchAllData();
  };

  const deleteMaintenanceTicket = async (id: string) => {
    await apiFetch(`/maintenance/${id}`, { method: "DELETE" });
    await fetchAllData();
  };

  const convertTicketToExpense = async (
    ticketId: string,
    actualCost: number,
  ) => {
    await apiFetch(`/maintenance/${ticketId}/convert-to-expense`, {
      method: "POST",
      body: JSON.stringify({ actualCost }),
    });
    await fetchAllData();
  };

  const addNote = async (
    targetId: string,
    note: Note,
    targetType: "tenant" | "unit",
  ) => {
    await apiFetch("/notes", {
      method: "POST",
      body: JSON.stringify({ targetId, targetType, ...note }),
    });
    await fetchAllData();
  };

  return React.createElement(
    AppContext.Provider,
    {
      value: {
        properties,
        units,
        tenants,
        payments,
        expenses,
        maintenanceTickets,
        darkMode,
        toggleDarkMode,
        isAuthenticated,
        login,
        logout,
        updateCredentials,
        checkPassword,
        addProperty,
        updateProperty,
        deleteProperty,
        addUnit,
        updateUnit,
        deleteUnit,
        addTenant,
        updateTenant,
        deleteTenant,
        restoreTenant,
        signLease,
        recordPayment,
        addExpense,
        updateExpense,
        deleteExpense,
        addMaintenanceTicket,
        updateMaintenanceTicket,
        deleteMaintenanceTicket,
        convertTicketToExpense,
        addNote,
        resetToDemoData,
      },
    },
    children,
  );
};
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
