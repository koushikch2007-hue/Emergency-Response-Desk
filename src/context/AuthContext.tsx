import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  switchDemoUser: (role: UserRole) => void;
  signOut: () => void;
  setCustomUser: (user: UserProfile) => void;
}

const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  reporter: {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'reporter@emergency.gov',
    full_name: 'Jane Citizen',
    role: 'reporter',
    is_active: true,
  },
  authority: {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'dispatcher@emergency.gov',
    full_name: 'Captain Marcus Vance',
    role: 'authority',
    department: 'Fire & Emergency Services',
    is_active: true,
  },
  admin: {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'admin@emergency.gov',
    full_name: 'System Admin',
    role: 'admin',
    department: 'Central Command',
    is_active: true,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('erd_demo_role') as UserRole;
    return DEMO_PROFILES[saved || 'reporter'];
  });

  const switchDemoUser = (targetRole: UserRole) => {
    const selected = DEMO_PROFILES[targetRole];
    setUser(selected);
    localStorage.setItem('erd_demo_role', targetRole);
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('erd_demo_role');
  };

  const setCustomUser = (profile: UserProfile) => {
    setUser(profile);
  };

  const role = user?.role || 'reporter';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        switchDemoUser,
        signOut,
        setCustomUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
