# argania-backend

backend for arganiaprofessional

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

