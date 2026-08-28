import { useState } from "react";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import "../utils/chartSetup";
import { orderService } from "../services/orderService";
import { useFetch } from "../hooks/useFetch";
import Loader from "../components/Loader";
import ErrorAlert from "../components/ErrorAlert";

const AdminDashboard = () => {
  const [days, setDays] = useState(30);
  const { data, loading, error } = useFetch(() => orderService.getAnalytics(days), [days]);

  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} />;

  const analytics = data?.data;
  const { revenueByDay = [], statusBreakdown = [], topProducts = [], totals = {} } = analytics || {};

  const revenueChartData = {
    labels: revenueByDay.map((d) => d._id),
    datasets: [
      {
        label: "Revenue ($)",
        data: revenueByDay.map((d) => d.revenue),
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13,110,253,0.15)",
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const statusColors = {
    pending: "#6c757d",
    processing: "#0dcaf0",
    shipped: "#0d6efd",
    delivered: "#198754",
    cancelled: "#dc3545",
    refunded: "#ffc107",
  };

  const statusChartData = {
    labels: statusBreakdown.map((s) => s._id),
    datasets: [
      {
        data: statusBreakdown.map((s) => s.count),
        backgroundColor: statusBreakdown.map((s) => statusColors[s._id] || "#adb5bd"),
      },
    ],
  };

  const topProductsChartData = {
    labels: topProducts.map((p) => p.name),
    datasets: [
      {
        label: "Units Sold",
        data: topProducts.map((p) => p.unitsSold),
        backgroundColor: "#20c997",
      },
    ],
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Sales Dashboard</h3>
        <Form.Select style={{ width: 180 }} value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </Form.Select>
      </div>

      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="shadow-sm text-center p-3">
            <small className="text-muted">Total Revenue</small>
            <h3 className="text-primary">${totals.totalRevenue?.toFixed(2) || "0.00"}</h3>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="shadow-sm text-center p-3">
            <small className="text-muted">Total Orders</small>
            <h3>{totals.totalOrders || 0}</h3>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="shadow-sm text-center p-3">
            <small className="text-muted">Avg. Order Value</small>
            <h3>
              $
              {totals.totalOrders
                ? (totals.totalRevenue / totals.totalOrders).toFixed(2)
                : "0.00"}
            </h3>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="shadow-sm text-center p-3">
            <small className="text-muted">Days Tracked</small>
            <h3>{days}</h3>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm p-3">
            <Card.Title>Revenue Over Time</Card.Title>
            {revenueByDay.length === 0 ? (
              <p className="text-muted">No paid orders in this period yet.</p>
            ) : (
              <Line data={revenueChartData} options={{ responsive: true }} />
            )}
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm p-3">
            <Card.Title>Order Status Breakdown</Card.Title>
            {statusBreakdown.length === 0 ? (
              <p className="text-muted">No orders yet.</p>
            ) : (
              <Doughnut data={statusChartData} />
            )}
          </Card>
        </Col>
        <Col lg={12}>
          <Card className="shadow-sm p-3">
            <Card.Title>Top Selling Products</Card.Title>
            {topProducts.length === 0 ? (
              <p className="text-muted">No sales data yet.</p>
            ) : (
              <Bar data={topProductsChartData} options={{ responsive: true, indexAxis: "y" }} />
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
