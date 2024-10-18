import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Booking from './components/booking';
import Confirmation from './components/confirmation';
import Teacher from './components/teacher'; // Import the Teacher component
import Public from './components/public'; // Import the Public component
import Header from './components/header'; // Update this path if necessary
import ProtectedRoute from './components/ProtectedRoute';
import { RoleProvider } from './context/RoleContext'; // Corrected import path

function App() {
  return (
    <RoleProvider>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Public />} />
          <Route path="/booking" element={<ProtectedRoute component={Booking} allowedRoles={['student']} />} />
          <Route path="/confirmation" element={<ProtectedRoute component={Confirmation} allowedRoles={['student']} />} />
          <Route path="/teacher" element={<ProtectedRoute component={Teacher} allowedRoles={['teacher']} />} />
        </Routes>
      </div>
    </RoleProvider>
  );
}

export default App;
