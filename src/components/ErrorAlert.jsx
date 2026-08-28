import { Alert } from "react-bootstrap";

const ErrorAlert = ({ message }) => {
  if (!message) return null;
  return (
    <Alert variant="danger" className="my-3">
      {message}
    </Alert>
  );
};

export default ErrorAlert;
