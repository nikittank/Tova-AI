import React, { useState } from 'react';
import ConnectionPage from './pages/ConnectionPage';
import WorkspacePage from './pages/WorkspacePage';
import TovaAi from './pages/TovaAi';

function App() {
  const [currentConnection, setCurrentConnection] = useState(null);
  const [showConnection, setShowConnection] = useState(false);

  const handleConnect = (connection) => {
    setCurrentConnection(connection);
  };

  const handleDisconnect = () => {
    setCurrentConnection(null);
    setShowConnection(false);
  };

  return (
    <>
      {currentConnection ? (
        <WorkspacePage 
          currentConnection={currentConnection} 
          onDisconnect={handleDisconnect} 
        />
      ) : showConnection ? (
        <ConnectionPage onConnect={handleConnect} />
      ) : (
        <TovaAi onGetStarted={() => setShowConnection(true)} />
      )}
    </>
  );
}

export default App;