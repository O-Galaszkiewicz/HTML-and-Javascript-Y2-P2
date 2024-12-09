document.addEventListener('DOMContentLoaded', function() {
    // Get current path
    const path = window.location.pathname;

    // Default to show contents page (homeDiv)
    if (path.includes("/M00950516/contents")) {
        document.getElementById('homeDiv').style.display = 'block';  // Show contents page
    } else if (path.includes("/M00950516/login")) {
        document.getElementById('loginDiv').style.display = 'block';  // Show login page
    } else if (path.includes("/M00950516/users")) {
        document.getElementById('registrationDiv').style.display = 'block';  // Show registration page
    } else if (path.includes("/M00950516/follow")) {
        document.getElementById('followDiv').style.display = 'block';  // Show follow page
    } else {
        // Default to contents page
        window.location.href = '/M00950516/contents';  // Redirect to contents page if no path matches
    }

    // Handle search button for contents page
    document.getElementById('searchButton').addEventListener('click', function() {
        const searchQuery = document.getElementById('search').value;
        console.log("Searching for posts with query: " + searchQuery);
        // Add your search logic here
    });
});
