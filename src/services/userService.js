export default async function getCurrentUser() {
    try {
        const response = await fetch(`/api/users/me`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            console.warn('No current user found.');
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch current user:', error.message);
        throw error;
    }
}