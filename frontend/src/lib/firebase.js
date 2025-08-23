import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBQqW24AzqGauPaOlegsfN8Q5kPODpqY8g",
  authDomain: "taskflowx-70787.firebaseapp.com",
  projectId: "taskflowx-70787",
  storageBucket: "taskflowx-70787.firebasestorage.app",
  messagingSenderId: "1064068947440",
  appId: "1:1064068947440:web:96246f965a1a902e1c9135"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Enable auth persistence
auth.settings = {
  appVerificationDisabledForTesting: false
};