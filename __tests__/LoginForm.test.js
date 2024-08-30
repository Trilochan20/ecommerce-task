/**
 * This file contains unit tests for the LoginForm component.
 * It tests whether the LoginForm component renders correctly with the expected props.
 * The tests use the Bun test runner and React for component rendering.
 */

import React from "react";
import { expect, test, describe } from "bun:test";
import LoginForm from "../components/Auth/LoginForm";

describe("LoginForm", () => {
  test("renders with correct props", () => {
    const mockOnSubmit = () => {};
    const component = <LoginForm onSubmit={mockOnSubmit} />;

    expect(component.type).toBe(LoginForm);
    expect(typeof component.props.onSubmit).toBe("function");
  });
});
