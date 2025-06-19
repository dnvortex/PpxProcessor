import { initializeApp } from "firebase/app";
import { getAuth, signInWithRedirect, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User as FirebaseUser } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
// We're using the provided Firebase config
// In production, these values should come from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyBaQpkchm52f-PCvXg4ekShu3yhol2jao4",
  authDomain: "dn-vortex-ai-agency.firebaseapp.com",
  projectId: "dn-vortex-ai-agency",
  storageBucket: "dn-vortex-ai-agency.appspot.com", // Corrected storage bucket
  messagingSenderId: "994308971143", 
  appId: "1:994308971143:web:561b1ea8dfd9df3b667622",
  measurementId: "G-655L349BHQ"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// Analytics is available only in browser environments
let analytics: any = null;
if (typeof window !== 'undefined') {
  import('firebase/analytics').then(module => {
    const { getAnalytics } = module;
    analytics = getAnalytics(firebaseApp);
  });
}
export { analytics };

// Authentication providers
export const googleProvider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = () => {
  return signInWithRedirect(auth, googleProvider);
};

// Sign up with email/password
export const createAccount = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Sign in with email/password
export const login = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Sign out
export const logout = () => {
  return signOut(auth);
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};
