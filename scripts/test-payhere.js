#!/usr/bin/env node

/**
 * PayHere Integration Test Script
 * Run this to validate your PayHere setup
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 PayHere Integration Test Suite');
console.log('==================================\n');

// Test 1: Check if PayHere SDK is installed
console.log('1️⃣ Checking PayHere SDK installation...');
try {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const hasPayHere = packageJson.dependencies && packageJson.dependencies['@payhere/payhere-mobilesdk-reactnative'];
  
  if (hasPayHere) {
    console.log('✅ PayHere SDK is installed:', hasPayHere);
  } else {
    console.log('❌ PayHere SDK not found in dependencies');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
  process.exit(1);
}

// Test 2: Check PayHere configuration
console.log('\n2️⃣ Checking PayHere configuration...');
try {
  const configPath = './config/payhere.js';
  if (fs.existsSync(configPath)) {
    console.log('✅ PayHere configuration file exists');
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    if (configContent.includes('1211149')) {
      console.log('⚠️ Using default test merchant ID - update for production');
    }
    if (configContent.includes('sandbox: true')) {
      console.log('✅ Sandbox mode enabled - good for testing');
    }
  } else {
    console.log('❌ PayHere configuration file not found');
  }
} catch (error) {
  console.log('❌ Error checking configuration:', error.message);
}

// Test 3: Check PaymentScreen integration
console.log('\n3️⃣ Checking PaymentScreen integration...');
try {
  const paymentScreenPath = './screens/PaymentScreen.js';
  if (fs.existsSync(paymentScreenPath)) {
    const screenContent = fs.readFileSync(paymentScreenPath, 'utf8');
    
    if (screenContent.includes('@payhere/payhere-mobilesdk-reactnative')) {
      console.log('✅ PayHere SDK imported in PaymentScreen');
    } else {
      console.log('❌ PayHere SDK not imported in PaymentScreen');
    }
    
    if (screenContent.includes('selectedPaymentMethod === \'payhere\'')) {
      console.log('✅ PayHere payment method option added');
    } else {
      console.log('❌ PayHere payment method option not found');
    }
    
    if (screenContent.includes('PayHere.startPayment')) {
      console.log('✅ PayHere payment processing implemented');
    } else {
      console.log('❌ PayHere payment processing not implemented');
    }
  } else {
    console.log('❌ PaymentScreen.js not found');
  }
} catch (error) {
  console.log('❌ Error checking PaymentScreen:', error.message);
}

// Test 4: Check platform-specific setup hints
console.log('\n4️⃣ Platform setup reminders...');
console.log('📱 iOS Setup:');
console.log('   - Add PayHere pods to ios/Podfile');
console.log('   - Run: cd ios && pod install');
console.log('   - Minimum iOS version: 11.0');

console.log('\n🤖 Android Setup:');
console.log('   - Add JitPack repository to android/build.gradle');
console.log('   - Update AndroidManifest.xml with tools:replace');
console.log('   - Minimum API Level: 17');

// Test 5: Testing recommendations
console.log('\n5️⃣ Testing Recommendations...');
console.log('📋 Test Scenarios:');
console.log('   1. Successful payment with test cards');
console.log('   2. Payment cancellation by user');
console.log('   3. Payment errors and error handling');
console.log('   4. Form validation with missing fields');

console.log('\n💳 Test Cards (Sandbox):');
console.log('   Visa: 4916217501611292');
console.log('   MasterCard: 5307731000000008');
console.log('   AmEx: 374245455400001');

console.log('\n📱 Test Data:');
console.log('   Email: test@payhere.lk');
console.log('   Phone: 0771234567');
console.log('   Address: No. 123, Galle Road');
console.log('   City: Colombo');

console.log('\n🚀 Ready to Test!');
console.log('Run: npm start');
console.log('Then navigate to any product and try PayHere payment');

console.log('\n📚 Documentation:');
console.log('   - Setup Guide: ./PAYHERE_SETUP.md');
console.log('   - Testing Guide: ./TESTING_GUIDE.md');
console.log('   - PayHere Docs: https://support.payhere.lk/');

console.log('\n✨ Test completed! Check the items above and start testing.');
