// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Сенің Firebase жобасы конфигі
const firebaseConfig = {
  apiKey: "AIzaSyA5Z7LszmFsFzCKvsXMKGK9afZtLFRKE9w",
  authDomain: "biology-4b558.firebaseapp.com",
  projectId: "biology-4b558",
  storageBucket: "biology-4b558.firebasestorage.app",
  messagingSenderId: "1024220231030",
  appId: "1:1024220231030:web:331faab4236ea8ea4fb657",
  measurementId: "G-95255RDFC5"
};

const app = initializeApp(firebaseConfig);

// IndexedDB cache: қайта кіріп-шығуда тез жүктеледі және интернет әлсіз кезде көмектеседі.
// Егер браузер қолдамаса/қате болса, fallback ретінде getFirestore қолданылады.
let dbInstance = null;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch (e) {
  dbInstance = getFirestore(app);
}

export const db = dbInstance;