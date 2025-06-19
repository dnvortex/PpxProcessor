import { auth, login as firebaseLogin, signInWithGoogle, createAccount as firebaseCreateAccount, logout as firebaseLogout } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '../types';

// Login with email/password
export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await firebaseLogin(email, password);
    const firebaseUser = userCredential.user;
    
    // Convert Firebase user to our User type
    return mapFirebaseUserToUser(firebaseUser);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Sign up with email/password
export const createAccount = async (email: string, password: string, displayName: string): Promise<User | null> => {
  try {
    const userCredential = await firebaseCreateAccount(email, password);
    const firebaseUser = userCredential.user;
    
    // You might want to update the user profile with displayName
    // await updateProfile(firebaseUser, { displayName });
    
    // Convert Firebase user to our User type
    return mapFirebaseUserToUser(firebaseUser, displayName);
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

// Login with Google
export const loginWithGoogle = async (): Promise<void> => {
  try {
    await signInWithGoogle();
    // The redirect will happen automatically, and the result will be handled in the onAuthStateChanged listener
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

// Sign out
export const logout = async (): Promise<void> => {
  try {
    await firebaseLogout();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Map Firebase user to our User type
export const mapFirebaseUserToUser = (firebaseUser: FirebaseUser, displayName?: string): User => {
  return {
    id: parseInt(firebaseUser.uid.substring(0, 8), 16), // Generate a numeric ID from the firebase UID
    username: firebaseUser.email?.split('@')[0] || '',
    email: firebaseUser.email || '',
    displayName: displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
    photoURL: firebaseUser.photoURL || undefined,
    isAdmin: false, // By default, users are not admins
    provider: firebaseUser.providerData[0]?.providerId || 'email',
  };
};
