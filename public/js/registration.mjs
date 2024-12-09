// Select the necessary elements
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const emailInput = document.getElementById("email");
const registerButton = document.getElementById("registerButton");
const messageDiv = document.getElementById("message");

// Event listener for the Register button
registerButton.addEventListener("click", async () => {
    // Collect user data
    const userData = {
        username: usernameInput.value.trim(),
        password: passwordInput.value.trim(),
        email: emailInput.value.trim(),
    };

    // Validate inputs
    if (!userData.username || !userData.password || !userData.email) {
        messageDiv.textContent = "All fields are required.";
        messageDiv.className = "message error";
        return;
    }

    try {
        // Send a POST request to the registration endpoint
        const response = await fetch("/M00950516/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        // Parse the response JSON
        const result = await response.json();

        if (response.ok) {
            // Display success message
            messageDiv.textContent = result.message;
            messageDiv.className = "message success";
        } else {
            // Display error message
            messageDiv.textContent = result.error;
            messageDiv.className = "message error";
        }
    } catch (error) {
        // Handle network or server errors
        console.error("Error:", error);
        messageDiv.textContent = "An error occurred. Please try again.";
        messageDiv.className = "message error";
    }
});