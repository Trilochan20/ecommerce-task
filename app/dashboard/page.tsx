"use client";

import { useUser } from "@/components/Context/UserContext";
import { useState, useEffect } from "react";
import AllProductsTable from "@/components/Dashboard/AllProductsTable";

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
      <div className="text-xl">
        {user.role === "admin" ? <AllProductsTable /> : "You're a user"}
      </div>
    </div>
  );
};

export default DashboardPage;
