import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/authProvider";

const PrivateRoutes = () => {
  const { user } = useAuth();
  return (user != null ? <Outlet /> : <Navigate to="/auth/login" />);
};

export default PrivateRoutes;
