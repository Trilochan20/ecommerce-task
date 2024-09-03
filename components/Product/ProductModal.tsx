import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import ModalProductView from "./ModalProductView";
import { FaEye } from "react-icons/fa";

interface ProductModalProps {
  product: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
  };
}

const ProductModal: React.FC<ProductModalProps> = ({ product }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <FaEye className="w-8 h-8 text-white" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <ModalProductView product={product} />
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
