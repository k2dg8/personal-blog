const posts = [
    {
        title: "Hello, World. Welcome to Magmatum.",
        date: "March 28, 2026",
        content: "I'm Khalid, a CS student and Backend Developer. Magmatum is where I document my journey from low-level Assembly to high-level Backend architecture and Cybersecurity. Stay tuned for more!"
    },
    {
        title: "My First Blog Post",
        date: "March 27, 2026",
        content: "Today I started my journey into web development. GitHub Pages makes it so easy to share my work with the world!"
    }
];

const container = document.getElementById('blog-container');

// This part stays the same—it handles the "magic" of showing the posts
posts.forEach(post => {
    const postElement = document.createElement('article');
    postElement.classList.add('post');

    postElement.innerHTML = `
        <h2>${post.title}</h2>
        <p class="post-date">${post.date}</p>
        <p>${post.content}</p>
    `;

    container.appendChild(postElement);
});
