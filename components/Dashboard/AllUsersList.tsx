import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";

interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
}

interface Order {
  orderId: string;
  date: string;
  totalAmount: number;
  finalAmount: number;
}

const AllUsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api?action=getAllUsers");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError("Failed to fetch users. Please try again.");
      console.error(err);
    }
  };

  const fetchUserOrders = async (userId: string) => {
    try {
      const response = await fetch(
        `/api?action=getUserOrders&userId=${userId}`
      );
      if (!response.ok) throw new Error("Failed to fetch user orders");
      const data = await response.json();
      setUserOrders(data.orders || []);
      setSelectedUser(userId);
      setIsDialogOpen(true);
      setError(null);
    } catch (err) {
      setError("Failed to fetch user orders. Please try again.");
      console.error(err);
    }
  };

  return (
    <div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.userId}>
              <TableCell>
                <button
                  onClick={() => fetchUserOrders(user.userId)}
                  className="text-blue-500 hover:underline"
                >
                  {user.userId}
                </button>
              </TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Orders for User: {selectedUser}</DialogTitle>
          </DialogHeader>
          {userOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Final Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userOrders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>
                      {new Date(order.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>${order.finalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No orders found for this user.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllUsersList;
