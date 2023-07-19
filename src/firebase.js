// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfS_ICIIGJUMS6pxMZznjDv92sWE1qJAY",
  authDomain: "piccell-807dd.firebaseapp.com",
  databaseURL: "https://piccell-807dd-default-rtdb.firebaseio.com",
  projectId: "piccell-807dd",
  storageBucket: "piccell-807dd.appspot.com",
  messagingSenderId: "942214366286",
  appId: "1:942214366286:web:7607ee7431e3e48bbf6f1f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore()