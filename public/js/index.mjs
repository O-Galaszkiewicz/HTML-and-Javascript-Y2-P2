// // Function to hide all modals
// function hideAllModals() {
//     const modals = document.querySelectorAll('.modal');
//     modals.forEach(modal => {
//         modal.style.display = 'none';
//     });
// }

// // Function to check if the user is logged in
// async function isLoggedIn() {
//     const response = await fetch('/M00950516/login');
//     const data = await response.json();
//     return data.loggedIn; // Will return true if the user is logged in, false otherwise
// }

// // Function to load the modal based on the path
// async function loadModalBasedOnPath() {
//     // Hide all modals first
//     hideAllModals();

//     // Get the current path
//     const path = window.location.pathname;
//     console.log(path);

//     const loggedIn = await isLoggedIn(); // Check if the user is logged in

//     if (path === '/M00950516/login') {
//         document.getElementById('loginDiv').style.display = 'block';
//         handleLoginRequest();  // Handle GET or POST for login
//     } else if (path === '/M00950516/registration') {
//         document.getElementById('registrationDiv').style.display = 'block';
//         handleRegistrationRequest();  // Handle POST for registration
//     } else if (path === '/M00950516/home') {
//         if (!loggedIn) {
//             window.location.href = '/M00950516/login';  // Redirect to login if not logged in
//         } else {
//             document.getElementById('homeDiv').style.display = 'block';
//             loadHomePosts();  // Handle GET for posts
//         }
//     } else if (path === '/M00950516/follow') {
//         if (!loggedIn) {
//             window.location.href = '/M00950516/login';  // Redirect to login if not logged in
//         } else {
//             document.getElementById('followDiv').style.display = 'block';
//             loadFollowList();  // Handle GET for users to follow
//         }
//     } else if (path === '/M00950516/make-post') {
//         if (!loggedIn) {
//             window.location.href = '/M00950516/login';  // Redirect to login if not logged in
//         } else {
//             document.getElementById('makePostDiv').style.display = 'block';
//         }
//     }
// }

// // Handle Login Form (POST Request)
// async function handleLoginRequest() {
//     const loginButton = document.getElementById('loginButton');
//     loginButton.addEventListener('click', async () => {
//         const username = document.getElementById('username').value;
//         const password = document.getElementById('password').value;
        
//         const response = await fetch('/M00950516/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ username, password }),
//         });

//         const data = await response.json();
//         if (data.success) {
//             window.location.href = '/M00950516/home';  // Redirect to home on successful login
//         } else {
//             document.getElementById('message').innerText = data.message;  // Show error message
//         }
//     });
// }

// // Handle Registration Form (POST Request)
// async function handleRegistrationRequest() {
//     const registerButton = document.getElementById('registerButton');
//     registerButton.addEventListener('click', async () => {
//         const username = document.getElementById('username').value;
//         const password = document.getElementById('password').value;
//         const email = document.getElementById('email').value;

//         const response = await fetch('/M00950516/register', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ username, password, email }),
//         });

//         const data = await response.json();
//         if (data.success) {
//             window.location.href = '/M00950516/login';  // Redirect to login on successful registration
//         } else {
//             document.getElementById('message').innerText = data.message;  // Show error message
//         }
//     });
// }

// // Handle Loading Home Page Posts (GET Request)
// async function loadHomePosts() {
//     const postsList = document.getElementById('postsList');
//     const response = await fetch('/M00950516/posts');
//     const posts = await response.json();
//     postsList.innerHTML = '';  // Clear previous posts

//     posts.forEach(post => {
//         const postElement = document.createElement('div');
//         postElement.classList.add('post');
//         postElement.innerHTML = `<p>${post.comment}</p><p>by ${post.username}</p>`;
//         postsList.appendChild(postElement);
//     });
// }

// // Handle Loading Follow List (GET Request)
// async function loadFollowList() {
//     const followList = document.getElementById('followList');
//     const response = await fetch('/M00950516/follow');
//     const users = await response.json();
//     followList.innerHTML = '';  // Clear previous users

//     users.forEach(user => {
//         const userElement = document.createElement('div');
//         userElement.classList.add('user');
//         userElement.innerHTML = `<p>${user.username}</p>`;
//         followList.appendChild(userElement);
//     });
// }

// // Event listener for DOM content loaded
// document.addEventListener('DOMContentLoaded', () => {
//     loadModalBasedOnPath();
// });

// // Event listener for history changes (e.g., client-side routing)
// window.addEventListener('popstate', () => {
//     loadModalBasedOnPath();
// });