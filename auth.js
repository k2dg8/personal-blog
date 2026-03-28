const firebaseConfig = {
  apiKey: "AIzaSyArSRwsubaRzp6YyH3_c7IglzGkuYXQBsU",
  authDomain: "magmatum-7c930.firebaseapp.com",
  projectId: "magmatum-7c930",
  storageBucket: "magmatum-7c930.firebasestorage.app",
  messagingSenderId: "1044455937837",
  appId: "1:1044455937837:web:f95cf264751f52d7a865a4",
  measurementId: "G-WB2F1VRLM6"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.firestore();

// --- AUTH LOGIC (Login/Signup/Logout) ---
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        auth.createUserWithEmailAndPassword(document.getElementById('signupEmail').value, document.getElementById('signupPassword').value)
            .then(() => window.location.href = "dashboard.html").catch(err => alert(err.message));
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        auth.signInWithEmailAndPassword(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value)
            .then(() => window.location.href = "dashboard.html").catch(err => alert(err.message));
    });
}

auth.onAuthStateChanged((user) => {
    const userEmailSpan = document.getElementById('userEmail');
    if (user) { if (userEmailSpan) userEmailSpan.innerText = user.email; } 
    else { if (window.location.pathname.includes("dashboard.html")) window.location.href = "login.html"; }
});

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) { logoutBtn.onclick = () => auth.signOut().then(() => window.location.href = "index.html"); }

// --- FIRESTORE LOGIC (Publishing Posts) ---
const postForm = document.getElementById('postForm');
if (postForm) {
    postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        db.collection("posts").add({
            title: document.getElementById('postTitle').value,
            content: document.getElementById('postContent').value,
            date: new Date().toLocaleDateString(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert("Post Published!");
            postForm.reset();
        }).catch(err => alert(err.message));
    });
}