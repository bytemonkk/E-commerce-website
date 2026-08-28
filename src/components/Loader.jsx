import { Spinner } from "react-bootstrap";

const Loader = ({ small }) => (
  <div className={`d-flex justify-content-center align-items-center ${small ? "py-2" : "py-5"}`}>
    <Spinner animation="border" role="status" variant="primary">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

export default Loader;
