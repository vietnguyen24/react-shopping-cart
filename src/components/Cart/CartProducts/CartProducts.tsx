import { ICartProduct } from 'models';
import CartProduct from './CartProduct';
import { useCartContext } from 'contexts/cart-context/CartContextProvider';

import * as S from './style';

interface IProps {
  products: ICartProduct[];
}

const CartProducts = ({ products }: IProps) => {
  const { error } = useCartContext();

  // If we have an error message from the API (like "Your cart is empty")
  if (error && products.length === 0) {
    return (
      <S.Container>
        <S.CartProductsEmpty>
          {error}
          <br />
          <span style={{ fontSize: '14px', marginTop: '10px' }}>
            Browse our collection and add some products!
          </span>
        </S.CartProductsEmpty>
      </S.Container>
    );
  }

  return (
    <S.Container>
      {products?.length ? (
        products.map((p, index) => (
          <CartProduct 
            product={p} 
            key={p.product_id ? `product-${p.product_id}` : `product-index-${index}`} 
          />
        ))
      ) : (
        <S.CartProductsEmpty>
          Add some products in the cart <br />
        </S.CartProductsEmpty>
      )}
    </S.Container>
  );
};

export default CartProducts;