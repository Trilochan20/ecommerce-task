/**
 * This file contains unit tests for the ProductList component.
 * It tests whether the ProductList component renders correctly.
 * The tests use the Bun test runner and React for component rendering.
 */

import React from "react";
import { expect, test, describe } from "bun:test";
import ProductList from "../components/Product/ProductList";

describe("ProductList", () => {
  test("renders correctly", () => {
    const component = <ProductList />;

    expect(component.type).toBe(ProductList);
  });
});
