import { createContext, useContext, FC, useState, useEffect, useRef, useMemo } from 'react';
import { ICartProduct, ICartTotal } from 'models';
import apiClient from 'utils/apiClient';
import axios from 'axios'; // Keep this import for isAxiosError
import { useUserContext } from 'contexts/user-context/UserContext';

export interface ICartContext {
  isOpen: boolean;
  setIsOpen(state: boolean): void;
  products: ICartProduct[];
  setProducts(products: ICartProduct[]): void;
  total: ICartTotal;
  setTotal(total: ICartTotal): void;
  isLoading: boolean;
  error: string | null;
  fetchCartItems(): Promise<void>;
}

const CartContext = createContext<ICartContext | undefined>(undefined);
const useCartContext = (): ICartContext => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }

  return context;
};

const totalInitialValues = {
  productQuantity: 0,
  installments: 0,
  totalPrice: 0,
  currencyId: 'USD',
  currencyFormat: '$',
};

const CartProvider: FC = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<ICartProduct[]>([]);
  const [total, setTotal] = useState<ICartTotal>(totalInitialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedData = useRef(false);

  // Get user context
  const userContext = useUserContext();
  const tokenId = userContext ? userContext.tokenId : null;

  // Update cart total whenever products change
  useEffect(() => {
    updateCartTotal(products);
  }, [products]);

  // Fetch cart data when user logs in (tokenId becomes available)
  useEffect(() => {
    // Only fetch if we have a tokenId and haven't already loaded data
    if (tokenId && !hasLoadedData.current) {
      fetchCartItems();
    }
    // If tokenId is removed (user logs out), reset the flag
    if (!tokenId) {
      hasLoadedData.current = false;
      setProducts([]); // Clear products when user logs out
    }
  }, [tokenId]);

  // Calculate cart totals based on current products
  const updateCartTotal = (cartProducts: ICartProduct[]) => {
    const productQuantity = cartProducts.reduce(
      (sum, product) => sum + product.quantity,
      0
    );
    
    const totalPrice = cartProducts.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
    
    // Find the highest installment available
    const installments = 0
    
    setTotal({
      productQuantity,
      installments,
      totalPrice,
      currencyId: 'USD',
      currencyFormat: '$',
    });
  };

  const fetchCartItems = async (): Promise<void> => {
    if (!tokenId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching cart items...');
      // Use apiClient instead of axios - no need to specify Authorization header
      const response = await apiClient.get('/carts');

      // Check if we have a response with a structure {items: [], message: ""}
      if (response.data && 'items' in response.data) {
        // Check if there's an empty cart message
        if (response.data.items.length === 0 && response.data.message) {
          setProducts([]);
          // You could optionally store the message to display it
          setError(response.data.message || null);
        } else {
          // We have items, process them
          const cartItems: ICartProduct[] = response.data.items.map((item: any) => ({
            product_id: item.product_id,
            name: item.product_name || 'Product',
            price: item.price || 0,
            quantity: item.quantity || 1,
            image: item.product_image || ''
          }));

          setProducts(cartItems);
          // updateCartTotal is now called automatically via useEffect
          setError(null);
        }

        hasLoadedData.current = true;
        console.log('Cart data loaded successfully');
      } else {
        // Handle unexpected response format
        console.error('Unexpected API response format:', response.data);
        setError('Received an unexpected response format from the server.');
      }
    } catch (err: any) {
      console.error('Error fetching cart items:', err);

      // For 404 errors which might be "cart is empty" responses
      if (err?.response?.status === 404 && err?.response?.data?.message) {
        setProducts([]);
        setError(err.response.data.message);
        hasLoadedData.current = true;
      } else if (err?.message !== 'Token expired') {
        // Only set error if it's not a token expiration (which is handled by apiClient)
        setError('Failed to load your cart items. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Custom setIsOpen that also triggers data fetching when cart is opened
  const customSetIsOpen = (newIsOpen: boolean) => {
    // If opening the cart and we haven't loaded data yet, fetch cart items
    if (newIsOpen && tokenId && !hasLoadedData.current) {
      fetchCartItems();
    }
    setIsOpen(newIsOpen);
  };

  // Resets the hasLoadedData flag when tokenId changes
  useEffect(() => {
    hasLoadedData.current = false;
  }, [tokenId]);

  const CartContextValue: ICartContext = {
    isOpen,
    setIsOpen: customSetIsOpen,
    products,
    setProducts,
    total,
    setTotal,
    isLoading,
    error,
    fetchCartItems
  };

  return <CartContext.Provider value={CartContextValue} {...props} />;
};

export { CartProvider, useCartContext };