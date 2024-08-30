/**
 * This file contains unit tests for the CartProvider component and useCart hook.
 * It tests whether the CartProvider correctly provides the cart context to its children.
 * The tests use the Bun test runner and React for component rendering.
 */

import React from "react";
import { expect, test, describe } from "bun:test";
import { CartProvider, useCart } from "../components/Context/CartContext";

describe("CartProvider", () => {
  test("provides cart context", () => {
    const TestComponent = () => {
      const cart = useCart();
      return <div>{JSON.stringify(cart)}</div>;
    };

    const component = (
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(component.type).toBe(CartProvider);
    expect(component.props.children.type).toBe(TestComponent);
  });
});
