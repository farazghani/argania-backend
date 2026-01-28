# argania-backend

backend for arganiaprofessional

Backend service for Argania Professional — an e-commerce platform that handles users, products, carts, and orders with a clean layered architecture using Node.js, Express, and Prisma.

This project follows industry-standard backend structure with clear separation of routes → controllers → services → database to keep the codebase scalable, testable, and easy to maintain.


Tech Stack

Node.js

Express.js

Prisma ORM

PostgreSQL / MySQL (via Prisma)

JWT Authentication

REST API architecture


PROJECT STRUCTURE:
```
argania-backend/
│── prisma/
│ └── schema.prisma # Prisma models
│
│── src/
│ ├── routes/ # All API routes
│ │ ├── user.routes.js # login, register, profile
│ │ ├── product.routes.js # products CRUD
│ │ ├── cart.routes.js # add/remove cart items
│ │ └── order.routes.js # checkout, order management
│ │
│ ├── controllers/ # Handle request/response logic
│ │ ├── user.controller.js
│ │ ├── product.controller.js
│ │ ├── cart.controller.js
│ │ └── order.controller.js
│ │
│ ├── services/ # Business logic / Prisma queries
│ │ ├── user.service.js
│ │ ├── product.service.js
│ │ ├── cart.service.js
│ │ └── order.service.js
│ │
│ ├── utils/ # Helpers (validation, errors, auth middleware, etc.)
│ │ └── auth.js
│ │
│ ├── app.js # Express app setup (middlewares, routes)
│ └── server.js # Server entry point
│
└── package.json

```
