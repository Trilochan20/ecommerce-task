"use client";
import { MdShoppingCart } from "react-icons/md";
import { useState } from "react";
import Image from "next/image";
import { useCart } from "../Context/CartContext";
import { toast } from "@/components/ui/use-toast";

type Product = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

interface SingleProductProps {
  product: Product;
}

const SingleProduct: React.FC<SingleProductProps> = ({ product }) => {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setSelectedQuantity(Math.min(Math.max(1, value), product.quantity));
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.productId,
      name: product.name,
      quantity: selectedQuantity,
      price: product.price,
      image: product.image,
    });
    toast({
      title: "Added to cart",
      description: `${selectedQuantity} ${product.name} added to your cart`,
      duration: 2000,
    });
  };

  return (
    <div className="w-full max-w-sm rounded bg-white shadow-xl p-5 text-gray-800 relative">
      <div className="relative h-48 mb-4">
        <Image
          src={product.image || "https://via.placeholder.com/300"}
          className="w-full h-full object-cover"
          alt={product.name}
          width={300}
          height={300}
        />
      </div>
      <div>
        <h1 className="font-bold uppercase text-xl mb-2">{product.name}</h1>

        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-2xl leading-none align-baseline">₹</span>
            <span className="font-bold text-3xl leading-none align-baseline">
              {product.price.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center">
            <label htmlFor={`quantity-${product.productId}`} className="mr-2">
              Quantity:
            </label>
            <input
              type="number"
              id={`quantity-${product.productId}`}
              min="1"
              max={product.quantity}
              value={selectedQuantity}
              onChange={handleQuantityChange}
              className="w-16 px-2 py-1 border rounded"
            />
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          className="w-full bg-emerald-300 opacity-75 hover:opacity-100 text-emerald-900 hover:text-gray-900 rounded-full px-4 py-2 font-semibold text-sm"
        >
          <MdShoppingCart className="inline -ml-1 mr-2" /> ADD TO CART
        </button>
      </div>
    </div>
  );
};

export default SingleProduct;
