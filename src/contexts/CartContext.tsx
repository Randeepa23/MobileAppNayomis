import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem, Food } from '@/types';

interface CartContextType {
  cart: Cart;
  isInitialized: boolean;
  addToCart: (food: Food, quantity?: number) => void;
  removeFromCart: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // Calculate total whenever items change
  useEffect(() => {
    const newTotal = cart.items.reduce((sum, item) => 
      sum + (item.food.price * item.quantity), 0
    );
    if (newTotal !== cart.total) {
      setCart(prevCart => ({ ...prevCart, total: newTotal }));
    }
  }, [cart.items]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('nayomis_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        localStorage.removeItem('nayomis_cart');
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('nayomis_cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (food: Food, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        item => item.foodId === food._id
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        const newItems = [...prevCart.items];
        newItems[existingItemIndex].quantity += quantity;
        return { ...prevCart, items: newItems };
      } else {
        // Add new item
        const newItem: CartItem = {
          foodId: food._id,
          food,
          quantity,
        };
        return { ...prevCart, items: [...prevCart.items, newItem] };
      }
    });
  };

  const removeFromCart = (foodId: string) => {
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.filter(item => item.foodId !== foodId),
    }));
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.foodId === foodId ? { ...item, quantity } : item
      );
      return { ...prevCart, items: newItems };
    });
  };

  const clearCart = () => {
    setCart({ items: [], total: 0 });
  };

  const getTotalItems = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    cart,
    isInitialized,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
