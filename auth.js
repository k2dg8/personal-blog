const firebaseConfig = {
  apiKey: "AIzaSyArSRwsubaRzp6YyH3_c7IglzGkuYXQBsU",
  authDomain: "magmatum-7c930.firebaseapp.com",
  projectId: "magmatum-7c930",
  storageBucket: "magmatum-7c930.firebasestorage.app",
  messagingSenderId: "1044455937837",
  appId: "1:1044455937837:web:f95cf264751f52d7a865a4",
  measurementId: "G-WB2F1VRLM6"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Login Logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = loginForm[0].value;
        const password = loginForm[1].value;
        auth.signInWithEmailAndPassword(email, password)
            .then(() => window.location.href = "dashboard.html")
            .catch(err => alert(err.message));
    });
}

// Signup Logic
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = signupForm[1].value; // Adjust index if you added a Name field
        const password = signupForm[2].value;
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => window.location.href = "dashboard.html")
            .catch(err => alert(err.message));
    });
}

// Auth Guard & UI Updates
auth.onAuthStateChanged(user => {
    const userEmailSpan = document.getElementById('userEmail');
    if (user) {
        if (userEmailSpan) userEmailSpan.innerText = user.email;
    } else if (window.location.pathname.includes("dashboard.html")) {
        window.location.href = "login.html";
    }
});

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.onclick = () => auth.signOut().then(() => window.location.href = "index.html");
}