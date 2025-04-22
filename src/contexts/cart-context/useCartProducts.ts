import { useCartContext } from './CartContextProvider';
import useCartTotal from './useCartTotal';
import { ICartProduct } from 'models';
import axios from 'axios';
import { useUserContext } from 'contexts/user-context/UserContext';
import apiClient from 'utils/apiClient';
import { useAuthCheck } from 'hooks/useAuthCheck';

const useCartProducts = () => {
  const { products, setProducts, fetchCartItems } = useCartContext();
  const { updateCartTotal } = useCartTotal();
  const { tokenId } = useUserContext();
  // Call the hook at the top level of your custom hook
  const { checkAuth } = useAuthCheck();

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
    // Use the checkAuth function that was already obtained at the top level
    checkAuth(async () => {
      try {
        // Prepare the request payload
        const payload = {
          product_id: newProduct.product_id,
          product_name: newProduct.name,
          quantity: newProduct.quantity || 1,
          product_image: newProduct.image || '',
          price: newProduct.price || 0.0,
        };

        // Make the API call to add the product to the cart using apiClient
        await apiClient.post('/carts', payload);

        // After successful API call, fetch the updated cart
        await fetchCartItems();
        
      } catch (error) {
        console.error('Error adding product to cart:', error);
        
        // If the API call fails, fall back to local state updates
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
    });
  };

  // Update removeProduct to use checkAuth
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