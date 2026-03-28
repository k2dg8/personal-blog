// Replace this with the config you just copied from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyArSRwsubaRzp6YyH3_c7IglzGkuYXQBsU",
  authDomain: "magmatum-7c930.firebaseapp.com",
  projectId: "magmatum-7c930",
  storageBucket: "magmatum-7c930.firebasestorage.app",
  messagingSenderId: "1044455937837",
  appId: "1:1044455937837:web:f95cf264751f52d7a865a4",
  measurementId: "G-WB2F1VRLM6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);