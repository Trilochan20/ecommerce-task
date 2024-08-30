# API Documentation

This document outlines the API endpoints and their functionalities for the e-commerce application.

## GET Endpoints

### Get All Products

- **URL**: `/api`
- **Method**: `GET`
- **Description**: Retrieves all products.
- **Response**: JSON object containing an array of products.

### Get User Orders

- **URL**: `/api?action=getUserOrders&userId={userId}`
- **Method**: `GET`
- **Description**: Retrieves orders for a specific user.
- **Parameters**:
  - `userId`: The ID of the user.
- **Response**: JSON object containing an array of user orders.

### Get Single Product

- **URL**: `/api?action=getProduct&productId={productId}`
- **Method**: `GET`
- **Description**: Retrieves details of a specific product.
- **Parameters**:
  - `productId`: The ID of the product.
- **Response**: JSON object containing product details.

### Get Users

- **URL**: `/api?action=getUsers`
- **Method**: `GET`
- **Description**: Retrieves all non-admin users.
- **Response**: JSON object containing an array of users.

### Get User Order Count

- **URL**: `/api?action=getUserOrderCount&userId={userId}`
- **Method**: `GET`
- **Description**: Retrieves the number of orders for a specific user.
- **Parameters**:
  - `userId`: The ID of the user.
- **Response**: JSON object containing the order count.

### Get Discount Order

- **URL**: `/api?action=getDiscountOrder`
- **Method**: `GET`
- **Description**: Retrieves the current discount order setting.
- **Response**: JSON object containing the discount order value.

### Get Discount Codes

- **URL**: `/api?action=getDiscountCodes`
- **Method**: `GET`
- **Description**: Retrieves all discount codes.
- **Response**: JSON object containing an array of discount codes.

### Get All Orders

- **URL**: `/api?action=getAllOrders`
- **Method**: `GET`
- **Description**: Retrieves all orders from all users.
- **Response**: JSON object containing an array of all orders.

### Get All Users

- **URL**: `/api?action=getAllUsers`
- **Method**: `GET`
- **Description**: Retrieves all users, including admins.
- **Response**: JSON object containing an array of all users.

## POST Endpoints

### User Login

- **URL**: `/api?action=login`
- **Method**: `POST`
- **Description**: Authenticates a user.
- **Body**: JSON object containing `email` and `password`.
- **Response**: JSON object with user details on success, or error message.

### Create User

- **URL**: `/api?action=createUser`
- **Method**: `POST`
- **Description**: Creates a new user account.
- **Body**: JSON object containing user details (`name`, `email`, `password`).
- **Response**: JSON object with created user details.

### Checkout

- **URL**: `/api?action=checkout`
- **Method**: `POST`
- **Description**: Processes a user's order.
- **Body**: JSON object containing `userId`, `cartItems`, and optional `discountCode`.
- **Response**: JSON object with order details and new discount code if applicable.

### Generate Discount Code

- **URL**: `/api?action=generateDiscountCode`
- **Method**: `POST`
- **Description**: Generates a new discount code for an eligible user.
- **Body**: JSON object containing `userId`.
- **Response**: JSON object with discount code details if user is eligible.

### Set Discount Order

- **URL**: `/api?action=setDiscountOrder`
- **Method**: `POST`
- **Description**: Sets the discount order value (admin only).
- **Body**: JSON object containing `userId` and `discountOrder`.
- **Response**: JSON object confirming the update.

### Create Product

- **URL**: `/api`
- **Method**: `POST`
- **Description**: Creates a new product.
- **Body**: JSON object containing product details (`name`, `quantity`, `price`, `image`).
- **Response**: JSON object with created product details.

## PUT Endpoint

### Update Product

- **URL**: `/api`
- **Method**: `PUT`
- **Description**: Updates an existing product.
- **Body**: JSON object containing `productId` and updated product details.
- **Response**: JSON object with updated product details.

## DELETE Endpoint

### Delete Product

- **URL**: `/api?productId={productId}`
- **Method**: `DELETE`
- **Description**: Deletes a specific product.
- **Parameters**:
  - `productId`: The ID of the product to delete.
- **Response**: JSON object confirming the deletion.
