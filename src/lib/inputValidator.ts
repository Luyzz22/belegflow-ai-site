// inputValidator.ts

/**
 * Validates email address
 * @param {string} email - The email address to validate
 * @returns {boolean} - Returns true if email is valid, false otherwise
 */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {boolean} - Returns true if password is strong, false otherwise
 */
function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return regex.test(password);
}

/**
 * Sanitizes a string to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Returns the sanitized string
 */
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.innerText = input;
    return div.innerHTML;
}

/**
 * Validates an amount (positive number with two decimal precision)
 * @param {number} amount - The amount to validate
 * @returns {boolean} - Returns true if amount is valid, false otherwise
 */
function validateAmount(amount) {
    return typeof amount === 'number' && amount >= 0 && amount.toFixed(2) === amount.toString();
}

module.exports = { validateEmail, validatePassword, sanitizeInput, validateAmount };