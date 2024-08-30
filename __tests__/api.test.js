import { expect, test, describe, beforeEach, mock } from "bun:test";
import { GET, POST, PUT, DELETE, setDatabase } from "../app/api/route";

// Mock the database
const mockDb = {
  data: {
    products: [
      {
        image: "https://picsum.photos/320/250?apple",
        name: "New Product 2",
        price: 42.21,
        productId: "aoiehgoieho",
        quantity: 993,
      },
      // ... other products ...
    ],
    users: [],
    discountCodes: [],
    discountOrder: 5,
  },
  read: mock(() => Promise.resolve()),
  write: mock(() => Promise.resolve()),
};

// Mock the Low constructor
const mockLow = mock(() => mockDb);

// Mock the entire lowdb module
mock.module("lowdb", () => ({
  Low: mockLow,
}));

// Mock the JSONFile
mock.module("lowdb/node", () => ({
  JSONFile: mock(() => ({})),
}));

describe("API Routes", () => {
  beforeEach(() => {
    mockDb.data = {
      products: [
        {
          image: "https://picsum.photos/320/250?apple",
          name: "New Product 2",
          price: 42.21,
          productId: "aoiehgoieho",
          quantity: 993,
        },
        // ... other products ...
      ],
      users: [],
      discountCodes: [],
      discountOrder: 5,
    };
    mockDb.read.mockClear();
    mockDb.write.mockClear();
    setDatabase(mockDb);
  });

  describe("GET", () => {
    test("should return all products when no action is specified", async () => {
      const request = new Request("http://localhost:3000/api");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("products");
      expect(Array.isArray(data.products)).toBe(true);
      expect(data.products.length).toBeGreaterThan(0);
      expect(data.products[0]).toHaveProperty("productId");
      expect(data.products[0]).toHaveProperty("name");
      expect(data.products[0]).toHaveProperty("price");
      expect(data.products[0]).toHaveProperty("quantity");
      expect(data.products[0]).toHaveProperty("image");
    });
  });

  describe("POST", () => {
    test("should create a new product", async () => {
      const newProduct = {
        name: "New Product",
        quantity: 5,
        price: 19.99,
        image: "https://via.placeholder.com/300",
      };
      const request = new Request("http://localhost:3000/api", {
        method: "POST",
        body: JSON.stringify(newProduct),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe("Product created successfully");
      expect(data.product).toMatchObject(newProduct);
    });
  });

  describe("PUT", () => {
    test("should update an existing product", async () => {
      const existingProduct = mockDb.data.products[0];
      console.log("Existing product:", existingProduct);
      const updates = { name: "Updated Product", quantity: 15 };
      const request = new Request("http://localhost:3000/api", {
        method: "PUT",
        body: JSON.stringify({
          productId: existingProduct.productId,
          ...updates,
        }),
      });

      const response = await PUT(request);
      console.log("PUT response status:", response.status);
      const data = await response.json();
      console.log("PUT response data:", data);

      expect(response.status).toBe(200);
      expect(data.message).toBe("Product updated successfully");
      expect(data.product).toMatchObject({ ...existingProduct, ...updates });
    });
  });

  describe("DELETE", () => {
    test("should delete an existing product", async () => {
      const existingProduct = mockDb.data.products[0];
      console.log("Existing product for deletion:", existingProduct);
      const request = new Request(
        `http://localhost:3000/api?productId=${existingProduct.productId}`,
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request);
      console.log("DELETE response status:", response.status);
      const data = await response.json();
      console.log("DELETE response data:", data);

      expect(response.status).toBe(200);
      expect(data.message).toBe("Product deleted successfully");
      expect(data.product).toMatchObject({
        productId: existingProduct.productId,
        image: existingProduct.image,
        price: existingProduct.price,
      });
    });
  });
});
