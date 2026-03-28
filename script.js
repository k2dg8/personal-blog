const posts = [
    {
        title: "My First Blog Post",
        date: "March 28, 2026",
        content: "Today I started my journey into web development. GitHub Pages makes it so easy to share my work with the world!"
    },
    {
        title: "Why I Love CSS",
        date: "March 27, 2026",
        content: "CSS is like the paint on a house. Without it, everything is just gray concrete and wooden beams."
    }
];

const container = document.getElementById('blog-container');

// Loop through the posts and create HTML for each
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