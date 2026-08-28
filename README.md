# ShopSphere — Full-Stack E-Commerce Platform

A production-structured, mobile-first e-commerce application.

**Stack:** React.js (custom hooks, Bootstrap) · Node.js/Express.js · MongoDB (Mongoose) · JWT Auth + RBAC · Braintree Payments · Chart.js Analytics · Axios

---

## 1. Project Structure

```
ecommerce-app/
├── backend/
│   ├── config/          # db.js (MongoDB), braintree.js (payment gateway)
│   ├── models/          # User, Product, Category, Order (Mongoose schemas)
│   ├── middleware/       # auth.js (JWT + RBAC), errorHandler.js, validate.js
│   ├── controllers/      # authController, productController, categoryController,
│   │                     # orderController (incl. sales analytics), paymentController
│   ├── routes/           # REST endpoints, grouped by resource
│   ├── utils/            # AppError, APIFeatures (filter/sort/paginate), logger, seed.js
│   ├── app.js             # Express app + security middleware
│   ├── server.js          # Entry point, DB connect, graceful shutdown
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── services/      # api.js (Axios instance), authService, productService, orderService
    │   ├── context/       # AuthContext, CartContext
    │   ├── hooks/         # useAuth, useCart, useFetch, useDebounce
    │   ├── components/    # Navbar, ProductCard, PrivateRoute, AdminRoute, Loader, Footer
    │   ├── pages/          # Home, ProductList, ProductDetails, Cart, Checkout,
    │   │                   # Login, Register, Profile, Orders, OrderDetails, AdminDashboard
    │   └── App.js          # Routing
    └── .env.example
```

---

## 2. Prerequisites

- Node.js ≥ 18
- MongoDB (local install or a free MongoDB Atlas cluster)
- A free Braintree Sandbox account: https://sandbox.braintreegateway.com

---

## 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string (32+ chars)
- `BRAINTREE_MERCHANT_ID`, `BRAINTREE_PUBLIC_KEY`, `BRAINTREE_PRIVATE_KEY` — from your Braintree sandbox dashboard under Account → API Keys

Seed the database with an admin user and sample products:

```bash
npm run seed
```

This creates:
- Admin login: `admin@ecommerce.com` / `Admin@12345`
- One category ("Electronics") and two sample products

Start the backend:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start        # production mode
```

Backend runs on `http://localhost:8080`. Confirm it's alive:

```bash
curl http://localhost:8080/health
```

---

## 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` just needs:
```
REACT_APP_API_URL=http://localhost:8080/api/v1
```

Start the frontend:

```bash
npm start
```

Runs on `http://localhost:3000` and proxies API calls to the backend.

---

## 5. End-to-End Workflow (what happens when someone uses the app)

1. **Registration/Login** — `POST /api/v1/auth/register` or `/login` issues a JWT (returned in the response body *and* set as an httpOnly cookie). The frontend stores the token in `localStorage` for the `Authorization: Bearer` header, and `AuthContext` rehydrates the session via `GET /auth/me` on page load.
2. **Browsing** — `ProductList` calls `GET /api/v1/products` with query params (`keyword`, `category`, `sort`, `page`) handled server-side by the reusable `APIFeatures` query builder (text search index + Mongo filters + pagination).
3. **Cart** — Managed entirely client-side via `CartContext` (a `useReducer` + `localStorage`), so it survives refreshes without hitting the DB until checkout.
4. **Checkout & Payment**:
   - Frontend requests a Braintree **client token** (`GET /payments/client-token`), which mounts the Braintree Drop-in UI (card form).
   - On submit, Drop-in returns a **payment nonce** (never raw card data touches your server).
   - Frontend sends `{ paymentMethodNonce, orderItems, shippingAddress }` to `POST /payments/checkout`.
   - **Backend re-fetches every product from MongoDB and recalculates the total itself** — it never trusts client-sent prices. This closes the classic "edit the price in dev tools" exploit.
   - Backend charges the nonce via `gateway.transaction.sale()`, then creates the `Order` and decrements `Product.stock` atomically per item.
5. **Order tracking** — `GET /orders/my-orders` and `/orders/:id` (ownership-checked: a customer can only view their own orders; admins can view all).
6. **RBAC** — `role` on the `User` model (`customer` / `seller` / `admin`) is enforced by `middleware/auth.js`'s `restrictTo(...)`. Product creation/editing is `admin`+`seller`; category management and order status updates are `admin`-only; the frontend's `AdminRoute` mirrors this for UX, but the real enforcement is always server-side.
7. **Admin Analytics Dashboard** — `GET /orders/analytics/summary` runs three MongoDB aggregation pipelines (revenue-by-day, order-status breakdown, top-selling products) and the `AdminDashboard` page renders them with Chart.js (`Line`, `Doughnut`, `Bar`).

---

## 6. Security Measures Implemented

| Concern | Mitigation |
|---|---|
| Password storage | bcrypt hash (cost factor 12), never returned in API responses |
| Session integrity | JWT signed with server secret; `passwordChangedAt` invalidates old tokens after password change |
| Brute force | `express-rate-limit` — tighter limits on `/auth/*` (10 req/15min) |
| NoSQL injection | `express-mongo-sanitize` strips `$`/`.` operators from input |
| XSS | `xss-clean` sanitizes request bodies; `helmet` sets secure headers |
| Price tampering | Checkout total is always recomputed server-side from the DB, never trusted from the client |
| CSRF-adjacent | `sameSite: strict` cookies + CORS locked to `CLIENT_URL` |
| Payload DoS | `express.json({ limit: '10kb' })` |

---

## 7. API Reference (selected)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Create account |
| POST | `/api/v1/auth/login` | Public | Login, returns JWT |
| GET | `/api/v1/products` | Public | List/search/filter products |
| POST | `/api/v1/products/:id/reviews` | Private | Add product review |
| POST | `/api/v1/products` | Admin/Seller | Create product |
| GET | `/api/v1/payments/client-token` | Private | Init Braintree Drop-in |
| POST | `/api/v1/payments/checkout` | Private | Charge card, create order |
| GET | `/api/v1/orders/my-orders` | Private | Customer's own orders |
| GET | `/api/v1/orders/analytics/summary` | Admin | Chart.js dashboard data |
| PATCH | `/api/v1/orders/:id/status` | Admin | Update fulfillment status |

(20+ endpoints total across auth, products, categories, orders, and payments — see `backend/routes/`.)

---

## 8. Deployment Notes

- **Backend**: Deploy to Render/Railway/EC2. Set all `.env` vars in the host's environment config. Use MongoDB Atlas for a managed DB. Set `BRAINTREE_ENV=Production` and switch to production Braintree keys only after PCI compliance review.
- **Frontend**: `npm run build` produces a static bundle deployable to Vercel/Netlify/S+CloudFront. Point `REACT_APP_API_URL` at your deployed backend URL.
- Put the backend behind HTTPS in production — `secure: true` cookies require it.

---
