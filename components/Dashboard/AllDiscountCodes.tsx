"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/components/Context/UserContext";

interface DiscountCode {
  code: string;
  discount: number;
  isAvailable: boolean;
}

const AllDiscountCodes: React.FC = () => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchDiscountCodes = async () => {
      try {
        const response = await fetch("/api?action=getDiscountCodes");
        if (response.ok) {
          const data = await response.json();
          setDiscountCodes(data.discountCodes);
        } else {
          console.error("Failed to fetch discount codes");
        }
      } catch (error) {
        console.error("Error fetching discount codes:", error);
      }
    };

    if (user && user.role === "admin") {
      fetchDiscountCodes();
    }
  }, [user]);

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Discount Codes</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Code</th>
            <th className="py-2 px-4 border-b">Discount (%)</th>
            <th className="py-2 px-4 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {discountCodes.map((code, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
              <td className="py-2 px-4 border-b">{code.code}</td>
              <td className="py-2 px-4 border-b text-center">
                {code.discount}
              </td>
              <td className="py-2 px-4 border-b text-center">
                {code.isAvailable ? (
                  <span className="text-green-600">Available</span>
                ) : (
                  <span className="text-red-600">Used</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllDiscountCodes;
