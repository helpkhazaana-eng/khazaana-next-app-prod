'use server';

import { getSystemConfig, saveSystemConfig } from '@/lib/system-config';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function updateSystemPhone(phone: string) {
  try {
    await requireAdmin();
    // Basic validation
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      return { success: false, message: 'Invalid phone number' };
    }
    
    await saveSystemConfig({ whatsappOrderNumber: cleaned });
    revalidatePath('/admin');
    revalidatePath('/'); // Revalidate home as it might show the number
    
    return { success: true, message: 'WhatsApp order number updated' };
  } catch (error) {
    return { success: false, message: 'Failed to update number' };
  }
}

export async function updateGlobalStatus(status: 'open' | 'closed' | 'auto') {
  try {
    await requireAdmin();
    await saveSystemConfig({ globalOverride: status });
    revalidatePath('/');
    revalidatePath('/admin');
    
    const statusText = status === 'auto' ? 'Automatic (Based on Timings)' : status === 'open' ? 'Force OPEN' : 'Force CLOSED';
    return { success: true, message: `System status set to: ${statusText}` };
  } catch (error) {
    return { success: false, message: 'Failed to update system status' };
  }
}
