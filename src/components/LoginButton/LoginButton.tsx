

import * as S from './style';

const Cart = () => {


  const handleLogin = () => {
    const loginUrl = getCognitoLoginUrl();
    window.location.href = loginUrl; //
  };
  const getCognitoLoginUrl = () => {
    const domain = process.env.REACT_APP_COGNITO_DOMAIN;
    const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.REACT_APP_COGNITO_LOGIN_REDIRECT_URI ?? (() => { throw new Error("REACT_APP_COGNITO_LOGIN_REDIRECT_URI is not defined"); })());
    const responseType = 'token'; // Use 'token' for Implicit Grant, 'code' for Auth Code Grant
    const scope = 'email+openid+phone'; // Adjust scopes

    return `https://${domain}/oauth2/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };


  return (

    <S.Container isOpen={false}>
      <S.CartButton onClick={handleLogin}>
          <span>Login</span>
       
      </S.CartButton>
     
    </S.Container>
  );
};

export default Cart;
