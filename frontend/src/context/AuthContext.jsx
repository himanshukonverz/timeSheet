import { createContext, useContext, useEffect, useState } from "react";
import api from "@/api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    loading: true,
  });

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");

      setAuthState({
        user: res.data?.user || null,
        loading: false,
      });
    } catch {
      setAuthState({
        user: null,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchUser(); // run once on app load
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        loading: authState.loading,
        refreshUser: fetchUser, // 👈 expose this
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);