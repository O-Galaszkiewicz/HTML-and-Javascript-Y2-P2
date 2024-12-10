document.addEventListener("DOMContentLoaded", () => {
    const modals = {
        login: document.getElementById("loginDiv"),
        register: document.getElementById("registrationDiv"),
        home: document.getElementById("homeDiv"),
        follow: document.getElementById("followDiv"),
        makePost: document.getElementById("makePostDiv")
    };

    const buttons = {
        switchToRegister: document.getElementById("switchToRegister"),
        switchToLogin: document.getElementById("switchToLogin"),
        login: document.getElementById("loginButton"),
        register: document.getElementById("registerButton"),
        search: document.getElementById("searchButton"),
        searchFollow: document.getElementById("searchFollowButton"),
        makePost: document.getElementById("makePostButton"),
        post: document.getElementById("postButton")
    };

    const inputs = {
        loginUsername: document.getElementById("loginUsername"),
        loginPassword: document.getElementById("loginPassword"),
        registerUsername: document.getElementById("registerUsername"),
        registerPassword: document.getElementById("registerPassword"),
        registerEmail: document.getElementById("registerEmail"),
        search: document.getElementById("search"),
        searchType: document.getElementById("searchType"),
        postContent: document.getElementById("postContent"),
        postImage: document.getElementById("postImage")
    };

    // Show a specific modal
    const showModal = (modalToShow) => {
        Object.values(modals).forEach(modal => modal.classList.add("hidden"));
        modalToShow.classList.remove("hidden");
    };

    // Event listeners
    buttons.switchToRegister.addEventListener("click", () => showModal(modals.register));
    buttons.switchToLogin.addEventListener("click", () => showModal(modals.login));
    buttons.login.addEventListener("click", loginUser);
    buttons.register.addEventListener("click", registerUser);
    buttons.search.addEventListener("click", searchContent);
    buttons.makePost.addEventListener("click", () => showModal(modals.makePost));
    buttons.post.addEventListener("click", createPost);

    // Login function
    async function loginUser() {
        const username = inputs.loginUsername.value;
        const password = inputs.loginPassword.value;

        // Main call
        const response = await fetch("/M00950516/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            showModal(modals.home);
        } else {
            alert("Login failed!");
        }
    }

    // Register function
    async function registerUser() {
        const username = inputs.registerUsername.value;
        const password = inputs.registerPassword.value;
        const email = inputs.registerEmail.value;

        const response = await fetch("/M00950516/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, email })
        });

        if (response.ok) {
            showModal(modals.login);
        } else {
            alert("Registration failed!");
        }
    }

    // Search function (user or post based on dropdown)
    async function searchContent() {
        const query = inputs.search.value;
        const type = inputs.searchType.value; // "user" or "post"

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
            method: "POST",
            body: formData
        });

        if (response.ok) {
            showModal(modals.home);
        } else {
            alert("Failed to create post!");
        }
    }

    // Initialize
    showModal(modals.login); // Start with login modal
});