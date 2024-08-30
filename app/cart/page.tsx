"use client";

import { useCart } from "@/components/Context/CartContext";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@/components/Context/UserContext";

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useUser();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [userOrderCount, setUserOrderCount] = useState(0);
  const [discountOrder, setDiscountOrder] = useState(0);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | null>(
    null
  );
  const [isEligibleForDiscount, setIsEligibleForDiscount] = useState(false);
  const [discountedTotal, setDiscountedTotal] = useState(0);

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  useEffect(() => {
    if (user) {
      fetchUserOrderCount();
      fetchDiscountOrder();
    }
  }, [user]);

  useEffect(() => {
    if (userOrderCount > 0 && discountOrder > 0) {
      setIsEligibleForDiscount((userOrderCount + 1) % discountOrder === 0);
    }
  }, [userOrderCount, discountOrder]);

  useEffect(() => {
    if (isEligibleForDiscount && !appliedDiscountCode) {
      generateAndApplyDiscountCode();
    }
  }, [isEligibleForDiscount, appliedDiscountCode]);

  const fetchUserOrderCount = async () => {
    try {
      const response = await fetch(
        `/api?action=getUserOrderCount&userId=${user?.userId}`
      );
      if (response.ok) {
        const data = await response.json();
        setUserOrderCount(data.orderCount);
      }
    } catch (error) {
      console.error("Error fetching user order count:", error);
    }
  };

  const fetchDiscountOrder = async () => {
    try {
      const response = await fetch("/api?action=getDiscountOrder");
      if (response.ok) {
        const data = await response.json();
        setDiscountOrder(data.discountOrder);
      }
    } catch (error) {
      console.error("Error fetching discount order:", error);
    }
  };

  const generateAndApplyDiscountCode = async () => {
    try {
      const response = await fetch("/api?action=generateDiscountCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.userId }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.isEligible && data.discountCode) {
          setAppliedDiscountCode(data.discountCode.code);
          const discountAmount =
            totalPrice * (data.discountCode.discount / 100);
          setDiscountedTotal(totalPrice - discountAmount);
          toast({
            title: "Discount Applied!",
            description: `A ${data.discountCode.discount}% discount code ${data.discountCode.code} has been automatically applied to your cart.`,
            duration: 5000,
          });
        } else if (data.isEligible) {
          console.error(
            "Unexpected response: User is eligible but no discount code was returned"
          );
          toast({
            title: "Discount Error",
            description:
              "An error occurred while applying your discount. Please try again.",
            duration: 5000,
          });
        } else {
          console.log("User is not eligible for a discount");
        }
      } else {
        const errorData = await response.json();
        console.error("Error generating discount code:", errorData.message);
        toast({
          title: "Discount Error",
          description:
            "An error occurred while checking for discounts. Please try again.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error generating discount code:", error);
      toast({
        title: "Discount Error",
        description: "An unexpected error occurred. Please try again.",
        duration: 5000,
      });
    }
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart",
      duration: 2000,
    });
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to proceed to checkout.",
        duration: 3000,
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await fetch("/api?action=checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.userId,
          cartItems: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            orderedPrice: item.price,
            name: item.name,
          })),
          discountCode: appliedDiscountCode,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        clearCart();
        setAppliedDiscountCode(null);
        toast({
          title: "Checkout complete",
          description: data.message,
          duration: 2000,
        });
      } else {
        throw new Error(data.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during checkout",
        duration: 3000,
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto mt-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p>Add some items to your cart and come back here to check out!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {isEligibleForDiscount && !appliedDiscountCode && (
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
          role="alert"
        >
          <p className="font-bold">You're eligible for a discount!</p>
          <p>A discount code will be automatically applied at checkout.</p>
        </div>
      )}
      {appliedDiscountCode && (
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4"
          role="alert"
        >
          <p className="font-bold">Discount Applied!</p>
          <p>
            A 10% discount code {appliedDiscountCode} has been automatically
            applied to your cart.
          </p>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-3/4">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="flex items-center hover:bg-gray-100 -mx-8 px-6 py-5"
            >
              <div className="flex w-2/5">
                <div className="w-20">
                  <Image
                    src={item.image || "https://via.placeholder.com/150"}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="h-24"
                  />
                </div>
                <div className="flex flex-col justify-between ml-4 flex-grow">
                  <span className="font-bold text-sm">{item.name}</span>
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="font-semibold hover:text-red-500 text-gray-500 text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="flex justify-center w-1/5">
                <input
                  className="mx-2 border text-center w-16"
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(
                      item.productId,
                      parseInt(e.target.value)
                    )
                  }
                />
              </div>
              <span className="text-center w-1/5 font-semibold text-sm">
                ₹{item.price.toFixed(2)}
              </span>
              <span className="text-center w-1/5 font-semibold text-sm">
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            {appliedDiscountCode && (
              <div className="flex justify-between mb-2 text-green-600">
                <span>Discount (10%)</span>
                <span>-₹{(totalPrice * 0.1).toFixed(2)}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between mb-2">
              <span className="font-bold">Total</span>
              <span className="font-bold">
                ₹
                {appliedDiscountCode
                  ? discountedTotal.toFixed(2)
                  : totalPrice.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || !user}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 w-full disabled:opacity-50"
            >
              {isCheckingOut
                ? "Processing..."
                : user
                ? "Checkout"
                : "Login to Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
