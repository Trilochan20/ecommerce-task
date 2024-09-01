import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { nanoid } from 'nanoid';
import { Product, CartItem, OrderItem, Order, User, Schema, DiscountCode } from './types';

// Define the default data
const defaultData: Schema = {
  products: [],
  users: [],
  discountCodes: [],
  discountOrder: 5
};

// Initialize lowdb
const file = join(process.cwd(), 'app/api/db.json'); // db file path
const adapter = new JSONFile<Schema>(file);
let db = new Low<Schema>(adapter, defaultData);

// Function to set the database (for testing purposes)
export function setDatabase(mockDb: Low<Schema>) {
  db = mockDb;
}

// Validation function 
export function validateProduct(product: Partial<Product>): string | null {
  if (typeof product.productId !== 'string') return 'Product ID must be a string';
  if (typeof product.name !== 'string') return 'Name must be a string';
  if (typeof product.quantity !== 'number') return 'Quantity must be a number';
  if (typeof product.price !== 'number') return 'Price must be a number';
  if (product.image && typeof product.image !== 'string') return 'Image must be a string';
  return null;
}

// Function to fetch a single product
export async function getProductById(productId: string): Promise<Product | null> {
  await db.read();
  return db.data.products.find(p => p.productId === productId) || null;
}

// Function to get all products
export async function getAllProductsResponse() {
  await db.read();
  return new Response(JSON.stringify({ products: db.data.products }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Function to get a single product response
export async function getProductResponse(productId: string) {
  const product = await getProductById(productId);
  if (product) {
    return new Response(JSON.stringify({ product }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } else {
    return new Response(JSON.stringify({ message: 'Product not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404
    });
  }
}

// Function to get user orders
export async function getUserOrders(userId: string) {
  const user = db.data.users.find(u => u.userId === userId);
  if (!user) {
    return new Response(JSON.stringify({ message: 'User not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404
    });
  }
  return new Response(JSON.stringify({ orders: user.orders || [] }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}

// Function to get all non-admin users
export async function getAllNonAdminUsers(): Promise<Omit<User, 'password'>[]> {
  await db.read();
  return db.data.users.filter(user => user.role !== 'admin').map(({ password, ...user }) => user);
}

// Function to get all users
export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  await db.read();
  return db.data.users.map(({ password, ...user }) => user);
}

// Function to get users response
export async function getUsersResponse() {
  const users = await getAllNonAdminUsers();
  return new Response(JSON.stringify({ users }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Function to get user order count
export async function getUserOrderCount(userId: string | null) {
  if (!userId) {
    return new Response(JSON.stringify({ message: 'User ID is required' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    });
  }

  await db.read();
  const user = db.data.users.find(u => u.userId === userId);
  if (!user) {
    return new Response(JSON.stringify({ message: 'User not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404
    });
  }

  const orderCount = user.orders?.length || 0;
  return new Response(JSON.stringify({ orderCount }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}

// Function to get discount order
export async function getDiscountOrder() {
  await db.read();
  return new Response(JSON.stringify({ discountOrder: db.data.discountOrder }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}

// Function to get discount codes response
export async function getDiscountCodesResponse() {
  return new Response(JSON.stringify({ discountCodes: db.data.discountCodes }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}

// Function to get all orders response
export async function getAllOrdersResponse() {
  const allOrders = db.data.users.flatMap(user =>
    (user.orders || []).map(order => ({
      ...order,
      userId: user.userId,
      userName: user.name
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return new Response(JSON.stringify({ orders: allOrders }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}

// Function to get all users response
export async function getAllUsersResponse() {
  const users = await getAllUsers();
  return new Response(JSON.stringify({ users }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}

// Function to handle login
export async function handleLogin(request: Request) {
  const { email, password } = await request.json();
  const { user, error } = await loginUser(email, password);

  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return new Response(JSON.stringify({
      message: 'Login successful',
      user: userWithoutPassword
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } else {
    return new Response(JSON.stringify({
      message: error
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401
    });
  }
}

// Function to handle checkout request
export async function handleCheckoutRequest(request: Request) {
  const { userId, cartItems, discountCode } = await request.json();

  if (!userId || !Array.isArray(cartItems) || cartItems.length === 0) {
    return new Response(JSON.stringify({
      success: false,
      message: "Invalid request. userId and non-empty cartItems are required."
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    });
  }

  const result = await handleCheckout(userId, cartItems, discountCode);

  if (result.success) {
    return new Response(JSON.stringify({
      success: true,
      message: result.message,
      order: result.order,
      newDiscountCode: result.newDiscountCode
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } else {
    return new Response(JSON.stringify({
      success: false,
      message: result.message
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    });
  }
}

// Function to handle product creation
export async function handleProductCreation(request: Request) {
  const body = await request.json();
  const newProduct: Product = {
    productId: randomUUID(),
    name: body.name,
    quantity: parseInt(body.quantity, 10),
    price: parseFloat(body.price),
    image: body.image
  };

  const validationError = validateProduct(newProduct);
  if (validationError) {
    return new Response(JSON.stringify({
      message: validationError
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    });
  }

  await db.read();
  db.data.products.push(newProduct);
  await db.write();

  return new Response(JSON.stringify({
    message: 'Product created successfully',
    product: newProduct
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 201
  });
}

// Function to validate product update
export function validateProductUpdate(updates: Partial<Product>): string | null {
  if ('productId' in updates && typeof updates.productId !== 'string') return 'Product ID must be a string';
  if ('name' in updates && typeof updates.name !== 'string') return 'Name must be a string';
  if ('quantity' in updates && typeof updates.quantity !== 'number') return 'Quantity must be a number';
  if ('price' in updates && typeof updates.price !== 'number') return 'Price must be a number';
  if ('image' in updates && updates.image !== undefined && typeof updates.image !== 'string') return 'Image must be a string';
  return null;
}

// Function to handle checkout
export async function handleCheckout(userId: string, cartItems: CartItem[], discountCode?: string): Promise<{ success: boolean, message: string, order?: Order, newDiscountCode?: DiscountCode }> {
  await db.read();

  if (!db.data || !db.data.users) {
    return { success: false, message: "Database error. Please try again later." };
  }

  const userIndex = db.data.users.findIndex(u => u.userId === userId);
  if (userIndex === -1) {
    return { success: false, message: "User not found" };
  }

  // Count total orders across all users
  const totalOrders = db.data.users.reduce((sum, user) => sum + (user.orders?.length || 0), 0);

  let discountApplied = 0;
  let newDiscountCode: DiscountCode | undefined;

  // Check if this order qualifies for a new discount code
  if ((totalOrders + 1) % (db.data.discountOrder || 5) === 0) {
    newDiscountCode = {
      code: nanoid(8).toUpperCase(),
      discount: 10, // 10% discount
      isAvailable: true
    };
    db.data.discountCodes = db.data.discountCodes || [];
    db.data.discountCodes.push(newDiscountCode);
  }

  let totalAmount = 0;
  const updatedProducts: Product[] = [];
  const orderItems: OrderItem[] = [];

  // Calculate total amount and update product quantities
  for (const item of cartItems) {
    const product = await getProductById(item.productId);
    if (!product) {
      return { success: false, message: `Product not found: ${item.productId}` };
    }
    if (product.quantity < item.quantity) {
      return { success: false, message: `Insufficient quantity for product: ${product.name}` };
    }
    const itemTotal = item.orderedPrice * item.quantity;
    totalAmount += itemTotal;
    product.quantity -= item.quantity;
    updatedProducts.push(product);

    orderItems.push({
      productId: product.productId,
      name: product.name,
      quantity: item.quantity,
      orderedPrice: item.orderedPrice,
      price: product.price
    });
  }

  // Apply discount if code is provided and valid
  if (discountCode && db.data.discountCodes) {
    const discountIndex = db.data.discountCodes.findIndex(d => d.code === discountCode && d.isAvailable);
    if (discountIndex !== -1) {
      const discount = db.data.discountCodes[discountIndex];
      discountApplied = totalAmount * (discount.discount / 100);
      db.data.discountCodes[discountIndex].isAvailable = false;
    } else {
      return { success: false, message: "Invalid or unavailable discount code" };
    }
  }

  const finalAmount = totalAmount - discountApplied;

  const newOrder: Order = {
    orderId: randomUUID(),
    items: orderItems,
    totalAmount: totalAmount,
    discountApplied: discountApplied,
    finalAmount: finalAmount,
    date: new Date().toISOString(),
    appliedDiscountCode: discountCode 
  };

  // Update the database
  if (!db.data.users[userIndex].orders) {
    db.data.users[userIndex].orders = [];
  }
  db.data.users[userIndex].orders.push(newOrder);
  db.data.products = db.data.products.map(p => updatedProducts.find(up => up.productId === p.productId) || p);

  try {
    await db.write();
    return { success: true, message: "Order placed successfully", order: newOrder, newDiscountCode };
  } catch (error) {
    return { success: false, message: "Error processing order. Please try again." };
  }
}

// Function to generate discount code
export async function generateDiscountCode(request: Request) {
  await db.read();

  const body = await request.json();
  const { userId } = body;

  const user = db.data.users.find(u => u.userId === userId);
  if (!user) {
    return new Response(JSON.stringify({
      message: 'User not found'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404
    });
  }

  // Check if the user is eligible for a discount
  const userOrderCount = user.orders?.length || 0;
  if ((userOrderCount + 1) % db.data.discountOrder !== 0) {
    return new Response(JSON.stringify({
      message: 'User is not eligible for a discount',
      isEligible: false
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  }

  // Find an available discount code
  let availableDiscountCode = db.data.discountCodes.find(code => code.isAvailable);

  // If no available discount code, generate a new one
  if (!availableDiscountCode) {
    availableDiscountCode = {
      code: nanoid(8).toUpperCase(),
      discount: 10, // 10% discount
      isAvailable: true
    };
    db.data.discountCodes.push(availableDiscountCode);
    await db.write(); // Save the new discount code to the database
  }

  return new Response(JSON.stringify({
    message: 'Discount code found',
    isEligible: true,
    discountCode: availableDiscountCode
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}

// Function to set discount order
export async function setDiscountOrder(request: Request) {
  await db.read();

  const body = await request.json();
  const { userId, discountOrder } = body;

  const user = db.data.users.find(u => u.userId === userId);
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({
      message: 'Unauthorized. Only admins can change this setting.'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 403
    });
  }

  if (typeof discountOrder !== 'number' || discountOrder < 1) {
    return new Response(JSON.stringify({
      message: 'Invalid discount order. Must be a positive number.'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    });
  }

  db.data.discountOrder = discountOrder;
  await db.write();

  return new Response(JSON.stringify({
    message: 'Discount order updated successfully',
    discountOrder: discountOrder
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}

// Function to create user
export async function createUser(request: Request) {
  await db.read();

  const body = await request.json();
  const { name, email } = body;

  // Check if user already exists
  const userExists = await checkUser(email);
  if (userExists) {
    return new Response(JSON.stringify({
      message: 'User already exists'
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 409 // Conflict status code
    });
  }

  // Create new user
  const newUser: User = {
    name,
    email,
    role: 'user',
    userId: randomUUID(),
    password: body.password,
    orders: []
  };

  db.data.users.push(newUser);
  await db.write();

  return new Response(JSON.stringify({
    message: 'User created successfully',
    user: newUser
  }), {
    headers: {
      'Content-Type': 'application/json'
    },
    status: 201
  });
}

// Function to check if user exists
export async function checkUser(email: string): Promise<boolean> {
  await db.read();
  return db.data.users.some(user => user.email === email);
}

// Function to login user
export async function loginUser(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  await db.read();
  const user = db.data.users.find(u => u.email === email);

  if (!user) {
    return { user: null, error: "User doesn't exist. Please sign up." };
  }

  if (user.password !== password) {
    return { user: null, error: "Password is incorrect." };
  }

  return { user, error: null };
}

// Add this function to the helpers.ts file

export async function updateProduct(productId: string, updates: Partial<Product>): Promise<{ success: boolean, message: string, product?: Product, status: number }> {
  await db.read();
  const productIndex = db.data.products.findIndex(p => p.productId === productId);
  if (productIndex === -1) {
    return { success: false, message: 'Product not found', status: 404 };
  }

  const updatedProduct = { ...db.data.products[productIndex], ...updates };
  db.data.products[productIndex] = updatedProduct;
  await db.write();

  return { success: true, message: 'Product updated successfully', product: updatedProduct, status: 200 };
}