// Select DOM elements
const loginDiv = document.getElementById("loginDiv");
const registrationDiv = document.getElementById("registrationDiv");
const homeDiv = document.getElementById("homeDiv");
const makePostDiv = document.getElementById("makePostDiv");
const postsContainer = document.getElementById("postsList");

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

    if (modal === homeDiv) {
        getAndDisplayPosts();
    }
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
    document.getElementById("loginMessage").textContent = "";
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
    } catch (err) {
        document.getElementById("registerMessage").textContent = err.message;
    }
});

// Switch to Login
switchToLogin.addEventListener("click", () => {
    showModal(loginDiv);
    document.getElementById("registerMessage").textContent = "";
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
    } catch (err) {
        console.error(err.message);
    }
});

// Function to get posts and display them
const getAndDisplayPosts = async () => {
    try {
        const response = await fetchJSON("/M00950516/contents"); // Fetch posts from the server
        postsContainer.innerHTML = ""; // Clear existing posts

        if (response.data.length === 0) {
            postsContainer.innerHTML = "<p>No posts available.</p>";
            return;
        }

        response.data.forEach(post => {
            const postElement = document.createElement("div");
            postElement.classList.add("post");
            postElement.innerHTML = `
                <h3>${post.username}</h3>
                <p>${post.text}</p>
                <small>${new Date(post.createdAt).toLocaleString()}</small>
            `;
            postsContainer.appendChild(postElement);
        });
    } catch (err) {
        console.error("Failed to fetch posts:", err.message);
        postsContainer.innerHTML = "<p>Error loading posts.</p>";
    }
};

// Search Posts or Users
searchButton.addEventListener("click", async () => {
    const searchType = document.getElementById("searchType").value;
    const searchQuery = document.getElementById("search").value.trim();

    try {
        const endpoint = searchType === "user" ? "users/search" : "contents/search";
        const response = await fetchJSON(`/M00950516/${endpoint}?q=${encodeURIComponent(searchQuery)}`);
        const postsList = document.getElementById("postsList");

        if (searchType === "user") {
            postsList.innerHTML = ""; // Clear the list before rendering

            // Process each user and render their follow/unfollow button asynchronously
            for (const user of response.data) {
                const isFollowed = await checkIfFollowed(user.username); // Await the async check
                const userDiv = document.createElement("div");
                userDiv.classList.add("text");
                userDiv.innerHTML = `
                    ${user.username}
                    ${isFollowed
                        ? `<button class="button unfollow-button" data-username="${user.username}">Unfollow</button>`
                        : `<button class="button follow-button" data-username="${user.username}">Follow</button>`
                    }
                `;
                postsList.appendChild(userDiv);
            }

            // Add event listeners for follow and unfollow buttons
            const followButtons = document.querySelectorAll(".follow-button");
            followButtons.forEach(button => {
                button.addEventListener("click", async () => {
                    const usernameToFollow = button.getAttribute("data-username");
                    await handleFollow(usernameToFollow, button);
                });
            });

            const unfollowButtons = document.querySelectorAll(".unfollow-button");
            unfollowButtons.forEach(button => {
                button.addEventListener("click", async () => {
                    const usernameToUnfollow = button.getAttribute("data-username");
                    await handleUnfollow(usernameToUnfollow, button);
                });
            });
        } else {
            postsContainer.innerHTML = "";
            response.data.forEach(post => {
                const postElement = document.createElement("div");
                postElement.classList.add("post");
                postElement.innerHTML = `
                    <h3>${post.username}</h3>
                    <p>${post.text}</p>
                    <small>${new Date(post.createdAt).toLocaleString()}</small>
                `;
                postsContainer.appendChild(postElement);
            });
        }
    } catch (err) {
        console.error("Error fetching search results:", err.message);
    }
});

// Function to check if a specific user is followed
async function checkIfFollowed(username) {
    try {
        const response = await fetch(`/M00950516/follow?username=${encodeURIComponent(username)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch followed user status");
        }

        const data = await response.json();

        return data.data.isFollowed; // Return true or false
    } catch (err) {
        console.error(err);
        return false; // Assume user is not followed in case of error
    }
}

// Function to handle following a user
async function handleFollow(usernameToFollow, button) {
    try {
        const followResponse = await fetch(`/M00950516/follow`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ usernameToFollow })
        });

        if (followResponse.ok) {
            const followData = await followResponse.json();
            console.log(followData.message);

            // Replace the Follow button with the Unfollow button
            button.outerHTML = `<button class="button unfollow-button" data-username="${usernameToFollow}">Unfollow</button>`;
            const newUnfollowButton = document.querySelector(`.unfollow-button[data-username="${usernameToFollow}"]`);
            newUnfollowButton.addEventListener("click", async () => {
                await handleUnfollow(usernameToFollow, newUnfollowButton);
            });
        } else {
            const errorData = await followResponse.json();
            console.error(errorData.message);
            console.log(`Error: ${errorData.message}`);
        }
    } catch (err) {
        console.error("Failed to follow user:", err.message);
    }
}

// Function to handle unfollowing a user
async function handleUnfollow(usernameToUnfollow, button) {
    try {
        const unfollowResponse = await fetch(`/M00950516/follow`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ usernameToUnfollow })
        });

        if (unfollowResponse.ok) {
            const unfollowData = await unfollowResponse.json();
            console.log(unfollowData.message);

            // Replace the Unfollow button with the Follow button
            button.outerHTML = `<button class="button follow-button" data-username="${usernameToUnfollow}">Follow</button>`;
            const newFollowButton = document.querySelector(`.follow-button[data-username="${usernameToUnfollow}"]`);
            newFollowButton.addEventListener("click", async () => {
                await handleFollow(usernameToUnfollow, newFollowButton);
            });
        } else {
            const errorData = await unfollowResponse.json();
            console.error(errorData.message);
            console.log(`Error: ${errorData.message}`);
        }
    } catch (err) {
        console.error("Failed to unfollow user:", err.message);
    }
}

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
    } catch (err) {
        console.error("Error checking login status:", err.message);
        showModal(loginDiv);
    }
};

checkLoginStatus();