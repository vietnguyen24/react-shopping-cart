import axios from 'axios';

const API_URL = process.env.REACT_APP_API_GATEWAY_ORIGIN;

export const fetchCartItems = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/carts`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};