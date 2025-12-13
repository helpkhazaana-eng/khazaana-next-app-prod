import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_DIR = path.join(__dirname, '../src/data/menus-csv');
const JSON_DIR = path.join(__dirname, '../src/data/menus-json');

// Ensure JSON directory exists
if (!fs.existsSync(JSON_DIR)) {
  fs.mkdirSync(JSON_DIR, { recursive: true });
}

const csvFiles = fs.readdirSync(CSV_DIR).filter(file => file.endsWith('.csv'));

console.log(`Found ${csvFiles.length} CSV files to convert...`);

csvFiles.forEach(file => {
  const csvPath = path.join(CSV_DIR, file);
  const jsonPath = path.join(JSON_DIR, file.replace('.csv', '.json'));
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => {
      const headerMap = {
        'Item Name': 'itemName',
        'Price (₹)': 'price',
        'Category': 'category',
        'Veg/Non-Veg': 'vegNonVeg',
        'Description': 'description'
      };
      return headerMap[header] || header;
    },
    transform: (value, field) => {
      if (field === 'price') return parseFloat(value) || 0;
      if (field === 'vegNonVeg') return value.trim() === 'Veg' ? 'Veg' : 'Non-Veg';
      return value;
    }
  });

  if (result.errors.length > 0) {
    console.error(`Error parsing ${file}:`, result.errors);
  } else {
    // Filter valid items
    const items = result.data.filter((item) => 
        item.itemName && 
        item.price > 0 && 
        item.category && 
        (item.vegNonVeg === 'Veg' || item.vegNonVeg === 'Non-Veg')
    );

    fs.writeFileSync(jsonPath, JSON.stringify(items, null, 2));
    console.log(`Converted ${file} -> ${path.basename(jsonPath)} (${items.length} items)`);
  }
});

console.log('Seeding completed.');
