# SaleSale - Basic React Native Navigation

A simple React Native app with basic navigation using React Navigation.

## 🚀 Features

- **Simple Navigation**: Basic stack navigator with two screens
- **Product Listing**: Dummy products displayed in a clean list
- **Clean UI**: Modern, simple design with proper styling

## 📱 Screens

1. **Home Screen** - Welcome screen with navigation to products
2. **Products Screen** - List of dummy products with basic information

## 🧭 Navigation

The app uses React Navigation's Stack Navigator with basic navigation functions:

```javascript
// Navigate to Products screen
navigation.navigate('Products');

// Go back to previous screen
navigation.goBack();
```

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

## 🎯 Usage

1. Open the app to see the Home screen
2. Tap "View Products" to navigate to the Products screen
3. View the list of dummy products
4. Tap "Go Back" to return to the Home screen

## 🏗️ Project Structure

```
SaleSale/
├── App.js                 # Main app with navigation and screens
├── package.json          # Dependencies
└── README.md            # This file
```

## 📚 Dependencies

- React Navigation (Stack Navigator)
- Expo
- React Native

## 🤝 Contributing

Feel free to add more features or improve the existing functionality. 