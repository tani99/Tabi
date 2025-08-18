// Centralized error message utility for user-friendly Firebase error handling

export const getAuthErrorMessage = (errorCode, context = 'general') => {
  // Remove 'auth/' prefix if present
  const code = errorCode.replace('auth/', '');
  
  switch (code) {
    // Login specific errors
    case 'invalid-credential':
      return "Your username or password is incorrect. If you forgot your password, please click 'Forgot Password'.";
    
    case 'user-not-found':
      return "No account found with this email. Please check your email or create a new account.";
    
    case 'wrong-password':
      return "Incorrect password. Please try again or use 'Forgot Password' to reset it.";
    
    case 'user-disabled':
      return "This account has been disabled. Please contact support for assistance.";
    
    // Registration specific errors
    case 'email-already-in-use':
      return "This email is already registered. Please sign in instead, or use a different email address.";
    
    case 'weak-password':
      return "Password is too weak. Please use at least 6 characters with a mix of letters and numbers.";
    
    case 'operation-not-allowed':
      return "Email/password authentication is not enabled. Please contact support.";
    
    // Password reset specific errors
    case 'invalid-email':
      return "Please enter a valid email address.";
    
    case 'too-many-requests':
      if (context === 'password-reset') {
        return "Too many reset attempts. Please wait a few minutes before trying again.";
      }
      return "Too many failed attempts. Please try again later.";
    
    // Network and general errors
    case 'network-request-failed':
      return "Network error. Please check your internet connection and try again.";
    
    case 'popup-closed-by-user':
      return "Gmail login was cancelled. Please try again.";
    
    case 'popup-blocked':
      return "Gmail login popup was blocked. Please allow popups and try again.";
    
    case 'account-exists-with-different-credential':
      return "An account already exists with this email using a different sign-in method. Please try signing in with Google instead.";
    
    case 'requires-recent-login':
      return "For security reasons, please sign in again to continue.";
    
    case 'invalid-verification-code':
      return "Invalid verification code. Please check your email and try again.";
    
    case 'invalid-verification-id':
      return "Verification link has expired. Please request a new one.";
    
    // Default fallback
    default:
      console.warn('Unhandled Firebase error code:', errorCode);
      return "An unexpected error occurred. Please try again or contact support if the problem persists.";
  }
};

// Helper function to extract error code from Firebase error
export const extractErrorCode = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && error.code) {
    return error.code;
  }
  
  if (error && error.message) {
    // Try to extract code from message if it contains 'auth/'
    const match = error.message.match(/auth\/[a-z-]+/);
    if (match) {
      return match[0];
    }
  }
  
  return 'unknown-error';
};

// Helper function to get user-friendly error message from any Firebase error
export const getUserFriendlyError = (error, context = 'general') => {
  const errorCode = extractErrorCode(error);
  return getAuthErrorMessage(errorCode, context);
};
