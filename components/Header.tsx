"use client";

import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import CartIcon from "./CartIcon";
import LoginModal from "./Auth/LoginModal";
import { useUser } from "./Context/UserContext";
import { useCart } from "./Context/CartContext";
import Link from "next/link";
import { redirect } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Categories", href: "/" },
  { label: "Featured", href: "/" },
  { label: "About us", href: "/" },
  { label: "Contact", href: "/" },
];

export const NavigationHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, logout } = useUser();
  const { cart } = useCart();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="px-4 py-5 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
      <div className="relative flex items-center justify-between">
        <Link
          href="/"
          aria-label="Company"
          title="Company"
          className="inline-flex items-center"
        >
          <span className="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase">
            STORE NAME
          </span>
        </Link>

        {/* Desktop view */}
        <div className="hidden lg:flex lg:items-center lg:space-x-8">
          {/* Navigation items */}
          <ul className="flex items-center space-x-8">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-label={item.label}
                  title={item.label}
                  className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-emerald-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Cart and Login/Logout */}
          <div className="flex items-center space-x-8">
            <Link href="/cart">
              <CartIcon itemCount={cartItemCount} />
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="hover:text-emerald-400">
                  Welcome, {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide text-white 
                  transition duration-200 rounded shadow-md bg-emerald-400 hover:bg-emerald-700 focus:shadow-outline focus:outline-none"
                  aria-label="Logout"
                  title="Logout"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <button
                onClick={openLoginModal}
                className="inline-flex items-center justify-center h-12 px-6 font-medium tracking-wide text-white 
                transition duration-200 rounded shadow-md bg-emerald-400 hover:bg-emerald-700 focus:shadow-outline focus:outline-none"
                aria-label="Login"
                title="Login"
              >
                LOGIN
              </button>
            )}
          </div>
        </div>

        {/* Mobile view */}
        <div className="lg:hidden flex items-center">
          <Link href="/cart">
            <CartIcon itemCount={cartItemCount} />
          </Link>
          <button
            aria-label="Open Menu"
            title="Open Menu"
            className="p-2 -mr-1 transition duration-200 rounded focus:outline-none focus:shadow-outline hover:bg-deep-emerald-50 focus:bg-deep-emerald-50"
            onClick={() => setIsMenuOpen(true)}
          >
            <FaBars className="w-5 h-5 text-gray-600" />
          </button>
          {isMenuOpen && (
            <div className="absolute top-0 left-0 w-full z-10">
              <div className="p-5 bg-white border rounded shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Link
                      href="/"
                      aria-label="Company"
                      title="Company"
                      className="inline-flex items-center"
                    >
                      <span className="ml-2 text-xl font-bold tracking-wide text-gray-800 uppercase">
                        STORE NAME
                      </span>
                    </Link>
                  </div>
                  <div>
                    <button
                      aria-label="Close Menu"
                      title="Close Menu"
                      className="p-2 -mt-2 -mr-2 transition duration-200 rounded hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:shadow-outline"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaTimes className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <nav>
                  <ul className="space-y-4">
                    {navItems.map((item) => (
                      <li key={item.label} className="p-2">
                        <Link
                          href={item.href}
                          aria-label={item.label}
                          title={item.label}
                          className="font-medium tracking-wide text-gray-700 transition-colors duration-200 hover:text-emerald-400"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    <li className="p-2">
                      {user ? (
                        <>
                          <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center w-full h-12 px-6 mb-2 font-medium tracking-wide
                           text-slate-900 transition duration-200 rounded shadow-md 
                           bg-emerald-400 hover:bg-emerald-700 focus:shadow-outline focus:outline-none"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Welcome, {user.name}
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsMenuOpen(false);
                            }}
                            className="inline-flex items-center justify-center w-full h-12 px-6 font-medium tracking-wide
                             text-slate-900 transition duration-200 rounded shadow-md 
                             bg-emerald-400 hover:bg-emerald-700 focus:shadow-outline focus:outline-none"
                            aria-label="Logout"
                            title="Logout"
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            openLoginModal();
                            setIsMenuOpen(false);
                          }}
                          className="inline-flex items-center justify-center w-full h-12 px-6 font-medium tracking-wide
                           text-slate-900 transition duration-200 rounded shadow-md 
                           bg-emerald-400 hover:bg-emerald-700 focus:shadow-outline focus:outline-none"
                          aria-label="Sign in"
                          title="Sign in"
                        >
                          Sign in
                        </button>
                      )}
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </div>

        {/* Login Modal */}
        <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      </div>
    </div>
  );
};
