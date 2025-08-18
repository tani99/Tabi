import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// TODO: Replace with your Firebase configuration for Tabi production
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project called "tabi-travel-app" or similar
// 3. Enable Authentication (Email/Password and Google sign-in)
// 4. Copy your config from Project Settings > General > Your apps
// Current config is for template testing only - replace with your Tabi project config
const firebaseConfig = {
  apiKey: "AIzaSyCOhItVy6QJaENyZxAc57_e_YOiWl_mq_c",
  authDomain: "travel-planner-codex.firebaseapp.com",
  projectId: "travel-planner-codex",
  storageBucket: "travel-planner-codex.firebasestorage.app",
  messagingSenderId: "807049061422",
  appId: "1:807049061422:web:adacaf28604ed87a94ebbf",
  measurementId: "G-R1MEKTJW2R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app;
