// App.js
import React from 'react';
import { AppRoutes } from './routes/AppRoutes';
import { useAuth } from './context/AuthContext';
import { Loader } from './components/common/Loader';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;