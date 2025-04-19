import formatPrice from 'utils/formatPrice';
import CartProducts from './CartProducts';

import { useCart } from 'contexts/cart-context';
import {useUserContext } from 'contexts/user-context/UserContext'
import * as S from './style';
import axios from 'axios';

const Cart = () => {
  const { tokenId } = useUserContext();
  const { products, total, isOpen, openCart, closeCart } = useCart();

  const postOrder = async () => {
    const url = `${process.env.REACT_APP_API_GATEWAY_ORIGIN}/orders`;
    const headers = {
      'Authorization': `Bearer ${tokenId}`,
      'Content-Type': 'application/json',
    };
    const body = {};

    try {
      return axios.post(url, body, { headers });
    } catch (error) {
      console.error('Error posting order:', error);
      throw error;
    }
  }

  const handleCheckout = () => {
    if (!total.productQuantity) {
      alert('Add some product in the cart!');
      return;
    }

    postOrder()
    .then((response) => {
      const orderId = response.data.orderId;
      console.log('Order posted successfully:', response);
      alert('Order placed successfully with ORDER ID:  ' + orderId);
    })
    .catch((error) => {
      console.error('Error posting order:', error);
      alert('Error posting order');
    });

  };

  const getCognitoLogoutUrl = () => {
    const domain = process.env.REACT_APP_COGNITO_DOMAIN;
    const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.REACT_APP_COGNITO_LOGOUT_REDIRECT_URI || '');

    return `https://${domain}/logout?client_id=${clientId}&logout_uri=${redirectUri}`;
  }

  const handleLogout = () => {
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    const logoutUrl = getCognitoLogoutUrl();
    window.location.href = logoutUrl; //

  }

  const handleToggleCart = (isOpen: boolean) => () =>
    isOpen ? closeCart() : openCart();

  return (

    <S.Container isOpen={isOpen}>
      <S.CartButton onClick={handleToggleCart(isOpen)}>
        {isOpen ? (
          <span>X</span>
        ) : (
          <S.CartIcon>
            <S.CartQuantity title="Products in cart quantity">
              {total.productQuantity}
            </S.CartQuantity>
          </S.CartIcon>
        )}
      </S.CartButton>

      {isOpen && (
        <S.CartContent>
          <S.CartContentHeader>
            <S.CartIcon large>
              <S.CartQuantity>{total.productQuantity}</S.CartQuantity>
            </S.CartIcon>
            <S.HeaderTitle>Cart</S.HeaderTitle>
          </S.CartContentHeader>

          <CartProducts products={products} />

          <S.CartFooter>
            <S.Sub>SUBTOTAL</S.Sub>
            <S.SubPrice>
              <S.SubPriceValue>{`${total.currencyFormat} ${formatPrice(
                total.totalPrice,
                total.currencyId
              )}`}</S.SubPriceValue>
              <S.SubPriceInstallment>
                {total.installments ? (
                  <span>
                    {`OR UP TO ${total.installments} x ${
                      total.currencyFormat
                    } ${formatPrice(
                      total.totalPrice / total.installments,
                      total.currencyId
                    )}`}
                  </span>
                ) : null}
              </S.SubPriceInstallment>
            </S.SubPrice>
            <S.CheckoutButton onClick={handleCheckout} autoFocus>
              Checkout
            </S.CheckoutButton>
            <S.LogoutButton onClick={handleLogout} autoFocus>
              Logout
            </S.LogoutButton>
          </S.CartFooter>

        </S.CartContent>
      )}
    </S.Container>
  );
};

export default Cart;
