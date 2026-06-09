export default function ProductCard({ product, color }) {
  const price = Number(product.price).toFixed(2);
  const oldPrice = product.oldPrice && Number(product.oldPrice) > Number(product.price)
    ? Number(product.oldPrice).toFixed(2)
    : null;
  const img = product.img || product.img_path || product.image;

  return (
    <div className="product-card">
      <div className="product-img-wrap">
        {img ? (
          <img
            src={img}
            alt={product.title}
            className="product-img"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="product-img-placeholder">🛒</div>
        )}
      </div>
      <div className="product-body">
        <div className="product-name">{product.title}</div>
        {product.weight && <div className="product-weight">{product.weight}</div>}
        <div className="product-price" style={{ color }}>
          {price} <span className="product-currency">грн</span>
          {oldPrice && <span className="product-old-price">{oldPrice} грн</span>}
        </div>
      </div>
    </div>
  );
}
