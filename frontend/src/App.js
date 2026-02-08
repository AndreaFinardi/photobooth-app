import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { isAuthenticated } from './utils/auth';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';

// Layout
import Layout from './components/Layout';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';

// Room Components
import CreateRoom from './components/Room/CreateRoom';
import JoinRoom from './components/Room/JoinRoom';
import RoomList from './components/Room/RoomList';
import RoomDetail from './components/Room/RoomDetail';

// Camera Components
import CameraComponent from './components/Camera/CameraComponent';
import PhotoGallery from './components/Camera/PhotoGallery';

// Library Components
import UserLibrary from './components/Library/UserLibrary';
import SharedLibrary from './components/Library/SharedLibrary';

// Pages
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
`;

// Private Route wrapper
const PrivateRoute = ({ children }) => {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    // Save attempted location for redirect after login
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" state={{ from: location }} />;
  }
  
  return children;
};

// Public Route wrapper (redirect if already logged in)
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check for redirect after login
    const redirectPath = localStorage.getItem('redirectAfterLogin');
    if (isAuthenticated() && redirectPath && redirectPath !== '/login') {
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    }
  }, [navigate]);

  return (
    <AppContainer>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <PublicRoute>
            <HomePage />
          </PublicRoute>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />

        {/* Private Routes with Layout */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Profile */}
          <Route path="/profile" element={<Profile />} />
          
          {/* Rooms */}
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/create-room" element={<CreateRoom />} />
          <Route path="/join-room" element={<JoinRoom />} />
          <Route path="/room/:roomId" element={<RoomDetail />} />
          <Route path="/room/:roomId/camera" element={<CameraComponent />} />
          <Route path="/room/:roomId/gallery" element={<PhotoGallery />} />
          
          {/* Camera */}
          <Route path="/camera" element={<CameraComponent />} />
          
          {/* Library */}
          <Route path="/library/:userId" element={<UserLibrary />} />
          <Route path="/shared-library" element={<SharedLibrary />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AppContainer>
  );
}

export default App;