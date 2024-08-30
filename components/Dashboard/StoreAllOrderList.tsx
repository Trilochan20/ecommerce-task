import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  orderedPrice: number;
  price: number;
}

interface Order {
  orderId: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  totalAmount: number;
  discountApplied: number;
  finalAmount: number;
  date: string;
  appliedDiscountCode?: string;
}

const OrderDetailsModal: React.FC<{ order: Order }> = ({ order }) => (
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle className="text-wrap">
        Order id - {order.orderId}
      </DialogTitle>
    </DialogHeader>
    <div className="mt-4">
      <p>
        <strong>User:</strong> {order.userName} ({order.userId})
      </p>
      <p>
        <strong>Date:</strong> {new Date(order.date).toLocaleString()}
      </p>
      <p>
        <strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}
      </p>
      <p>
        <strong>Discount Applied:</strong> ${order.discountApplied.toFixed(2)}
      </p>
      <p>
        <strong>Final Amount:</strong> ${order.finalAmount.toFixed(2)}
      </p>
      <p>
        <strong>Discount Code:</strong> {order.appliedDiscountCode || "N/A"}
      </p>

      <h3 className="font-bold mt-4 mb-2">Order Items:</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Ordered Price</TableHead>
            <TableHead>Current Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item) => (
            <TableRow key={item.productId}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>${item.orderedPrice.toFixed(2)}</TableCell>
              <TableCell>${item.price.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </DialogContent>
);

const StoreAllOrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api?action=getAllOrders");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();
        setOrders(data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div>Loading orders...</div>;
  }

  if (orders.length === 0) {
    return <div>No orders found.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">All Store Orders</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>User Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Discount Applied</TableHead>
            <TableHead>Final Amount</TableHead>
            <TableHead>Discount Code</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.orderId}>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-blue-600 hover:underline">
                      {order.orderId}
                    </button>
                  </DialogTrigger>
                  <OrderDetailsModal order={order} />
                </Dialog>
              </TableCell>
              <TableCell>{order.userId}</TableCell>
              <TableCell>{order.userName}</TableCell>
              <TableCell>{new Date(order.date).toLocaleString()}</TableCell>
              <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
              <TableCell>${order.discountApplied.toFixed(2)}</TableCell>
              <TableCell>${order.finalAmount.toFixed(2)}</TableCell>
              <TableCell>{order.appliedDiscountCode || "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StoreAllOrderList;
