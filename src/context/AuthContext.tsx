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

export function syncSellerCookie(token: string | null, user: any | null) {
  try {
    if (token && user) {
      const data = encodeURIComponent(JSON.stringify({ token, user }));
      document.cookie = `dt_seller_session=${data}; path=/; max-age=2592000; SameSite=Lax`;
    } else {
      document.cookie = 'dt_seller_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
  } catch (e) {
    console.error('Failed to sync cookie:', e);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SellerUser | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ssoUser = params.get('sso_user');
      const ssoToken = params.get('sso_token');
      if (ssoToken && ssoUser) {
        const parsed = JSON.parse(ssoUser);
        localStorage.setItem('seller_token', ssoToken);
        localStorage.setItem('seller_user', ssoUser);
        syncSellerCookie(ssoToken, parsed);
        params.delete('sso_token');
        params.delete('sso_user');
        const newSearch = params.toString() ? `?${params.toString()}` : '';
        window.history.replaceState({}, '', `${window.location.pathname}${newSearch}`);
        return parsed;
      }
    } catch {
      // ignore
    }
    const saved = localStorage.getItem('seller_user');
    const parsedSaved = saved ? JSON.parse(saved) : null;
    const savedToken = localStorage.getItem('seller_token');
    if (savedToken && parsedSaved) {
      syncSellerCookie(savedToken, parsedSaved);
    }
    return parsedSaved;
  });
  const [token, setToken] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ssoToken = params.get('sso_token');
      if (ssoToken) return ssoToken;
    } catch {
      // ignore
    }
    return localStorage.getItem('seller_token') || null;
  });
  const [loading, setLoading] = useState(true);

  // Sync cookie on mount
  useEffect(() => {
    if (token && user) {
      syncSellerCookie(token, user);
    }
  }, [token, user]);

  useEffect(() => {
    async function verifyAuth() {
      if (token) {
        try {
          const res: any = await api.get('/auth/me');
          const userData = res?.data || res;
          if (userData && userData.role === 'SELLER') {
            setUser(userData);
            localStorage.setItem('seller_user', JSON.stringify(userData));
            syncSellerCookie(token, userData);
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
    syncSellerCookie(accessToken, userData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('seller_token');
    localStorage.removeItem('seller_refresh_token');
    localStorage.removeItem('seller_user');
    syncSellerCookie(null, null);
  };

  const refreshUser = async () => {
    try {
      const res: any = await api.get('/auth/me');
      const userData = res?.data || res;
      if (userData && userData.role === 'SELLER') {
        setUser(userData);
        localStorage.setItem('seller_user', JSON.stringify(userData));
        syncSellerCookie(token, userData);
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
