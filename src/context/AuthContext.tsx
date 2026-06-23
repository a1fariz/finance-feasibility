import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsSandboxDemo: () => Promise<void>;
  logout: () => Promise<void>;
  syncUserProfile: (tokenStr: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserProfile = async (tokenStr: string) => {
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenStr}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(prev => prev ? { ...prev, role: data.user.role } : null);
        }
      }
    } catch (err) {
      console.error('Failed to sync user profile with database:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      setLoading(true);
      if (fbUser) {
        try {
          const freshToken = await fbUser.getIdToken();
          setToken(freshToken);

          const baseUser: AuthUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            role: 'user', // Defaults to 'user', will be updated by sync
          };
          setUser(baseUser);

          // Clear sandbox flag on active real session
          localStorage.removeItem('demo_auth_active');

          // Trigger Postgres DB sync
          await syncUserProfile(freshToken);
        } catch (error) {
          console.error("Failed to fetch fresh token from firebase auth:", error);
          setUser(null);
          setToken(null);
        }
      } else {
        // If there's no real FB user, check if sandbox session is active
        const isDemo = localStorage.getItem('demo_auth_active') === 'true';
        if (isDemo) {
          const demoToken = "demo-sandbox-dev-uid-999";
          setToken(demoToken);
          const baseUser: AuthUser = {
            uid: "demo-sandbox-dev-uid-999",
            email: "sandbox-developer@example.com",
            displayName: "Sandbox Developer",
            photoURL: "https://lh3.googleusercontent.com/a/default-user",
            role: 'user',
          };
          setUser(baseUser);
          await syncUserProfile(demoToken);
        } else {
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('demo_auth_active');
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInAsSandboxDemo = async () => {
    setLoading(true);
    try {
      const demoToken = "demo-sandbox-dev-uid-999";
      localStorage.setItem('demo_auth_active', 'true');
      setToken(demoToken);
      const baseUser: AuthUser = {
        uid: "demo-sandbox-dev-uid-999",
        email: "sandbox-developer@example.com",
        displayName: "Sandbox Developer",
        photoURL: "https://lh3.googleusercontent.com/a/default-user",
        role: 'user',
      };
      setUser(baseUser);
      await syncUserProfile(demoToken);
    } catch (error) {
      console.error("Failed to sign in as sandbox demo:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('demo_auth_active');
      await signOut(auth);
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Sign-out failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signInWithGoogle, signInAsSandboxDemo, logout, syncUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
