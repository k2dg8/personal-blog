// 1. Blog Posts Data
const posts = [
    {
        title: "Hello, World. Welcome to Magmatum.",
        date: "March 28, 2026",
        content: "I'm Khalid, a CS student and Backend Developer. Magmatum is where I document my journey from low-level Assembly to high-level architecture. Stay tuned!"
    },
    {
        title: "The Architecture of a One-Page Blog",
        date: "March 27, 2026",
        content: "Building with HTML, CSS, and JS is the foundation of everything I do. It's the 'Magma' of the web development world."
    }
];

// 2. Render Posts
const container = document.getElementById('blog-container');
posts.forEach(post => {
    const article = document.createElement('article');
    article.className = 'post';
    article.innerHTML = `<h2>${post.title}</h2><p style="color:#888">${post.date}</p><p>${post.content}</p>`;
    container.appendChild(article);
});

// 3. Burger Menu Logic
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

burger.onclick = () => {
    navLinks.classList.toggle('nav-active');
};

// 4. Modal Popup Logic
const modal = document.getElementById("contactModal");
const contactBtn = document.getElementById("contactLink");
const closeBtn = document.querySelector(".close-btn");

contactBtn.onclick = (e) => {
    e.preventDefault(); // Stop link from jumping
    modal.style.display = "block";
    navLinks.classList.remove('nav-active'); // Close mobile menu if open
}

closeBtn.onclick = () => modal.style.display = "none";

window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
}