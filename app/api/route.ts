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

type Order = {
  productName: string,
  qtyBought: number,
  pricePaid: number
}

type User = {
  name: string,
  email: string,
  userId: string,
  password: string,
  role: string, // Add this line
  orders: Order[]
}

type Schema = {
  products: Product[],
  users: User[]
}

// Define the default data
const defaultData: Schema = {
  products: [],
  users: []
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

// list all products
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    await db.read()

    if (action === 'getUsers') {
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

  if (action === 'createUser') {
    await db.read()

    const body = await request.json()
    const { name, email, password } = body // Add password here

    // Check if user already exists
    const userExists = db.data.users.some(user => user.email === email)
    if (userExists) {
      return new Response(JSON.stringify({
        message: 'User already exists'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 409
      })
    }

    // Create new user
    const newUser: User = {
      name,
      email,
      password, // Add password here
      userId: randomUUID(),
      role: 'user', // Always set role to 'user'
      orders: []
    }

    db.data.users.push(newUser)
    await db.write()

    return new Response(JSON.stringify({
      message: 'User created successfully',
      user: { ...newUser, password: undefined } // Exclude password from response
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 201
    })
  }

  // Existing product creation logic
  const body = await request.json()
  const newProduct: Product = {
    productId: body.productId,
    name: body.name,
    quantity: body.quantity,
    price: body.price,
    image: body.image
  }

  const validationError = validateProduct(newProduct);
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

  db.data.products.push(newProduct)
  await db.write()

  return new Response(JSON.stringify({
    message: 'Product created successfully',
    product: newProduct
  }), {
    headers: {
      'Content-Type': 'application/json'
    },
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

