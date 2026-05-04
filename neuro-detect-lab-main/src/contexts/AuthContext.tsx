import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { loginUser, registerUser } from "@/lib/api";

export type UserRole = "doctor" | "user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

// Demo accounts for testing
const DEMO_ACCOUNTS: Record<string, AuthUser> = {
  "doctor@demo.com": { id: "doctor@demo.com", name: "Dr. Sarah Mitchell", email: "doctor@demo.com", role: "doctor", token: "doctor@demo.com" },
  "user@demo.com": { id: "user@demo.com", name: "Ahmed Hassan", email: "user@demo.com", role: "user", token: "user@demo.com" },
};

const canUseDemoAccounts = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
};

const isLikelyMongoId = (value: string) => /^[a-f0-9]{24}$/i.test(value);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("alz_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        if (!canUseDemoAccounts() && !isLikelyMongoId(parsed.token)) {
          localStorage.removeItem("alz_user");
        } else {
          setUser(parsed);
        }
      } catch {
        localStorage.removeItem("alz_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await loginUser(email, password);
      const authUser: AuthUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
      };
      localStorage.setItem("alz_user", JSON.stringify(authUser));
      setUser(authUser);
      return;
    } catch (error) {
      const demo = canUseDemoAccounts() ? DEMO_ACCOUNTS[email] : undefined;
      if (demo) {
        localStorage.setItem("alz_user", JSON.stringify(demo));
        setUser(demo);
        return;
      }
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    const data = await registerUser(name, email, password, role);
    const authUser: AuthUser = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      token: data.token,
    };
    localStorage.setItem("alz_user", JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem("alz_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
