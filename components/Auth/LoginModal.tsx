import React from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/components/Context/UserContext";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useUser();
  const { toast } = useToast();

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch("/api?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user);
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: data.message || "An error occurred during login.",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        duration: 3000,
      });
    }
  };

  const handleSignup = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      const validatedData = signupSchema.parse({
        name,
        email,
        password,
        confirmPassword,
      });

      const response = await fetch("/api?action=createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: validatedData.name,
          email: validatedData.email,
          password: validatedData.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        login(data.user);
        onClose();
      } else {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: data.message || "An error occurred during signup.",
          duration: 5000, // 5 seconds
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => err.message).join(", ");
        toast({
          variant: "destructive",
          title: "Validation error",
          description: errorMessages,
          duration: 5000, // 5 seconds
        });
      } else {
        toast({
          variant: "destructive",
          title: "Signup error",
          description: "An unexpected error occurred. Please try again.",
          duration: 5000, // 5 seconds
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm onSubmit={handleLogin} />
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm onSubmit={handleSignup} />
          </TabsContent>
        </Tabs>
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gray-200 py-2 px-4 rounded-md mt-4 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
