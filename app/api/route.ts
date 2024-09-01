import {
  getAllProductsResponse,
  getProductResponse,
  getUserOrders,
  getUsersResponse,
  getUserOrderCount,
  getDiscountOrder,
  getDiscountCodesResponse,
  getAllOrdersResponse,
  getAllUsersResponse,
  handleLogin,
  handleCheckoutRequest,
  handleProductCreation,
  generateDiscountCode,
  setDiscountOrder,
  createUser,
  validateProductUpdate,
  updateProduct
} from './helpers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('userId');
  const productId = searchParams.get('productId');

  try {
    switch (action) {
      case 'getUserOrders':
        return userId ? await getUserOrders(userId) : new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
      case 'getProduct':
        return productId ? await getProductResponse(productId) : new Response(JSON.stringify({ error: 'Product ID is required' }), { status: 400 });
      case 'getUsers':
        return await getUsersResponse();
      case 'getUserOrderCount':
        return userId ? await getUserOrderCount(userId) : new Response(JSON.stringify({ error: 'User ID is required' }), { status: 400 });
      case 'getDiscountOrder':
        return await getDiscountOrder();
      case 'getDiscountCodes':
        return await getDiscountCodesResponse();
      case 'getAllOrders':
        return await getAllOrdersResponse();
      case 'getAllUsers':
        return await getAllUsersResponse();
      default:
        return await getAllProductsResponse();
    }
  } catch (error) {
    console.error('Error in GET request:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'login':
      return await handleLogin(request);
    case 'createUser':
      return await createUser(request);
    case 'checkout':
      return await handleCheckoutRequest(request);
    case 'generateDiscountCode':
      return await generateDiscountCode(request);
    case 'setDiscountOrder':
      return await setDiscountOrder(request);
    default:
      return await handleProductCreation(request);
  }
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { productId, ...updates } = body;

  const validationError = validateProductUpdate(updates);
  if (validationError) {
    return new Response(JSON.stringify({ message: validationError }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    });
  }

  const result = await updateProduct(productId, updates);

  if (!result.success) {
    return new Response(JSON.stringify({ message: result.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: result.status
    });
  }

  return new Response(JSON.stringify({
    message: 'Product updated successfully',
    product: result.product
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return new Response(JSON.stringify({ message: 'Product ID is required' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    });
  }



  return new Response(JSON.stringify({
    message: 'Product deleted successfully',
    productId: productId
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
}

