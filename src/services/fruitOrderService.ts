import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs 
} from 'firebase/firestore';
import { db, sanitizeFirestoreData } from './firebase';
import { FruitOrder, OrderStatus } from '../types';
import { initialFruitOrders } from '../data/fruitCatalog';

const COLLECTION_NAME = 'fruit_orders';

/**
 * Subscribe to real-time fruit orders updates from Firestore
 */
export function subscribeToFruitOrders(
  onData: (orders: FruitOrder[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, COLLECTION_NAME);

    return onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore collection is empty on first boot, seed initial sample orders
          seedInitialFruitOrders(initialFruitOrders);
          onData(initialFruitOrders);
          return;
        }

        const items: FruitOrder[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as FruitOrder;
          items.push({
            ...data,
            id: docSnap.id,
            items: Array.isArray(data.items) ? data.items : [],
            customerPhone: data.customerPhone || undefined,
            notes: data.notes || undefined,
          });
        });

        // Sort descending by date/time or createdAt
        items.sort((a, b) => {
          const timeA = new Date(a.createdAt || `${a.date}T${a.time || '00:00'}`).getTime();
          const timeB = new Date(b.createdAt || `${b.date}T${b.time || '00:00'}`).getTime();
          return timeB - timeA;
        });

        onData(items);
      },
      (error) => {
        console.warn('Fruit orders Firestore subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.error('Failed to setup fruit orders Firestore listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Seed initial sample fruit orders if collection empty
 */
export async function seedInitialFruitOrders(orders: FruitOrder[]) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const existingSnap = await getDocs(colRef);
    if (!existingSnap.empty) return;

    for (const ord of orders) {
      const clean = sanitizeFirestoreData({
        ...ord,
        customerPhone: ord.customerPhone || '',
        notes: ord.notes || '',
        createdAt: ord.createdAt || new Date().toISOString(),
      });
      await setDoc(doc(db, COLLECTION_NAME, ord.id), clean);
    }
    console.log('Seeded initial fruit orders to Firestore');
  } catch (e) {
    console.warn('Could not seed fruit orders to Firestore:', e);
  }
}

/**
 * Add a new fruit order to Firestore
 */
export async function addFruitOrderToCloud(order: FruitOrder): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, order.id);
  const clean = sanitizeFirestoreData({
    ...order,
    customerPhone: order.customerPhone || '',
    notes: order.notes || '',
    createdAt: order.createdAt || new Date().toISOString(),
  });
  await setDoc(docRef, clean);
}

/**
 * Update an existing fruit order in Firestore
 */
export async function updateFruitOrderInCloud(order: FruitOrder): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, order.id);
  const clean = sanitizeFirestoreData({
    ...order,
    customerPhone: order.customerPhone || '',
    notes: order.notes || '',
  });
  await setDoc(docRef, clean, { merge: true });
}

/**
 * Delete a fruit order from Firestore
 */
export async function deleteFruitOrderFromCloud(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Update order status (menunggu, diproses, selesai, dibatalkan)
 */
export async function updateFruitOrderStatusInCloud(id: string, status: OrderStatus): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, { status });
}

