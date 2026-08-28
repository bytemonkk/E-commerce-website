import { createContext, useReducer, useEffect, useMemo } from "react";

export const CartContext = createContext(null);

const STORAGE_KEY = "cart_items";

const loadInitialState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.find((i) => i.product === action.payload.product);
      if (existing) {
        return state.map((i) =>
          i.product === action.payload.product
            ? { ...i, quantity: i.quantity + action.payload.quantity }
            : i
        );
      }
      return [...state, action.payload];
    }
    case "UPDATE_QTY":
      return state.map((i) =>
        i.product === action.payload.product ? { ...i, quantity: action.payload.quantity } : i
      );
    case "REMOVE_ITEM":
      return state.filter((i) => i.product !== action.payload.product);
    case "CLEAR_CART":
      return [];
    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        product: product._id,
        name: product.name,
        price: product.discountPrice ?? product.price,
        image: product.images?.[0]?.url,
        stock: product.stock,
        quantity,
      },
    });
  };

  const updateQuantity = (productId, quantity) =>
    dispatch({ type: "UPDATE_QTY", payload: { product: productId, quantity } });

  const removeFromCart = (productId) => dispatch({ type: "REMOVE_ITEM", payload: { product: productId } });

  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const { itemsCount, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.itemsCount += item.quantity;
        acc.subtotal += item.price * item.quantity;
        return acc;
      },
      { itemsCount: 0, subtotal: 0 }
    );
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, itemsCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};
