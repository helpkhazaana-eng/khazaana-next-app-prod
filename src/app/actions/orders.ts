'use server';

import { triggerInvoice, type InvoiceResponse } from '@/lib/googleSheets';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function generateReceipt(orderId: string): Promise<InvoiceResponse> {
  try {
    await requireAdmin();
    const result = await triggerInvoice(orderId);
    
    if (result.success) {
      revalidatePath('/admin/orders');
    }
    
    return result;
  } catch (error) {
    console.error('Failed to generate receipt:', error);
    return { success: false, error: 'Server error occurred' };
  }
}
