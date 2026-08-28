import { Container, Table, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { orderService } from "../services/orderService";
import { useFetch } from "../hooks/useFetch";
import Loader from "../components/Loader";
import ErrorAlert from "../components/ErrorAlert";

const statusColor = {
  pending: "secondary",
  processing: "info",
  shipped: "primary",
  delivered: "success",
  cancelled: "danger",
  refunded: "warning",
};

const Orders = () => {
  const { data, loading, error } = useFetch(() => orderService.getMyOrders(), []);

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <Container className="py-4">
      <h3 className="mb-4">My Orders</h3>
      {data?.data?.length === 0 ? (
        <p className="text-muted">You haven't placed any orders yet.</p>
      ) : (
        <Table responsive hover>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Paid</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((order) => (
              <tr key={order._id}>
                <td>{order._id.slice(-8).toUpperCase()}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>${order.totalPrice.toFixed(2)}</td>
                <td>
                  <Badge bg={statusColor[order.status] || "secondary"}>{order.status}</Badge>
                </td>
                <td>{order.isPaid ? "Yes" : "No"}</td>
                <td>
                  <Link to={`/orders/${order._id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default Orders;
