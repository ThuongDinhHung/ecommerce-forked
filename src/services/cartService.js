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

// Adds or updates a variation in the cart (backend expects variationName)
const updateItem = async (barcode, variationName, quantity) => {
    const payload = { barcode, variationName, quantity: Number(quantity) };
    const response = await fetch('/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error('Invalid JSON response from /api/cart');
    }
    if (!response.ok) {
        throw new Error(data?.message || 'Failed to update cart item');
    }
    return data;
};

// Explicit add function (alias of updateItem for clarity)
const addVariationToCart = async (barcode, variationName, quantity) => {
    return updateItem(barcode, variationName, quantity);
};

export default {
    getCartItems,
    updateItem,
    addVariationToCart,
};