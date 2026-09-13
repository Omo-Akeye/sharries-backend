# Sharries Backend

The Sharries Backend is the server-side component of an e-commerce platform built to manage products, orders, user authentication, and reviews. It provides a RESTful API for the Sharries application, using Node.js, Express.js, MongoDB, and Cloudinary for image management. It includes role-based access control, JWT-based authentication with server-side token revocation, rate limiting, and scheduled health checks.

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Roles & Admin Access](#roles--admin-access)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features
- **User Authentication**: Register, login, logout, and profile management with JWT-based authentication (cookie-based, `httpOnly`).
- **Role-Based Access Control**: Every user has a `role` of `customer` or `admin`. Product and order management endpoints require an `admin` role, not just a valid login.
- **Product Management**: Create, read, update, and delete products, including image uploads via Cloudinary (admin-only, image files up to 5MB, max 5 files per request).
- **Order Processing**: Place orders (guest or logged-in), track an order by ID + the email it was placed under, view personal order history, and manage order statuses (Pending, Processed, Shipped, Delivered, Cancelled). Server-side validation enforces real product prices, stock availability, and sane quantity/shipping-fee bounds — client-submitted totals are never trusted.
- **Reviews**: Authenticated users can add, update, and delete their own reviews; only the review's author or an admin can edit/delete it. Public review listings expose only the reviewer's name, never other profile data.
- **Rate Limiting**: General API limit of 100 requests per 15 minutes per IP; a stricter 10 requests per 15 minutes limit on `/login` and `/register` to slow down credential stuffing.
- **Security Headers & CSRF Mitigation**: `helmet` for standard security headers, a strict CORS allow-list, and an `Origin` check on all state-changing requests.
- **Health Monitoring**: Scheduled cron job pings the server every 10 minutes to prevent cold starts and ensure availability.
- **CORS Support**: Configured to allow requests from the frontend hosted at `https://sharries.vercel.app` only.

## Technologies
- **Node.js** / **Express.js**: Server runtime and web framework.
- **MongoDB** / **Mongoose**: Data storage.
- **Cloudinary**: Cloud-based image storage for product images.
- **JWT (JSON Web Tokens)** + **Passport.js**: Cookie-based authentication (local + JWT strategies), with a `tokenVersion` field on each user so logout/credential changes actually invalidate outstanding tokens instead of only clearing the cookie client-side.
- **Helmet**: Security-related HTTP headers.
- **express-rate-limit**: General and auth-specific rate limiting.
- **node-cron**: Scheduled health-check pings.
- **busboy**: Streaming multipart parsing for image uploads.
- **Other Dependencies**: bcryptjs, cookie-parser, cors, dotenv (see `package.json` for exact versions).

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
   Create a `.env` file in the root directory (this file is gitignored — never commit it) with the following:
   ```env
   PORT=6010
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   SERVER_URL=https://your-deployed-server-url
   ```
   Replace placeholders with your actual credentials. Note the variable is `MONGO_URI`, not `MONGODB_URI`.

4. **Start the server**:
   ```bash
   npm run dev
   ```
   The server runs on `http://localhost:6010` (or the port specified in `.env`) and includes a cron job that pings `/health` every 10 minutes.

For detailed API usage, see [API Endpoints](#api-endpoints).

## Roles & Admin Access
Every registered user gets `role: "customer"` by default — there is no self-service way to become an admin, by design. To promote a user to admin, set it directly in the database after they've registered once:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

Admin-only endpoints (product management, viewing all orders, deleting orders) require both a valid login **and** `role: "admin"` — a regular logged-in customer gets a `403`.

## API Endpoints

### User Routes
| Method | Endpoint             | Description                  | Authentication      |
|--------|-----------------------|-------------------------------|----------------------|
| POST   | `/register`           | Register a new user (`role` always defaults to `customer`) | None (rate-limited) |
| POST   | `/login`              | Authenticate a user, sets `auth-token` cookie | None (rate-limited) |
| POST   | `/logout`             | Log out and invalidate the current token server-side | Required |
| GET    | `/check-auth`         | Check authentication status and get session user | Required |
| GET    | `/user-profile`       | Get user profile              | Required             |
| POST   | `/user/total-spent`   | Calculate the current user's total spent | Required |

### Product Routes
| Method | Endpoint                          | Description                  | Authentication |
|--------|------------------------------------|-------------------------------|----------------|
| POST   | `/addproduct`                     | Create a new product (multipart, images required) | Admin |
| GET    | `/getproducts`                    | Get all products              | None           |
| DELETE | `/deleteproduct/:productId`       | Delete a product               | Admin          |
| PUT    | `/updateproduct/:productId`       | Update a product's fields      | Admin          |
| GET    | `/product/get-filtered-products`  | Get paginated/sorted products  | None           |
| GET    | `/product/:productId`             | Get product by ID              | None           |
| GET    | `/product/search/:productname`    | Search products by name        | None           |

### Order Routes
| Method | Endpoint             | Description                  | Authentication |
|--------|-----------------------|-------------------------------|----------------|
| POST   | `/postorder`          | Place a new order (server validates prices, stock, quantities, shipping fee) | Optional |
| GET    | `/order/:orderID?email=` | Get an order by ID — the email that placed the order must also be supplied | None |
| GET    | `/getorders`          | Get all orders                | Admin          |
| DELETE | `/order/:orderID`     | Delete an order                | Admin          |
| GET    | `/user/orders`        | Get the current user's order history | Required |

### Review Routes
| Method | Endpoint                                   | Description             | Authentication |
|--------|----------------------------------------------|--------------------------|----------------|
| POST   | `/products/:productId/reviews`               | Add a review for a product (author is taken from the session, never the request body) | Required |
| GET    | `/products/:productId/reviews`               | Get reviews for a product (reviewer's name only) | None |
| PUT    | `/products/:productId/reviews/:reviewId`     | Update a review           | Author or Admin |
| DELETE | `/products/:productId/reviews/:reviewId`     | Delete a review           | Author or Admin |

*Note*: "Required"/"Admin" endpoints expect the `auth-token` cookie set by `/login` (sent automatically by browsers with `credentials: 'include'`); there is no `Authorization`-header flow.

## Security
A few things worth knowing if you're integrating a frontend against this API:
- Auth is cookie-based (`httpOnly`, `secure`, `SameSite=None`), not a bearer token — API clients must send credentials with every request.
- Mutating requests (`POST`/`PUT`/`PATCH`/`DELETE`) are rejected with `403` if their `Origin` header isn't the configured frontend origin.
- Logging out invalidates the token server-side (via a `tokenVersion` check), so a copied/leaked cookie stops working immediately after the legitimate user logs out — it isn't just cleared client-side.
- Order totals, prices, stock, and quantities are always recomputed and validated server-side; client-submitted amounts are never trusted.
- Passwords must be 8–128 characters and include at least one letter and one number.

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please ensure your code follows the project's coding standards and includes relevant tests.

## License
This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## Contact
For questions or feedback, reach out to:
- **Akeye Saheed**: [akeyesunkanmi@gmail.com](mailto:akeyesunkanmi@gmail.com)
- **GitHub**: [Omo-Akeye](https://github.com/Omo-Akeye)
