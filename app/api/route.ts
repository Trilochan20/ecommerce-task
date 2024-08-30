import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join } from 'path'
import { randomUUID } from 'crypto';

// type defination for database structure
type Product = {
  productId: string,
  name: string,
  quantity: number,
  price: number,
  image?: string
}

type CartItem = {
  productId: string,
  quantity: number,
  name: string,
  orderedPrice: number,
  currentPrice: number
}

// Update the OrderItem interface
interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  orderedPrice: number;
  price: number; // This is the current price of the product
}

// Update the Order interface
interface Order {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  discountApplied: number;
  finalAmount: number;
  date: string;
}

type User = {
  name: string,
  email: string,
  userId: string,
  password: string,
  role: string,
  orders: Order[]
}

type Schema = {
  products: Product[],
  users: User[],
  discountCodes: DiscountCode[]
}

//  this type for discount codes
type DiscountCode = {
  code: string,
  discount: number,
  isAvailable: boolean
}

// Define the default data
const defaultData: Schema = {
  products: [],
  users: [],
  discountCodes: []
}

// Initialize lowdb
const file = join(process.cwd(), 'app/api/db.json') //db file path
const adapter = new JSONFile<Schema>(file)
const db = new Low<Schema>(adapter, defaultData)


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

    if (action === 'getUserOrders' && userId) {
        const user = db.data.users.find(u => u.userId === userId)
        if (!user) {
            return new Response(JSON.stringify({
                message: 'User not found'
            }), {
                headers: { 'Content-Type': 'application/json' },
                status: 404
            })
        }
        console.log('User orders:', user.orders);  
        return new Response(JSON.stringify({
            orders: user.orders
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })
    } else if (action === 'getProduct' && productId) {
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
    } else if (action === 'getUsers') {
        const users = await getAllNonAdminUsers()
        return new Response(JSON.stringify({
            users: users
        }), {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } else {
        // Return all products (existing functionality)
        return new Response(JSON.stringify({
            products: db.data.products
        }), {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
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

  if (!userId || !Array.isArray(cartItems) || cartItems.length === 0) {
    return new Response(JSON.stringify({
      message: "Invalid request. userId and non-empty cartItems are required."
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    })
  }

  const result = await handleCheckout(userId, cartItems, discountCode)

  if (result.success) {
    return new Response(JSON.stringify({
      message: result.message,
      order: result.order
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } else {
    return new Response(JSON.stringify({
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


// update product with product-id 
export async function PUT(request: Request) {
    await db.read()

    const body = await request.json()
    const { productId, ...updates } = body

    if (typeof productId !== 'string') {
        return new Response(JSON.stringify({
            message: 'Product ID must be a string'
        }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 400
        })
    }

    const productIndex = db.data.products.findIndex(p => p.productId === productId)

    if (productIndex === -1) {
        return new Response(JSON.stringify({
            message: 'Product not found'
        }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 404
        })
    }

    const validationError = validateProductUpdate(updates);
    if (validationError) {
        return new Response(JSON.stringify({
            message: validationError
        }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 400
        })
    }

    const updatedProduct: Product = {
        ...db.data.products[productIndex],
        ...updates
    }

    db.data.products[productIndex] = updatedProduct
    await db.write()

    return new Response(JSON.stringify({
        message: 'Product updated successfully',
        product: updatedProduct
    }), {
        headers: {
            'Content-Type': 'application/json'
        },
        status: 200
    })
}



//delete a product

export async function DELETE(request: Request) {
    await db.read()

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
        return new Response(JSON.stringify({
            message: 'Product ID is required'
        }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 400
        })
    }

    const productIndex = db.data.products.findIndex(p => p.productId === productId)

    if (productIndex === -1) {
        return new Response(JSON.stringify({
            message: 'Product not found'
        }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 404
        })
    }

    const deletedProduct = db.data.products.splice(productIndex, 1)[0]
    await db.write()

    return new Response(JSON.stringify({
        message: 'Product deleted successfully',
        product: deletedProduct
    }), {
        headers: {
            'Content-Type': 'application/json'
        },
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
interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  orderedPrice: number;
  price: number;
}

interface Order {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  discountApplied: number;
  finalAmount: number;
  date: string;
}

async function handleCheckout(userId: string, cartItems: CartItem[], discountCode?: string): Promise<{ success: boolean, message: string, order?: Order }> {
  await db.read()

  const userIndex = db.data.users.findIndex(u => u.userId === userId)
  if (userIndex === -1) {
    return { success: false, message: "User not found" }
  }

  let totalAmount = 0
  let discountApplied = 0
  const updatedProducts: Product[] = []
  const orderItems: OrderItem[] = []

  // Calculate total amount and update product quantities
  for (const item of cartItems) {
    const product = await getProductById(item.productId)
    if (!product) {
      return { success: false, message: `Product not found: ${item.productId}` }
    }
    if (product.quantity < item.quantity) {
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
  }

  // Apply discount if code is provided and valid
  if (discountCode) {
    const discountIndex = db.data.discountCodes.findIndex(d => d.code === discountCode && d.isAvailable)
    if (discountIndex !== -1) {
      const discount = db.data.discountCodes[discountIndex]
      discountApplied = totalAmount * (discount.discount / 100)
      db.data.discountCodes[discountIndex].isAvailable = false
    } else {
      return { success: false, message: "Invalid or unavailable discount code" }
    }
  }

  const finalAmount = totalAmount - discountApplied

  const newOrder: Order = {
    orderId: randomUUID(),
    items: orderItems,
    totalAmount: totalAmount,
    discountApplied: discountApplied,
    finalAmount: finalAmount,
    date: new Date().toISOString()
  }

  // Update the database
  if (!db.data.users[userIndex].orders) {
    db.data.users[userIndex].orders = []
  }
  db.data.users[userIndex].orders.push(newOrder)
  db.data.products = db.data.products.map(p => updatedProducts.find(up => up.productId === p.productId) || p)
  
  console.log('Before writing to database:', JSON.stringify(db.data, null, 2));
  
  try {
    await db.write()
    console.log('After writing to database:', JSON.stringify(db.data, null, 2));
    return { success: true, message: "Order placed successfully", order: newOrder }
  } catch (error) {
    console.error("Error writing to database:", error)
    return { success: false, message: "Error processing order. Please try again." }
  }
}

