import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, initializeFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCP18mGXDVZkY1mm7MC30MGBLUAeJYGoBs",
    authDomain: "public-complaint-registration.firebaseapp.com",
    projectId: "public-complaint-registration",
    storageBucket: "public-complaint-registration.firebasestorage.app",
    messagingSenderId: "665692899082",
    appId: "1:665692899082:web:33a78ad8b183063ed21cf3"
  };
const app = initializeApp(firebaseConfig);

// Fix for QUIC_PROTOCOL_ERROR / 400 Bad Request by forcing Long Polling instead of WebChannel QUIC streams
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
});
export const storage = getStorage(app);
export const auth = getAuth(app);