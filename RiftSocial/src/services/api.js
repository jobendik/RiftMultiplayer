const API_URL = 'http://localhost:3000/api';

export const api = {
    login: async (email, password) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        return response.json();
    },

    getProfile: async (token) => {
        const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        return response.json();
    },

    getFriends: async (token) => {
        const response = await fetch(`${API_URL}/social/friends`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch friends');
        }

        return response.json();
    },

    getFriendRequests: async (token) => {
        const response = await fetch(`${API_URL}/social/friend-requests`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch friend requests');
        }

        return response.json();
    },

    getParty: async (token) => {
        const response = await fetch(`${API_URL}/social/party`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch party');
        }

        return response.json();
    }
};
