import axios from 'axios';
import { IGetProductsResponse } from 'models';

export const getProducts = async (categories: string[] = [], searchTerm?: string) => {
  try {
    // Build the query params
    const params = new URLSearchParams();
    
    if (categories.length > 0) {
      params.append('category', categories.join(','));
    }
    
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    const queryString = params.toString();
    const url = `${process.env.REACT_APP_API_GATEWAY_ORIGIN}/products${queryString ? `?${queryString}` : ''}`;
    
    const res = await axios.get(url);
    console.log("products:", res.data.body);
    return res.data.body;
  } catch(err) {
    console.log(err);
    return [];
  }
};

export const generateParams = (categories: string[], searchTerm?: string) => {
  const params = new URLSearchParams();
  
  if (categories.length > 0) {
    params.append('category', categories.join(','));
  }
  
  if (searchTerm) {
    params.append('search', searchTerm);
  }
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

