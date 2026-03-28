// 1. YOUR FIREBASE CONFIG
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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let isAdmin = false;
// IMPORTANT: Log in once, copy your UID from Firebase Console, and paste it here
const MY_ADMIN_UID = "PASTE_YOUR_UID_HERE"; 

// 2. NAVIGATION & ROUTING
function showSection(sectionId) {
    if (sectionId === 'adminSection' && !isAdmin) {
        alert("Unauthorized!");
        showSection('homeSection');
        return;
    }
    document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
    
    if (sectionId === 'homeSection') fetchPosts();
    if (sectionId === 'adminSection') fetchAdminPosts();
}

// 3. AUTHENTICATION LOGIC
function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            if (userCredential.user.uid === MY_ADMIN_UID) {
                isAdmin = true;
                alert("Welcome, Khalid.");
                showSection('adminSection');
            } else {
                alert("You are not the administrator.");
                auth.signOut();
            }
        })
        .catch((error) => alert("Error: " + error.message));
}

// Persist login state
auth.onAuthStateChanged((user) => {
    const adminLink = document.getElementById('adminLink');
    const authBtn = document.getElementById('authBtn');

    if (user && user.uid === MY_ADMIN_UID) {
        isAdmin = true;
        adminLink.style.display = 'block';
        authBtn.innerText = "Logout";
        authBtn.onclick = () => auth.signOut();
    } else {
        isAdmin = false;
        adminLink.style.display = 'none';
        authBtn.innerText = "Login";
        authBtn.onclick = () => showSection('loginSection');
    }
});

// 4. FIRESTORE CRUD LOGIC (The Database)

// Fetch for Home View
function fetchPosts() {
    db.collection("posts").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        const container = document.getElementById('postsContainer');
        container.innerHTML = snapshot.docs.map(doc => {
            const post = doc.data();
            return `
                <div class="post-card">
                    <h3>${post.title}</h3>
                    <p>${post.content.substring(0, 150)}...</p>
                    <small>${post.date || ''}</small>
                </div>`;
        }).join('');
    });
}

// Fetch for Admin View
function fetchAdminPosts() {
    db.collection("posts").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        const tbody = document.getElementById('adminTableBody');
        tbody.innerHTML = snapshot.docs.map(doc => {
            const post = doc.data();
            return `
                <tr>
                    <td>${post.title}</td>
                    <td>${post.date}</td>
                    <td>
                        <button onclick="openPostModal('${doc.id}')" style="color: blue;">Edit</button>
                        <button onclick="deletePost('${doc.id}')" style="color: red;">Delete</button>
                    </td>
                </tr>`;
        }).join('');
    });
}

// Create or Update
function savePost() {
    const id = document.getElementById('editPostId').value;
    const title = document.getElementById('postTitleInput').value;
    const content = document.getElementById('postContentInput').value;

    const postData = {
        title: title,
        content: content,
        date: new Date().toLocaleDateString(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (id) {
        db.collection("posts").doc(id).update(postData).then(() => closeModal());
    } else {
        db.collection("posts").add(postData).then(() => closeModal());
    }
}

// Delete
function deletePost(id) {
    if (confirm("Permanently delete this post?")) {
        db.collection("posts").doc(id).delete();
    }
}

// Modal Helpers
function openPostModal(id = null) {
    if (id) {
        db.collection("posts").doc(id).get().then(doc => {
            const post = doc.data();
            document.getElementById('editPostId').value = id;
            document.getElementById('postTitleInput').value = post.title;
            document.getElementById('postContentInput').value = post.content;
            document.getElementById('modalTitle').innerText = "Edit Post";
        });
    } else {
        document.getElementById('editPostId').value = "";
        document.getElementById('postTitleInput').value = "";
        document.getElementById('postContentInput').value = "";
        document.getElementById('modalTitle').innerText = "New Post";
    }
    document.getElementById('postModal').style.display = 'block';
}

function closeModal() { document.getElementById('postModal').style.display = 'none'; }

// Run on Load
fetchPosts();