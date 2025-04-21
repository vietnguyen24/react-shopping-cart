import { createContext, FC, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { IProduct } from 'models';

export interface IProductsContext {
  isFetching: boolean;
  products: IProduct[];
  filters: string[];
  fetchProducts: () => void;
  filterProducts: (filters: string[]) => void;
  searchProducts: (searchTerm: string) => void;
}

const ProductsContext = createContext<IProductsContext | undefined>(undefined);

export const useProductsContext = (): IProductsContext => {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error(
      'useProductsContext must be used within a ProductsProvider'
    );
  }

  return context;
};

const ProductsProvider: FC = ({ children }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [filters, setFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const initialFetchDone = useRef(false);
  const fetchingInProgress = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userInitiatedAction = useRef(false);
  
  // A simple fetch function that doesn't depend on filters or searchTerm
  const fetchData = useCallback(async (activeFilters: string[], activeSearchTerm: string) => {
    // Prevent concurrent API calls
    if (fetchingInProgress.current) {
      return;
    }
    
    fetchingInProgress.current = true;
    setIsFetching(true);
    
    try {
      // Build the query params
      const params = new URLSearchParams();
      
      if (activeFilters.length > 0) {
        params.append('category', activeFilters.join(','));
      }
      
      if (activeSearchTerm) {
        params.append('search', activeSearchTerm);
      }
      
      const queryString = params.toString();
      const url = `${process.env.REACT_APP_API_GATEWAY_ORIGIN}/products${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching products with URL:', url);
      const response = await axios.get(url);
      setProducts(response.data.body || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsFetching(false);
      fetchingInProgress.current = false;
    }
  }, []);

  // Initial fetch of products - only used for the first load
  // Remove dependencies on filters and searchTerm to prevent unnecessary rerenders
  const fetchProducts = useCallback(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchData([], ''); // Initial fetch with no filters or search term
    }
  }, [fetchData]);

  // Function to filter products by categories - only runs when user selects a category
  const filterProducts = useCallback((newFilters: string[]) => {
    // Cancel any pending fetch
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Set this flag to indicate a user-initiated action
    userInitiatedAction.current = true;
    
    setFilters(newFilters);
    
    // Debounce the actual API call
    fetchTimeoutRef.current = setTimeout(() => {
      fetchData(newFilters, searchTerm);
    }, 300);
  }, [fetchData, searchTerm]);

  // Function to search products by name - only runs when user types in search
  const searchProducts = useCallback((term: string) => {
    // Cancel any pending fetch
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Set this flag to indicate a user-initiated action
    userInitiatedAction.current = true;
    
    setSearchTerm(term);
    
    // Debounce the actual API call
    fetchTimeoutRef.current = setTimeout(() => {
      fetchData(filters, term);
    }, 300);
  }, [fetchData, filters]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const ProductContextValue: IProductsContext = {
    isFetching,
    products,
    filters,
    fetchProducts,
    filterProducts,
    searchProducts
  };

  return (
    <ProductsContext.Provider value={ProductContextValue}>
      {children}
    </ProductsContext.Provider>
  );
};

export { ProductsProvider };
