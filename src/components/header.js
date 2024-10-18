import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Header = () => {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return (
    <header>
      {/* <h1>Welcome to dancehall</h1>
      {isAuthenticated ? (
        <button onClick={() => logout({ returnTo: window.location.origin })}>Logout</button>
      ) : (
        <button onClick={() => loginWithRedirect()}>Login</button>
      )} */}
    </header>
  );
};

export default Header;