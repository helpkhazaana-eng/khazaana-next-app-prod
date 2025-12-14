/**
 * Migration Script: Seed Firestore with existing local data
 * 
 * Run this script ONCE to migrate existing restaurants and menus to Firestore.
 * 
 * Usage: npx ts-node scripts/migrate-to-firestore.ts
 * Or add to package.json: "migrate:firestore": "ts-node scripts/migrate-to-firestore.ts"
 */

import { promises as fs } from 'fs';
import path from 'path';

// Initialize Firebase Admin before importing firestore functions
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

let firestoreDb: admin.firestore.Firestore;

async function initFirebase() {
  if (admin.apps.length > 0) {
    return;
  }
  
  // Use environment variables for Firebase Admin credentials
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const databaseId = process.env.FIREBASE_DATABASE_ID;

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Firebase Admin SDK: Missing environment variables');
    console.error('Required in .env.local:');
    console.error('  FIREBASE_PROJECT_ID');
    console.error('  FIREBASE_CLIENT_EMAIL');
    console.error('  FIREBASE_PRIVATE_KEY');
    console.error('\nGet these from Firebase Console:');
    console.error('  Project Settings > Service Accounts > Generate New Private Key');
    process.exit(1);
  }

  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    projectId,
  });
  
  // Initialize Firestore with correct database ID
  if (databaseId && databaseId !== '(default)') {
    firestoreDb = getFirestore(app, databaseId);
    console.log(`✓ Firebase initialized for project: ${projectId}, database: ${databaseId}`);
  } else {
    firestoreDb = getFirestore(app);
    console.log(`✓ Firebase initialized for project: ${projectId}`);
  }
}

function getDb() {
  return firestoreDb;
}

async function migrateRestaurants() {
  console.log('\n📦 Migrating restaurants...');
  
  const db = getDb();
  const liveRestaurantsPath = path.join(process.cwd(), 'src/data/live-restaurants.json');
  
  try {
    const data = await fs.readFile(liveRestaurantsPath, 'utf-8');
    const restaurants = JSON.parse(data);
    
    const batch = db.batch();
    let count = 0;
    
    for (const restaurant of restaurants) {
      const { id, ...restData } = restaurant;
      const ref = db.collection('restaurants').doc(id);
      batch.set(ref, { 
        ...restData, 
        adminStatus: restData.adminStatus || 'live',
        migratedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      count++;
      console.log(`  ✓ Prepared: ${restaurant.name} (${id})`);
    }
    
    await batch.commit();
    console.log(`✅ Migrated ${count} restaurants to Firestore`);
  } catch (error) {
    console.error('❌ Failed to migrate restaurants:', error);
  }
}

async function migrateMenus() {
  console.log('\n📦 Migrating menus...');
  
  const db = getDb();
  const menusDir = path.join(process.cwd(), 'src/data/menus-json');
  
  try {
    const files = await fs.readdir(menusDir);
    const jsonFiles = files.filter(f => f.endsWith('.json') && !f.includes('.draft'));
    
    let count = 0;
    
    for (const file of jsonFiles) {
      const restaurantId = file.replace('.json', '');
      const filePath = path.join(menusDir, file);
      
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        const items = JSON.parse(data);
        
        await db.collection('menus').doc(restaurantId).set({
          items,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          migratedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        count++;
        console.log(`  ✓ Migrated menu: ${restaurantId} (${items.length} items)`);
      } catch (err) {
        console.error(`  ❌ Failed to migrate menu for ${restaurantId}:`, err);
      }
    }
    
    console.log(`✅ Migrated ${count} menus to Firestore`);
  } catch (error) {
    console.error('❌ Failed to migrate menus:', error);
  }
}

async function migrateSystemConfig() {
  console.log('\n📦 Migrating system config...');
  
  const db = getDb();
  const configPath = path.join(process.cwd(), 'src/data/system-config.json');
  
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(data);
    
    await db.collection('system').doc('config').set({
      ...config,
      migratedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Migrated system config to Firestore`);
  } catch (error) {
    console.error('❌ Failed to migrate system config:', error);
  }
}

async function main() {
  console.log('🚀 Starting Firestore Migration...\n');
  console.log('='.repeat(50));
  
  await initFirebase();
  
  await migrateRestaurants();
  await migrateMenus();
  await migrateSystemConfig();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Migration complete!\n');
  console.log('Next steps:');
  console.log('1. Verify data in Firebase Console: https://console.firebase.google.com');
  console.log('2. Test the application locally');
  console.log('3. Deploy to production');
  
  process.exit(0);
}

main().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
