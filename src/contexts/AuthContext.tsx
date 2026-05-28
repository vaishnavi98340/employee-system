import React, { createContext, useContext, useEffect, useState } from 'react';
import { Employee } from '../types';

interface AuthContextType {
  user: { uid: string } | null;
  profile: Employee | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [profile, setProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/profile');
        if (res.ok) {
          const data = await res.json();
          setUser({ uid: data.uid });
          setProfile(data);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    // Mock login - backend always returns Dr. Sarah Connor for now
    try {
      const res = await fetch('/api/auth/profile');
      const data = await res.json();
      setUser({ uid: data.uid });
      setProfile(data);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
