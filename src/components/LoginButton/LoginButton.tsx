

import * as S from './style';

const Cart = () => {


  const handleLogin = () => {
    const loginUrl = getCognitoLoginUrl();
    window.location.href = loginUrl; //
  };
  const getCognitoLoginUrl = () => {
    const domain = 'us-east-2st4razho3.auth.us-east-2.amazoncognito.com'; // Replace
    const clientId = '79cpf3l8hvreoksom87g2293bi'; // Replace
    const redirectUri = encodeURIComponent('http://localhost:3000/callback'); // Your callback URL
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
