import ProductCard from "./ProductCard";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between mt-8">
      <div className="hidden sm:block">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-sm font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
        >
          Previous
        </button>
      </div>
      <div className="flex-1 flex justify-between sm:justify-end">
        <div className="flex items-center space-x-1">
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                currentPage === number
                  ? 'z-10 bg-primary border-primary text-white'
                  : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
              }`}
            >
              {number}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-sm font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </nav>
  );
};


function ProductList({ products = [], pagination, onPageChange, onAddToCart, modeRate = false }) {
    const view = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    return (
        <>
            <div className={`grid ${view} gap-6`}>
                {products.map((product) => (
                    <ProductCard key={product.product_id} product={product} modeRate={modeRate} onAddToCart={onAddToCart} />
                ))}
            </div>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={onPageChange}
            />
        </>
    )
}
export default ProductList;