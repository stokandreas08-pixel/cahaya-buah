import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, sanitizeFirestoreData } from './firebase';
import { StockMap } from '../types';
import { initialFruitStock } from '../data/fruitCatalog';

const COLLECTION_NAME = 'fruit_stocks';
const DOC_ID = 'inventory';

/**
 * Clean and ensure all stock values are valid numbers (supports negative numbers)
 */
function cleanStockMap(raw: StockMap): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, val] of Object.entries(raw)) {
    const num = Number(val);
    result[key] = isNaN(num) ? 0 : Math.round(num);
  }
  return result;
}

/**
 * Subscribe to real-time fruit stock changes from Firestore
 */
export function subscribeToFruitStock(
  onData: (stock: StockMap) => void,
  onError?: (err: Error) => void
) {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);

    return onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          // Initialize inventory document in Firestore
          seedInitialFruitStock(initialFruitStock);
          onData(initialFruitStock);
          return;
        }

        const data = snapshot.data();
        if (data && data.stocks && typeof data.stocks === 'object') {
          onData(cleanStockMap(data.stocks as StockMap));
        } else {
          onData(initialFruitStock);
        }
      },
      (error) => {
        console.warn('Fruit stock Firestore subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.error('Failed to setup fruit stock Firestore listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Seed initial stock data to Firestore if not present
 */
export async function seedInitialFruitStock(stocks: StockMap) {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(docRef, {
        stocks: cleanStockMap(stocks),
        updatedAt: new Date().toISOString(),
      });
      console.log('Seeded initial fruit stock to Firestore');
    }
  } catch (e) {
    console.warn('Could not seed fruit stock to Firestore:', e);
  }
}

/**
 * Update stock for a single fruit size or all stocks
 */
export async function updateFruitStockInCloud(stockKey: string, newStock: number): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, DOC_ID);
  const snap = await getDoc(docRef);
  const currentStocks: StockMap = snap.exists() && snap.data()?.stocks ? snap.data()!.stocks : { ...initialFruitStock };

  currentStocks[stockKey] = Math.round(Number(newStock) || 0);

  await setDoc(docRef, {
    stocks: cleanStockMap(currentStocks),
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Update the whole stock map
 */
export async function saveAllStocksToCloud(newStocks: StockMap): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, DOC_ID);
  const sanitized = cleanStockMap(newStocks);
  await setDoc(docRef, sanitizeFirestoreData({
    stocks: sanitized,
    updatedAt: new Date().toISOString(),
  }), { merge: true });
}
