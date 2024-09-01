"use client";

import { useEffect, useState } from "react";
import SingleProduct from "./SingleProduct";

type Product = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Fetching products...");
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api?action=getProducts");
        console.log("Fetch response:", response);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        console.log("Fetched products:", data);
        setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return <div className="text-center p-6">Loading products...</div>;
  }

  if (products.length === 0) {
    return <div className="text-center p-6">No products available.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto justify-center grid grid-cols-auto xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {products.map((product) => (
        <SingleProduct key={product.productId} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
