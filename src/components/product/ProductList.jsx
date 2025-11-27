import React, { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import { useSearchParams } from "react-router-dom";

function Pagination({ currentPage = 1, totalPages = 1, onPageChange = () => {} }) {
  const prev = () => onPageChange(Math.max(1, currentPage - 1));
  const next = () => onPageChange(Math.min(totalPages, currentPage + 1));
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-6 flex items-center justify-between">
      <button onClick={prev} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">
        Prev
      </button>
      <div className="text-sm text-gray-600">Page {currentPage} / {totalPages}</div>
      <button onClick={next} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">
        Next
      </button>
    </nav>
  );
}

function ProductList({
  view = "horizontal",
  products = [],
  modeRate = false,
  pagination = { currentPage: 1, totalPages: 1 },
  onPageChange = () => {}
}) {
  const [internalPage, setInternalPage] = useState(pagination.currentPage || 1);
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get("search") || "").toLowerCase();

  // determine grid classes
  const viewClass = useMemo(() => {
    switch ((view || "").toLowerCase()) {
      case "horizontal":
        return "h-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-evenly";
      case "vertical":
        return "h-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 justify-evenly";
      default:
        return "h-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-evenly";
    }
  }, [view]);

  const itemQuantity = view.toLowerCase() === "horizontal" ? 4 : 15;

  // prefer external pagination.currentPage if provided/updated
  const currentPage = pagination.currentPage ?? internalPage;

  const startIdx = (currentPage - 1) * itemQuantity;
  const endIdx = startIdx + itemQuantity;
  const pageSlice = Array.isArray(products) ? products.slice(startIdx, endIdx) : [];

  const filteredProducts = pageSlice.filter((product) => {
    const name = (product?.name || product?.productName || "").toString().toLowerCase();
    const desc = (product?.description || product?.desc || "").toString().toLowerCase();
    if (!searchQuery) return true;
    return name.includes(searchQuery) || desc.includes(searchQuery);
  });

  const handlePageChange = (page) => {
    setInternalPage(page);
    if (typeof onPageChange === "function") onPageChange(page);
  };

  return (
    <>
      <div className={viewClass}>
        {filteredProducts.map((product, i) => (
          <ProductCard
            key={startIdx + i}
            product={product}
            modeRate={modeRate}
            view={view}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={pagination.totalPages ?? 1}
        onPageChange={handlePageChange}
      />
    </>
  );
}

export default ProductList;