'use server';

import Papa from 'papaparse';
import { requireAdmin } from '@/lib/auth';
import { saveDraftMenuToFirestore, type MenuItem } from '@/lib/firestore';

export async function uploadMenuCSV(formData: FormData) {
  try {
    await requireAdmin();
    const file = formData.get('file') as File;
    const restaurantId = formData.get('restaurantId') as string;

    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }

    if (!restaurantId) {
      return { success: false, message: 'Restaurant ID is required' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const csvContent = buffer.toString('utf-8');

    // Parse CSV
    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        const headerMap: Record<string, string> = {
          'Item Name': 'itemName',
          'Price (₹)': 'price',
          'Category': 'category',
          'Veg/Non-Veg': 'vegNonVeg',
          'Description': 'description'
        };
        return headerMap[header] || header;
      },
      transform: (value: string, field: string) => {
        if (field === 'price') return parseFloat(value) || 0;
        if (field === 'vegNonVeg') return value.trim() === 'Veg' ? 'Veg' : 'Non-Veg';
        return value;
      }
    });

    if (parseResult.errors.length > 0) {
      return { success: false, message: 'CSV parsing failed: ' + parseResult.errors[0].message };
    }

    const items = parseResult.data as MenuItem[];
    
    // Validate items
    const validItems = items.filter(item => 
      item.itemName && 
      item.price > 0 && 
      item.category && 
      (item.vegNonVeg === 'Veg' || item.vegNonVeg === 'Non-Veg')
    );

    if (validItems.length === 0) {
      return { success: false, message: 'No valid menu items found in CSV' };
    }

    // Save draft menu to Firestore
    await saveDraftMenuToFirestore(restaurantId, validItems);
    
    return { 
      success: true, 
      message: `Draft saved successfully! Processed ${validItems.length} items. Go to Dashboard to preview and publish.`,
      count: validItems.length 
    };

  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, message: 'Server error processing file' };
  }
}
