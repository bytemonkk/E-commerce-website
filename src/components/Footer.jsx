import { Container } from "react-bootstrap";

const Footer = () => (
  <footer className="bg-dark text-white-50 py-4 mt-auto">
    <Container className="text-center small">
      &copy; {new Date().getFullYear()} ShopSphere. All rights reserved.
    </Container>
  </footer>
);

export default Footer;
