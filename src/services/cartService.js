const getCartItems = async () => {
    const response = await fetch('/api/cart/items', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    return data;
}

export default {
    getCartItems,
};