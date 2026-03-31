// secureCookies.ts

/**
 * Set Access Token Cookie
 * @param token - The access token to store in the cookie
 */
export function setAccessTokenCookie(token: string) {
    document.cookie = `accessToken=${token}; HttpOnly; SameSite=Strict; Secure; Path=/; Expires=${new Date(Date.now() + 60 * 60 * 1000).toUTCString()}`;
}

/**
 * Set Refresh Token Cookie
 * @param token - The refresh token to store in the cookie
 */
export function setRefreshTokenCookie(token: string) {
    document.cookie = `refreshToken=${token}; HttpOnly; SameSite=Strict; Secure; Path=/; Expires=${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()}`;
}

/**
 * Get Access Token
 * @returns {string | null} - The access token, or null if it doesn't exist
 */
export function getAccessToken() {
    const match = document.cookie.match(/(?:^|; )accessToken=([^;]*)/);
    return match ? match[1] : null;
}

/**
 * Get Refresh Token
 * @returns {string | null} - The refresh token, or null if it doesn't exist
 */
export function getRefreshToken() {
    const match = document.cookie.match(/(?:^|; )refreshToken=([^;]*)/);
    return match ? match[1] : null;
}

/**
 * Clear Auth Cookies
 */
export function clearAuthCookies() {
    document.cookie = 'accessToken=; HttpOnly; SameSite=Strict; Secure; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refreshToken=; HttpOnly; SameSite=Strict; Secure; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
}