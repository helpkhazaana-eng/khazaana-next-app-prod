'use server';

import { saveOrderToFirestore, type FirestoreOrder } from '@/lib/firestore';

export async function saveOrderToFirestoreAction(order: FirestoreOrder) {
  try {
    await saveOrderToFirestore(order);
    return { success: true };
  } catch (error) {
    console.error('[SaveOrder] Error:', error);
    return { success: false, message: 'Failed to save order to Firestore' };
  }
}
