import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, ListGroup, Badge } from "react-bootstrap";
import { orderService } from "../services/orderService";
import { useFetch } from "../hooks/useFetch";
import Loader from "../components/Loader";
import ErrorAlert from "../components/ErrorAlert";

const OrderDetails = () => {
  const { id } = useParams();
  const { data, loading, error } = useFetch(() => orderService.getOrder(id), [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} />;

  const order = data?.data;
  if (!order) return null;

  return (
    <Container className="py-4">
      <h3 className="mb-4">Order #{order._id.slice(-8).toUpperCase()}</h3>
      <Row className="g-4">
        <Col md={7}>
          <Card className="shadow-sm mb-3">
            <Card.Body>
              <Card.Title>Shipping Address</Card.Title>
              <p className="mb-0">
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.street}, {order.shippingAddress.city}
                <br />
                {order.shippingAddress.state} {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </p>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {order.orderItems.map((item, idx) => (
                  <ListGroup.Item key={idx} className="d-flex justify-content-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <div className="d-flex justify-content-between mb-2">
                <span>Status</span>
                <Badge bg="info">{order.status}</Badge>
              </div>
              <div className="d-flex justify-content-between">
                <span>Payment</span>
                <span>{order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : "Unpaid"}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <span>Items</span>
                <span>${order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Tax</span>
                <span>${order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Shipping</span>
                <span>${order.shippingPrice.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetails;
