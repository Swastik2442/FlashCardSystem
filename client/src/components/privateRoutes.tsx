import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/authProvider";

/**
 * A Wrapper for Routes that require a User to be Logged In.
 */
const PrivateRoutes = () => {
  const { user } = useAuth();
  return (user != null ? <Outlet /> : <Navigate to="/auth/login" />);
};

export default PrivateRoutes;
