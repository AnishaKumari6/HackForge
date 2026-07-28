import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import authService from "../services/authService";
import { setAccessToken } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // On first load, attempt a silent refresh using the httpOnly cookie.
  // If it succeeds, fetch the current user. If not, the visitor is simply logged out.
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { accessToken } = await authService.refreshToken();
        setAccessToken(accessToken);
        const { user: me } = await authService.getMe();
        setUser(me);
      } catch (err) {
        setAccessToken(null);
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };
    bootstrap();
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      toast.error("Your session expired. Please log in again.");
    };
    window.addEventListener("hackforge:session-expired", handleExpired);
    return () => window.removeEventListener("hackforge:session-expired", handleExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { user: me } = await authService.getMe();
    setUser(me);
    return me;
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, initializing, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
