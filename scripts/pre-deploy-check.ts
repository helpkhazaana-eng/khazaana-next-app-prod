/**
 * Pre-Deployment Checklist for Khazaana
 * Run this before deploying to Vercel to ensure everything is configured correctly
 * 
 * Usage: npx ts-node scripts/pre-deploy-check.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, condition: boolean, passMsg: string, failMsg: string, isWarning = false) {
  results.push({
    name,
    status: condition ? 'pass' : (isWarning ? 'warn' : 'fail'),
    message: condition ? passMsg : failMsg
  });
}

console.log('\n🚀 KHAZAANA PRE-DEPLOYMENT CHECKLIST\n');
console.log('='.repeat(60));

// 1. Check Environment Variables
console.log('\n📋 1. ENVIRONMENT VARIABLES CHECK\n');

const requiredEnvVars = [
  // Firebase Admin (Server-side)
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL', 
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_DATABASE_ID',
  
  // Firebase Client (Browser)
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  
  // Google Sheets (Orders/Analytics)
  'NEXT_PUBLIC_GOOGLE_SCRIPT_URL',
];

const optionalEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', // No longer required - using Firebase Auth
  'CLERK_SECRET_KEY', // No longer required
];

// Read .env.local
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf-8');
} catch {
  console.log('❌ .env.local file not found!');
  process.exit(1);
}

const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

requiredEnvVars.forEach(varName => {
  const exists = !!envVars[varName] && envVars[varName] !== '';
  check(
    `ENV: ${varName}`,
    exists,
    '✅ Set',
    '❌ Missing or empty - REQUIRED for production'
  );
});

// 2. Check Critical Files Exist
console.log('\n📁 2. CRITICAL FILES CHECK\n');

const criticalFiles = [
  'src/lib/firebase-admin.ts',
  'src/lib/firebase.ts',
  'src/lib/firestore.ts',
  'src/contexts/AdminAuthContext.tsx',
  'src/app/admin/AdminLayoutClient.tsx',
  'src/app/sign-in/[[...sign-in]]/page.tsx',
  'src/lib/restaurant-manager.ts',
  'src/lib/data-access.ts',
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  check(
    `FILE: ${file}`,
    exists,
    '✅ Exists',
    '❌ Missing'
  );
});

// 3. Check Restaurant Data
console.log('\n🍽️ 3. RESTAURANT DATA CHECK\n');

const liveRestaurantsPath = path.join(process.cwd(), 'src/data/live-restaurants.json');
try {
  const restaurants = JSON.parse(fs.readFileSync(liveRestaurantsPath, 'utf-8'));
  check(
    'Live Restaurants',
    restaurants.length > 0,
    `✅ ${restaurants.length} restaurants configured`,
    '❌ No restaurants found'
  );
  
  // Check each restaurant has required fields
  restaurants.forEach((r: any) => {
    const hasRequired = r.id && r.name && r.opensAt && r.closesAt;
    check(
      `Restaurant: ${r.name || r.id}`,
      hasRequired,
      '✅ Has all required fields',
      '❌ Missing required fields (id, name, opensAt, closesAt)'
    );
  });
} catch (e) {
  check('Live Restaurants', false, '', '❌ Could not read live-restaurants.json');
}

// 4. Check Menu Files
console.log('\n📜 4. MENU FILES CHECK\n');

const menusDir = path.join(process.cwd(), 'src/data/menus-json');
try {
  const menuFiles = fs.readdirSync(menusDir).filter(f => f.endsWith('.json'));
  check(
    'Menu JSON Files',
    menuFiles.length > 0,
    `✅ ${menuFiles.length} menu files found`,
    '❌ No menu files found'
  );
  
  menuFiles.forEach(file => {
    const menuPath = path.join(menusDir, file);
    try {
      const menu = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
      const validItems = menu.filter((item: any) => item.itemName && item.price > 0);
      check(
        `Menu: ${file}`,
        validItems.length > 0,
        `✅ ${validItems.length} valid items`,
        '❌ No valid items'
      );
    } catch {
      check(`Menu: ${file}`, false, '', '❌ Invalid JSON');
    }
  });
} catch {
  check('Menu Directory', false, '', '❌ menus-json directory not found');
}

// 5. Check Admin Operations Code
console.log('\n⚙️ 5. ADMIN OPERATIONS CHECK\n');

const adminOperations = [
  { file: 'src/app/actions/publish-menu.ts', name: 'Publish Menu Action' },
  { file: 'src/app/actions/upload-menu.ts', name: 'Upload Menu Action' },
  { file: 'src/app/admin/restaurants/new/page.tsx', name: 'Create Restaurant Page' },
  { file: 'src/app/admin/upload/page.tsx', name: 'Upload Menu Page' },
  { file: 'src/app/admin/page.tsx', name: 'Admin Dashboard' },
];

adminOperations.forEach(op => {
  const filePath = path.join(process.cwd(), op.file);
  const exists = fs.existsSync(filePath);
  check(op.name, exists, '✅ Ready', '❌ Missing');
});

// 6. Check Firestore Integration
console.log('\n🔥 6. FIRESTORE INTEGRATION CHECK\n');

const firestorePath = path.join(process.cwd(), 'src/lib/firestore.ts');
try {
  const firestoreContent = fs.readFileSync(firestorePath, 'utf-8');
  
  const hasGetRestaurants = firestoreContent.includes('getAllRestaurantsFromFirestore') || firestoreContent.includes('getLiveRestaurants');
  const hasGetMenu = firestoreContent.includes('getMenuFromFirestore');
  const hasSaveRestaurant = firestoreContent.includes('saveRestaurant') || firestoreContent.includes('saveDraftRestaurant');
  const hasSaveMenu = firestoreContent.includes('saveDraftMenuToFirestore') || firestoreContent.includes('publishMenuToFirestore');
  
  check('Firestore: Get Restaurants', hasGetRestaurants, '✅ Implemented', '❌ Missing');
  check('Firestore: Get Menu', hasGetMenu, '✅ Implemented', '❌ Missing');
  check('Firestore: Save Restaurant', hasSaveRestaurant, '✅ Implemented', '❌ Missing');
  check('Firestore: Save Menu', hasSaveMenu, '✅ Implemented', '❌ Missing');
} catch {
  check('Firestore Module', false, '', '❌ Could not read firestore.ts');
}

// 7. Check Firebase Auth Integration
console.log('\n🔐 7. FIREBASE AUTH CHECK\n');

const authContextPath = path.join(process.cwd(), 'src/contexts/AdminAuthContext.tsx');
try {
  const authContent = fs.readFileSync(authContextPath, 'utf-8');
  
  const hasSignIn = authContent.includes('signInWithEmailAndPassword');
  const hasSignOut = authContent.includes('signOut');
  const hasAuthState = authContent.includes('onAuthStateChanged');
  
  check('Firebase Auth: Sign In', hasSignIn, '✅ Implemented', '❌ Missing');
  check('Firebase Auth: Sign Out', hasSignOut, '✅ Implemented', '❌ Missing');
  check('Firebase Auth: State Listener', hasAuthState, '✅ Implemented', '❌ Missing');
} catch {
  check('Firebase Auth Context', false, '', '❌ Could not read AdminAuthContext.tsx');
}

// 8. Check Restaurant Timing Logic
console.log('\n⏰ 8. RESTAURANT TIMING CHECK\n');

const restaurantManagerPath = path.join(process.cwd(), 'src/lib/restaurant-manager.ts');
try {
  const rmContent = fs.readFileSync(restaurantManagerPath, 'utf-8');
  
  const hasIsOpen = rmContent.includes('isRestaurantOpen') || rmContent.includes('isOpen');
  const hasTimingLogic = rmContent.includes('opensAt') && rmContent.includes('closesAt');
  
  check('Restaurant: Open/Close Logic', hasIsOpen || hasTimingLogic, '✅ Implemented', '❌ Missing');
} catch {
  check('Restaurant Manager', false, '', '❌ Could not read restaurant-manager.ts');
}

// 9. Check Translation System
console.log('\n🌐 9. TRANSLATION SYSTEM CHECK\n');

const translationsPath = path.join(process.cwd(), 'src/lib/translations.ts');
try {
  const transContent = fs.readFileSync(translationsPath, 'utf-8');
  const foodTranslationsMatch = transContent.match(/foodTranslations[^{]*{([^}]+)}/);
  const translationCount = foodTranslationsMatch ? (foodTranslationsMatch[1].match(/'/g) || []).length / 2 : 0;
  
  check(
    'Bengali Translations',
    translationCount > 100,
    `✅ ${Math.floor(translationCount)} food terms translated`,
    `⚠️ Only ${Math.floor(translationCount)} translations (recommend 100+)`
  );
} catch {
  check('Translations Module', false, '', '❌ Could not read translations.ts');
}

// Print Summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 SUMMARY\n');

const passed = results.filter(r => r.status === 'pass').length;
const failed = results.filter(r => r.status === 'fail').length;
const warned = results.filter(r => r.status === 'warn').length;

console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⚠️ Warnings: ${warned}`);

if (failed > 0) {
  console.log('\n❌ FAILED CHECKS:\n');
  results.filter(r => r.status === 'fail').forEach(r => {
    console.log(`  • ${r.name}: ${r.message}`);
  });
}

if (warned > 0) {
  console.log('\n⚠️ WARNINGS:\n');
  results.filter(r => r.status === 'warn').forEach(r => {
    console.log(`  • ${r.name}: ${r.message}`);
  });
}

console.log('\n' + '='.repeat(60));

// Vercel Environment Variables Checklist
console.log('\n📝 VERCEL ENVIRONMENT VARIABLES CHECKLIST\n');
console.log('Add these to Vercel Dashboard → Settings → Environment Variables:\n');

const vercelEnvVars = [
  { name: 'FIREBASE_PROJECT_ID', value: 'khazaana-app', sensitive: false },
  { name: 'FIREBASE_CLIENT_EMAIL', value: 'firebase-adminsdk-fbsvc@khazaana-app.iam.gserviceaccount.com', sensitive: false },
  { name: 'FIREBASE_PRIVATE_KEY', value: '(copy from .env.local with quotes)', sensitive: true },
  { name: 'FIREBASE_DATABASE_ID', value: 'khazaana', sensitive: false },
  { name: 'NEXT_PUBLIC_FIREBASE_API_KEY', value: '(from Firebase Console)', sensitive: false },
  { name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', value: 'khazaana-app', sensitive: false },
  { name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', value: '(from Firebase Console)', sensitive: false },
  { name: 'NEXT_PUBLIC_FIREBASE_APP_ID', value: '(from Firebase Console)', sensitive: false },
  { name: 'NEXT_PUBLIC_GOOGLE_SCRIPT_URL', value: '(your Google Apps Script URL)', sensitive: true },
];

vercelEnvVars.forEach(v => {
  const icon = v.sensitive ? '🔒' : '📄';
  console.log(`${icon} ${v.name}`);
  console.log(`   Value: ${v.value}\n`);
});

console.log('='.repeat(60));

// Final Status
if (failed === 0) {
  console.log('\n✅ ALL CRITICAL CHECKS PASSED - Ready for deployment!\n');
  process.exit(0);
} else {
  console.log('\n❌ DEPLOYMENT BLOCKED - Fix failed checks before deploying!\n');
  process.exit(1);
}
