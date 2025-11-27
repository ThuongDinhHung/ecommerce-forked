import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product = {}, onAddToCart = () => {}, view = "horizontal", modeRate = false }) => {
  const navigate = useNavigate();

  // Helpers
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const formatPrice = (val) => {
    const n = Math.round(toNumber(val));
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  // Resolve image(s)
  const images = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length) return product.images;
    if (typeof product.images === "string" && product.images) return [product.images];
    if (product.IMAGE_URL) return [product.IMAGE_URL];
    if (product.image) return [product.image];
    return [];
  }, [product]);

  // Resolve price and sale data
  const { originalPrice, salePercentage, finalPrice } = useMemo(() => {
    // various possible fields
    const priceCandidates = [
      product.price,
      product.price_per_day,
      product.PRICE,
      product.Price,
      product.cost,
      product.pricePerUnit,
      product.px,
      product.Px,
    ];
    let base = priceCandidates.map(toNumber).find((n) => n > 0) ?? 0;
    const sale = (product.sale_percentage ?? product.sale ?? product.discount ?? 0);
    const saleNum = toNumber(sale);
    const final = saleNum > 0 ? Math.round(base * (1 - saleNum / 100)) : Math.round(base);
    return { originalPrice: base, salePercentage: saleNum, finalPrice: final };
  }, [product]);

  const handleCardClick = () => {
    const id = product.product_id ?? product.barcode ?? product.id ?? product.sku ?? product.Bar_code;
    navigate(`/product/${encodeURIComponent(id ?? "")}`);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const thumb = images[0] ?? "";

  return (
    <div
      onClick={handleCardClick}
      className="rounded-lg h-full w-full transition-transform duration-200 ease-in-out hover:scale-105 hover:z-10 hover:cursor-pointer hover:ring-2 ring-gray-200 bg-white overflow-hidden"
    >
      <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
        {thumb ? (
          // eslint-disable-next-line jsx-a11y/img-redundant-alt
          <img src={thumb} alt={product.name ?? "product image"} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-400 text-sm">No image</div>
        )}
      </div>

      <div className="p-2">
        <h2 className="line-clamp-2 text-[1rem] font-semibold text-gray-900 mb-1">{product.name ?? product.productName ?? "Untitled product"}</h2>

        {/* rating / optional */}
        {modeRate && product.avgRating != null && (
          <div className="text-sm text-yellow-500 mb-1">{Number(product.avgRating).toFixed(1)} ★</div>
        )}

        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            {salePercentage > 0 ? (
              <>
                <div className="text-indigo-700 font-bold">{formatPrice(finalPrice)}</div>
                <div className="line-through text-gray-400 text-sm">{formatPrice(originalPrice)}</div>
                <div className="ml-1 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">-{salePercentage}%</div>
              </>
            ) : (
              <div className="text-indigo-700 font-bold">{formatPrice(originalPrice)}</div>
            )}
          </div>

          <div>
            <button
              onClick={handleAddToCartClick}
              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:brightness-95"
              aria-label="Add to cart"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;