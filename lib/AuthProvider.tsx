"use client"
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import api from "./api";
import { UserSerialize } from "@/types/user";



type AuthContextType = {
  user: UserSerialize | null,
  loading: boolean,
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext)!;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSerialize | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/api/auth/me");
        setUser(res.data.user);
      } finally {
        setLoading(false);
      }
    } fetchUser();
  }, []);
  const logout = async () => {
    await api.post("/api/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}