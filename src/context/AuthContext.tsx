import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { DEMO_USERS } from '../data/mockComplaints';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role?: 'citizen' | 'municipal_officer', name?: string) => void;
  quickLogin: (type: 'citizen' | 'officer') => void;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'civic_complaints_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    // Default to the citizen demo user so user can immediately view personalized status
    return DEMO_USERS.citizen;
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [user]);

  const login = (email: string, role: 'citizen' | 'municipal_officer' = 'citizen', name?: string) => {
    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: name || (email.split('@')[0].replace('.', ' ') || 'Citizen User'),
      email,
      role,
      ward: role === 'citizen' ? 'Ward 3 - North Hillside' : 'All Municipal Wards',
      isVerified: true,
      phone: '+1 (555) 019-2834',
      department: role === 'municipal_officer' ? 'Department of Public Works' : undefined
    };
    setUser(newUser);
  };

  const quickLogin = (type: 'citizen' | 'officer') => {
    if (type === 'citizen') {
      setUser(DEMO_USERS.citizen);
    } else {
      setUser(DEMO_USERS.officer);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updatedData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updatedData } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        quickLogin,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
