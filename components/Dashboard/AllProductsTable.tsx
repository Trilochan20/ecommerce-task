import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import ProductAddModal from "./ProductAddModal";

interface Product {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

const AllProductsTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api?action=getProducts");
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleSave = async () => {
    if (!editingProduct) return;

    try {
      const response = await fetch("/api", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct),
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Product updated successfully",
          duration: 2000,
        });
        setEditingProduct(null);
        fetchProducts();
      } else {
        toast({
          title: "Error",
          description: "Failed to update product",
          variant: "destructive",
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
  };

  const handleDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api?productId=${productId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
          duration: 2000,
        });
        fetchProducts();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete product",
          variant: "destructive",
          duration: 2000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleInputChange = (field: keyof Product, value: string | number) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, [field]: value });
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.productId}>
              <TableCell>
                {editingProduct?.productId === product.productId ? (
                  <Input
                    value={editingProduct.image || ""}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                    placeholder="Image URL"
                  />
                ) : product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={50}
                    height={50}
                    className="object-cover"
                  />
                ) : (
                  "No image"
                )}
              </TableCell>
              <TableCell>
                {editingProduct?.productId === product.productId ? (
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                ) : (
                  product.name
                )}
              </TableCell>
              <TableCell>
                {editingProduct?.productId === product.productId ? (
                  <Input
                    type="number"
                    value={editingProduct.quantity}
                    onChange={(e) =>
                      handleInputChange("quantity", Number(e.target.value))
                    }
                  />
                ) : (
                  product.quantity
                )}
              </TableCell>
              <TableCell>
                {editingProduct?.productId === product.productId ? (
                  <Input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      handleInputChange("price", Number(e.target.value))
                    }
                  />
                ) : (
                  `$${product.price.toFixed(2)}`
                )}
              </TableCell>
              <TableCell>
                {editingProduct?.productId === product.productId ? (
                  <>
                    <Button onClick={handleSave} className="mr-2">
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => handleEdit(product)}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the product.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product.productId)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingProduct && (
        <p className="text-green-600 mt-2">
          Click "Save" to update the product
        </p>
      )}
      <ProductAddModal onProductAdded={fetchProducts} />
    </div>
  );
};

export default AllProductsTable;
