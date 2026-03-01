"use client"
import { useEffect, ReactNode } from "react";

type AuthProviderProps = {
  children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {

  useEffect(() => {

    let interval: NodeJS.Timeout;

    const startRefresh = async () => {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include"
      });

      if (res.ok) {
        interval = setInterval(() => {
          fetch("/api/auth/refresh", {
            method: "POST",
            credentials: "include"
          });
        }, 14 * 60 * 1000);
      }
    };

    startRefresh();

    return () => {
      if (interval) clearInterval(interval);
    };

  }, []);

  return <>{children}</>;
}