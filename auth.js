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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// --- SIGN UP LOGIC ---
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        auth.createUserWithEmailAndPassword(email, password)
            .then(() => window.location.href = "dashboard.html")
            .catch((error) => alert(error.message));
    });
}

// --- LOGIN LOGIC ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        auth.signInWithEmailAndPassword(email, password)
            .then(() => window.location.href = "dashboard.html")
            .catch((error) => alert(error.message));
    });
}

// --- AUTH OBSERVER (The Guard) ---
auth.onAuthStateChanged((user) => {
    const userEmailSpan = document.getElementById('userEmail');
    if (user) {
        if (userEmailSpan) userEmailSpan.innerText = user.email;
    } else {
        // Protect the Dashboard
        if (window.location.pathname.includes("dashboard.html")) {
            window.location.href = "login.html";
        }
    }
});

// --- LOGOUT ---
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.onclick = () => {
        auth.signOut().then(() => window.location.href = "index.html");
    };
}