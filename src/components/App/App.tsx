import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import AuthCallback from '../AuthCallback'; 
import Main from 'components/Main';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        {/* This is the route that handles the redirect from Cognito */}
        <Route path="/callback" element={<AuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;