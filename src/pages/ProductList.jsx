import { useState, useEffect } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { productService, categoryService } from "../services/productService";
import { useFetch } from "../hooks/useFetch";
import { useDebounce } from "../hooks/useDebounce";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import ErrorAlert from "../components/ErrorAlert";

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "-createdAt");
  const [page, setPage] = useState(1);

  const debouncedKeyword = useDebounce(keyword, 400);

  const { data: categoriesRes } = useFetch(() => categoryService.getCategories(), []);

  const { data, loading, error } = useFetch(
    () =>
      productService.getProducts({
        keyword: debouncedKeyword || undefined,
        category: category || undefined,
        sort,
        page,
        limit: 12,
      }),
    [debouncedKeyword, category, sort, page]
  );

  useEffect(() => {
    const params = {};
    if (debouncedKeyword) params.keyword = debouncedKeyword;
    if (category) params.category = category;
    if (sort !== "-createdAt") params.sort = sort;
    setSearchParams(params, { replace: true });
  }, [debouncedKeyword, category, sort, setSearchParams]);

  return (
    <Container className="py-4">
      <Row className="mb-4 g-2">
        <Col md={5}>
          <Form.Control
            placeholder="Search products..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </Col>
        <Col md={4}>
          <Form.Select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categoriesRes?.data?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="-createdAt">Newest</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-ratingsAverage">Top Rated</option>
          </Form.Select>
        </Col>
      </Row>

      {loading && <Loader />}
      <ErrorAlert message={error} />

      {!loading && data?.data?.length === 0 && <p className="text-muted">No products found.</p>}

      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {data?.data?.map((product) => (
          <Col key={product._id}>
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>

      {data?.pages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-4">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`btn btn-sm ${p === page ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </Container>
  );
};

export default ProductList;
