# PayHere Integration Testing Guide

## 🧪 Testing Overview

This guide covers how to test the PayHere integration in your React Native app comprehensively.

## 🚀 Quick Start Testing

### 1. Start the Development Server
```bash
npm start
# Then press 'i' for iOS simulator or 'a' for Android emulator
```

### 2. Navigate to Payment Screen
1. Open the app
2. Browse to any product
3. Tap "Buy Now" or add to cart → checkout
4. You'll see the PaymentScreen with PayHere option

### 3. Test PayHere Payment
1. Select "💳 PayHere" payment method
2. Fill required fields (see test data below)
3. Tap "Pay with PayHere"
4. PayHere payment interface will open

## 📋 Test Scenarios

### Scenario 1: Successful Payment
```javascript
// Test Data
Email: test@payhere.lk
Phone: 0771234567
Address: No. 123, Galle Road
City: Colombo

// Expected: Payment completes successfully
```

### Scenario 2: Payment Cancellation
```javascript
// Test Data
Email: cancel@test.com
Phone: 0771234568
Address: Test Address
City: Kandy

// Action: Close PayHere popup before payment
// Expected: "Payment Dismissed" message
```

### Scenario 3: Payment Error
```javascript
// Test Data
Email: error@test.com
Phone: 0771234569
Address: Error Test Address
City: Galle

// Action: Use invalid card or trigger error
// Expected: Error alert with PayHere error message
```

## 💳 Test Payment Methods

### Credit/Debit Cards (Sandbox)
```
Visa Test Card:
Number: 4916217501611292
CVV: 123
Expiry: 12/25
Name: Test User

MasterCard Test Card:
Number: 5307731000000008
CVV: 456
Expiry: 11/26
Name: Test User

American Express Test Card:
Number: 374245455400001
CVV: 1234
Expiry: 10/27
Name: Test User
```

### Mobile Wallets (Sandbox)
- eZ Cash: Use test mobile numbers
- mCash: Use test mobile numbers
- Dialog eZ Cash: Test integration

### Bank Transfers (Sandbox)
- Any Sri Lankan bank
- Use test account numbers
- Test different banks

## 🔍 Debugging & Monitoring

### 1. Enable Debug Logging

Add this to your PaymentScreen for detailed logging:

```javascript
// Add this import
import { debugPaymentObject } from '../utils/payhere-test-helper';

// In processPayHerePayment function, before PayHere.startPayment:
debugPaymentObject(paymentObject);
```

### 2. Monitor Console Logs
Watch for these key logs:
```
🔍 PayHere Payment Object Debug
✅ PayHere Payment Completed: [payment_id]
❌ PayHere Payment Error: [error_message]
ℹ️ PayHere Payment Dismissed
```

### 3. Check Network Requests
- Monitor network tab for PayHere API calls
- Verify payment object parameters
- Check server notification calls (if implemented)

## 📱 Platform-Specific Testing

### iOS Testing
```bash
# Start iOS simulator
npm run ios

# Or manually:
npm start
# Press 'i' in terminal
```

**iOS-Specific Checks:**
- PayHere SDK loads correctly
- Payment interface appears properly
- Touch ID/Face ID integration (if enabled)
- App doesn't crash during payment

### Android Testing
```bash
# Start Android emulator
npm run android

# Or manually:
npm start
# Press 'a' in terminal
```

**Android-Specific Checks:**
- PayHere SDK initializes
- Payment flow works smoothly
- Back button handling during payment
- App permissions for payment features

## 🛠️ Manual Testing Checklist

### Pre-Payment Testing
- [ ] PayHere option appears in payment methods
- [ ] Selecting PayHere updates UI correctly
- [ ] Form validation works for required fields
- [ ] Payment button text updates to "Pay with PayHere"

### Payment Flow Testing
- [ ] PayHere payment interface opens
- [ ] All payment methods are available
- [ ] Can enter card details correctly
- [ ] Can select bank transfer options
- [ ] Can use mobile wallet options

### Success Flow Testing
- [ ] Successful payment shows confirmation
- [ ] Payment ID is displayed
- [ ] Navigation options work correctly
- [ ] User can continue shopping
- [ ] User can view order details

### Error Handling Testing
- [ ] Invalid card shows error message
- [ ] Network errors are handled gracefully
- [ ] Payment cancellation works correctly
- [ ] User can retry after errors

### Edge Cases Testing
- [ ] App backgrounding during payment
- [ ] Network disconnection during payment
- [ ] Multiple rapid payment attempts
- [ ] Very long product names/descriptions

## 🌐 Server-Side Testing (Optional)

If you've set up a server endpoint for notifications:

### 1. Test Notification Endpoint
```javascript
// Test URL in config/payhere.js
notifyUrl: "https://your-test-server.com/payhere/notify"
```

### 2. Verify Notification Data
Check that your server receives:
- payment_id
- payhere_amount
- payhere_currency
- status_code
- order_id
- custom fields

### 3. Test Webhook Security
- Verify payment signatures
- Validate merchant credentials
- Check for duplicate notifications

## 🔧 Troubleshooting Common Issues

### Issue 1: PayHere Interface Not Opening
```javascript
// Check console for errors
// Verify SDK installation
// Ensure proper configuration
```

### Issue 2: Payment Always Fails
```javascript
// Check merchant ID in config
// Verify sandbox mode setting
// Test with different payment methods
```

### Issue 3: App Crashes During Payment
```javascript
// Check platform-specific setup
// Verify iOS/Android prerequisites
// Test on different devices/simulators
```

## 📊 Testing Metrics to Track

### Success Metrics
- Payment completion rate
- Average payment time
- User satisfaction scores
- Error recovery rate

### Error Metrics
- Payment failure rate
- Cancellation rate
- Technical error frequency
- User drop-off points

## 🎯 Production Testing

### Before Going Live
1. Switch to production mode:
   ```javascript
   // In config/payhere.js
   sandbox: false
   ```

2. Use real merchant ID and credentials
3. Test with small amounts first
4. Verify server notifications work
5. Test on multiple devices
6. Perform load testing

### Production Test Checklist
- [ ] Real payments process correctly
- [ ] Notifications reach your server
- [ ] Error handling works in production
- [ ] Performance is acceptable
- [ ] Security measures are active

## 📞 Getting Help

### PayHere Support
- Documentation: https://support.payhere.lk/
- Technical Support: techsupport@payhere.lk
- SDK Issues: https://github.com/PayHereLK/payhere-mobilesdk-reactnative/issues

### Debug Information to Provide
When reporting issues, include:
- Device type and OS version
- React Native version
- PayHere SDK version
- Error messages and logs
- Steps to reproduce
- Payment object (without sensitive data)

## 🎉 You're Ready to Test!

Follow this guide systematically to ensure your PayHere integration works perfectly across all scenarios and platforms. Remember to test thoroughly in sandbox mode before switching to production!
