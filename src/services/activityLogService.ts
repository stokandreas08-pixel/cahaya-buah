import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs,
  query,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db, sanitizeFirestoreData } from './firebase';
import { UserLog } from '../types';

const LOGS_COLLECTION = 'user_logs';
const LOGS_STORAGE_KEY = 'cb_user_logs_cache_v1';
const CLIENT_VISITOR_KEY = 'cb_client_visitor_id';
const GEO_CACHE_KEY = 'cb_client_geo_cache_v1';

interface GeoLocationCache {
  ip: string;
  location: string;
  fetchedAt: number;
}

/**
 * Get or generate a persistent visitor identifier for clients/guests
 */
export function getOrCreateVisitorId(): string {
  try {
    let visitorId = localStorage.getItem(CLIENT_VISITOR_KEY);
    if (!visitorId) {
      const randHex = Math.random().toString(16).substring(2, 6).toUpperCase();
      visitorId = `KLIEN-${randHex}`;
      localStorage.setItem(CLIENT_VISITOR_KEY, visitorId);
    }
    return visitorId;
  } catch {
    return 'KLIEN-ANON';
  }
}

/**
 * Parse browser User-Agent into clean device & browser description
 */
export function parseUserDevice(): string {
  if (typeof window === 'undefined' || !navigator) return 'Desktop / Browser';

  const ua = navigator.userAgent || '';
  let os = 'Unknown OS';
  let deviceType = 'Desktop';

  if (/Android/i.test(ua)) {
    os = 'Android';
    deviceType = 'Mobile';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = 'iOS';
    deviceType = /iPad/i.test(ua) ? 'Tablet' : 'Mobile';
  } else if (/Windows NT 10.0/i.test(ua)) {
    os = 'Windows 10/11';
  } else if (/Windows/i.test(ua)) {
    os = 'Windows';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  let browser = 'Browser';
  if (/Edg\//i.test(ua)) {
    browser = 'Edge';
  } else if (/Chrome\//i.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox\//i.test(ua)) {
    browser = 'Firefox';
  }

  return `${browser} (${os} • ${deviceType})`;
}

// In-memory cache for fast reuse during current session
let memoryGeoCache: GeoLocationCache | null = null;
let isFetchingGeo = false;

/**
 * Fetch IP and location name using ipapi.co with fallback and cache
 */
export async function getClientIpAndLocation(): Promise<{ ip: string; location: string }> {
  // Check memory cache first
  if (memoryGeoCache && Date.now() - memoryGeoCache.fetchedAt < 24 * 60 * 60 * 1000) {
    return { ip: memoryGeoCache.ip, location: memoryGeoCache.location };
  }

  // Check localStorage cache
  try {
    const saved = localStorage.getItem(GEO_CACHE_KEY);
    if (saved) {
      const parsed: GeoLocationCache = JSON.parse(saved);
      if (parsed.ip && Date.now() - parsed.fetchedAt < 24 * 60 * 60 * 1000) {
        memoryGeoCache = parsed;
        return { ip: parsed.ip, location: parsed.location };
      }
    }
  } catch (e) {
    // Ignore localStorage parse error
  }

  if (isFetchingGeo) {
    return { ip: 'Mengambil IP...', location: 'Mendeteksi Lokasi...' };
  }

  isFetchingGeo = true;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    // Call free ipapi.co endpoint
    const res = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const ip = data.ip || '127.0.0.1';
      const city = data.city || '';
      const region = data.region || '';
      const country = data.country_name || 'Indonesia';
      
      const locParts = [city, region, country].filter(Boolean);
      const location = locParts.length > 0 ? locParts.join(', ') : 'Indonesia (Jaringan Publik)';

      const cacheObj: GeoLocationCache = { ip, location, fetchedAt: Date.now() };
      memoryGeoCache = cacheObj;
      try {
        localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cacheObj));
      } catch {}

      isFetchingGeo = false;
      return { ip, location };
    }
  } catch (err) {
    // ipapi.co might be rate limited or blocked, try fallback to ipify for IP
    try {
      const fallbackRes = await fetch('https://api.ipify.org?format=json', { cache: 'no-cache' });
      if (fallbackRes.ok) {
        const ipData = await fallbackRes.json();
        const ip = ipData.ip || '127.0.0.1';
        const location = 'Indonesia (Layanan Jaringan)';
        const cacheObj: GeoLocationCache = { ip, location, fetchedAt: Date.now() };
        memoryGeoCache = cacheObj;
        try {
          localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cacheObj));
        } catch {}
        isFetchingGeo = false;
        return { ip, location };
      }
    } catch {}
  }

  isFetchingGeo = false;
  // Default fallback if network or adblock prevents API call
  return {
    ip: '127.0.0.1 (Lokal)',
    location: 'Indonesia (Klien Web)',
  };
}

