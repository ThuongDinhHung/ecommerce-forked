import React from 'react';

const ProductFilters = ({ searchTerm, setSearchTerm, sortBy, setSortBy, totalItems }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-start">
        <div className="max-w-lg w-full lg:max-w-xs">
          <label className="sr-only" htmlFor="search">Search for products...</label>
          <div className="relative text-zinc-400 focus-within:text-zinc-600">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <span className="material-icons-outlined text-zinc-500">search</span>
            </div>
            <input
              id="search"
              name="search"
              className="block w-full bg-white dark:bg-zinc-800 py-2 pl-10 pr-3 border border-zinc-300 dark:border-zinc-700 rounded-md leading-5 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Search for products..."
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Showing 1-15 of {totalItems} products</p>
        <div>
          <label className="sr-only" htmlFor="sort-by">Sort by</label>
          <select
            id="sort-by"
            name="sort-by"
            className="rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 focus:ring-primary focus:border-primary text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
