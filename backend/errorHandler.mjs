// Validate the request body for required fields and return appropriate error if missing or invalid
export function validateRequestBody(res, body, requiredFields, fieldValidations = {}) {
    // Check for missing required fields
    const missingFields = requiredFields.filter(field => !(field in body));
    if (missingFields.length > 0) {
        return handleInvalidRequestError(res, `Missing required fields: ${missingFields.join(", ")}`);
    };

    // Validate each field using fieldValidations (if provided)
    const invalidFields = [];
    for (const field of requiredFields) {
        const validation = fieldValidations[field];

        // If there are specific validations for this field
        if (validation) {
            const error = validation(body[field]);
            if (error) {
                invalidFields.push({ field, error });
            };
        };
    };

    // If there are validation errors, return them
    if (invalidFields.length > 0) {
        const errorMessage = invalidFields.map(item => `${item.field}: ${item.error}`).join(", ");
        return handleInvalidRequestError(res, `Invalid fields: ${errorMessage}`);
    };

    return true;  // Everything is valid
};

// Centralized Error Handler
export function handleError(res, statusCode, message = "", error = null) {
    if (error) console.error(message, error); // Log server-side errors
    res.status(statusCode).json({
        error: message,
        code: statusCode,
        timestamp: new Date().toISOString(), // Optional metadata
    });
};

// Specific Error Handlers:
//     Server (500) Errors
export function handleServerError(res, error, message = "Internal Server Error") {
    handleError(res, 500, message, error);
};

//     Client (400) Errors:
export function handleClientError(res, statusCode = 400, message = "") {
    handleError(res, statusCode, message);
};

//     Handle Invalid Request (400) error
export function handleInvalidRequestError(res, errors) {
    // If the errors is an array (i.e., multiple errors from validationResult)
    if (Array.isArray(errors)) {
        const errorMessages = errors.map(err => `${err.param}: ${err.msg}`).join(", ");
        return handleClientError(res, 400, `Validation errors: ${errorMessages}`);
    }

    // Otherwise, handle a single error message
    return handleClientError(res, 400, errors);
};

//     Handle Unauthorized (401) error (for cases where the user is accessing content without permission)
export function handleUnauthorizedError(res, message = "") {
    handleClientError(res, 401, message);
};

//     Handle Forbidden (403) error (for cases where the user is authenticated but lacks permission)
export function handleForbiddenError(res, message = "") {
    handleClientError(res, 403, message);
};

//     Handle Not Found (404) error (for cases where the resource doesn't exist)
export function handleNotFoundError(res, message = "") {
    handleClientError(res, 404, message);
};

//     Handle Method Not Allowed (405) error (for invalid HTTP method on a route)
export function handleMethodNotAllowedError(res, message = "") {
    handleClientError(res, 405, message);
};

//     Handle Conflict (409) error (e.g., when a resource already exists, such as a duplicate user)
export function handleConflictError(res, message = "") {
    handleClientError(res, 409, message);
};

//     Handle Unsupported Media Type (415) error (for unsupported content type in the request)
export function handleUnsupportedMediaTypeError(res, message = "") {
    handleClientError(res, 415, message);
};

//     Handle Unprocessable Entity (422) error (for cases of semantic validation errors in the request data)
export function handleUnprocessableEntityError(res, message = "") {
    handleClientError(res, 422, message);
};

// Success Handler:
export function handleSuccess(res, statusCode, message = "", data = null) {
    const response = { message, timestamp: new Date().toISOString() };
    if (data) response.data = data;
    res.status(statusCode).json(response);
};

//     Request Succeeded (200) response
export function handleSuccessOK(res, data = null, message = "") {
    handleSuccess(res, 200, message, data);
};

//     Created (201) response
export function handleSuccessCreated(res, data = null, message = "") {
    handleSuccess(res, 201, message, data);
};