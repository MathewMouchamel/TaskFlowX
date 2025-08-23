"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      return await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message);
      throw error;
    }
  };


  const logout = () => {
    return signOut(auth);
  };

  const getToken = async () => {
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signInWithGoogle,
    logout,
    getToken,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};