# Backend API Integration Setup

Your SaleSale app is now configured to work with your backend API! Here's how to set it up:

## 📡 API Configuration

### 1. Update API URLs
Edit `config/api.js` to match your server URLs:

```javascript
export const API_CONFIG = {
  DEVELOPMENT: {
    WEB: 'http://localhost:3000',              // Your local development server
    MOBILE: 'http://10.0.2.2:3000',          // Android emulator
    IOS_DEVICE: 'http://192.168.1.100:3000', // Your computer's IP for iOS device testing
  },
  PRODUCTION: 'https://your-api-domain.com', // Your production server
};
```

### 2. Required API Endpoints
Your backend should implement these endpoints:

#### POST `/users/check-username`
**Request:**
```json
{ "username": "john_doe" }
```
**Response:**
```json
{ "exists": true/false }
```

#### POST `/users/authenticate`
**Request:**
```json
{ 
  "username": "john_doe", 
  "password": "securepass123" 
}
```
**Response:**
```json
{
  "user": {
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "_id": "user_id_here",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST `/users`
**Request:**
```json
{
  "username": "john_doe",
  "password": "securepass123",
  "name": "John Doe",          // optional
  "email": "john@example.com", // optional  
  "phone": "+1234567890",      // optional
  "address": "123 Main St"     // optional
}
```
**Response:**
```json
{
  "user": {
    "username": "john_doe",
    "name": "John Doe",
    "_id": "new_user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🎯 User Schema (MongoDB/Mongoose)
```javascript
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: false },
    address: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});
```

## 🔧 Testing Setup

### For Development:
1. **Web**: Make sure your backend runs on `http://localhost:3000`
2. **Android Emulator**: Backend should be accessible via `http://10.0.2.2:3000`
3. **iOS Simulator**: Uses `localhost:3000`
4. **Physical Devices**: Update `IOS_DEVICE` URL in config with your computer's IP

### Find Your IP Address:
- **Windows**: `ipconfig`
- **Mac/Linux**: `ifconfig` or `ip addr`
- Look for your local network IP (usually 192.168.x.x)

## 🚨 Error Handling
The app includes comprehensive error handling:
- Network connection errors
- Invalid credentials
- Username already exists
- Server errors
- Validation errors

## ✨ Features Implemented:
- ✅ Real-time username availability checking
- ✅ Secure authentication with your backend
- ✅ User registration with optional profile fields
- ✅ Smart login/registration flow
- ✅ Cross-platform compatibility (Web, iOS, Android)
- ✅ Local data persistence
- ✅ Global user state management

## 🎉 Ready to Test!
Once your backend is running with the required endpoints, the app will automatically:
1. Check if usernames exist when entered
2. Authenticate users with real credentials
3. Create new accounts with registration flow
4. Store user data locally for offline access

Happy coding! 🚀
