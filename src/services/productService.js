import products from '../data/products.json';

const ITEMS_PER_PAGE = 15;

export const getProducts = async ({ searchTerm = '', sortBy = 'newest', page = 1 }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredProducts = [...products];

  // 1. Filtering
  if (searchTerm) {
    const lowercasedTerm = searchTerm.toLowerCase();
    filteredProducts = filteredProducts.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(lowercasedTerm);
      const variantMatch = product.variants.some(variant =>
        (variant.color && variant.color.toLowerCase().includes(lowercasedTerm)) ||
        (variant.size && variant.size.toString().toLowerCase().includes(lowercasedTerm))
      );
      return nameMatch || variantMatch;
    });
  }

  // 2. Sorting
  switch (sortBy) {
    case 'price-asc':
      filteredProducts.sort((a, b) => parseFloat(a.price_per_day) - parseFloat(b.price_per_day));
      break;
    case 'price-desc':
      filteredProducts.sort((a, b) => parseFloat(b.price_per_day) - parseFloat(a.price_per_day));
      break;
    case 'newest':
    default:
      // Assuming the default order in JSON is 'newest'.
      // In a real scenario, we'd use a timestamp.
      break;
  }

  // 3. Pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return {
    products: paginatedProducts,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
    },
  };
};

export const getProductById = async (productId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const product = products.find(p => p.product_id === productId);
    return product;
}
