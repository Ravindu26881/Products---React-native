import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../utils/colors';

const PayHereWebView = ({ 
  visible, 
  onClose, 
  onSuccess, 
  onError, 
  paymentData 
}) => {
  const [loading, setLoading] = useState(true);
  const [webViewKey, setWebViewKey] = useState(0);

  // Generate PayHere checkout HTML
  const generatePayHereHTML = () => {
    const {
      merchant_id,
      order_id,
      items,
      amount,
      currency,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      country,
      sandbox
    } = paymentData;

    const baseUrl = sandbox 
      ? 'https://sandbox.payhere.lk/pay/checkout'
      : 'https://www.payhere.lk/pay/checkout';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PayHere Payment</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 400px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .item {
            color: #666;
            margin-bottom: 20px;
        }
        .pay-button {
            background-color: #007AFF;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            width: 100%;
            cursor: pointer;
        }
        .pay-button:hover {
            background-color: #0056b3;
        }
        .loading {
            text-align: center;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="amount">${currency} ${amount}</div>
            <div class="item">${items}</div>
        </div>
        
        <form id="payhere-form" method="post" action="${baseUrl}">
            <input type="hidden" name="merchant_id" value="${merchant_id}">
            <input type="hidden" name="return_url" value="payhere://payment-success">
            <input type="hidden" name="cancel_url" value="payhere://payment-cancel">
            <input type="hidden" name="notify_url" value="https://your-server.com/notify">
            <input type="hidden" name="order_id" value="${order_id}">
            <input type="hidden" name="items" value="${items}">
            <input type="hidden" name="currency" value="${currency}">
            <input type="hidden" name="amount" value="${amount}">
            <input type="hidden" name="first_name" value="${first_name}">
            <input type="hidden" name="last_name" value="${last_name}">
            <input type="hidden" name="email" value="${email}">
            <input type="hidden" name="phone" value="${phone}">
            <input type="hidden" name="address" value="${address}">
            <input type="hidden" name="city" value="${city}">
            <input type="hidden" name="country" value="${country}">
            
            <button type="submit" class="pay-button" onclick="submitPayment()">
                Pay with PayHere
            </button>
        </form>
    </div>

    <script>
        function submitPayment() {
            document.getElementById('payhere-form').submit();
        }
        
        // Auto-submit after a short delay to show the form first
        setTimeout(() => {
            window.ReactNativeWebView && window.ReactNativeWebView.postMessage('form-ready');
        }, 1000);
    </script>
</body>
</html>`;
  };

  const handleWebViewNavigationStateChange = (navState) => {
    const { url } = navState;
    
    // Handle success
    if (url.includes('payhere://payment-success') || url.includes('payment-success')) {
      setLoading(false);
      onSuccess('Payment completed successfully');
      return;
    }
    
    // Handle cancellation
    if (url.includes('payhere://payment-cancel') || url.includes('payment-cancel')) {
      setLoading(false);
      onError('Payment was cancelled');
      return;
    }
    
    // Handle PayHere success page
    if (url.includes('payhere.lk') && url.includes('success')) {
      setLoading(false);
      onSuccess('Payment completed successfully');
      return;
    }
    
    // Handle PayHere error page
    if (url.includes('payhere.lk') && (url.includes('error') || url.includes('fail'))) {
      setLoading(false);
      onError('Payment failed');
      return;
    }
  };

  const handleMessage = (event) => {
    const message = event.nativeEvent.data;
    
    if (message === 'form-ready') {
      setLoading(false);
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setLoading(false);
    onError('Failed to load payment page');
  };

  const reloadWebView = () => {
    setLoading(true);
    setWebViewKey(prev => prev + 1);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PayHere Payment</Text>
          <TouchableOpacity onPress={reloadWebView} style={styles.reloadButton}>
            <Text style={styles.reloadButtonText}>↻ Reload</Text>
          </TouchableOpacity>
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading PayHere...</Text>
          </View>
        )}
        
        <WebView
          key={webViewKey}
          source={{ html: generatePayHereHTML() }}
          style={styles.webview}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          onMessage={handleMessage}
          onError={handleError}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode="compatibility"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  reloadButton: {
    padding: 8,
  },
  reloadButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default PayHereWebView;
