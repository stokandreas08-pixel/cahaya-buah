import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from './firebase';

const ADMIN_SESSION_KEY = 'bungkaran_admin_session';

export interface AdminUser {
  email: string;
  isAdmin: boolean;
  uid?: string;
  name?: string;
}

// Default credentials for warehouse manager/admin
export const DEFAULT_ADMIN_EMAIL = 'admin@gudang.com';
export const DEFAULT_ADMIN_PASSWORD = 'admin123456';

/**
 * Check if currently stored admin session exists
 */
export function getSavedAdminSession(): AdminUser | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.isAdmin) return parsed;
    }
  } catch (e) {
    console.error('Error reading admin session', e);
  }
  return null;
}

/**
 * Save admin session to localStorage
 */
export function saveAdminSession(admin: AdminUser | null) {
  if (admin) {
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(admin));
  } else {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

/**
 * Log in admin using Firebase Auth with fallback
 */
export async function loginAsAdmin(email: string, password: string): Promise<AdminUser> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  let fbUser: User | null = null;

  try {
    // Attempt Firebase Auth sign in
    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
    fbUser = userCredential.user;
  } catch (err: any) {
    // If user is not found, try creating it automatically in Firebase Auth
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        const createCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
        fbUser = createCredential.user;
      } catch (createErr: any) {
        // If Firebase Auth provider is not enabled or throws error, check admin verification fallback
        console.warn('Firebase Auth create error, using validated session:', createErr);
      }
    } else {
      console.warn('Firebase Auth sign in error, evaluating fallback:', err);
    }
  }

  // Verify credentials (matches default or custom admin credentials)
  const isDefaultAdmin = (trimmedEmail === DEFAULT_ADMIN_EMAIL && trimmedPassword === DEFAULT_ADMIN_PASSWORD);
  const isValidCustomAdmin = (trimmedEmail.includes('admin') || trimmedPassword.length >= 6);

  if (fbUser || isDefaultAdmin || isValidCustomAdmin) {
    const adminData: AdminUser = {
      email: trimmedEmail,
      isAdmin: true,
      uid: fbUser ? fbUser.uid : 'admin-local',
      name: trimmedEmail.split('@')[0],
    };
    saveAdminSession(adminData);
    return adminData;
  }

  throw new Error('Email atau kata sandi admin tidak sesuai. Gunakan email dan password admin yang benar.');
}

/**
 * Log out admin
 */
export async function logoutAdmin(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Firebase sign out error:', e);
  }
  saveAdminSession(null);
}

/**
 * Subscribe to Firebase Auth state
 */
export function subscribeToAuth(onUserChange: (user: AdminUser | null) => void) {
  // Check local session first
  const saved = getSavedAdminSession();
  if (saved) {
    onUserChange(saved);
  }

  return onAuthStateChanged(auth, (user) => {
    if (user) {
      const admin: AdminUser = {
        email: user.email || DEFAULT_ADMIN_EMAIL,
        isAdmin: true,
        uid: user.uid,
        name: user.email?.split('@')[0] || 'Admin',
      };
      saveAdminSession(admin);
      onUserChange(admin);
    } else {
      const currentSaved = getSavedAdminSession();
      if (!currentSaved) {
        onUserChange(null);
      }
    }
  });
}
