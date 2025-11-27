const API_URL = 'http://localhost:3000/api';

export const api = {
    register: async (email, username, password) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        return response.json();
    },

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
    },

    getLeaderboard: async (token) => {
        const response = await fetch(`${API_URL}/social/leaderboard`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard');
        }

        return response.json();
        return response.json();
    },

    getShopItems: async () => {
        const response = await fetch(`${API_URL}/shop/items`);
        if (!response.ok) throw new Error('Failed to fetch shop items');
        return response.json();
    },

    getInventory: async (token) => {
        const response = await fetch(`${API_URL}/shop/inventory`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch inventory');
        return response.json();
    },

    buyItem: async (token, itemId) => {
        const response = await fetch(`${API_URL}/shop/buy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ itemId })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Purchase failed');
        return data;
    }
};
