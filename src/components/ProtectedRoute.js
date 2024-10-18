import React, { useContext } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { RoleContext } from '../context/RoleContext';

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  const { role } = useContext(RoleContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log('ProtectedRoute role:', role);
  const hasAccess = allowedRoles.includes(role);

  console.log('ProtectedRoute:', { isAuthenticated, role, hasAccess });

  return isAuthenticated && hasAccess ? <Component {...rest} /> : <Navigate to="/" />;
};

export default ProtectedRoute;
