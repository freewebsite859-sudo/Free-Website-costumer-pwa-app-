import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export type AuthStatus = 'loading' | 'signed-in' | 'signed-out' | 'disabled';

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  /** True when Supabase credentials are missing - the app runs local-only. */
  isOffline: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Turns Supabase's terse auth errors into something worth showing a user. */
function humanizeAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Incorrect email or password.';
  if (m.includes('email not confirmed')) {
    return 'Please confirm your email address first - check your inbox for the link.';
  }
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return 'An account with this email already exists. Try logging in instead.';
  }
  if (m.includes('password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  if (m.includes('rate limit') || m.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (m.includes('failed to fetch') || m.includes('networkerror')) {
    return 'Cannot reach the server. Check your internet connection.';
  }
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>(
    isSupabaseConfigured ? 'loading' : 'disabled',
  );

  useEffect(() => {
    if (!supabase) return;

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setStatus(data.session ? 'signed-in' : 'signed-out');
      })
      .catch((error) => {
        console.error('[auth] Failed to restore session', error);
        if (active) setStatus('signed-out');
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setStatus(nextSession ? 'signed-in' : 'signed-out');
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    if (!supabase) throw new Error('Sign up is unavailable in offline demo mode.');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: fullName ? { full_name: fullName } : undefined },
    });
    if (error) throw new Error(humanizeAuthError(error.message));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Login is unavailable in offline demo mode.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(humanizeAuthError(error.message));
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(humanizeAuthError(error.message));
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) throw new Error('Password reset is unavailable in offline demo mode.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw new Error(humanizeAuthError(error.message));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      isOffline: !isSupabaseConfigured,
      signUp,
      signIn,
      signOut,
      resetPassword,
    }),
    [status, session, signUp, signIn, signOut, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
