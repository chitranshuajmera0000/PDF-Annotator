import axios from "axios";

export function setToken(token) {
    localStorage.setItem('token', token);
}

export function getToken() {
    return localStorage.getItem('token');
}

export function removeToken() {
    localStorage.removeItem('token');
}

export async function isAuthenticated() {
    try {
        const response = await axios.get('http://localhost:5000/api/auth/authenticate', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        // Return user info if available
        return response.data && response.data.user ? response.data.user : true;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}
