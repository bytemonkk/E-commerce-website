import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Button, Form, ListGroup, Badge } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { productService } from "../services/productService";
import { useFetch } from "../hooks/useFetch";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/Loader";
import ErrorAlert from "../components/ErrorAlert";
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data, loading, error, refetch } = useFetch(() => productService.getProduct(id), [id]);
  const { data: relatedRes } = useFetch(() => productService.getRelated(id), [id]);

  const product = data?.data;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await productService.createReview(id, reviewForm);
      toast.success("Review submitted!");
      setReviewForm({ rating: 5, comment: "" });
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} />;
  if (!product) return null;

  return (
    <Container className="py-4">
      <Row className="g-4">
        <Col md={5}>
          <img
            src={product.images?.[0]?.url || "https://via.placeholder.com/500"}
            alt={product.name}
            className="img-fluid rounded shadow-sm"
          />
        </Col>
        <Col md={7}>
          <h2>{product.name}</h2>
          <div className="d-flex align-items-center mb-2">
            <FaStar className="text-warning me-1" />
            <span>{product.ratingsAverage?.toFixed(1)} ({product.ratingsCount} reviews)</span>
          </div>

          <h4 className="mb-3">
            {product.discountPrice ? (
              <>
                <span className="text-danger me-2">${product.discountPrice.toFixed(2)}</span>
                <small className="text-muted text-decoration-line-through">${product.price.toFixed(2)}</small>
              </>
            ) : (
              <>${product.price.toFixed(2)}</>
            )}
          </h4>

          <p>{product.description}</p>

          <Badge bg={product.stock > 0 ? "success" : "secondary"} className="mb-3">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </Badge>

          {product.stock > 0 && (
            <div className="d-flex align-items-center gap-2 mb-3">
              <Form.Control
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, Number(e.target.value))))}
                style={{ width: 90 }}
              />
              <Button onClick={handleAddToCart}>Add to Cart</Button>
            </div>
          )}
        </Col>
      </Row>

      <Row className="mt-5">
        <Col md={7}>
          <h4>Customer Reviews</h4>
          {product.reviews?.length === 0 && <p className="text-muted">No reviews yet.</p>}
          <ListGroup variant="flush" className="mb-4">
            {product.reviews?.map((r) => (
              <ListGroup.Item key={r._id}>
                <div className="d-flex justify-content-between">
                  <strong>{r.name}</strong>
                  <span className="text-warning">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </span>
                </div>
                <p className="mb-0 text-muted">{r.comment}</p>
              </ListGroup.Item>
            ))}
          </ListGroup>

          {user ? (
            <Form onSubmit={handleReviewSubmit}>
              <Form.Group className="mb-2">
                <Form.Label>Your Rating</Form.Label>
                <Form.Select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} Star{n > 1 && "s"}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Share your thoughts..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </Form.Group>
              <Button type="submit" size="sm" disabled={submittingReview}>
                {submittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </Form>
          ) : (
            <p>
              <Link to="/login">Log in</Link> to write a review.
            </p>
          )}
        </Col>
      </Row>

      {relatedRes?.data?.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-3">Related Products</h4>
          <Row xs={1} sm={2} md={4} className="g-4">
            {relatedRes.data.map((p) => (
              <Col key={p._id}>
                <ProductCard product={p} />
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  );
};

export default ProductDetails;
