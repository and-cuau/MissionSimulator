// src/contexts/UserContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

interface User {
  user_name: string;
  user_id: string;
  role: "admin" | "commander" | "operator" | "observer";
  token: string;
}

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  missionId: string | null;
  setMissionId: (missionId: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // only runs once at opening app in browser
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [missionId, setMissionId] = useState<string | null>(() => {
    const storedMissionId = localStorage.getItem("missionId");
    return storedMissionId ? storedMissionId : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    if (missionId) {
      localStorage.setItem("missionId", missionId);
    } else {
      localStorage.removeItem("missionId");
    }
  }, [missionId]);

  return (
    <AuthContext.Provider value={{ user, setUser, missionId, setMissionId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUser must be used within a AuthProvider");
  }
  return context;
};
