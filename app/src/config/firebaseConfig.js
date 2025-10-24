import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhhlRXcqhNYUJaMxy79ViGp66RR-e8iXE",
  authDomain: "annam-mithra.firebaseapp.com",
  projectId: "annam-mithra",
  storageBucket: "annam-mithra.firebasestorage.app",
  messagingSenderId: "852340191027",
  appId: "1:852340191027:web:93c4024ae473c5f87b9846",
  measurementId: "G-64C3QMGBZ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize other services
export const storage = getStorage(app);
export const db = getFirestore(app);

export default app;
