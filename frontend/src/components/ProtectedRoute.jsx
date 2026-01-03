import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Loader from "./Loader";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  console.log("user - ", user)

  if(loading) return <Loader />
  
  if (!user) return <Navigate to={"/login"} />;

  return children;
}

export default ProtectedRoute;
