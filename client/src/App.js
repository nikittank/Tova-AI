import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ConnectionPage from './pages/ConnectionPage';
import WorkspacePage from './pages/WorkspacePage';
import TovaAi from './pages/TovaAi';

// Wrapper component to handle navigation
function AppContent() {
  const [currentConnection, setCurrentConnection] = useState(null);
  const navigate = useNavigate();

  // Load connection from localStorage on app start
  useEffect(() => {
    const savedConnection = localStorage.getItem('currentConnection');
    if (savedConnection) {
      try {
        setCurrentConnection(JSON.parse(savedConnection));
      } catch (error) {
        console.error('Error loading saved connection:', error);
        localStorage.removeItem('currentConnection');
      }
    }
  }, []);

  const handleConnect = (connection) => {
    setCurrentConnection(connection);
    // Save connection to localStorage
    localStorage.setItem('currentConnection', JSON.stringify(connection));
    navigate('/workspace');
  };

  const handleDisconnect = () => {
    setCurrentConnection(null);
    localStorage.removeItem('currentConnection');
    navigate('/');
  };

  const handleGetStarted = () => {
    navigate('/connect');
  };

  return (
    <Routes>
      <Route path="/" element={<TovaAi onGetStarted={handleGetStarted} />} />
      <Route path="/connect" element={<ConnectionPage onConnect={handleConnect} />} />
      <Route
        path="/workspace"
        element={
          currentConnection ? (
            <WorkspacePage
              currentConnection={currentConnection}
              onDisconnect={handleDisconnect}
            />
          ) : (
            <Navigate to="/connect" replace />
          )
        }
      />
      {/* Redirect any unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;