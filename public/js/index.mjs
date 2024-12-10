// Select DOM elements
const loginDiv = document.getElementById("loginDiv");
const registrationDiv = document.getElementById("registrationDiv");
const homeDiv = document.getElementById("homeDiv");
const followDiv = document.getElementById("followDiv");
const makePostDiv = document.getElementById("makePostDiv");

const loginButton = document.getElementById("loginButton");
const switchToRegister = document.getElementById("switchToRegister");
const registerButton = document.getElementById("registerButton");
const switchToLogin = document.getElementById("switchToLogin");
const makePostButton = document.getElementById("makePostButton");
const postButton = document.getElementById("postButton");
const searchButton = document.getElementById("searchButton");
const searchFollowButton = document.getElementById("searchFollowButton");

// Helper functions
const showModal = (modal) => {
    [loginDiv, registrationDiv, homeDiv, followDiv, makePostDiv].forEach(div => div.classList.add("hidden"));
    modal.classList.remove("hidden");
};

const fetchJSON = async (url, options = {}) => {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }
    return data;
};

// Login functionality
loginButton.addEventListener("click", async () => {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

<<<<<<< Updated upstream
    // Login function
    async function loginUser() {
        const username = inputs.loginUsername.value;
        const password = inputs.loginPassword.value;

        // Main call
        const response = await fetch("/M00950516/login", {
=======
    try {
        const response = await fetchJSON("/M00950516/login", {
>>>>>>> Stashed changes
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        alert(response.message);
        showModal(homeDiv);
    } catch (error) {
        document.getElementById("loginMessage").textContent = error.message;
    }
});

// Switch to Registration
switchToRegister.addEventListener("click", () => {
    showModal(registrationDiv);
});

<<<<<<< Updated upstream
        const response = await fetch("/M00950516/register", {
=======
// Registration functionality
registerButton.addEventListener("click", async () => {
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const email = document.getElementById("registerEmail").value.trim();

    try {
        const response = await fetchJSON("/M00950516/users", {
>>>>>>> Stashed changes
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, email }),
        });
        alert(response.message);
        showModal(loginDiv);
    } catch (error) {
        document.getElementById("registerMessage").textContent = error.message;
    }
});

// Switch to Login
switchToLogin.addEventListener("click", () => {
    showModal(loginDiv);
});

<<<<<<< Updated upstream
        const response = await fetch(`/M00950516/search?type=${type}&query=${query}`);
        const data = await response.json();

        if (type === "user") {
            const followList = document.getElementById("followList");
            followList.innerHTML = data.map(user => `
                <div>
                    <span>${user.username}</span>
                    <button>${user.following ? "Unfollow" : "Follow"}</button>
                </div>
            `).join("");
            showModal(modals.follow);
        } else if (type === "post") {
            const postsList = document.getElementById("postsList");
            postsList.innerHTML = data.map(post => `<p>${post.text}</p>`).join("");
        }
    }

    // Create post function
    async function createPost() {
        const content = inputs.postContent.value;
        const image = inputs.postImage.files[0];

        const formData = new FormData();
        formData.append("content", content);
        if (image) formData.append("image", image);

        const response = await fetch("/M00950516/posts", {
=======
// Posting content
postButton.addEventListener("click", async () => {
    const text = document.getElementById("postContent").value.trim();

    try {
        const response = await fetchJSON("/M00950516/contents", {
>>>>>>> Stashed changes
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });
        alert(response.message);
        showModal(homeDiv);
    } catch (error) {
        alert(error.message);
    }
});

// Viewing Follow List
searchFollowButton.addEventListener("click", async () => {
    const searchQuery = document.getElementById("searchFollow").value.trim();

    try {
        const response = await fetchJSON(`/M00950516/users/search?q=${encodeURIComponent(searchQuery)}`);
        const followList = document.getElementById("followList");
        followList.innerHTML = response.data.map(user => `<div>${user.username}</div>`).join("");
    } catch (error) {
        alert(error.message);
    }
});

// Search Posts or Users
searchButton.addEventListener("click", async () => {
    const searchType = document.getElementById("searchType").value;
    const searchQuery = document.getElementById("search").value.trim();

    try {
        const endpoint = searchType === "user" ? "users/search" : "contents/search";
        const response = await fetchJSON(`/M00950516/${endpoint}?q=${encodeURIComponent(searchQuery)}`);
        const postsList = document.getElementById("postsList");

        if (searchType === "user") {
            postsList.innerHTML = response.data.map(user => `<div>${user.username}</div>`).join("");
        } else {
            postsList.innerHTML = response.data.map(post => `<div>${post.text} by ${post.username}</div>`).join("");
        }
    } catch (error) {
        alert(error.message);
    }
});

// Make a Post
makePostButton.addEventListener("click", () => {
    showModal(makePostDiv);
});

// Initialization: Check login status on page load
const checkLoginStatus = async () => {
    try {
        const response = await fetchJSON("/M00950516/login");
        if (response.loggedIn) {
            showModal(homeDiv);
        } else {
            showModal(loginDiv);
        }
    } catch (error) {
        console.error("Error checking login status:", error.message);
        showModal(loginDiv);
    }
};

checkLoginStatus();