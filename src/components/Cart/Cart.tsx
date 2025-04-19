import formatPrice from 'utils/formatPrice';
import CartProducts from './CartProducts';

import { useCart } from 'contexts/cart-context';
import {useUserContext } from 'contexts/user-context/UserContext'
import * as S from './style';

const Cart = () => {
  const { products, total, isOpen, openCart, closeCart } = useCart();

  const handleCheckout = () => {
    if (total.productQuantity) {
      alert(
        `Checkout - Subtotal: ${total.currencyFormat} ${formatPrice(
          total.totalPrice,
          total.currencyId
        )}`
      );
    } else {
      alert('Add some product in the cart!');
    }
  };

  const getCognitoLogoutUrl = () => {
    const domain = 'us-east-2st4razho3.auth.us-east-2.amazoncognito.com'; // Replace
    const clientId = '79cpf3l8hvreoksom87g2293bi'; // Replace
    const redirectUri = encodeURIComponent('http://localhost:3000'); // Your callback URL

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
