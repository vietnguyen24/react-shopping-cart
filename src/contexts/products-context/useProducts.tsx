import { useCallback } from 'react';

import { useProductsContext } from './ProductsContextProvider';
import { IProduct } from 'models';
import { getProducts } from 'services/products';

const useProducts = () => {
  const {
    isFetching,
    products,
    filters,
    fetchProducts,
    filterProducts,
    searchProducts
  } = useProductsContext();

  return {
    isFetching,
    products,
    filters,
    fetchProducts,
    filterProducts,
    searchProducts
  };
};

export default useProducts;
