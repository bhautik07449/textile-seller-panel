import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

export interface SellerUser {
  id: string;
  email: string;
  phone?: string;
  role: string;
  accountStatus: string;
  sellerProfile?: {
    id: string;
    companyName: string;
    slug: string;
    contactPerson: string;
    publicPhone: string;
    city: string;
    state: string;
    businessAddress: string;
    gstNumber?: string;
    panNumber?: string;
    description?: string;
  };
  subscriptions?: Array<{
    id: string;
    packageId: string;
    packageNameSnapshot: string;
    listingQuotaSnapshot: number;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  }>;
}

interface AuthContextType {
  user: SellerUser | null;
  token: string | null;
  loading: boolean;
  login: (userData: SellerUser, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SellerUser | null>(() => {
    const saved = localStorage.getItem('seller_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('seller_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const res: any = await api.get('/auth/me');
          const userData = res?.data || res;
          if (userData && userData.role === 'SELLER') {
            setUser(userData);
            localStorage.setItem('seller_user', JSON.stringify(userData));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    }
    verifyAuth();
  }, [token]);

  const login = (userData: SellerUser, accessToken: string, refreshToken?: string) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('seller_token', accessToken);
    if (refreshToken) localStorage.setItem('seller_refresh_token', refreshToken);
    localStorage.setItem('seller_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('seller_token');
    localStorage.removeItem('seller_refresh_token');
    localStorage.removeItem('seller_user');
  };

  const refreshUser = async () => {
    try {
      const res: any = await api.get('/auth/me');
      const userData = res?.data || res;
      if (userData && userData.role === 'SELLER') {
        setUser(userData);
        localStorage.setItem('seller_user', JSON.stringify(userData));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
