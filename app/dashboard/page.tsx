"use client";

import { useUser } from "@/components/Context/UserContext";
import { useState, useEffect } from "react";
import AllProductsTable from "@/components/Dashboard/AllProductsTable";
import AllOrderList from "@/components/Dashboard/User/AllOrderList";
import DiscountOrder from "@/components/Dashboard/discountOrder";
import AllDiscountCodes from "@/components/Dashboard/AllDiscountCodes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardPage = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user state has been initialized
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">
          Please login to access the dashboard
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      {user.role === "admin" ? (
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="discount-order">Discount Order</TabsTrigger>
            <TabsTrigger value="discount-codes">Discount Codes</TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            <AllProductsTable />
          </TabsContent>
          <TabsContent value="discount-order">
            <DiscountOrder />
          </TabsContent>
          <TabsContent value="discount-codes">
            <AllDiscountCodes />
          </TabsContent>
        </Tabs>
      ) : (
        <AllOrderList />
      )}
    </div>
  );
};

export default DashboardPage;
