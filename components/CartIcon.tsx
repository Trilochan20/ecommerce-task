import React from "react";
import { FaShoppingCart } from "react-icons/fa";

interface CartIconProps {
  itemCount?: number;
}

const CartIcon: React.FC<CartIconProps> = ({ itemCount = 0 }) => {
  return (
    <button className="relative p-2 text-gray-600 hover:text-emerald-500 transition-colors duration-200">
      <FaShoppingCart className="w-6 h-6" />
      <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
        {itemCount}
      </span>
    </button>
  );
};

export default CartIcon;
