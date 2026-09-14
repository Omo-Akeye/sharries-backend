import swaggerJSDoc from 'swagger-jsdoc';

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Sharries Backend API',
    version: '1.0.0',
    description:
      'REST API for the Sharries e-commerce platform: products, orders, reviews, and auth.',
  },
  servers: [
    { url: process.env.SERVER_URL || 'http://localhost:6010', description: 'Current environment' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'auth-token',
        description: 'JWT set by POST /login as an httpOnly cookie.',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '6512f0c9a1b2c3d4e5f6a7b8' },
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          phoneNumber: { type: 'number', example: 2348012345678 },
          role: { type: 'string', enum: ['customer', 'admin'], example: 'customer' },
          totalPurchases: { type: 'number', example: 3 },
          totalSpent: { type: 'number', example: 45000 },
        },
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'Rose Body Cream' },
          categories: { type: 'string', example: 'skincare' },
          price: { type: 'number', example: 8500 },
          description: { type: 'string' },
          howToUse: { type: 'string' },
          images: { type: 'array', items: { type: 'string', format: 'uri' } },
          isOutOfStock: { type: 'boolean', example: false },
        },
      },
      CartItem: {
        type: 'object',
        required: ['_id', 'name', 'price', 'quantity', 'src', 'subTotal'],
        properties: {
          _id: { type: 'string', description: 'Product ID' },
          name: { type: 'string' },
          price: { type: 'number' },
          quantity: { type: 'integer', minimum: 1, maximum: 100 },
          src: { type: 'string', format: 'uri' },
          subTotal: { type: 'number' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          orderID: { type: 'string', example: 'a1b2c3d4e5' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phoneNumber: { type: 'number' },
          shippingFee: { type: 'number' },
          shippingAddress: { type: 'string' },
          paymentMethod: { type: 'string' },
          paymentStatus: { type: 'string', example: 'checking' },
          orderStatus: { type: 'string', example: 'processing' },
          cartItems: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
          orderTotal: { type: 'number' },
        },
      },
      Review: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: {
            oneOf: [
              { type: 'string', description: 'User ID' },
              {
                type: 'object',
                properties: { _id: { type: 'string' }, name: { type: 'string' } },
              },
            ],
          },
          comment: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Missing or invalid auth cookie',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Forbidden: {
        description: 'Authenticated but not allowed (wrong role/owner)',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NotFound: {
        description: 'Resource not found',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
  security: [],
};

export const swaggerSpec = swaggerJSDoc({
  definition,
  apis: ['./src/routes/*.js'],
});
