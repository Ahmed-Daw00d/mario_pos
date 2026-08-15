// src/data/seedFirestore.js
// Run with: node src/data/seedFirestore.js (after npm install)
// This seeds the Firestore database with all menu items, ingredients, and tables

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { INGREDIENTS, PRESET_PIZZAS, FRITTI, BEVANDE, TABLES, KEBAB_OPTIONS } from './menuData.js';

const firebaseConfig = {
  apiKey: "AIzaSyCml_af3wFrhJH-pygfYLWyIVt5mhPWx8c",
  authDomain: "casher-1fb4a.firebaseapp.com",
  projectId: "casher-1fb4a",
  storageBucket: "casher-1fb4a.firebasestorage.app",
  messagingSenderId: "575674491188",
  appId: "1:575674491188:web:34be71f443d8363d924561"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedInBatches(collectionName, items, getDocId) {
  const BATCH_SIZE = 500;
  let batch = writeBatch(db);
  let count = 0;

  for (const item of items) {
    const docId = getDocId(item);
    const ref = doc(db, collectionName, docId);
    batch.set(ref, item);
    count++;

    if (count % BATCH_SIZE === 0) {
      await batch.commit();
      batch = writeBatch(db);
      console.log(`  Committed ${count} docs to ${collectionName}`);
    }
  }

  if (count % BATCH_SIZE !== 0) {
    await batch.commit();
  }

  console.log(`✅ Seeded ${count} documents into '${collectionName}'`);
}

async function main() {
  console.log('🌱 Starting Firestore seed...\n');

  // 1. Ingredients
  await seedInBatches('ingredients', INGREDIENTS, i => i.id);

  // 2. Preset Pizzas
  const pizzaItems = PRESET_PIZZAS.map(p => ({ ...p, category: 'pizza' }));
  await seedInBatches('menu_items', pizzaItems, i => i.id);

  // 3. Fritti
  const frittiItems = FRITTI.map(f => ({ ...f, category: 'fritti' }));
  await seedInBatches('menu_items', frittiItems, i => i.id);

  // 4. Bevande
  const bevandeItems = BEVANDE.map(b => ({ ...b, category: 'bevande' }));
  await seedInBatches('menu_items', bevandeItems, i => i.id);

  // 5. Kebab (single doc with config)
  await setDoc(doc(db, 'menu_items', 'kebab_builder'), {
    id: 'kebab_builder',
    category: 'kebab',
    name_it: 'Kebab di Pollo',
    name_ar: 'كباب الدجاج',
    description_ar: 'كباب دجاج طازج مع اختياراتك',
    description_it: 'Kebab di pollo fresco a modo tuo',
    ...KEBAB_OPTIONS,
    is_available: true,
    sort_order: 0
  });
  console.log("✅ Seeded 'kebab_builder' into 'menu_items'");

  // 6. Tables
  await seedInBatches('tables', TABLES, t => t.id);

  console.log('\n🎉 Seed complete! Your Firestore database is ready.');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
