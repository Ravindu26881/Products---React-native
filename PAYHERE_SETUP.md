# PayHere Integration Setup Guide

This guide will help you complete the PayHere payment gateway integration in your React Native app.

## ✅ What's Already Done

1. ✅ PayHere React Native SDK installed (`@payhere/payhere-mobilesdk-reactnative`)
2. ✅ PayHere payment method added to PaymentScreen
3. ✅ Payment processing logic implemented
4. ✅ Configuration file created (`config/payhere.js`)
5. ✅ Form validation updated for PayHere requirements
6. ✅ Error handling and success flows implemented

## 🚀 Next Steps to Complete Setup

### 1. Update PayHere Configuration

Edit `config/payhere.js` and replace the placeholder values:

```javascript
export const PAYHERE_CONFIG = {
  sandbox: true, // Set to false for production
  merchantId: "YOUR_ACTUAL_MERCHANT_ID", // Replace with your PayHere Merchant ID
  notifyUrl: "https://your-server.com/payhere/notify", // Your server endpoint
  currency: "LKR",
  country: "Sri Lanka",
};
```

### 2. Get PayHere Merchant Account

1. Visit [PayHere Merchant Registration](https://www.payhere.lk/merchant/)
2. Sign up for a merchant account
3. Complete the verification process
4. Get your Merchant ID from the dashboard

### 3. Whitelist Your Mobile App

1. Login to your PayHere Merchant Account
2. Navigate to Settings > Domains and Credentials
3. Click 'Add Domain/App' button
4. Select 'App' from the dropdown
5. Add your React Native App package name (from `app.json`)
6. Note the hash value (this is your Merchant Secret)
7. Click 'Request to Approve'

### 4. Platform-Specific Setup

#### Android Setup

Add to `android/build.gradle` (project level):

```groovy
allprojects {
    repositories {
        mavenLocal()
        maven {
            url 'https://jitpack.io'
        }
    }
}
```

Update `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.your.package"
    xmlns:tools="http://schemas.android.com/tools">

<application tools:replace="android:allowBackup">
    <!-- your existing application content -->
</application>
</manifest>
```

#### iOS Setup

Update `ios/Podfile`:

```ruby
platform :ios, '11.0'

# Add these lines
pod 'payHereSDK', :git => 'https://github.com/PayHereLK/payhere-mobilesdk-ios.git'
pod 'payhere-mobilesdk-reactnative', :path => '../node_modules/@payhere/payhere-mobilesdk-reactnative'

target 'YourApp' do
  use_frameworks!
  pod 'SDWebImage', :modular_headers => true
  # your existing pods
end
```

Then run:
```bash
cd ios && pod install
```

### 5. Set Up Server Notification Endpoint

Create a server endpoint to handle PayHere payment notifications:

```javascript
// Example Node.js/Express endpoint
app.post('/payhere/notify', (req, res) => {
  const {
    payment_id,
    payhere_amount,
    payhere_currency,
    status_code,
    // ... other PayHere parameters
  } = req.body;

  // Verify payment and update your database
  if (status_code === '2') {
    // Payment successful
    console.log('Payment successful:', payment_id);
    // Update order status in your database
  }

  res.status(200).send('OK');
});
```

### 6. Testing

1. Use sandbox mode initially (`sandbox: true`)
2. Use test card numbers provided by PayHere
3. Test all payment scenarios:
   - Successful payments
   - Failed payments
   - User cancellation
   - Network errors

### 7. Production Deployment

1. Set `sandbox: false` in configuration
2. Use production Merchant ID
3. Ensure your app is approved in PayHere merchant dashboard
4. Test thoroughly in production environment

## 📱 How It Works

1. User selects PayHere as payment method
2. User fills in required information (email, phone, address)
3. User taps "Pay with PayHere" button
4. PayHere SDK opens payment interface
5. User completes payment using:
   - Credit/Debit cards
   - Bank transfers
   - Mobile wallets
   - Other supported methods
6. Payment result is handled by the app
7. Server receives notification for payment verification

## 🔧 Customization Options

### Currency Support
PayHere supports multiple currencies. Update the configuration:

```javascript
currency: "USD" // or "LKR", "GBP", "EUR", etc.
```

### Custom Payment Data
You can pass additional data using custom fields:

```javascript
"custom_1": `store_${storeId}`,
"custom_2": `product_${product.id}`,
"custom_3": "additional_data"
```

### Recurring Payments
For subscription-based payments, modify the payment object:

```javascript
const paymentObject = {
  // ... existing fields
  "recurrence": "1 Month", // or "1 Week", "1 Year"
  "duration": "1 Year",
  "startup_fee": "10.00"
};
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Merchant ID not found"**
   - Verify your Merchant ID in the configuration
   - Ensure your merchant account is approved

2. **"App not whitelisted"**
   - Add your app package name in PayHere merchant dashboard
   - Wait for approval if using live merchant account

3. **iOS Build Errors**
   - Follow the iOS setup steps carefully
   - Ensure you have `use_frameworks!` in Podfile

4. **Android Build Errors**
   - Add JitPack repository to build.gradle
   - Add tools:replace attribute to AndroidManifest.xml

### Support

- PayHere Documentation: https://support.payhere.lk/
- Technical Support: techsupport@payhere.lk
- SDK Issues: https://github.com/PayHereLK/payhere-mobilesdk-reactnative/issues

## 🎉 You're All Set!

Your PayHere integration is now ready. Remember to:

1. Update the configuration with your actual merchant details
2. Complete the platform-specific setup
3. Test thoroughly before going live
4. Set up proper server-side payment verification

Happy coding! 🚀
