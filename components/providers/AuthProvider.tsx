'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider, testFirestoreConnection } from '@/lib/firebase';
import {
  ensureUserAccount,
  getUserAccount,
  getCandidateProfile,
  updateUserAccountType,
} from '@/lib/firestore-service';
import { AccountType, CandidateProfile, UserAccount } from '@/lib/types';

interface AuthContextValue {
  firebaseUser: User | null;
  userAccount: UserAccount | null;
  candidateProfile: CandidateProfile | null;
  loading: boolean;
  emailNeedsVerification: boolean;
  connectionError: string | null;
  signInWithGoogle: (preferredRole?: AccountType) => Promise<void>;
  registerWithEmail: (params: {
    email: string;
    password: string;
    displayName: string;
    accountType: AccountType;
  }) => Promise<{ requiresVerification: boolean }>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshSession: () => Promise<void>;
  changeAccountType: (role: AccountType) => Promise<void>;
  refreshCandidateProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PENDING_ROLE_KEY = 'skillbridge_pending_role';

export function formatAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  const msg = err instanceof Error ? err.message : String(err);

  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not yet enabled in Firebase Authentication. Enable it in Firebase Console → Authentication → Sign-in method → Email/Password, or use Continue with Google.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completion. Please try again.';
    case 'auth/popup-blocked':
      return 'Browser blocked the sign-in popup. Allow popups for this site and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify your credentials or reset your password.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment before trying again.';
    default:
      return msg || 'Authentication failed. Please try again.';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const inFlightHydrationRef = useRef<Map<string, Promise<void>>>(new Map());

  const hydrateUserRecords = useCallback(async (user: User) => {
    if (!user.emailVerified) {
      setUserAccount(null);
      setCandidateProfile(null);
      return;
    }

    const existingPromise = inFlightHydrationRef.current.get(user.uid);
    if (existingPromise) {
      return existingPromise;
    }

    const runHydration = (async () => {
      const rawRole =
        typeof window !== 'undefined' ? window.localStorage.getItem(PENDING_ROLE_KEY) : null;
      const storedRole: AccountType =
        rawRole === 'job_seeker' || rawRole === 'recruiter' ? rawRole : 'learner';

      let account = await getUserAccount(user.uid);
      if (!account) {
        account = await ensureUserAccount({
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Skill To Job Matcher Member',
          email: user.email || '',
          photoURL: user.photoURL || undefined,
          accountType: storedRole,
        });
      }
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(PENDING_ROLE_KEY);
      }
      setUserAccount(account);

      if (account.accountType !== 'recruiter') {
        const cp = await getCandidateProfile(user.uid);
        setCandidateProfile(cp);
      } else {
        setCandidateProfile(null);
      }
    })();

    inFlightHydrationRef.current.set(user.uid, runHydration);
    try {
      await runHydration;
    } finally {
      inFlightHydrationRef.current.delete(user.uid);
    }
  }, []);

  useEffect(() => {
    testFirestoreConnection().then((res) => {
      if (!res.ok && res.message) setConnectionError(res.message);
    });

    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          await hydrateUserRecords(user);
        } catch (err) {
          console.error('Failed to hydrate user profile:', err);
        }
      } else {
        setUserAccount(null);
        setCandidateProfile(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [hydrateUserRecords]);

  const signInWithGoogle = async (preferredRole?: AccountType) => {
    if (preferredRole && typeof window !== 'undefined') {
      window.localStorage.setItem(PENDING_ROLE_KEY, preferredRole);
    }
    const cred = await signInWithPopup(auth, googleProvider);
    await hydrateUserRecords(cred.user);
  };

  const registerWithEmail = async ({
    email,
    password,
    displayName,
    accountType,
  }: {
    email: string;
    password: string;
    displayName: string;
    accountType: AccountType;
  }) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PENDING_ROLE_KEY, accountType);
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    if (!cred.user.emailVerified) {
      await sendEmailVerification(cred.user);
      return { requiresVerification: true };
    }
    await hydrateUserRecords(cred.user);
    return { requiresVerification: false };
  };

  const loginWithEmail = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await hydrateUserRecords(cred.user);
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const refreshSession = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const updated = auth.currentUser;
      setFirebaseUser(updated);
      await hydrateUserRecords(updated);
    }
  };

  const changeAccountType = async (role: AccountType) => {
    if (!firebaseUser) return;
    await updateUserAccountType(firebaseUser.uid, role);
    await hydrateUserRecords(firebaseUser);
  };

  const refreshCandidateProfile = async () => {
    if (!firebaseUser || !firebaseUser.emailVerified) return;
    const cp = await getCandidateProfile(firebaseUser.uid);
    setCandidateProfile(cp);
  };

  const logout = async () => {
    await signOut(auth);
    setUserAccount(null);
    setCandidateProfile(null);
  };

  const emailNeedsVerification = Boolean(firebaseUser && !firebaseUser.emailVerified);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userAccount,
        candidateProfile,
        loading,
        emailNeedsVerification,
        connectionError,
        signInWithGoogle,
        registerWithEmail,
        loginWithEmail,
        sendPasswordReset,
        resendVerification,
        refreshSession,
        changeAccountType,
        refreshCandidateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
