import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// Firebase config (replace with your Firebase project settings)
const firebaseConfig = {
  apiKey: 'AIzaSyChU2gfVwcDZ0sXunkPDWwb8ex_ZrGEMEQ',
  authDomain: 'envirosage-bda0c.firebaseapp.com',
  projectId: 'envirosage-bda0c',
  storageBucket: 'envirosage-bda0c.firebasestorage.app',
  messagingSenderId: '281254631132',
  appId: '1:281254631132:web:ab8cbbb9e7509bdbd64619',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,  // Use Local Persistence for React Native
});

// Initialize Firestore
const db = getFirestore(app);

console.log('Firebase has been successfully initialized');

// Export for use in other parts of the app
export { app, auth, db };
