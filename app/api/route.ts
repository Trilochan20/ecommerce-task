import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join } from 'path'
import { randomUUID } from 'crypto';
import { nanoid } from 'nanoid';
import { Product, CartItem, OrderItem, Order, User, Schema, DiscountCode } from './types';

// Define the default data
const defaultData: Schema = {
  products: [],
  users: [],
  discountCodes: [],
  discountOrder: 5
}

// Initialize lowdb
const file = join(process.cwd(), 'app/api/db.json') //db file path
const adapter = new JSONFile<Schema>(file)
let db = new Low<Schema>(adapter, defaultData)

// Function to set the database (for testing purposes)
export function setDatabase(mockDb: Low<Schema>) {
  db = mockDb;
}

// validation function 
function validateProduct(product: Partial<Product>): string | null {
    if (typeof product.productId !== 'string') return 'Product ID must be a string';
    if (typeof product.name !== 'string') return 'Name must be a string';
    if (typeof product.quantity !== 'number') return 'Quantity must be a number';
    if (typeof product.price !== 'number') return 'Price must be a number';
    if (product.image && typeof product.image !== 'string') return 'Image must be a string';
    return null;
}

//  this function fetch a single product
async function getProductById(productId: string): Promise<Product | null> {
  await db.read()
  return db.data.products.find(p => p.productId === productId) || null
}

// list all products
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const userId = searchParams.get('userId')
    const productId = searchParams.get('productId')

    await db.read()

    switch (action) {
        case 'getUserOrders':
            if (userId) {
                return await getUserOrders(userId)
            }
            break
        case 'getProduct':
            if (productId) {
                return await getProductResponse(productId)
            }
            break
        case 'getUsers':
            return await getUsersResponse()
        case 'getUserOrderCount':
            if (userId) {
                return await getUserOrderCount(userId)
            }
            break
        case 'getDiscountOrder':
            return await getDiscountOrder()
        case 'getDiscountCodes':
            return await getDiscountCodesResponse()
        case 'getAllOrders':
            return await getAllOrdersResponse()
        case 'getAllUsers':
            return await getAllUsersResponse()
        default:
            return await getAllProductsResponse()
    }

    return new Response(JSON.stringify({ message: 'Invalid request' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
    })
}

