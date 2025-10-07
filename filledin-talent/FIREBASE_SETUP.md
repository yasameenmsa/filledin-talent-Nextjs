# Firebase Setup Guide

## Steps to Configure Firebase for FilledIn Talent

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `filledin-talent`
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Save

### 3. Create Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Done

### 4. Enable Storage
1. Go to "Storage"
2. Click "Get started"
3. Choose "Start in test mode"
4. Select same location as Firestore
5. Done

### 5. Get Configuration Keys
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app
4. Register app with name: `filledin-talent-web`
5. Copy the configuration object

### 6. Update .env.local
Replace the placeholder values in `.env.local` with your actual Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id
```

### 7. Security Rules (Production)
Update Firestore rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 8. Test Configuration
1. Restart your development server: `npm run dev`
2. Try registering a new user
3. Check Firebase Console → Authentication to see if user was created

## Troubleshooting

### Common Issues:
1. **API Key Invalid**: Make sure you copied the correct API key from Firebase Console
2. **Domain Not Authorized**: Add `localhost:3000` to authorized domains in Firebase Console → Authentication → Settings
3. **Project ID Mismatch**: Ensure project ID matches exactly (case-sensitive)

### For Production:
1. Add your production domain to authorized domains
2. Update security rules to be more restrictive
3. Enable App Check for additional security