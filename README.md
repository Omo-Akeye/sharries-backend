# Sharries Backend

The Sharries Backend is the server-side component of an e-commerce platform built to manage products, orders, user authentication, and reviews. It provides a robust RESTful API for the Sharries application, utilizing Node.js, Express.js, MongoDB for data storage, and Cloudinary for image management. The backend includes features like rate limiting, JWT-based authentication, and scheduled health checks to ensure reliability.

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features
- **User Authentication**: Register, login, logout, and profile management with JWT-based authentication.
- **Product Management**: Create, read, update, and delete (CRUD) products, including image uploads via Cloudinary.
- **Order Processing**: Place orders, view order history, and manage order statuses (Pending, Processed, Shipped, Delivered, Cancelled).
- **Reviews**: Add, update, and delete product reviews associated with specific products.
- **Rate Limiting**: Protects the API with a limit of 100 requests per 15 minutes per user or IP.
- **Health Monitoring**: Scheduled cron job pings the server every 10 minutes to prevent cold starts and ensure availability.
- **CORS Support**: Configured to allow requests from the frontend hosted at `https://sharries.vercel.app`.

## Technologies
- **Node.js**: JavaScript runtime for server-side development.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing users, products, orders, and reviews.
- **Cloudinary**: Cloud-based image storage for product images.
- **JWT (JSON Web Tokens)**: Secure user authentication.
- **Passport.js**: Authentication middleware for user login strategies.
- **express-rate-limit**: Rate limiting to prevent API abuse.
- **node-cron**: Scheduled tasks for server health checks.
- **Other Dependencies**: bcryptjs, nodemailer, cookie-parser, cors, mongoose, and more (see `package.json`).

## Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Omo-Akeye/sharries-backend.git
   cd sharries-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory with the following:
   ```env
   PORT=
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   SERVER_URL=https://your-deployed-server-url
   ```
   Replace placeholders (`your_mongodb_connection_string`, etc.) with your actual credentials.

4. **Start the server**:
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:6010` (or the port specified in `.env`) and includes a cron job to ping the `/health` endpoint every 10 minutes.



For detailed API usage, refer to the [API Endpoints](#api-endpoints) section.

## API Endpoints
Below are the main API endpoints based on the provided route files:

### User Routes
| Method | Endpoint                    | Description                        | Authentication |
|--------|-----------------------------|------------------------------------|----------------|
| POST   | `/register`                 | Register a new user                | None           |
| POST   | `/login`                    | Authenticate a user                | None           |
| POST   | `/logout`                   | Log out a user                    | None           |
| GET    | `/check-auth`               | Check authentication status        | JWT            |
| GET    | `/user-profile`             | Get user profile                  | JWT            |
| POST   | `/user/total-spent`         | Calculate user’s total spent       | Required       |

### Product Routes
| Method | Endpoint                              | Description                        | Authentication |
|--------|---------------------------------------|------------------------------------|----------------|
| POST   | `/addproduct`                        | Create a new product               | Required (Upload) |
| GET    | `/getproducts`                       | Get all products                   | None           |
| DELETE | `/deleteproduct/:productId`          | Delete a product                   | Required       |
| PUT    | `/updateproduct/:productId`          | Update a product                   | Required       |
| GET    | `/product/get-filtered-products`     | Get filtered products              | None           |
| GET    | `/product/:productId`                | Get product by ID                  | None           |
| GET    | `/product/search/:productname`       | Search products by name            | None           |

### Order Routes
| Method | Endpoint                    | Description                        | Authentication |
|--------|-----------------------------|------------------------------------|----------------|
| POST   | `/postorder`                | Place a new order                  | Optional       |
| GET    | `/order/:orderID`           | Get order by ID                    | None           |
| GET    | `/getorders`                | Get all orders                     | None           |
| DELETE | `/order/:orderID`           | Delete an order                    | Required       |
| GET    | `/user/orders`              | Get user’s order history           | Required       |

### Review Routes
| Method | Endpoint                              | Description                        | Authentication |
|--------|---------------------------------------|------------------------------------|----------------|
| POST   | `/products/:productId/reviews`       | Add a review for a product         | Required       |
| GET    | `/products/:productId/reviews`       | Get reviews for a product          | None           |
| PUT    | `/products/:productId/reviews/:reviewId` | Update a review                | Required       |
| DELETE | `/products/:productId/reviews/:reviewId` | Delete a review                | Required       |

*Note*: Some endpoints require authentication via JWT. Ensure you include the `Authorization` header with a valid token for protected routes.

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please ensure your code follows the project’s coding standards and includes relevant tests.

## License
This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## Contact
For questions or feedback, reach out to:
- **Akeye Saheed**: [akeyesunkanmi@gmail.com](mailto:akeyesunkanmi@gmail.com)
- **GitHub**: [Omo-Akeye](https://github.com/Omo-Akeye)
