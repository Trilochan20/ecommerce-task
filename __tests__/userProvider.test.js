import React from "react";
import { expect, test, describe } from "bun:test";
import { UserProvider, useUser } from "../components/Context/UserContext";

describe("UserProvider", () => {
  test("provides user context", () => {
    const TestComponent = () => {
      const { user } = useUser();
      return <div>{user ? user.name : "No user"}</div>;
    };

    const component = (
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(component.type).toBe(UserProvider);
    expect(component.props.children.type).toBe(TestComponent);
  });
});
