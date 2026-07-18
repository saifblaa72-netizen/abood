import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total_amount: 0 });
  const [sessionId, setSessionId] = useState(localStorage.getItem('cartSession'));
  const { token } = useAuth();

  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36)}`;
      setSessionId(newSessionId);
      localStorage.setItem('cartSession', newSessionId);
    }
    fetchCart();
  }, [token, sessionId]);

  const fetchCart = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = token ? {} : { session_id: sessionId };
      const response = await axios.get(`${API}/cart`, { headers, params });
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (item) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = token ? {} : { session_id: sessionId };
      await axios.post(`${API}/cart`, item, { headers, params });
      await fetchCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (productId, color, size, quantity) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = token ? { color, size, quantity } : { session_id: sessionId, color, size, quantity };
      await axios.put(`${API}/cart/${productId}`, null, { headers, params });
      await fetchCart();
    } catch (error) {
      console.error('Failed to update cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = token ? {} : { session_id: sessionId };
      await axios.delete(`${API}/cart`, { headers, params });
      await fetchCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, cartCount, addToCart, updateCartItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
