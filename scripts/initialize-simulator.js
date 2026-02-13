#!/usr/bin/env node

/**
 * Simulator State Initialization Script
 * 
 * This script initializes the simulator state for all users in Firestore.
 * Run this once after deploying the DSE Stock Simulator integration.
 * 
 * Usage:
 *   node scripts/initialize-simulator.js
 * 
 * Prerequisites:
 *   1. Download service account key from Firebase Console
 *   2. Place it in the root directory as serviceAccountKey.json
 *   3. Install dependencies: npm install
 */

const admin = require('firebase-admin');
const path = require('path');

// Load service account key
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Error: Could not load serviceAccountKey.json');
  console.error('Please download your Firebase service account key from:');
  console.error('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.error('2. Click "Generate New Private Key"');
  console.error('3. Save as serviceAccountKey.json in the root directory');
  process.exit(1);
}

const db = admin.firestore();

async function initializeSimulator(userId) {
  try {
    const simulatorRef = db.collection('users').doc(userId).collection('simulator').doc('state');
    
    // Check if already initialized
    const docSnapshot = await simulatorRef.get();
    if (docSnapshot.exists) {
      console.log(`⏭️  User ${userId} already has simulator state (skipping)`);
      return;
    }

    // Initialize with default values
    const initialState = {
      balance: 10000, // ৳10,000 Fake BDT
      portfolio: [],
      totalInvested: 0,
      totalCurrentValue: 0,
      totalGainLoss: 0,
      gainLossPercent: 0,
      createdAt: new Date().toISOString()
    };

    await simulatorRef.set(initialState);
    console.log(`✅ Initialized simulator for user ${userId}`);
  } catch (error) {
    console.error(`❌ Error initializing simulator for user ${userId}:`, error.message);
  }
}

async function initializeAllUsers() {
  try {
    console.log('🚀 Starting simulator initialization...\n');
    
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;
    
    console.log(`Found ${totalUsers} user(s) to process\n`);

    if (totalUsers === 0) {
      console.log('⚠️  No users found in Firestore');
      process.exit(0);
    }

    let count = 0;
    for (const userDoc of usersSnapshot.docs) {
      count++;
      console.log(`[${count}/${totalUsers}]`, '');
      await initializeSimulator(userDoc.id);
    }

    console.log(`\n✨ Initialization complete!`);
    console.log(`Total users processed: ${count}`);
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeAllUsers();
