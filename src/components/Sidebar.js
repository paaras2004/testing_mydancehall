import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './Sidebar.css'; // Import the CSS file

const Sidebar = ({ items, setActiveSection }) => {
  const { logout } = useAuth0();

  return (
    <div className="sidebar">
      <div className="logo text-center">
        <div style={{ width: '144px', height: '50px', backgroundColor: '#ccc', margin: '0 auto' }}>Logo</div>
      </div>
      <ul className="side-nav list-unstyled">
        {items.map((item, index) => (
          <li key={index} className="side-nav-item">
            <button className="side-nav-link" onClick={() => setActiveSection(item.section)}>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="sidebar-bottom">
        <button className="side-nav-link" onClick={() => logout({ returnTo: window.location.origin })}>Logout</button>
      </div>
    </div>
  );
};

export default Sidebar;