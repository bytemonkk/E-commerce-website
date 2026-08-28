import { Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const NotFound = () => (
  <Container className="py-5 text-center">
    <h1 className="display-3">404</h1>
    <p className="lead">The page you're looking for doesn't exist.</p>
    <Button as={Link} to="/">
      Go Home
    </Button>
  </Container>
);

export default NotFound;
