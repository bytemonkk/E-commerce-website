import { useState } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import ErrorAlert from "../components/ErrorAlert";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || "/";

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: 480 }}>
      <Card className="shadow-sm p-4">
        <h3 className="mb-4 text-center">Sign In</h3>
        <ErrorAlert message={error} />
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </Form.Group>
          <div className="d-flex justify-content-between mb-3">
            <Link to="/forgot-password" className="small">Forgot password?</Link>
          </div>
          <Button type="submit" className="w-100" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign In"}
          </Button>
        </Form>
        <Row className="mt-3">
          <Col className="text-center">
            Don't have an account? <Link to="/register">Register</Link>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default Login;
