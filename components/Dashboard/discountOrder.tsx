"use client";

import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@/components/Context/UserContext";

const AdminSettings = () => {
  const { user } = useUser();
  const [discountOrder, setDiscountOrder] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDiscountOrder = async () => {
      try {
        const response = await fetch("/api?action=getDiscountOrder");
        const data = await response.json();
        if (response.ok) {
          setDiscountOrder(data.discountOrder.toString());
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        toast({
          title: "Failed to fetch current setting",
          description:
            error instanceof Error ? error.message : "An error occurred",
          duration: 3000,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscountOrder();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== "admin") {
      toast({
        title: "Unauthorized",
        description: "Only admins can change this setting.",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api?action=setDiscountOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.userId,
          discountOrder: parseInt(discountOrder),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Setting updated",
          description: data.message,
          duration: 2000,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while updating the setting",
        duration: 3000,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>
      {isLoading ? (
        <p>Loading current setting...</p>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md">
          <div className="mb-4">
            <label htmlFor="discountOrder" className="block mb-2">
              Set product order count for discount code generation:
            </label>
            <input
              type="number"
              id="discountOrder"
              value={discountOrder}
              onChange={(e) => setDiscountOrder(e.target.value)}
              className="w-full p-2 border rounded"
              min="1"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Update Setting
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminSettings;
