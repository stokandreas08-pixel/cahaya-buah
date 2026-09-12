import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from './firebase';

const ADMIN_SESSION_KEY = 'bungkaran_admin_session';
const ADMIN_CUSTOM_PASSWORD_KEY = 'bungkaran_admin_custom_pwd';

export interface AdminUser {
  email: string;
  isAdmin: boolean;
  uid?: string;
  name?: string;
  avatarUrl?: string;
  roleTitle?: string;
  updatedAt?: string;
}

// Official credentials for financial office / warehouse manager
export const DEFAULT_ADMIN_EMAIL = 'cahayabuah@gmail.com';
export const DEFAULT_ADMIN_PASSWORD = 'cahayabuah';

/**
 * Get active admin password (either customized or default)
 */
export function getAdminPassword(): string {
  try {
    const custom = localStorage.getItem(ADMIN_CUSTOM_PASSWORD_KEY);
    if (custom && custom.trim().length >= 4) {
      return custom.trim();
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_ADMIN_PASSWORD;
}

/**
 * Update admin password
 */
export function updateAdminPassword(oldPassword: string, newPassword: string): void {
  const currentPassword = getAdminPassword();
  if (oldPassword.trim() !== currentPassword) {
    throw new Error('Kata sandi lama yang Anda masukkan salah!');
  }
  if (!newPassword || newPassword.trim().length < 4) {
    throw new Error('Kata sandi baru minimal 4 karakter!');
  }
  localStorage.setItem(ADMIN_CUSTOM_PASSWORD_KEY, newPassword.trim());
}

/**
 * Update admin profile information (name, avatar, role title)
 */
export function updateAdminProfile(updates: Partial<AdminUser>): AdminUser {
  const current = getSavedAdminSession();
  if (!current) {
    throw new Error('Sesi admin tidak ditemukan. Silakan login terlebih dahulu.');
  }
  const updated: AdminUser = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveAdminSession(updated);
  return updated;
}

/**
 * Check if currently stored admin session exists
 */
export function getSavedAdminSession(): AdminUser | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed && 
        parsed.isAdmin && 
        parsed.email && 
        parsed.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()
      ) {
        return parsed;
      }
      // Bersihkan sesi lama yang tidak sesuai
      localStorage.removeItem(ADMIN_SESSION_KEY);
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
  const validPassword = getAdminPassword();

  // Validasi ketat: Hanya email dan password resmi admin yang diizinkan
  if (trimmedEmail !== DEFAULT_ADMIN_EMAIL.toLowerCase() || trimmedPassword !== validPassword) {
    throw new Error('Email atau kata sandi admin salah! Akses ditolak.');
  }

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
        console.warn('Firebase Auth create notice:', createErr);
      }
    } else {
      console.warn('Firebase Auth sign in notice:', err);
    }
  }

  const existingProfile = getSavedAdminSession();

  const adminData: AdminUser = {
    email: DEFAULT_ADMIN_EMAIL,
    isAdmin: true,
    uid: fbUser ? fbUser.uid : 'admin-cahayabuah',
    name: existingProfile?.name || 'Admin Keuangan',
    avatarUrl: existingProfile?.avatarUrl || '',
    roleTitle: existingProfile?.roleTitle || 'Administrator Keuangan & Gudang',
  };
  saveAdminSession(adminData);
  return adminData;
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
      const existing = getSavedAdminSession();
      const admin: AdminUser = {
        email: user.email || DEFAULT_ADMIN_EMAIL,
        isAdmin: true,
        uid: user.uid,
        name: existing?.name || user.email?.split('@')[0] || 'Admin Keuangan',
        avatarUrl: existing?.avatarUrl || '',
        roleTitle: existing?.roleTitle || 'Administrator Keuangan & Gudang',
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
