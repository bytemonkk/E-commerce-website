import { Container, Row, Col } from "react-bootstrap";
import { useFetch } from "../hooks/useFetch";
import { productService } from "../services/productService";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import ErrorAlert from "../components/ErrorAlert";

const Home = () => {
  const { data, loading, error } = useFetch(() => productService.getFeatured(), []);

  return (
    <>
      <div className="bg-primary text-white text-center py-5 mb-4">
        <Container>
          <h1 className="fw-bold">Welcome to ShopSphere</h1>
          <p className="lead">Quality products, unbeatable prices, delivered fast.</p>
        </Container>
      </div>

      <Container className="pb-5">
        <h3 className="mb-4">Featured Products</h3>
        {loading && <Loader />}
        <ErrorAlert message={error} />
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {data?.data?.map((product) => (
            <Col key={product._id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default Home;
