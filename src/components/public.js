import React, { useContext, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { RoleContext } from '../context/RoleContext';
import './public.css'; // Import the CSS file

const Public = () => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const navigate = useNavigate();
  const { setRole } = useContext(RoleContext);

  const handleLogin = async (role) => {
    try {
      console.log(`Attempting to login as ${role}`);
      await loginWithRedirect({
        authorizationParams: { 
          redirect_uri: window.location.origin,
          screen_hint: 'signup', // Ensure the signup screen is shown
        },
        appState: { returnTo: role === 'student' ? '/booking' : '/teacher', role },
      });
      console.log(`Redirecting to login as ${role}...`);
    } catch (error) {
      console.error(`Error during login with redirect as ${role}:`, error);
    }
  };

  useEffect(() => {
    console.log('useEffect called with isAuthenticated:', isAuthenticated);
    console.log('User object:', user);
    if (isAuthenticated && user) {
      const appState = JSON.parse(localStorage.getItem('appState'));
      if (appState && appState.role) {
        setRole(appState.role);
        console.log('Role set from appState:', appState.role);
        if (appState.role === 'student') {
          console.log('Redirecting to /booking');
          navigate('/booking');
        } else if (appState.role === 'teacher') {
          console.log('Redirecting to /teacher');
          navigate('/teacher');
        }
      }
    }
  }, [isAuthenticated, user, navigate, setRole]);

  return (
    <div className="container">
       <h1>Welcome to My Dance Hall</h1>
       <h2>I'm a</h2>
      <div className="buttons">
        <button className="teacher-button" onClick={() => handleLogin('teacher')}>Teacher</button>
        <button className="student-button" onClick={() => handleLogin('student')}>Student</button>
      </div>
      {isAuthenticated && (
        <button className="logout-button" onClick={() => logout({ returnTo: window.location.origin })}>
          Logout
        </button>
      )}
    </div>
  );
};
export default Public;