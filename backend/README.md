# Backend API - POS Kedai Kopi

REST API built with Express.js, TypeScript, MongoDB, and JWT authentication.

## 🚀 Features

- ✅ JWT-based authentication
- ✅ Bcrypt password hashing
- ✅ Role-based access control
- ✅ RESTful API endpoints
- ✅ Input validation (Joi)
- ✅ Error handling middleware
- ✅ MongoDB Mongoose ODM
- ✅ TypeScript for type safety
- ✅ CORS enabled

## 📋 Prerequisites

- Node.js v16+
- MongoDB v4.4+ (local or MongoDB Atlas)
- npm or yarn

## 🔧 Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your config
# For local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/pos-kedai-kopi
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pos-kedai-kopi

# Start development server
npm run dev
```

## 📝 Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/pos-kedai-kopi

# JWT
JWT_SECRET=your_secret_key_change_this

# Server
PORT=3001
NODE_ENV=development

# Security
BCRYPT_ROUNDS=10
```

## ▶️ Running

```bash
# Development (with hot reload)
npm run dev

# Production Build
npm run build

# Run compiled version
npm start

# Lint code
npm run lint
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "CASHIER"  // optional, defaults to CASHIER
}

Response:
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CASHIER"
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CASHIER"
  }
}
```

#### Get Current User
```
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CASHIER",
    "isActive": true
  }
}
```

### Product Endpoints

#### Get Products
```
GET /products?category=ESPRESSO
Authorization: Bearer <token>

Query Parameters:
- category: ESPRESSO | MANUAL_BREW | NON_COFFEE | FOOD | ALL

Response:
{
  "products": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "storeId": "default",
      "name": "Espresso",
      "category": "ESPRESSO",
      "basePrice": 15000,
      "image": "data:image/jpeg;base64,...",
      "stock": 100,
      "isActive": true,
      "variants": [
        {
          "id": "small",
          "name": "Small",
          "extraPrice": 0
        },
        {
          "id": "large",
          "name": "Large",
          "extraPrice": 5000
        }
      ],
      "createdAt": "2026-05-18T10:00:00Z",
      "updatedAt": "2026-05-18T10:00:00Z"
    }
  ]
}
```

#### Create Product (ADMIN/MANAGER only)
```
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Cappuccino",
  "category": "ESPRESSO",
  "basePrice": 20000,
  "stock": 50,
  "image": "data:image/jpeg;base64,...",  // optional
  "variants": [
    {
      "id": "small",
      "name": "Small",
      "extraPrice": 0
    },
    {
      "id": "large",
      "name": "Large",
      "extraPrice": 5000
    }
  ]
}

Response:
{
  "message": "Product created",
  "product": { /* product object */ }
}
```

#### Update Product (ADMIN/MANAGER only)
```
PUT /products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Cappuccino Updated",
  "basePrice": 22000,
  "stock": 75,
  "isActive": true
}

Response:
{
  "message": "Product updated",
  "product": { /* product object */ }
}
```

#### Delete Product (ADMIN/MANAGER only)
```
DELETE /products/:id
Authorization: Bearer <token>

Response:
{
  "message": "Product deleted",
  "product": { /* product object */ }
}
```

### Sales Endpoints

#### Create Sale
```
POST /sales
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerName": "John Doe",  // optional
  "orderType": "DINE_IN",       // DINE_IN | TAKE_AWAY
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "qty": 2,
      "selectedVariantIds": ["large"],
      "note": "Extra ice"  // optional
    }
  ],
  "discount": 0,                // Rp amount
  "tax": 1500,                  // Rp amount
  "paymentMethod": "CASH",      // CASH | QRIS | TRANSFER
  "paidAmount": 50000
}

Response:
{
  "message": "Sale created successfully",
  "sale": {
    "_id": "507f1f77bcf86cd799439012",
    "cashierId": "507f1f77bcf86cd799439011",
    "date": "2026-05-18T15:30:00Z",
    "customerName": "John Doe",
    "orderType": "DINE_IN",
    "items": [ /* items array */ ],
    "subtotal": 40000,
    "discount": 0,
    "tax": 1500,
    "total": 41500,
    "payment": {
      "method": "CASH",
      "paidAmount": 50000,
      "change": 8500
    }
  },
  "change": 8500
}
```

