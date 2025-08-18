# Tabi - Travel Planning App

A modern, production-ready React Native travel planning app with beautiful UI and Firebase integration. Tabi helps you plan, organize, and manage your travel adventures with ease.

## 🚀 Quick Start

### 1. Use This Template

```bash
# Clone this repository
git clone https://github.com/your-username/tabi.git

# Navigate to your new project
cd tabi

# Install dependencies
npm install
```

### 2. Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" or "Add project"
   - Enter your project name and follow the setup wizard

2. **Enable Authentication**
   - In your Firebase project, go to "Authentication" → "Sign-in method"
   - Enable "Email/Password" authentication
   - Enable "Google" authentication (for Gmail sign-in)

3. **Get Firebase Configuration**
   - Go to Project Settings (gear icon) → "General"
   - Scroll down to "Your apps" section
   - Click "Add app" → "Web app"
   - Copy the configuration object

4. **Configure Firebase in Your App**
   - Open `src/config/firebase.js`
   - Replace the placeholder config with your Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Customize Your App

#### Update App Information
- **package.json**: App name and description already updated for Tabi
- **app.json**: App name and slug already updated for Tabi
- **Assets**: Replace placeholder icons and splash screens in the `assets/` folder with Tabi branding

#### Customize Branding
- **Colors**: Update `src/theme/colors.js` with Tabi brand colors
- **App Icons**: Replace icons in `assets/` folder with Tabi logo
- **Splash Screen**: Update `assets/splash-icon.png` with Tabi branding

### 4. Run Your App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## 📱 Features

- ✨ Modern, clean UI design with smooth animations
- 🔐 Email/password authentication
- 📧 Gmail (Google) authentication
- 🔄 Password reset functionality
- 📱 Responsive design for mobile and web
- 🎨 Beautiful animations and transitions
- 🔒 Secure authentication flow
- 📊 User state management with React Context
- 🧪 Built-in testing setup with Jest
- 📝 Code formatting with ESLint and Prettier
- 🗺️ Travel planning and itinerary management
- 📍 Destination discovery and organization
- ✈️ Trip creation and management



## 🔐 Authentication Flow

1. **Welcome Screen** → Tabi introduction and navigation options
2. **Login/Register** → User authentication via email/password or Gmail
3. **Forgot Password** → Password reset functionality
4. **Home Screen** → Tabi travel planning dashboard
5. **Logout** → Returns to welcome screen

## 🛠️ Development

### Available Scripts

```bash
# Development
npm start          # Start Expo development server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run on web browser

# Code Quality
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint issues
npm run format     # Format code with Prettier

# Testing
npm test           # Run Jest tests

# Building
npm run build:android  # Build Android APK
npm run build:ios      # Build iOS app
```

### Testing

The template includes Jest setup for testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Code Quality

- **ESLint**: Code linting with Expo configuration
- **Prettier**: Code formatting
- **TypeScript**: Type checking (optional)

## 📦 Dependencies

### Core Dependencies
- **React Native**: 0.79.5
- **Expo**: ~53.0.20
- **Firebase**: ^12.1.0
- **React Navigation**: ^7.1.17
- **React Hook Form**: ^7.62.0

### Development Dependencies
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **TypeScript**: Type checking

## 🚀 Deployment

### Expo Build

```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

### Eject to Bare React Native

```bash
npm run eject
```

## 🔧 Customization Guide

### Adding New Screens

1. Create a new screen in `src/screens/`
2. Add navigation route in `src/navigation/AppNavigator.js`
3. Update the navigation flow as needed

### Adding New Authentication Methods

1. Enable the method in Firebase Console
2. Update `src/services/auth.js` with new authentication logic
3. Create UI components for the new method
4. Update navigation and state management

### Styling Customization

1. **Colors**: Update `src/theme/colors.js`
2. **Components**: Modify existing components in `src/components/`
3. **Screens**: Update individual screen styles

## 📄 License

This template is licensed under the MIT License. Feel free to use it for your projects.

## 📞 Support

- **Issues**: Open an issue in this repository
- **Documentation**: Check the inline code comments
- **Community**: Join React Native and Expo communities

## 🗺️ Roadmap

See [TABI_TODOS.md](./TABI_TODOS.md) for the complete development roadmap and feature list.

---

**Happy traveling! ✈️**
