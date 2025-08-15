// PayHere Configuration
// Update these values with your actual PayHere merchant details

export const PAYHERE_CONFIG = {
  // Set to false for production
  sandbox: true,
  
  // Replace with your actual Merchant ID from PayHere Dashboard
  // You can get this from: https://www.payhere.lk/merchant/
  merchantId: "1211149", // This is a test merchant ID
  
  // Replace with your server endpoint that handles PayHere notifications
  // This endpoint will receive payment status updates from PayHere
  notifyUrl: "https://your-server.com/payhere/notify",
  
  // Default currency (LKR for Sri Lankan Rupees)
  currency: "LKR",
  
  // Default country
  country: "Sri Lanka",
};

// Helper function to generate unique order IDs
export const generateOrderId = () => {
  return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to format amount for PayHere
export const formatAmount = (price) => {
  const amount = parseFloat(price.replace(/[^\d.]/g, ''));
  return amount.toFixed(2);
};
