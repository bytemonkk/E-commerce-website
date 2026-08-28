import { Container, Table, Button, Row, Col, Card, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h4>Your cart is empty</h4>
        <Link to="/products" className="btn btn-primary mt-3">
          Continue Shopping
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="mb-4">Shopping Cart</h3>
      <Row>
        <Col md={8}>
          <Table responsive align="middle">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.product}>
                  <td className="d-flex align-items-center gap-2">
                    <img src={item.image} alt={item.name} width={50} height={50} style={{ objectFit: "cover" }} />
                    {item.name}
                  </td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>
                    <Form.Control
                      type="number"
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      style={{ width: 80 }}
                      onChange={(e) =>
                        updateQuantity(item.product, Math.max(1, Math.min(item.stock, Number(e.target.value))))
                      }
                    />
                  </td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <Button variant="link" className="text-danger" onClick={() => removeFromCart(item.product)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <div className="d-flex justify-content-between my-2">
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <small className="text-muted">Tax and shipping calculated at checkout.</small>
              <Button className="w-100 mt-3" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
