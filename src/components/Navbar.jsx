import { useState } from "react";
import { Navbar as BsNavbar, Nav, Container, Form, FormControl, Badge, NavDropdown } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemsCount } = useCart();
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) navigate(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <BsNavbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <BsNavbar.Brand as={Link} to="/">
          ShopSphere
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="main-navbar" />
        <BsNavbar.Collapse id="main-navbar">
          <Form className="d-flex mx-auto" style={{ maxWidth: 480, width: "100%" }} onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="me-2"
            />
          </Form>

          <Nav className="ms-auto align-items-lg-center">
            <Nav.Link as={Link} to="/products">
              Shop
            </Nav.Link>
            <Nav.Link as={Link} to="/cart" className="position-relative">
              <FaShoppingCart size={18} />
              {itemsCount > 0 && (
                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                  {itemsCount}
                </Badge>
              )}
            </Nav.Link>

            {user ? (
              <NavDropdown title={<><FaUserCircle className="me-1" />{user.name.split(" ")[0]}</>} align="end">
                <NavDropdown.Item as={Link} to="/profile">
                  My Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/orders">
                  My Orders
                </NavDropdown.Item>
                {isAdmin && (
                  <NavDropdown.Item as={Link} to="/admin/dashboard">
                    Admin Dashboard
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to="/login">
                Login
              </Nav.Link>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
