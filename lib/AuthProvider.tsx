"use client"
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import api from "./api";
import { UserSerialize } from "@/types/user";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  useEffect(() => {
    async function fetchUser() {
      try {
        // Don't run on auth pages
        if (pathname === "/login" || pathname === "/sign_up" || pathname === "/verify-otp") {
          setLoading(false);
          return;
        }
        
        
        const res = await api.get("/api/auth/me");
        setUser(res.data.user);
      } catch {
        //  401 = not logged in, totally fine on public pages
        setUser(null)
      } finally {
        setLoading(false)
      }
    } fetchUser();
  }, [pathname]);


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