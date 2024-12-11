const loginDiv = document.getElementById("loginDiv");
const registrationDiv = document.getElementById("registrationDiv");
const homeDiv = document.getElementById("homeDiv");
const makePostDiv = document.getElementById("makePostDiv");

const loginButton = document.getElementById("loginButton");
const switchToRegister = document.getElementById("switchToRegister");
const registerButton = document.getElementById("registerButton");
const switchToLogin = document.getElementById("switchToLogin");
const makePostButton = document.getElementById("makePostButton");
const postButton = document.getElementById("postButton");
const searchButton = document.getElementById("searchButton");

// Show a specific modal
const showModal = (modal) => {
    [loginDiv, registrationDiv, homeDiv, makePostDiv].forEach(div => div.classList.add("hidden"));
    modal.classList.remove("hidden");
};

const fetchJSON = async (url, options = {}) => {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
    }
    return data;
};

// Login functionality
loginButton.addEventListener("click", async () => {
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
        const response = await fetchJSON("/M00950516/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        console.log(response.message);
        showModal(homeDiv);
    } catch (err) {
        document.getElementById("loginMessage").textContent = err.message;
    }
});

// Switch to Registration
switchToRegister.addEventListener("click", () => {
    showModal(registrationDiv);
});

// Registration functionality
registerButton.addEventListener("click", async () => {
    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const email = document.getElementById("registerEmail").value.trim();

    try {
        const response = await fetchJSON("/M00950516/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, email }),
        });
        console.log(response.message);
        showModal(loginDiv);
    } catch (error) {
        document.getElementById("registerMessage").textContent = error.message;
    }
});

// Switch to Login
switchToLogin.addEventListener("click", () => {
    showModal(loginDiv);
});

// Posting content
postButton.addEventListener("click", async () => {
    const text = document.getElementById("postContent").value.trim();

    try {
        const response = await fetchJSON("/M00950516/contents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });
        console.log(response.message);
        showModal(homeDiv);
    } catch (error) {
        console.log(error.message);
    }
});

// Search Posts or Users
searchButton.addEventListener("click", async () => {
    const searchType = document.getElementById("searchType").value;
    const searchQuery = document.getElementById("search").value.trim();

    try {
        const endpoint = searchType === "user" ? "users/search" : "contents/search";
        const response = await fetchJSON(`/M00950516/${endpoint}?q=${searchQuery}`);
        const postsList = document.getElementById("postsList");

        if (searchType === "user") {
            postsList.innerHTML = response.data.map(user => {
                const isFollowing = response.loggedInUser.follows.includes(user.username);
                return `
                    <div class="text">
                        ${user.username}
                        <button class="button" id="followButton" data-username="${user.username}">
                            ${isFollowing ? "Unfollow" : "Follow"}
                        </button>
                    </div>`;
            }).join("");

            // Attach event listeners to the Follow/Unfollow buttons
            const followButtons = document.querySelectorAll("#followButton");
            followButtons.forEach(button => {
                button.addEventListener("click", async (event) => {
                    const targetUser = event.target.getAttribute("data-username");
                    const isFollowing = event.target.textContent === "Unfollow";
                    
                    try {
                        // Send a follow/unfollow request to the backend
                        const action = isFollowing ? "unfollow" : "follow";
                        const method = action === "unfollow" ? "DELETE" : "POST";
                        const body = action === "unfollow" ? { usernameToUnfollow: targetUser } : { usernameToFollow: targetUser };

                        const response = await fetch("/M00950516/follow", {
                            method,
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(body)
                        });

                        const data = await response.json();
                        if (response.ok) {
                            // Update the button text after the action
                            event.target.textContent = isFollowing ? "Follow" : "Unfollow";
                            console.log(data.message);
                        } else {
                            console.error(data.message);
                        }
                    } catch (error) {
                        console.error("Error during follow/unfollow:", error.message);
                    }
                });
            });

        } else {
            postsList.innerHTML = response.data.map(post => `<div class="text">${post.text} by ${post.username}</div>`).join("");
        }
    } catch (error) {
        console.log(error.message);
    }
});

// Make a Post
makePostButton.addEventListener("click", () => {
    showModal(makePostDiv);
});

// Closing Make Post Modal
const closePostModal = document.getElementById("closePostModal");
closePostModal.addEventListener("click", () => {
    makePostDiv.classList.add("hidden");
    homeDiv.classList.remove("hidden")
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