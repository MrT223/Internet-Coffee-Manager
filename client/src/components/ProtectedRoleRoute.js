import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && allowedRoles.includes(user.role_id)) {
    return children;
  }

  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoleRoute;
