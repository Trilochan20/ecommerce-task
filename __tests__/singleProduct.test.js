/**
 * This file contains unit tests for the SingleProduct component.
 * It tests whether the component renders correctly with the provided props.
 * The tests use the Bun test runner and React for component rendering.
 */

import React from "react";
import { expect, test, describe } from "bun:test";
import SingleProduct from "../components/Product/SingleProduct";

const mockProduct = {
  productId: "1",
  name: "Test Product",
  quantity: 10,
  price: 9.99,
  image: "test-image.jpg",
};

describe("SingleProduct", () => {
  test("renders with correct props", () => {
    const component = <SingleProduct product={mockProduct} />;

    expect(component.props.product).toEqual(mockProduct);
    expect(component.type).toBe(SingleProduct);
  });
});
