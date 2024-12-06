// Server-side errors:
// Handle server-side errors (500 Internal Server Error)
export function handleServerError(res, error, errorMessage = "") {
    console.error(errorMessage, error); // Log the error for debugging purposes
    res.status(500).json({ error: errorMessage });
}

// Validate the request body for required fields and return appropriate error if missing
export function validateRequestBody(res, body, requiredFields) {
    const missingFields = requiredFields.filter(field => !(field in body));
    if (missingFields.length > 0) {
        handleInvalidRequestError(res, `Missing required fields: ${missingFields.join(", ")}`);
        return false;
    }
    return true;
}

// Client-side errors:
// Handle client-side errors with customizable status code and message
export function handleClientError(res, statusCode = 0, message = "") {
    res.status(statusCode).json({ error: message });
}

// Handle Invalid Request (400) error
export function handleInvalidRequestError(res, message = "") {
    handleClientError(res, 400, message);
}

// Handle Unauthorized (401) error (for cases where the user is accessing content without permission)
export function handleUnauthorizedError(res, message = "") {
    handleClientError(res, 401, message);
}

// Handle Forbidden (403) error (for cases where the user is authenticated but lacks permission)
export function handleForbiddenError(res, message = "") {
    handleClientError(res, 403, message);
}

// Handle Not Found (404) error (for cases where the resource doesn't exist)
export function handleNotFoundError(res, message = "") {
    handleClientError(res, 404, message);
}

// Handle Conflict (409) error (e.g., when a resource already exists, such as a duplicate user)
export function handleConflictError(res, message = "") {
    handleClientError(res, 409, message);
}

// Handle Unprocessable Entity (422) error (for cases of semantic validation errors in the request data)
export function handleUnprocessableEntityError(res, message = "") {
    handleClientError(res, 422, message);
}

// Handle Method Not Allowed (405) error (for invalid HTTP method on a route)
export function handleMethodNotAllowedError(res, message = "") {
    handleClientError(res, 405, message);
}

// Handle Unsupported Media Type (415) error (for unsupported content type in the request)
export function handleUnsupportedMediaTypeError(res, message = "") {
    handleClientError(res, 415, message);
}

// Success:
// Request Succeeded (200) response
export function handleSuccessOK(res, data = null, message = "") {
    const response = { message };
    if (data !== null) response.data = data; // Include data only if it's provided
    res.status(200).json(response);
}

// Created (201) response
export function handleSuccessCreated(res, data = null, message = "") {
    const response = { message };
    if (data !== null) response.data = data; // Include data only if it's provided
    res.status(201).json(response);
}