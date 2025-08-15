// PayHere Test Helper
// Use this for testing different payment scenarios

export const TEST_SCENARIOS = {
  SUCCESS: {
    description: "Successful Payment Test",
    testData: {
      email: "success@test.com",
      phone: "0771234567",
      address: "123 Test Street",
      city: "Colombo",
    },
    expectedResult: "Payment should complete successfully"
  },

  CARD_DECLINED: {
    description: "Card Declined Test",
    testData: {
      email: "declined@test.com",
      phone: "0771234568",
      address: "456 Test Avenue",
      city: "Kandy",
    },
    expectedResult: "Payment should be declined"
  },

  INSUFFICIENT_FUNDS: {
    description: "Insufficient Funds Test",
    testData: {
      email: "insufficient@test.com",
      phone: "0771234569",
      address: "789 Test Road",
      city: "Galle",
    },
    expectedResult: "Payment should fail due to insufficient funds"
  },

  USER_CANCELLATION: {
    description: "User Cancellation Test",
    testData: {
      email: "cancel@test.com",
      phone: "0771234570",
      address: "321 Test Lane",
      city: "Matara",
    },
    expectedResult: "User should be able to cancel payment"
  }
};

export const TEST_CARDS = {
  VISA_SUCCESS: {
    number: "4916217501611292",
    cvv: "123",
    expiry: "12/25",
    name: "Test User"
  },
  
  MASTERCARD_SUCCESS: {
    number: "5307731000000008",
    cvv: "456",
    expiry: "11/26",
    name: "Test User"
  },
  
  AMEX_SUCCESS: {
    number: "374245455400001",
    cvv: "1234",
    expiry: "10/27",
    name: "Test User"
  }
};

// Test runner function
export const runPayHereTest = (scenario, onResult) => {
  console.log(`🧪 Running Test: ${scenario.description}`);
  console.log(`📧 Email: ${scenario.testData.email}`);
  console.log(`📱 Phone: ${scenario.testData.phone}`);
  console.log(`🏠 Address: ${scenario.testData.address}`);
  console.log(`🏙️ City: ${scenario.testData.city}`);
  console.log(`✅ Expected: ${scenario.expectedResult}`);
  
  // Return test data for use in forms
  return scenario.testData;
};

// Debug helper for payment objects
export const debugPaymentObject = (paymentObject) => {
  console.log("🔍 PayHere Payment Object Debug:");
  console.log("================================");
  Object.keys(paymentObject).forEach(key => {
    console.log(`${key}: ${paymentObject[key]}`);
  });
  console.log("================================");
};
