import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "./Loader";

/**
 * Frontend mirror of the backend RBAC check. This is a UX convenience only —
 * the real enforcement always happens server-side in restrictTo('admin').
 */
const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default AdminRoute;
