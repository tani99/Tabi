import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { getUserFriendlyError } from '../utils/errorMessages';

// Register with email and password
export const registerWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { 
      success: false, 
      error: getUserFriendlyError(error, 'registration'),
      originalError: error.message 
    };
  }
};

// Login with email and password
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { 
      success: false, 
      error: getUserFriendlyError(error, 'login'),
      originalError: error.message 
    };
  }
};

// Login with Gmail
export const loginWithGmail = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    return { 
      success: false, 
      error: getUserFriendlyError(error, 'gmail'),
      originalError: error.message 
    };
  }
};

// Logout
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: getUserFriendlyError(error, 'logout'),
      originalError: error.message 
    };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    console.log('Firebase: Attempting to send password reset email to:', email);
    
    // Validate email format before sending to Firebase
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      console.error('Firebase: Invalid email format:', email);
      return { 
        success: false, 
        error: { 
          code: 'auth/invalid-email',
          message: 'Please enter a valid email address.' 
        } 
      };
    }

    await sendPasswordResetEmail(auth, email);
    console.log('Firebase: Password reset email sent successfully to:', email);
    
    return { 
      success: true,
      message: 'Password reset email sent successfully'
    };
  } catch (error) {
    console.error('Firebase: Password reset error:', {
      code: error.code,
      message: error.message,
      email: email
    });
    
    // Return structured error information
    return { 
      success: false, 
      error: {
        code: error.code,
        message: getUserFriendlyError(error, 'password-reset'),
        originalMessage: error.message
      }
    };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
