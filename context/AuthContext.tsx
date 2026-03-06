// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

type AuthContextType = {
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  isLoading: boolean;
  logout: () => Promise<void>;
};
const CLIENT_ID = "...";

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = async () => {
    await SecureStore.deleteItemAsync("auth_data");
    setToken(null);
  };

  const refreshToken = async (storedRefreshToken: string) => {
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: storedRefreshToken,
          client_id: CLIENT_ID,
        }).toString(),
      });

      const data = await response.json();
      if (data.access_token) {
        const expirationDate = new Date().getTime() + data.expires_in * 1000;
        const newData = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || storedRefreshToken,
          expirationDate,
        };
        await SecureStore.setItemAsync("auth_data", JSON.stringify(newData));
        setToken(data.access_token);
        return data.access_token;
      }
    } catch (e) {
      console.error("Refresh failed", e);
      logout();
    }
  };

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const stored = await SecureStore.getItemAsync("auth_data");
        if (stored) {
          const { accessToken, refreshToken: storedRefresh, expirationDate } = JSON.parse(stored);
          if (new Date().getTime() < expirationDate - 60000) {
            setToken(accessToken);
          } else {
            await refreshToken(storedRefresh);
          }
        }
      } catch (e) {
        console.error("Restore token failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