// Simple debounce cache to prevent rapid duplicate logs
let lastLogSignature = '';
let lastLogTime = 0;

/**
 * Record user activity automatically and persist to Firestore + local cache
 */
export async function recordUserActivity(
  aktivitas: string,
  options?: {
    userId?: string;
    namaPengguna?: string;
    metadata?: Record<string, any>;
    force?: boolean;
  }
): Promise<UserLog | null> {
  const now = Date.now();
  const signature = `${aktivitas}_${options?.userId || ''}`;

  // Debounce duplicate identical activities within 2 seconds
  if (!options?.force && signature === lastLogSignature && now - lastLogTime < 2000) {
    return null;
  }
  lastLogSignature = signature;
  lastLogTime = now;

  try {
    const { ip, location } = await getClientIpAndLocation();
    const visitorId = options?.userId || getOrCreateVisitorId();
    const userName = options?.namaPengguna || (options?.userId?.includes('@') ? 'Admin Keuangan' : `Klien (${visitorId})`);
    const device = parseUserDevice();
    const timestamp = new Date().toISOString();
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const logEntry: UserLog = {
      id: logId,
      user_id: visitorId,
      nama_pengguna: userName,
      ip_address: ip,
      perangkat: device,
      lokasi: location,
      aktivitas,
      timestamp,
      metadata: options?.metadata || {},
    };

    // 1. Save to localStorage cache for instant availability
    saveLogToLocalCache(logEntry);

    // 2. Persist to Firestore asynchronously
    try {
      const docRef = doc(db, LOGS_COLLECTION, logId);
      const cleanData = sanitizeFirestoreData({ ...logEntry });
      await setDoc(docRef, cleanData);
    } catch (dbErr) {
      console.warn('Gagal menyimpan log ke cloud Firestore, tersimpan di cache lokal:', dbErr);
    }

    return logEntry;
  } catch (e) {
    console.error('Error recording activity log:', e);
    return null;
  }
}

/**
 * Save log item to localStorage
 */
function saveLogToLocalCache(log: UserLog) {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    const list: UserLog[] = raw ? JSON.parse(raw) : [];
    // Keep last 300 logs in local storage
    const updated = [log, ...list.filter(item => item.id !== log.id)].slice(0, 300);
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

/**
 * Get cached local logs
 */
export function getCachedUserLogs(): UserLog[] {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Real-time subscription to user_logs from Firestore
 */
export function subscribeToUserLogs(
  onData: (logs: UserLog[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, LOGS_COLLECTION);
    // Realtime query
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          const localLogs = getCachedUserLogs();
          onData(localLogs);
          return;
        }

        const items: UserLog[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as UserLog;
          items.push({
            ...data,
            id: docSnap.id,
          });
        });

        // Sort descending by timestamp
        items.sort((a, b) => {
          const timeA = new Date(a.timestamp || 0).getTime();
          const timeB = new Date(b.timestamp || 0).getTime();
          return timeB - timeA;
        });

        // Also merge with local cache to avoid missing immediate local entries
        const local = getCachedUserLogs();
        const existingIds = new Set(items.map(i => i.id));
        for (const loc of local) {
          if (!existingIds.has(loc.id)) {
            items.push(loc);
          }
        }
        items.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());

        onData(items);
      },
      (error) => {
        console.warn('Firestore user_logs subscription warning:', error);
        onData(getCachedUserLogs());
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('Firestore subscription exception:', err);
    onData(getCachedUserLogs());
    return () => {};
  }
}

/**
 * Delete a specific log entry
 */
export async function deleteUserLogInCloud(logId: string): Promise<void> {
  // Remove from local cache
  try {
    const local = getCachedUserLogs().filter(l => l.id !== logId);
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(local));
  } catch {}

  // Delete from Firestore
  try {
    const docRef = doc(db, LOGS_COLLECTION, logId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Error deleting log from cloud:', e);
  }
}

/**
 * Clear all logs (Admin utility)
 */
export async function clearAllUserLogs(): Promise<void> {
  try {
    localStorage.removeItem(LOGS_STORAGE_KEY);
  } catch {}

  try {
    const colRef = collection(db, LOGS_COLLECTION);
    const snap = await getDocs(colRef);
    const promises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(promises);
  } catch (e) {
    console.warn('Error clearing logs in cloud:', e);
  }
}
