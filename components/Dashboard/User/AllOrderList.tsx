"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/components/Context/UserContext";

type CartItem = {
  productId: string;
  quantity: number;
  name: string;
  price: number;
};

type Order = {
  orderId: string;
  date: string;
  totalAmount: number;
  finalAmount: number;
  items: CartItem[];
  appliedDiscountCode?: string;
  discountApplied: number;
};

type Product = {
  productId: string;
  name: string;
  price: number;
  image?: string;
};

const AllOrderList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    const fetchOrders = async () => {
      if (user && user.userId) {
        try {
          const response = await fetch(
            `/api?action=getUserOrders&userId=${user.userId}`
          );
          if (response.ok) {
            const data = await response.json();
            // console.log("Fetched orders:", data.orders);
            setOrders(data.orders);
          } else {
            console.error("Failed to fetch orders");
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [user]);

  const fetchProductDetails = async (
    productId: string
  ): Promise<Product | null> => {
    try {
      const response = await fetch(
        `/api?action=getProduct&productId=${productId}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.product;
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
    return null;
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Orders</h2>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <ul className="space-y-8">
          {orders.map((order) => (
            <li key={order.orderId} className="border p-4 rounded-lg">
              <p>
                <strong>Order ID:</strong> {order.orderId}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{order.totalAmount.toFixed(2)}
              </p>
              {order.appliedDiscountCode && (
                <p>
                  <strong>Discount Code:</strong> {order.appliedDiscountCode}
                </p>
              )}
              {order.discountApplied > 0 && (
                <p>
                  <strong>Discount Applied:</strong> ₹
                  {order.discountApplied.toFixed(2)}
                </p>
              )}
              <p>
                <strong>Final Amount:</strong> ₹{order.finalAmount.toFixed(2)}
              </p>
              <h3 className="font-semibold mt-2">Items:</h3>
              <ul className="list-disc pl-5">
                {order.items.map((item) => (
                  <li key={item.productId}>
                    {item.name} - Quantity: {item.quantity} - Price: ₹
                    {item.price?.toFixed(2)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllOrderList;
