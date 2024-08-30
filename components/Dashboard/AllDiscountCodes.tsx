"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/components/Context/UserContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead className="text-center">Discount (%)</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {discountCodes.map((code, index) => (
            <TableRow key={index}>
              <TableCell>{code.code}</TableCell>
              <TableCell className="text-center">{code.discount}</TableCell>
              <TableCell className="text-center">
                {code.isAvailable ? (
                  <span className="text-green-600">Available</span>
                ) : (
                  <span className="text-red-600">Used</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AllDiscountCodes;
