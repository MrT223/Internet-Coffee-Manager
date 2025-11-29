import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoleRoute = ({ element: Element, allowedRoles, ...rest }) => {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && allowedRoles.includes(user.role_id)) {
    return <Element {...rest} />;
  }

  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoleRoute;
