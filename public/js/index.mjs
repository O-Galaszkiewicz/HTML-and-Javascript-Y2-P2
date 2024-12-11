// Select DOM elements
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
        const response = await fetchJSON(`/M00950516/${endpoint}?q=${encodeURIComponent(searchQuery)}`);
        const postsList = document.getElementById("postsList");

        if (searchType === "user") {
            // Assuming `response.data` contains a list of users
            postsList.innerHTML = response.data.map(user => {
                const isFollowing = user.follows.includes(user.username);
                return `
                    <div class="text">
                        ${user.username}
                        <button class="button follow-button" data-username="${user.username}">
                            ${isFollowing ? "Unfollow" : "Follow"}
                        </button>
                    </div>`;
            }).join("");

            // Add event listeners to all Follow/Unfollow buttons
            const followButtons = document.querySelectorAll(".follow-button");
            followButtons.forEach(button => {
                button.addEventListener("click", async (event) => {
                    const targetUser = event.target.getAttribute("data-username");
                    const isFollowing = event.target.textContent === "Unfollow";

                    try {
                        // Make the API request based on the current state
                        const method = isFollowing ? "DELETE" : "POST";
                        const url = `/M00950516/follow`;

                        // Send follow/unfollow request
                        const response = await fetch(url, {
                            method: method,
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                [isFollowing ? "usernameToUnfollow" : "usernameToFollow"]: targetUser
                            })
                        });

                        const data = await response.json();
                        if (response.ok) {
                            // Toggle the button text between "Follow" and "Unfollow"
                            event.target.textContent = isFollowing ? "Follow" : "Unfollow";
                            console.log(data.message); // Optionally log the response message
                        } else {
                            console.error(data.message); // Optionally log errors
                        }
                    } catch (error) {
                        console.error("Error during follow/unfollow:", error.message);
                    }
                });
            });

        } else {
            postsList.innerHTML = response.data.map(post =>
                `<div>${post.text} by ${post.username}</div>`).join("");
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