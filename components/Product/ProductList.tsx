import { useQuery } from "@tanstack/react-query";
import SingleProduct from "./SingleProduct";

type Product = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch("/api?action=getProducts");
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = await response.json();
  return data.products;
};

const ProductList: React.FC = () => {
  const {
    data: products,
    isLoading,
    error,
  } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  if (isLoading) {
    return <div className="text-center p-6">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center p-6">Error: {error.message}</div>;
  }

  if (!products || products.length === 0) {
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
