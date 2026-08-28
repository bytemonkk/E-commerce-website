import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import dropin from "braintree-web-drop-in";
import { useCart } from "../hooks/useCart";
import { paymentService } from "../services/orderService";
import Loader from "../components/Loader";
import ErrorAlert from "../components/ErrorAlert";

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [clientToken, setClientToken] = useState(null);
  const [dropinInstance, setDropinInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const dropinContainerRef = useRef(null);

  const tax = Number((subtotal * 0.08).toFixed(2));
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = Number((subtotal + tax + shipping).toFixed(2));

  // Step 1: fetch a Braintree client token, then mount the Drop-in UI into the DOM node
  useEffect(() => {
    let instance;
    const init = async () => {
      try {
        const res = await paymentService.getClientToken();
        setClientToken(res.clientToken);

        instance = await dropin.create({
          authorization: res.clientToken,
          container: dropinContainerRef.current,
          card: { cardholderName: true },
        });
        setDropinInstance(instance);
      } catch (err) {
        setError(err.message || "Could not load payment form.");
      } finally {
        setLoading(false);
      }
    };
    init();

    return () => {
      if (instance) instance.teardown().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddressChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!dropinInstance) return;

    setPlacingOrder(true);
    setError("");
    try {
      // Step 2: request a one-time payment nonce from the Drop-in UI
      const { nonce } = await dropinInstance.requestPaymentMethod();

      // Step 3: send nonce + cart to backend, which recalculates prices and
      // charges via Braintree server-side (never trust client-sent totals)
      const orderItems = items.map((i) => ({ product: i.product, quantity: i.quantity }));
      const res = await paymentService.checkout({
        paymentMethodNonce: nonce,
        orderItems,
        shippingAddress: address,
      });

      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/orders/${res.data._id}`);
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <Container className="py-4">
      <h3 className="mb-4">Checkout</h3>
      <ErrorAlert message={error} />
      <Form onSubmit={handlePlaceOrder}>
        <Row className="g-4">
          <Col md={7}>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <Card.Title>Shipping Address</Card.Title>
                <Row className="g-3">
                  <Col md={12}>
                    <Form.Control
                      name="fullName"
                      placeholder="Full Name"
                      required
                      value={address.fullName}
                      onChange={handleAddressChange}
                    />
                  </Col>
                  <Col md={12}>
                    <Form.Control
                      name="street"
                      placeholder="Street Address"
                      required
                      value={address.street}
                      onChange={handleAddressChange}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      name="city"
                      placeholder="City"
                      required
                      value={address.city}
                      onChange={handleAddressChange}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      name="state"
                      placeholder="State/Province"
                      value={address.state}
                      onChange={handleAddressChange}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      name="postalCode"
                      placeholder="Postal Code"
                      required
                      value={address.postalCode}
                      onChange={handleAddressChange}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      name="country"
                      placeholder="Country"
                      required
                      value={address.country}
                      onChange={handleAddressChange}
                    />
                  </Col>
                  <Col md={12}>
                    <Form.Control
                      name="phone"
                      placeholder="Phone Number"
                      value={address.phone}
                      onChange={handleAddressChange}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Payment Details</Card.Title>
                {loading && <Loader small />}
                <div ref={dropinContainerRef} />
              </Card.Body>
            </Card>
          </Col>

          <Col md={5}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Order Summary</Card.Title>
                {items.map((item) => (
                  <div key={item.product} className="d-flex justify-content-between small mb-1">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Button type="submit" className="w-100 mt-3" disabled={loading || placingOrder || !clientToken}>
                  {placingOrder ? "Placing Order..." : "Place Order"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default Checkout;
