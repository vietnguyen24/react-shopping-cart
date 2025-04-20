import formatPrice from 'utils/formatPrice';
import { ICartProduct } from 'models';
import { useCart } from 'contexts/cart-context';
import { useUserContext } from 'contexts/user-context/UserContext';
import axios from 'axios';
import * as S from './style';

interface IProps {
  product: ICartProduct;
}

const CartProduct = ({ product }: IProps) => {
  const { removeProduct, increaseProductQuantity, decreaseProductQuantity } = useCart();
  const { tokenId } = useUserContext();
  
  const {
    product_id,
    name,
    price,
    quantity,
    image
  } = product;

  const handleRemoveProduct = async () => {
    try {
      // Call the DELETE API to remove the product
      await axios.delete(
        `${process.env.REACT_APP_API_GATEWAY_ORIGIN}/carts`,
        {
          headers: {
            Authorization: `Bearer ${tokenId}`,
            'Content-Type': 'application/json'
          },
          data: {
            product_id: product_id
          }
        }
      );
      
      // Remove product from local state
      removeProduct(product);
    } catch (error) {
      console.error('Error removing product:', error);
      // Fall back to local state update if API fails
      removeProduct(product);
    }
  };

  const handleIncreaseProductQuantity = async () => {
    try {
      // Call the PUT API to update quantity
      await axios.put(
        `${process.env.REACT_APP_API_GATEWAY_ORIGIN}/carts`,
        { 
          product_id: product_id,
          new_quantity: quantity + 1 
        },
        {
          headers: {
            Authorization: `Bearer ${tokenId}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update product in local state
      increaseProductQuantity(product);
    } catch (error) {
      console.error('Error increasing quantity:', error);
      // Fall back to local state update if API fails
      increaseProductQuantity(product);
    }
  };

  const handleDecreaseProductQuantity = async () => {
    if (quantity <= 1) return;
    
    try {
      // Call the PUT API to update quantity
      await axios.put(
        `${process.env.REACT_APP_API_GATEWAY_ORIGIN}/carts`,
        { 
          product_id: product_id,
          new_quantity: quantity - 1 
        },
        {
          headers: {
            Authorization: `Bearer ${tokenId}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update product in local state
      decreaseProductQuantity(product);
    } catch (error) {
      console.error('Error decreasing quantity:', error);
      // Fall back to local state update if API fails
      decreaseProductQuantity(product);
    }
  };

  // Use image from API if available, otherwise fall back to local image
  const productImage = `${process.env.REACT_APP_IMAGE_ORIGIN}/${image}` || `${process.env.REACT_APP_IMAGE_ORIGIN}/${product_id}-1-cart.webp`;
    return (
    <S.Container>
      <S.DeleteButton
        onClick={handleRemoveProduct}
        title="remove product from cart"
      />
      <S.Image
        src={productImage}
        alt={name}
        // onError={(e) => {
        //   // If the API image fails to load, fall back to local image
        //   e.currentTarget.src = `${process.env.REACT_APP_IMAGE_ORIGIN}/1-cart.webp`;
        // }}
      />
      <S.Details>
        <S.Title>{name}</S.Title>
        <S.Desc>
          Quantity: {quantity}
        </S.Desc>
      </S.Details>
      <S.Price>
        <p>{formatPrice(price, 'USD')}</p>
        <div>
          <S.ChangeQuantity
            onClick={handleDecreaseProductQuantity}
            disabled={quantity <= 1}
          >
            -
          </S.ChangeQuantity>
          <S.ChangeQuantity onClick={handleIncreaseProductQuantity}>
            +
          </S.ChangeQuantity>
        </div>
      </S.Price>
    </S.Container>
  );
};

export default CartProduct;