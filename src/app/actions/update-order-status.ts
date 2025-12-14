'use server';

import { updateOrderStatus, getOrderFromFirestore, type OrderStatus } from '@/lib/firestore';
import { sendPushNotification } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

const STATUS_MESSAGES: Record<OrderStatus, { title: string; body: string }> = {
  pending: { title: 'Order Received', body: 'Your order has been received and is being processed.' },
  confirmed: { title: 'Order Confirmed! 🎉', body: 'Your order has been confirmed and is being prepared.' },
  delivered: { title: 'Order Delivered! 🍽️', body: 'Your order has been delivered. Enjoy your meal!' },
  cancelled: { title: 'Order Cancelled', body: 'Your order has been cancelled. Contact us for more info.' },
};

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  try {
    await requireAdmin();
    
    // Get order to retrieve FCM token
    const order = await getOrderFromFirestore(orderId);
    
    if (!order) {
      return { success: false, message: 'Order not found' };
    }
    
    // Update status in Firestore
    const updated = await updateOrderStatus(orderId, status);
    
    if (!updated) {
      return { success: false, message: 'Failed to update order status' };
    }
    
    // Send push notification if FCM token exists
    if (order.fcmToken) {
      const message = STATUS_MESSAGES[status];
      try {
        await sendPushNotification(
          order.fcmToken,
          message.title,
          message.body,
          { orderId, status, url: '/history' }
        );
        console.log('[OrderStatus] Push notification sent for order:', orderId);
      } catch (notifError) {
        console.error('[OrderStatus] Failed to send push notification:', notifError);
        // Don't fail the whole operation if notification fails
      }
    }
    
    revalidatePath('/admin/orders');
    revalidatePath('/history');
    
    return { success: true, message: `Order status updated to ${status}` };
  } catch (error) {
    console.error('[OrderStatus] Error:', error);
    return { success: false, message: 'Failed to update order status' };
  }
}
