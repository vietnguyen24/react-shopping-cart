// src/components/AuthCallback.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import queryString from 'query-string';
import { useUserContext } from 'contexts/user-context/UserContext';
// Optional: If you use a Context for auth state
// import { useAuth } from '../context/AuthContext';


function AuthCallback() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const {tokenId, setTokenId} = useUserContext();
  useEffect(() => {
    // --- Try Parsing Hash Fragment (Implicit Grant: response_type=token) ---
    const hash = window.location.hash.substring(1); // Remove leading '#'
    const parsedHash = queryString.parse(hash);

    const id_token = Array.isArray(parsedHash.id_token) ? parsedHash.id_token[0] : parsedHash.id_token;
    const access_token = Array.isArray(parsedHash.access_token) ? parsedHash.access_token[0] : parsedHash.access_token;
    const expires_in = Array.isArray(parsedHash.expires_in) ? parsedHash.expires_in[0] : parsedHash.expires_in;
    const token_type = Array.isArray(parsedHash.token_type) ? parsedHash.token_type[0] : parsedHash.token_type;
    const hashError = parsedHash.error;
    const hashErrorDescription = parsedHash.error_description;

    if (hashError) {
      console.error('Error from Cognito (Hash):', hashError, hashErrorDescription);
    //   setError(`Login failed: ${hashErrorDescription || hashError}`);
      setIsLoading(false);
      // You might want to redirect to login or show error inline
      // navigate('/login?error=' + encodeURIComponent(hashError));
      return; // Stop processing
    }

    if (id_token && access_token) {
      console.log('Received Tokens via Hash (Implicit Grant)');
      console.log('ID Token:', id_token ? 'Received' : 'Not Received'); // Avoid logging token directly in production
      console.log('Access Token:', access_token ? 'Received' : 'Not Received');
      console.log('Expires In (seconds):', expires_in);
      console.log('Token Type:', token_type);

      // **SECURITY NOTE:** Storing tokens in localStorage is convenient but vulnerable to XSS.
      // Consider HttpOnly cookies (requires backend cooperation) or storing in memory
      // if your security requirements demand it. For simplicity, we use localStorage here.

      // **VALIDATION NOTE:** You SHOULD validate the ID token's signature, issuer,
      // audience, expiry, and nonce (if used) in a real application.
      // This often requires a backend or specialized libraries.

      // Store tokens
      localStorage.setItem('id_token', id_token);
      localStorage.setItem('access_token', access_token);
      // store token in context
      setTokenId(id_token);
      if (expires_in) {
        const expiryTime = new Date().getTime() + parseInt(Array.isArray(expires_in) ? expires_in[0] || '0' : expires_in, 10) * 1000;
        localStorage.setItem('token_expiry', expiryTime.toString());
      }
      localStorage.setItem('token_type', token_type || 'Bearer');

      // Update global application state (e.g., using Context API)
      // login({ id_token, access_token /*, potentially decode id_token for user info */ });
      console.log('Tokens stored. Simulating login state update.');

      // Clear the hash from the URL for cleanliness and security
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

      // Redirect user to the main application area
      navigate('/'); // Or desired post-login route

      return; // Successfully handled implicit grant
    }

    // --- If no tokens in hash, Try Parsing Query String (Authorization Code Grant: response_type=code) ---
    const parsedQuery = queryString.parse(window.location.search);
    const code = parsedQuery.code;
    const queryError = parsedQuery.error;
    const queryErrorDescription = parsedQuery.error_description;
    // const state = parsedQuery.state; // Optional: Check if state matches what you sent

    if (queryError) {
      console.error('Error from Cognito (Query):', queryError, queryErrorDescription);
    //   setError(`Login failed: ${queryErrorDescription || queryError}`);
      setIsLoading(false);
      // navigate('/login?error=' + encodeURIComponent(queryError));
      return; // Stop processing
    }

    if (code) {
      console.log('Received Authorization Code via Query String:', code);
      setIsLoading(false); // Or keep loading while backend talks to Cognito

      // **NEXT STEPS (Authorization Code Grant):**
      // 1. You CANNOT securely exchange this code for tokens directly in the frontend
      //    if your App Client has a secret or if you aren't using PKCE correctly with Amplify/SDK.
      // 2. Typically, send this `code` to your backend server.
      // 3. Your backend server securely exchanges the `code` (and potentially client secret)
      //    with Cognito's `/oauth2/token` endpoint to get the ID, Access, and Refresh tokens.
      // 4. Your backend then likely establishes a session with the frontend (e.g., using
      //    an HttpOnly cookie) or returns the tokens if appropriate for your architecture.

      // Placeholder: Indicate that backend processing is needed
    //   setError('Authorization code received. Backend processing required.');
      // Example: You might redirect to a temporary "authenticating" page or call a backend API
      // callBackendToExchangeCode(code);
      // navigate('/authenticating');

      return; // Stop processing here
    }

    // --- If neither tokens nor code found, and no specific error ---
    if (!isLoading && !error) { // Check if we haven't already hit an error or success path
        console.error('Callback received without tokens, code, or a specific error parameter.');
        // setError('Login process failed. Invalid callback state or unexpected response.');
    }
    setIsLoading(false); // Ensure loading stops if we fall through

  }, [navigate /*, login */]); // Add dependencies like context functions if used

  // Render Loading or Error state
  if (isLoading) {
    return <div>Processing login...</div>;
  }

  if (error) {
    // Provide a link back to login or home
    return (
      <div>
        <h2>Login Error</h2>
        <p>There was a problem logging you in:</p>
        <pre style={{ color: 'red', background: '#f0f0f0', padding: '10px' }}>{error}</pre>
        <Link to="/">Go to Home</Link>
        {/* Or provide a link to retry login */}
      </div>
    );
  }

  // Should typically have redirected if successful, or shown error.
  // This state might be reached briefly or if something unexpected happened.
  return <div>Callback processing complete. Redirecting...</div>;
}

export default AuthCallback;