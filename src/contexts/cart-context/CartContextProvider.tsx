import { createContext, useContext, FC, useState, useEffect } from 'react';
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
  
  const { tokenId } = useUserContext();
  
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
      
      // Transform API response to match your ICartProduct interface
      const cartItems: ICartProduct[] = response.data.map((item: any) => ({
        id: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        // Add other required fields from your ICartProduct interface
      }));
      
      setProducts(cartItems);
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setError('Failed to load your cart items. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch cart items when the component mounts and when tokenId changes
  useEffect(() => {
    if (tokenId) {
      fetchCartItems();
    }
  }, [tokenId]);

  const CartContextValue: ICartContext = {
    isOpen,
    setIsOpen,
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