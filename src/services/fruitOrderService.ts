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
    const q = query(colRef, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore collection is empty, seed initial sample orders
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
          });
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
      await setDoc(doc(db, COLLECTION_NAME, ord.id), ord);
    }
    console.log('Seeded initial fruit orders to Firestore');
  } catch (e) {
    console.warn('Could not seed fruit orders to Firestore:', e);
  }
}

/**
 * Add a new fruit order
 */
export async function addFruitOrderToCloud(order: FruitOrder): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, order.id);
  await setDoc(docRef, order);
}

/**
 * Update an existing fruit order
 */
export async function updateFruitOrderInCloud(order: FruitOrder): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, order.id);
  await updateDoc(docRef, { ...order });
}

/**
 * Delete a fruit order
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

