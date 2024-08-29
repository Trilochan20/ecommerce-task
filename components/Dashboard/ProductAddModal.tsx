"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface ProductAddModalProps {
  onProductAdded: () => void;
}

const ProductAddModal: React.FC<ProductAddModalProps> = ({
  onProductAdded,
}) => {
  const [open, setOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    quantity: 0,
    price: 0,
    image: "",
  });

  const handleInputChange = (field: string, value: string | number) => {
    setNewProduct({ ...newProduct, [field]: value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Product added successfully",
          duration: 2000,
        });
        setOpen(false);
        onProductAdded();
        setNewProduct({ name: "", quantity: 0, price: 0, image: "" });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to add product",

          duration: 2000,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed bottom-4 right-4">Add Product</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Quantity"
              value={newProduct.quantity}
              onChange={(e) => handleInputChange("quantity", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              placeholder="Image URL"
              value={newProduct.image}
              onChange={(e) => handleInputChange("image", e.target.value)}
            />
          </div>
          <Button type="submit">Add Product</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductAddModal;
