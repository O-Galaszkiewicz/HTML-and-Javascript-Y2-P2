// Select the necessary elements
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const loginButton = document.getElementById("loginButton");
const messageDiv = document.getElementById("message");

// Event listener for the Login button
loginButton.addEventListener("click", async () => {
    // Collect login data
    const loginData = {
        username: usernameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
        confirmPass: confirmPasswordInput.value.trim()
    };

    // Validate inputs
    if (!loginData.username || !loginData.email || !loginData.password || !loginData.confirmPass) {
        messageDiv.textContent = "All fields are required.";
        messageDiv.className = "message error";
        return;
    };

    try {
        // Send a POST request to the login endpoint
        const response = await fetch("/M00950516/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(loginData)
        });

        // Parse the response JSON
        const result = await response.json();

        if (response.ok) {
            // Display success message
            messageDiv.textContent = result.message;
            messageDiv.className = "message success";

            // Redirect to another page after login
            setTimeout(() => {
                window.location.href = "/M00950516/contents";
            }, 2000);
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