async function getUserOrders(userId: string) {
    const user = db.data.users.find(u => u.userId === userId)
    if (!user) {
        return new Response(JSON.stringify({ message: 'User not found' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 404
        })
    }
    return new Response(JSON.stringify({ orders: user.orders || [] }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}

async function getProductResponse(productId: string) {
    const product = await getProductById(productId)
    if (product) {
        return new Response(JSON.stringify({ product }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    } else {
        return new Response(JSON.stringify({ message: 'Product not found' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 404
        })
    }
}

async function getUsersResponse() {
    const users = await getAllNonAdminUsers()
    return new Response(JSON.stringify({ users }), {
        headers: { 'Content-Type': 'application/json' }
    })
}

async function getUserOrderCount(userId: string | null) {
  if (!userId) {
    return new Response(JSON.stringify({ message: 'User ID is required' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  }

  await db.read()
  const user = db.data.users.find(u => u.userId === userId)
  if (!user) {
    return new Response(JSON.stringify({ message: 'User not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404
    })
  }

  const orderCount = user.orders?.length || 0
  return new Response(JSON.stringify({ orderCount }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  })
}

async function getDiscountOrder() {
  await db.read()
  return new Response(JSON.stringify({ discountOrder: db.data.discountOrder }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  })
}

async function getDiscountCodesResponse() {
    return new Response(JSON.stringify({ discountCodes: db.data.discountCodes }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}

async function getAllOrdersResponse() {
    const allOrders = db.data.users.flatMap(user => 
        (user.orders || []).map(order => ({
            ...order,
            userId: user.userId,
            userName: user.name
        }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return new Response(JSON.stringify({ orders: allOrders }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}

async function getAllUsersResponse() {
    const users = await getAllUsers()
    return new Response(JSON.stringify({ users }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
    })
}

async function getAllProductsResponse() {
    return new Response(JSON.stringify({ products: db.data.products }), {
        headers: { 'Content-Type': 'application/json' }
    })
}


//create new product
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  switch (action) {
    case 'login':
      return await handleLogin(request)
    case 'createUser':
      return await createUser(request)
    case 'checkout':
      return await handleCheckoutRequest(request)
    case 'generateDiscountCode':
      return await generateDiscountCode(request)
    case 'setDiscountOrder':
      return await setDiscountOrder(request)
    default:
      return await handleProductCreation(request)
  }
}

async function handleLogin(request: Request) {
  const { email, password } = await request.json()
  const { user, error } = await loginUser(email, password)

  if (user) {
    const { password: _, ...userWithoutPassword } = user
    return new Response(JSON.stringify({
      message: 'Login successful',
      user: userWithoutPassword
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } else {
    return new Response(JSON.stringify({
      message: error
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 401
    })
  }
}

async function handleCheckoutRequest(request: Request) {
  const { userId, cartItems, discountCode } = await request.json()

  // console.log("Received checkout request:", { userId, cartItems, discountCode });

  if (!userId || !Array.isArray(cartItems) || cartItems.length === 0) {
    console.error("Invalid checkout request:", { userId, cartItems, discountCode });
    return new Response(JSON.stringify({
      success: false,
      message: "Invalid request. userId and non-empty cartItems are required."
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  }

  const result = await handleCheckout(userId, cartItems, discountCode)

  if (result.success) {
    return new Response(JSON.stringify({
      success: true,
      message: result.message,
      order: result.order,
      newDiscountCode: result.newDiscountCode
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } else {
    return new Response(JSON.stringify({
      success: false,
      message: result.message
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  }
}

async function handleProductCreation(request: Request) {
  const body = await request.json()
  const newProduct: Product = {
    productId: randomUUID(),
    name: body.name,
    quantity: parseInt(body.quantity, 10),
    price: parseFloat(body.price),
    image: body.image
  }

  const validationError = validateProduct(newProduct);
  if (validationError) {
    return new Response(JSON.stringify({
      message: validationError
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  }

  await db.read()
  db.data.products.push(newProduct)
  await db.write()

  return new Response(JSON.stringify({
    message: 'Product created successfully',
    product: newProduct
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 201
  })
}


//validation for update
function validateProductUpdate(updates: Partial<Product>): string | null {
    if ('productId' in updates && typeof updates.productId !== 'string') return 'Product ID must be a string';
    if ('name' in updates && typeof updates.name !== 'string') return 'Name must be a string';
    if ('quantity' in updates && typeof updates.quantity !== 'number') return 'Quantity must be a number';
    if ('price' in updates && typeof updates.price !== 'number') return 'Price must be a number';
    if ('image' in updates && updates.image !== undefined && typeof updates.image !== 'string') return 'Image must be a string';
    return null;
}


// Update the PUT function
export async function PUT(request: Request) {
  await db.read()
  const body = await request.json()
  const { productId, ...updates } = body

  const productIndex = db.data.products.findIndex(p => p.productId === productId)

  if (productIndex === -1) {
    return new Response(JSON.stringify({ message: 'Product not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404
    })
  }

  db.data.products[productIndex] = { ...db.data.products[productIndex], ...updates }
  await db.write()

  return new Response(JSON.stringify({
    message: 'Product updated successfully',
    product: db.data.products[productIndex]
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  })
}



// Update the DELETE function
export async function DELETE(request: Request) {
  await db.read()
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')

  if (!productId) {
    return new Response(JSON.stringify({ message: 'Product ID is required' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  }

  const productIndex = db.data.products.findIndex(p => p.productId === productId)

  if (productIndex === -1) {
    return new Response(JSON.stringify({ message: 'Product not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404
    })
  }

  const deletedProduct = db.data.products.splice(productIndex, 1)[0]
  await db.write()

  return new Response(JSON.stringify({
    message: 'Product deleted successfully',
    product: deletedProduct
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  })
}

// Check if user exists
async function checkUser(email: string): Promise<boolean> {
  await db.read()
  return db.data.users.some(user => user.email === email)
}

// Create user
export async function createUser(request: Request) {
  await db.read()

  const body = await request.json()
  const { name, email } = body

  // Check if user already exists
  const userExists = await checkUser(email)
  if (userExists) {
    return new Response(JSON.stringify({
      message: 'User already exists'
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 409 // Conflict status code
    })
  }

  // Create new user
  const newUser: User = {
    name,
    email,
    role: 'user',
    userId: randomUUID(),
    password: body.password,
    orders: []
  }

  db.data.users.push(newUser)
  await db.write()

  return new Response(JSON.stringify({
    message: 'User created successfully',
    user: newUser
  }), {
    headers: {
      'Content-Type': 'application/json'
    },
    status: 201
  })
}

// Get all users except admins
async function getAllNonAdminUsers(): Promise<Omit<User, 'password'>[]> {
  await db.read()
  return db.data.users.filter(user => user.role !== 'admin').map(({ password, ...user }) => user);
}

//  this new function for user login
async function loginUser(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  await db.read()
  const user = db.data.users.find(u => u.email === email)
  
  if (!user) {
    return { user: null, error: "User doesn't exist. Please sign up." }
  }
  
  if (user.password !== password) {
    return { user: null, error: "Password is incorrect." }
  }
  
  return { user, error: null }
}

// Update the handleCheckout function
async function handleCheckout(userId: string, cartItems: CartItem[], discountCode?: string): Promise<{ success: boolean, message: string, order?: Order, newDiscountCode?: DiscountCode }> {
  await db.read()

  // console.log("Starting handleCheckout function");

  if (!db.data || !db.data.users) {
    console.error("Database or users array is undefined");
    return { success: false, message: "Database error. Please try again later." };
  }

  const userIndex = db.data.users.findIndex(u => u.userId === userId)
  if (userIndex === -1) {
    console.error(`User not found for userId: ${userId}`);
    return { success: false, message: "User not found" }
  }

  // console.log(`User found at index: ${userIndex}`);

  // Count total orders across all users
  const totalOrders = db.data.users.reduce((sum, user) => sum + (user.orders?.length || 0), 0)
  // console.log(`Total orders: ${totalOrders}`);

  let discountApplied = 0
  let newDiscountCode: DiscountCode | undefined

  // Check if this order qualifies for a new discount code
  if ((totalOrders + 1) % (db.data.discountOrder || 5) === 0) {
    newDiscountCode = {
      code: nanoid(8).toUpperCase(),
      discount: 10, // 10% discount
      isAvailable: true
    }
    db.data.discountCodes = db.data.discountCodes || [];
    db.data.discountCodes.push(newDiscountCode)
    console.log(`New discount code generated: ${newDiscountCode.code}`);
  }

  let totalAmount = 0
  const updatedProducts: Product[] = []
  const orderItems: OrderItem[] = []

  // console.log("Processing cart items:");
  // Calculate total amount and update product quantities
  for (const item of cartItems) {
    // console.log(`Processing item: ${item.productId}`);
    const product = await getProductById(item.productId)
    if (!product) {
      console.error(`Product not found: ${item.productId}`);
      return { success: false, message: `Product not found: ${item.productId}` }
    }
    if (product.quantity < item.quantity) {
      console.error(`Insufficient quantity for product: ${product.name}`);
      return { success: false, message: `Insufficient quantity for product: ${product.name}` }
    }
    const itemTotal = item.orderedPrice * item.quantity
    totalAmount += itemTotal
    product.quantity -= item.quantity
    updatedProducts.push(product)
    
    orderItems.push({
      productId: product.productId,
      name: product.name,
      quantity: item.quantity,
      orderedPrice: item.orderedPrice,
      price: product.price
    })
    console.log(`Item processed: ${item.productId}, New quantity: ${product.quantity}`);
  }

  // console.log(`Total amount: ${totalAmount}`);

  // Apply discount if code is provided and valid
  if (discountCode && db.data.discountCodes) {
    // console.log(`Applying discount code: ${discountCode}`);
    const discountIndex = db.data.discountCodes.findIndex(d => d.code === discountCode && d.isAvailable)
    if (discountIndex !== -1) {
      const discount = db.data.discountCodes[discountIndex]
      discountApplied = totalAmount * (discount.discount / 100)
      db.data.discountCodes[discountIndex].isAvailable = false
      console.log(`Discount applied: ${discountApplied}`);
    } else {
      console.error(`Invalid or unavailable discount code: ${discountCode}`);
      return { success: false, message: "Invalid or unavailable discount code" }
    }
  }

  const finalAmount = totalAmount - discountApplied
  // console.log(`Final amount: ${finalAmount}`);

  const newOrder: Order = {
    orderId: randomUUID(),
    items: orderItems,
    totalAmount: totalAmount,
    discountApplied: discountApplied,
    finalAmount: finalAmount,
    date: new Date().toISOString(),
    appliedDiscountCode: discountCode 
  }

  // console.log("New order created:", newOrder);

  // Update the database
  if (!db.data.users[userIndex].orders) {
    db.data.users[userIndex].orders = []
  }
  db.data.users[userIndex].orders.push(newOrder)
  db.data.products = db.data.products.map(p => updatedProducts.find(up => up.productId === p.productId) || p)
  
  // console.log('Before writing to database:', JSON.stringify(db.data, null, 2));
  
  try {
    await db.write()
    // console.log('After writing to database:', JSON.stringify(db.data, null, 2));
    return { success: true, message: "Order placed successfully", order: newOrder, newDiscountCode }
  } catch (error) {
    console.error("Error writing to database:", error)
    return { success: false, message: "Error processing order. Please try again." }
  }
}

async function generateDiscountCode(request: Request) {
  await db.read()

  const body = await request.json()
  const { userId } = body

  const user = db.data.users.find(u => u.userId === userId)
  if (!user) {
    return new Response(JSON.stringify({
      message: 'User not found'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404
    })
  }

  // Check if the user is eligible for a discount
  const userOrderCount = user.orders?.length || 0
  if ((userOrderCount + 1) % db.data.discountOrder !== 0) {
    return new Response(JSON.stringify({
      message: 'User is not eligible for a discount',
      isEligible: false
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  }

  // Find an available discount code
  let availableDiscountCode = db.data.discountCodes.find(code => code.isAvailable)

  // If no available discount code, generate a new one
  if (!availableDiscountCode) {
    availableDiscountCode = {
      code: nanoid(8).toUpperCase(),
      discount: 10, // 10% discount
      isAvailable: true
    }
    db.data.discountCodes.push(availableDiscountCode)
    await db.write() // Save the new discount code to the database
  }

  return new Response(JSON.stringify({
    message: 'Discount code found',
    isEligible: true,
    discountCode: availableDiscountCode
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  })
}

async function setDiscountOrder(request: Request) {
  await db.read()

  const body = await request.json()
  const { userId, discountOrder } = body

  const user = db.data.users.find(u => u.userId === userId)
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({
      message: 'Unauthorized. Only admins can change this setting.'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 403
    })
  }

  if (typeof discountOrder !== 'number' || discountOrder < 1) {
    return new Response(JSON.stringify({
      message: 'Invalid discount order. Must be a positive number.'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  }

  db.data.discountOrder = discountOrder
  await db.write()

  return new Response(JSON.stringify({
    message: 'Discount order updated successfully',
    discountOrder: discountOrder
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  })
}

async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  await db.read()
  return db.data.users.map(({ password, ...user }) => user);
}

