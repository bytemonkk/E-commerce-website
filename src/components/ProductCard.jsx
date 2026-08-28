import { Card, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { useCart } from "../hooks/useCart";
import { toast } from "react-toastify";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const hasDiscount = product.discountPrice != null;

  const handleAdd = (e) => {
    e.preventDefault();
    if (product.stock === 0) {
      toast.error("This product is out of stock.");
      return;
    }
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Card className="h-100 shadow-sm product-card">
      <Link to={`/products/${product._id}`} className="text-decoration-none text-dark">
        <div style={{ height: 200, overflow: "hidden" }}>
          <Card.Img
            variant="top"
            src={product.images?.[0]?.url || "https://via.placeholder.com/300"}
            style={{ height: "100%", objectFit: "cover" }}
          />
        </div>
        <Card.Body>
          {hasDiscount && <Badge bg="danger" className="mb-2">Sale</Badge>}
          <Card.Title className="fs-6 text-truncate">{product.name}</Card.Title>
          <div className="d-flex align-items-center mb-2">
            <FaStar className="text-warning me-1" size={14} />
            <small>
              {product.ratingsAverage?.toFixed(1) || "0.0"} ({product.ratingsCount || 0})
            </small>
          </div>
          <div>
            {hasDiscount ? (
              <>
                <span className="fw-bold text-danger me-2">${product.discountPrice.toFixed(2)}</span>
                <span className="text-muted text-decoration-line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="fw-bold">${product.price.toFixed(2)}</span>
            )}
          </div>
        </Card.Body>
      </Link>
      <Card.Footer className="bg-white border-0 pt-0">
        <Button
          variant={product.stock === 0 ? "secondary" : "primary"}
          size="sm"
          className="w-100"
          disabled={product.stock === 0}
          onClick={handleAdd}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default ProductCard;