#### Get Sales Report
```
GET /sales/report?startDate=2026-05-01&endDate=2026-05-31
Authorization: Bearer <token>

Query Parameters:
- startDate: ISO format date (optional)
- endDate: ISO format date (optional)

Response:
{
  "sales": [ /* array of sales */ ],
  "summary": {
    "totalSales": 100,
    "totalRevenue": 2500000,
    "totalDiscount": 100000,
    "totalTax": 50000,
    "byPaymentMethod": {
      "CASH": 1500000,
      "QRIS": 800000,
      "TRANSFER": 200000
    },
    "topProducts": [
      {
        "name": "Espresso",
        "qty": 150,
        "total": 2250000
      }
    ]
  }
}
```

#### Get Sale by ID
```
GET /sales/:id
Authorization: Bearer <token>

Response:
{
  "sale": { /* sale object */ }
}
```

## 🔐 Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens expire after 7 days. User needs to login again after expiry.

## 👥 Roles & Permissions

| Endpoint | ADMIN | MANAGER | CASHIER |
|----------|-------|---------|---------|
| GET /auth/me | ✅ | ✅ | ✅ |
| GET /products | ✅ | ✅ | ✅ |
| POST /products | ✅ | ✅ | ❌ |
| PUT /products/:id | ✅ | ✅ | ❌ |
| DELETE /products/:id | ✅ | ✅ | ❌ |
| POST /sales | ✅ | ✅ | ✅ |
| GET /sales/report | ✅ | ✅ | ✅ |
| GET /sales/:id | ✅ | ✅ | ✅ |

## ✅ Health Check

```
GET /api/health

Response:
{
  "status": "OK",
  "timestamp": "2026-05-18T15:30:00.000Z"
}
```

## 🐛 Error Responses

### Validation Error
```
Status: 400

{
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Authentication Error
```
Status: 401

{
  "error": "Invalid or expired token"
}
```

### Authorization Error
```
Status: 403

{
  "error": "Access denied. Insufficient permissions."
}
```

### Not Found
```
Status: 404

{
  "error": "Product not found"
}
```

### Server Error
```
Status: 500

{
  "error": "Internal server error"
}
```

## 🔒 Security Best Practices

1. **Password Hashing**
   - All passwords hashed with bcryptjs (10 rounds)
   - Never logged or exposed

2. **JWT Tokens**
   - Secure token generation
   - 7-day expiry
   - Refresh token ready (future)

3. **Input Validation**
   - Joi schemas on all endpoints
   - Type validation
   - Sanitization

4. **Error Handling**
   - No sensitive data in error messages
   - Proper HTTP status codes
   - Request logging (production)

5. **CORS**
   - Configured for specific origins
   - Update for production

## 📦 Dependencies

```json
{
  "express": "REST API framework",
  "mongoose": "MongoDB ODM",
  "bcryptjs": "Password hashing",
  "jsonwebtoken": "JWT authentication",
  "joi": "Input validation",
  "cors": "Cross-origin requests",
  "dotenv": "Environment variables",
  "uuid": "ID generation"
}
```

## 🚀 Deployment

### Heroku
```bash
# Create Heroku app
heroku create pos-api

# Set environment variables
heroku config:set MONGODB_URI=<your-atlas-url>
heroku config:set JWT_SECRET=<strong-secret>

# Deploy
git push heroku main
```

### AWS/DigitalOcean/Render
1. Push to GitHub
2. Connect repo to hosting platform
3. Set environment variables
4. Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Manual testing with cURL
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test"}'

# With Postman
# Import collection from docs/postman-collection.json
```

## 📊 Database Indexes

For performance, create these indexes:

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })

// Products
db.products.createIndex({ storeId: 1, isActive: 1 })
db.products.createIndex({ category: 1 })

// Sales
db.sales.createIndex({ storeId: 1, date: -1 })
db.sales.createIndex({ cashierId: 1 })
```

## 🔧 Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
- Ensure MongoDB is running
- Check connection string in .env
- Verify database name matches

### JWT Secret Not Set
```
Error: JWT secret not found
```
- Set JWT_SECRET in .env
- Use strong, random string

### Port Already in Use
```
Error: listen EADDRINUSE :::3001
```
- Change PORT in .env
- Or kill process on port: `lsof -ti:3001 | xargs kill`

## 📞 Support

For issues or questions:
1. Check logs in console
2. Verify environment variables
3. Test endpoints with Postman
4. Check MongoDB connection

## 📄 License

MIT License

---

**Last Updated:** May 18, 2026
**Version:** 1.0.0
