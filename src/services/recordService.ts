import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { CarUnloadingRecord, PaymentStatus } from '../types';
import { initialRecords } from '../data/initialData';

const COLLECTION_NAME = 'bungkaran_records';

/**
 * Subscribe to real-time bungkaran records updates from Firestore
 */
export function subscribeToRecords(
  onData: (records: CarUnloadingRecord[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore collection is empty, seed with initial records
          seedInitialRecords(initialRecords);
          onData(initialRecords);
          return;
        }

        const items: CarUnloadingRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as CarUnloadingRecord;
          items.push({
            ...data,
            id: docSnap.id,
          });
        });
        onData(items);
      },
      (error) => {
        console.warn('Firestore subscription error (using local fallback):', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.error('Failed to setup Firestore snapshot listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Seed initial records into Firestore if collection is empty
 */
export async function seedInitialRecords(records: CarUnloadingRecord[]) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const existingSnap = await getDocs(colRef);
    if (!existingSnap.empty) return;

    for (const rec of records) {
      await setDoc(doc(db, COLLECTION_NAME, rec.id), rec);
    }
    console.log('Seeded initial bungkaran records to Firestore');
  } catch (e) {
    console.warn('Could not seed to Firestore:', e);
  }
}

/**
 * Add a new record to Firestore
 */
export async function addRecordToCloud(record: CarUnloadingRecord): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, record.id);
  await setDoc(docRef, record);
}

/**
 * Update an existing record in Firestore
 */
export async function updateRecordInCloud(record: CarUnloadingRecord): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, record.id);
  await updateDoc(docRef, { ...record });
}

/**
 * Delete a record from Firestore
 */
export async function deleteRecordFromCloud(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Toggle payment status in Firestore
 */
export async function togglePaymentStatusInCloud(id: string, currentStatus: PaymentStatus): Promise<void> {
  const newStatus: PaymentStatus = currentStatus === 'lunas' ? 'belum_dibayar' : 'lunas';
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, { paymentStatus: newStatus });
}
