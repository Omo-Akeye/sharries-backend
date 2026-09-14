import express from 'express';
import uploadImage from '../middlewares/upload.js';
import { authenticateJWT, authorizeAdmin } from '../middlewares/auth.js';
import { createProduct, deleteProduct, getFilteredProducts, getProductById, getProducts, searchProduct, updateProduct } from '../controllers/productControllers.js';




const productRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog management
 */

/**
 * @swagger
 * /addproduct:
 *   post:
 *     summary: Create a new product (admin only)
 *     tags: [Products]
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, categories, price, description, howToUse, images]
 *             properties:
 *               name: { type: string }
 *               categories: { type: string }
 *               price: { type: number }
 *               description: { type: string }
 *               howToUse: { type: string }
 *               isOutOfStock: { type: boolean }
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *                 description: Up to 5 image files, 5MB max each
 *     responses:
 *       201: { description: Product created }
 *       400: { description: At least one valid image is required }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
productRouter.post('/addproduct',authenticateJWT, authorizeAdmin, uploadImage, createProduct);

/**
 * @swagger
 * /getproducts:
 *   get:
 *     summary: List all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Product' }
 */
productRouter.get('/getproducts', getProducts);

/**
 * @swagger
 * /deleteproduct/{productId}:
 *   delete:
 *     summary: Delete a product (admin only)
 *     tags: [Products]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Product deleted }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
productRouter.delete('/deleteproduct/:productId',authenticateJWT, authorizeAdmin, deleteProduct)

/**
 * @swagger
 * /updateproduct/{productId}:
 *   put:
 *     summary: Update a product's fields (admin only)
 *     tags: [Products]
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               categories: { type: string }
 *               price: { type: number }
 *               description: { type: string }
 *               howToUse: { type: string }
 *               isOutOfStock: { type: boolean }
 *     responses:
 *       200: { description: Product updated }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
productRouter.put('/updateproduct/:productId',authenticateJWT, authorizeAdmin, updateProduct)

/**
 * @swagger
 * /product/get-filtered-products:
 *   get:
 *     summary: List products with sorting and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema: { type: string, enum: [price-low-to-high, price-high-to-low, latest, oldest] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: Paginated product list }
 */
productRouter.get('/product/get-filtered-products',getFilteredProducts)

/**
 * @swagger
 * /product/{productId}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
productRouter.get('/product/:productId',getProductById)

/**
 * @swagger
 * /product/search/{productname}:
 *   get:
 *     summary: Search products by name
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productname
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Matching products }
 *       404: { description: No products found matching the search criteria }
 */
productRouter.get('/product/search/:productname',searchProduct)



export default productRouter;
