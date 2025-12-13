# Goaldah United Mobile App

React Native mobile application for the Goaldah United village management system.

## Features

- ✅ User Authentication (Login/Register)
- ✅ Dashboard with financial summary
- 🚧 Finance Management (In Progress)
- 🚧 Events Management (In Progress)
- 🚧 Profile Management (In Progress)
- 🚧 Admin Features (In Progress)

## Prerequisites

- Node.js (v20.10.0 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Xcode (Mac only)
- For Android: Android Studio

## Installation

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies (already done):
```bash
npm install
```

## Configuration

### API Base URL

Update the API base URL in `src/utils/constants.js`:

**For iOS Simulator:**
```javascript
export const API_BASE_URL = 'http://localhost:5000/api';
```

**For Android Emulator:**
```javascript
export const API_BASE_URL = 'http://10.0.2.2:5000/api';
```

**For Physical Device:**
Find your computer's IP address:
- Mac: Run `ipconfig getifaddr en0` in terminal
- Windows: Run `ipconfig` and find IPv4 Address

Then update:
```javascript
export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000/api';
// Example: 'http://192.168.1.100:5000/api'
```

## Running the App

### Start the development server:
```bash
npm start
```

### Run on iOS Simulator (Mac only):
```bash
npm run ios
```

### Run on Android Emulator:
```bash
npm run android
```

### Run on Physical Device:
1. Install Expo Go app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in terminal
3. Make sure your phone and computer are on the same WiFi network

## Project Structure

```
mobile/
├── src/
│   ├── navigation/         # Navigation configuration
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── MainNavigator.js
│   ├── screens/           # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── main/          # Main app screens
│   │   └── admin/         # Admin screens
│   ├── components/        # Reusable components
│   │   ├── common/        # Common UI components
│   │   ├── finance/       # Finance-specific components
│   │   └── events/        # Event-specific components
│   ├── context/           # React Context (State Management)
│   │   └── AuthContext.js
│   ├── services/          # API services
│   │   └── api.js
│   ├── utils/             # Utility functions
│   │   └── constants.js
│   └── styles/            # Style definitions
│       ├── colors.js
│       ├── typography.js
│       └── spacing.js
└── App.js                 # Main app entry point
```

## Current Implementation Status

### ✅ Completed
- Project setup and structure
- Styling system (colors, typography, spacing)
- API service with interceptors
- Authentication context
- Common UI components (Button, Input, Card, Loading)
- Login screen
- Register screen
- Dashboard screen
- Navigation setup (Auth, Tab, Drawer)

### 🚧 In Progress
The following screens need to be implemented:
- Finance Screen (with tabs and admin features)
- Events Screen
- Profile Screen
- Admin Dashboard Screen
- Users Management Screen
- Admin Events Management Screen

## Next Steps

1. **Test Current Implementation:**
   - Ensure backend server is running
   - Update API_BASE_URL in constants.js
   - Run `npm start` and test on simulator/emulator
   - Test login and registration
   - Verify dashboard displays correctly

2. **Complete Remaining Screens:**
   - Implement Finance screen with all features
   - Implement Events screen
   - Implement Profile screen with image upload
   - Implement Admin screens

3. **Add Features:**
   - Pull-to-refresh on all lists
   - Error handling improvements
   - Offline support
   - Push notifications (optional)

## Troubleshooting

### Cannot connect to backend
- Verify backend server is running on port 5000
- Check API_BASE_URL is correct for your device type
- For physical devices, ensure same WiFi network
- Try pinging your computer's IP from phone

### Build errors
- Clear cache: `npm start -- --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node version: `node --version` (should be 20.10.0+)

### Navigation issues
- Make sure all navigation dependencies are installed
- Rebuild the app after installing new packages

## Testing Credentials

Use the same credentials as the web app:
- Phone: (your registered phone number)
- Password: (your password)

## Contributing

This is part of the Goaldah United project. Follow the same coding standards as the web application.

## License

Private project for Goaldah United village management.
