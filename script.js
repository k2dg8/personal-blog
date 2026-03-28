// Initialize Firebase on Home Page
const firebaseConfig = {
  apiKey: "AIzaSyArSRwsubaRzp6YyH3_c7IglzGkuYXQBsU",
  authDomain: "magmatum-7c930.firebaseapp.com",
  projectId: "magmatum-7c930",
  storageBucket: "magmatum-7c930.firebasestorage.app"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.firestore();
const container = document.getElementById('blog-container');

// Pull posts from Firestore, ordered by newest first
db.collection("posts").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
    container.innerHTML = ""; // Clear current posts
    snapshot.forEach((doc) => {
        const post = doc.data();
        const article = document.createElement('article');
        article.className = 'post';
        article.innerHTML = `
            <h2>${post.title}</h2>
            <p style="color:#888; font-size:0.8rem;">${post.date}</p>
            <p>${post.content}</p>
        `;
        container.appendChild(article);
    });
});