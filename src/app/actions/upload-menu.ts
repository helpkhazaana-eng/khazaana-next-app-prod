'use server';

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import Papa from 'papaparse';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

// Define the shape of our menu items
interface MenuItem {
  itemName: string;
  price: number;
  category: string;
  vegNonVeg: 'Veg' | 'Non-Veg';
  description?: string;
  inStock?: boolean;
}

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

    // Save as DRAFT JSON first
    const dataDir = join(process.cwd(), 'src', 'data', 'menus-json');
    await mkdir(dataDir, { recursive: true });
    
    // Use .draft.json extension
    const filePath = join(dataDir, `${restaurantId}.draft.json`);
    await writeFile(filePath, JSON.stringify(validItems, null, 2));

    // Also update the CSV file for reference/download
    const csvDir = join(process.cwd(), 'src', 'data', 'menus-csv');
    await mkdir(csvDir, { recursive: true });
    const csvPath = join(csvDir, `${restaurantId}.draft.csv`);
    await writeFile(csvPath, csvContent);

    // No revalidate needed yet as it's a draft
    
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
