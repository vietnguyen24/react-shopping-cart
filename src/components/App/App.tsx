import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AuthCallback from '../AuthCallback';
import Main from 'components/Main';
import TokenExpirationHandler from '../TokenExpirationHandler/TokenExpirationHandler';
import { ProtectedRoute } from '../ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        {/* This is the route that handles the redirect from Cognito */}
        <Route path="/callback" element={<AuthCallback />} />
        
        {/* Protected routes example */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <div>Protected Profile Page</div>
          </ProtectedRoute>
        } />
        
        {/* Add other routes as needed */}
      </Routes>
      <TokenExpirationHandler />
    </Router>
  );
}

export default App;