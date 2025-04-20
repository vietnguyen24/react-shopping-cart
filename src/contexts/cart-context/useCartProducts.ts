import { useCartContext } from './CartContextProvider';
import useCartTotal from './useCartTotal';
import { ICartProduct } from 'models';
import axios from 'axios';
import { useUserContext } from 'contexts/user-context/UserContext';

const useCartProducts = () => {
  const { products, setProducts, fetchCartItems } = useCartContext();
  const { updateCartTotal } = useCartTotal();
  const { tokenId } = useUserContext();

  const updateQuantitySafely = (
    currentProduct: ICartProduct,
    targetProduct: ICartProduct,
    quantity: number
  ): ICartProduct => {
    if (currentProduct.product_id === targetProduct.product_id) {
      return Object.assign({
        ...currentProduct,
        quantity: currentProduct.quantity + quantity,
      });
    } else {
      return currentProduct;
    }
  };

  const addProduct = async (newProduct: ICartProduct) => {
    if (!tokenId) {
      console.error('Cannot add product: Not authenticated');
      return;
    }

    try {
      // Prepare the request payload
      const payload = {
        product_id: newProduct.product_id,
        product_name: newProduct.name,
        quantity: newProduct.quantity || 1,
        product_image: newProduct.image || '',
        price: newProduct.price || 0.0,
      };

      // Make the API call to add the product to the cart
      await axios.post(
        `${process.env.REACT_APP_API_GATEWAY_ORIGIN}/carts`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${tokenId}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // After successful API call, fetch the updated cart
      // This ensures we have the latest cart state from the server
      await fetchCartItems();
      
      // Note: We're not manually updating the local state here
      // because fetchCartItems will refresh the entire cart
      
    } catch (error) {
      console.error('Error adding product to cart:', error);
      
      // If the API call fails, we can fall back to local state updates
      let updatedProducts;
      const isProductAlreadyInCart = products.some(
        (product) => newProduct.product_id === product.product_id
      );

      if (isProductAlreadyInCart) {
        updatedProducts = products.map((product) => {
          return updateQuantitySafely(product, newProduct, newProduct.quantity || 1);
        });
      } else {
        updatedProducts = [...products, newProduct];
      }

      setProducts(updatedProducts);
      updateCartTotal(updatedProducts);
    }
  };

  // Keep the existing functions for local state manipulation
  const removeProduct = (productToRemove: ICartProduct) => {
    const updatedProducts = products.filter(
      (product) => product.product_id !== productToRemove.product_id
    );

    setProducts(updatedProducts);
    updateCartTotal(updatedProducts);
  };

  const increaseProductQuantity = (productToIncrease: ICartProduct) => {
    const updatedProducts = products.map((product) => {
      return updateQuantitySafely(product, productToIncrease, 1);
    });

    setProducts(updatedProducts);
    updateCartTotal(updatedProducts);
  };

  const decreaseProductQuantity = (productToDecrease: ICartProduct) => {
    const updatedProducts = products.map((product) => {
      return updateQuantitySafely(product, productToDecrease, -1);
    });

    setProducts(updatedProducts);
    updateCartTotal(updatedProducts);
  };

  return {
    products,
    addProduct,
    removeProduct,
    increaseProductQuantity,
    decreaseProductQuantity,
  };
};

export default useCartProducts;