# Firestore Setup Guide

## Firebase Console Configuration

### 1. Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one for Tabi)
3. In the left sidebar, click on "Firestore Database"
4. Click "Create Database"
5. Choose "Start in test mode" for development (we'll add security rules later)
6. Select a location closest to your users
7. Click "Done"

### 2. Deploy Security Rules

1. Install Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```

4. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

5. Deploy the indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

### 3. Security Rules Explanation

The security rules in `firestore.rules` ensure:

- **Authentication Required**: Users must be logged in to access any trip data
- **User Isolation**: Users can only access trips where `userId` matches their auth UID
- **Data Validation**: New trips must have the correct `userId` set to the authenticated user

### 4. Database Structure

The Firestore database will have this structure:

```
trips/{tripId}
├── userId: string (matches auth.uid)
├── name: string
├── location: string
├── startDate: timestamp
├── endDate: timestamp
├── description: string (optional)
├── status: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

### 5. Testing the Setup

After deployment, you can test the setup by:

1. Running your app
2. Creating a test trip
3. Verifying the data appears in the Firebase Console
4. Checking that security rules work by trying to access data from a different user account

### 6. Production Considerations

Before going to production:

1. Update the Firebase config in `src/config/firebase.js` with your production project details
2. Review and test security rules thoroughly
3. Set up proper backup and monitoring
4. Consider implementing data validation on the server side
5. Set up proper error handling for offline scenarios

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check that security rules are deployed correctly
2. **Index Errors**: Deploy the indexes configuration
3. **Authentication Issues**: Ensure users are properly authenticated before accessing Firestore
4. **Network Errors**: Check Firebase project configuration and internet connectivity

### Getting Help

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Console](https://console.firebase.google.com/)
