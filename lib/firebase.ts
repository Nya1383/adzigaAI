import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCno6EkDjMGV8r3nCeX3eHlIqmxWxacpeQ",
  authDomain: "adzigaai.firebaseapp.com",
  projectId: "adzigaai",
  storageBucket: "adzigaai.firebasestorage.app",
  messagingSenderId: "12986703925",
  appId: "1:12986703925:web:35c4d2ea36adb8bf47117c"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Only connect to emulators if explicitly enabled via environment variable
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' && typeof window !== 'undefined') {
  console.log('🔧 Connecting to Firebase emulators...');
  
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('✅ Auth emulator connected');
  } catch (error) {
    console.log('⚠️ Auth emulator connection failed:', error);
  }

  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✅ Firestore emulator connected');
  } catch (error) {
    console.log('⚠️ Firestore emulator connection failed:', error);
  }

  try {
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('✅ Storage emulator connected');
  } catch (error) {
    console.log('⚠️ Storage emulator connection failed:', error);
  }

  try {
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('✅ Functions emulator connected');
  } catch (error) {
    console.log('⚠️ Functions emulator connection failed:', error);
  }
} else {
  console.log('🌐 Using Firebase production servers');
}

export default app; 