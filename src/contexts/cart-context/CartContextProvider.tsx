import { createContext, useContext, FC, useState, useEffect, useRef } from 'react';
import { ICartProduct, ICartTotal } from 'models';
import axios from 'axios';
import { useUserContext } from 'contexts/user-context/UserContext';

export interface ICartContext {
  isOpen: boolean;
  setIsOpen(state: boolean): void;
  products: ICartProduct[];
  setProducts(products: ICartProduct[]): void;
  total: ICartTotal;
  setTotal(products: any): void;
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
  
  const fetchCartItems = async (): Promise<void> => {
    if (!tokenId) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_GATEWAY_ORIGIN}/carts`,
        {
          headers: {
            Authorization: `Bearer ${tokenId}`
          }
        }
      );
      
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
            product_id: item.productId,
            name: item.name || 'Product',
            price: item.price || 0,
            quantity: item.quantity || 1,
            description: item.description || '',
            category: item.category || '',
            image: item.image || ''
          }));
          
          setProducts(cartItems);
          setError(null);
        }
        
        hasLoadedData.current = true;
      } else {
        // Handle unexpected response format
        console.error('Unexpected API response format:', response.data);
        setError('Received an unexpected response format from the server.');
      }
    } catch (err) {
      console.error('Error fetching cart items:', err);
      
      // Check if this is a 404 "cart is empty" response
      if (axios.isAxiosError(err) && err.response?.status === 404 && 
          err.response?.data?.message) {
        setProducts([]);
        // You could set the error to display the message from the backend
        setError(err.response.data.message);
        hasLoadedData.current = true;
      } else {
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