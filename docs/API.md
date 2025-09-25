# 🔌 **API Documentation**

## 📘 **Overview**
This document provides comprehensive documentation for the Mini CRM API endpoints. The API follows RESTful principles and uses JWT authentication for secure access.

**Base URL**: `http://localhost:5000/api`  
**Authentication**: JWT Bearer Token  
**Content-Type**: `application/json`

---

## 🔐 **Authentication Endpoints**

### **POST /auth/register**
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "user"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "token": "jwt_token_here",
  "created_at": "2025-01-01T00:00:00.000Z"
}
```

### **POST /auth/login**
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "token": "jwt_token_here"
}
```

---

## 👥 **Customer Management Endpoints**

### **GET /customers**
Get all customers with pagination and search.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name, email, or company
- `userId` (optional): Filter by user ID

**Response (200):**
```json
{
  "customers": [
    {
      "id": "uuid",
      "name": "Customer Name",
      "email": "customer@example.com",
      "phone": "+1234567890",
      "company": "Company Inc",
      "address": "123 Main St",
      "created_at": "2025-01-01T00:00:00.000Z",
      "total_leads": 5,
      "total_value": "25000.00",
      "converted_leads": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### **GET /customers/:id**
Get customer by ID with associated leads.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+1234567890",
  "company": "Company Inc",
  "address": "123 Main St",
  "created_at": "2025-01-01T00:00:00.000Z",
  "leads": [
    {
      "id": "uuid",
      "title": "Lead Title",
      "description": "Lead description",
      "status": "New",
      "value": 5000,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### **POST /customers**
Create a new customer.

**Headers:**
```
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Customer",
  "email": "newcustomer@example.com",
  "phone": "+1234567890",
  "company": "New Company",
  "address": "456 Oak St"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "New Customer",
  "email": "newcustomer@example.com",
  "phone": "+1234567890",
  "company": "New Company",
  "address": "456 Oak St",
  "user_id": "user_uuid",
  "created_at": "2025-01-01T00:00:00.000Z"
}
```

### **PUT /customers/:id**
Update customer information.

**Headers:**
```
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Customer",
  "email": "updated@example.com",
  "phone": "+1234567890",
  "company": "Updated Company",
  "address": "789 Pine St"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Updated Customer",
  "email": "updated@example.com",
  "phone": "+1234567890",
  "company": "Updated Company",
  "address": "789 Pine St",
  "created_at": "2025-01-01T00:00:00.000Z"
}
```

### **DELETE /customers/:id**
Delete a customer.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response (200):**
```json
{
  "message": "Customer deleted successfully"
}
```

### **GET /customers/stats**
Get customer statistics.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `userId` (optional): Filter by user ID

**Response (200):**
```json
{
  "total_customers": 50,
  "total_leads": 125,
  "total_value": "250000.00",
  "converted_leads": 25,
  "conversion_rate": "20.00",
  "monthly_growth": [
    {
      "month": "2025-01-01",
      "count": 10
    }
  ]
}
```

---

## 🎯 **Leads Management Endpoints**

### **GET /leads**
Get all leads with pagination and filtering.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by title or description
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `userId` (optional): Filter by user ID

**Response (200):**
```json
{
  "leads": [
    {
      "id": "uuid",
      "title": "Lead Title",
      "description": "Lead description",
      "status": "New",
      "value": 5000,
      "priority": "High",
      "source": "Website",
      "customer_id": "customer_uuid",
      "assigned_to": "user_uuid",
      "created_at": "2025-01-01T00:00:00.000Z",
      "customer": {
        "name": "Customer Name",
        "email": "customer@example.com",
        "company": "Company Inc"
      },
      "assigned_user": {
        "name": "User Name",
        "email": "user@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 125,
    "totalPages": 13
  }
}
```

### **GET /leads/:id**
Get lead by ID with customer information.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Lead Title",
  "description": "Lead description",
  "status": "New",
  "value": 5000,
  "priority": "High",
  "source": "Website",
  "customer_id": "customer_uuid",
  "assigned_to": "user_uuid",
  "created_at": "2025-01-01T00:00:00.000Z",
  "customer": {
    "id": "customer_uuid",
    "name": "Customer Name",
    "email": "customer@example.com",
    "company": "Company Inc"
  }
}
```

### **POST /leads**
Create a new lead.

**Headers:**
```
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Lead",
  "description": "Lead description",
  "status": "New",
  "value": 5000,
  "priority": "High",
  "source": "Website",
  "customer_id": "customer_uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "New Lead",
  "description": "Lead description",
  "status": "New",
  "value": 5000,
  "priority": "High",
  "source": "Website",
  "customer_id": "customer_uuid",
  "assigned_to": "user_uuid",
  "created_at": "2025-01-01T00:00:00.000Z"
}
```

### **PUT /leads/:id**
Update lead information.

**Headers:**
```
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Lead",
  "description": "Updated description",
  "status": "Contacted",
  "value": 7500,
  "priority": "Medium"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Updated Lead",
  "description": "Updated description",
  "status": "Contacted",
  "value": 7500,
  "priority": "Medium",
  "created_at": "2025-01-01T00:00:00.000Z"
}
```

### **DELETE /leads/:id**
Delete a lead.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response (200):**
```json
{
  "message": "Lead deleted successfully"
}
```

### **GET /leads/stats**
Get leads statistics.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response (200):**
```json
{
  "total_leads": 125,
  "total_value": "625000.00",
  "conversion_rate": "20.00",
  "status_breakdown": {
    "New": 25,
    "Contacted": 30,
    "Qualified": 20,
    "Proposal": 15,
    "Negotiation": 10,
    "Converted": 20,
    "Lost": 5
  },
  "priority_breakdown": {
    "High": 40,
    "Medium": 50,
    "Low": 35
  }
}
```

---

## 💳 **Payment Endpoints**

### **GET /payments**
Get all payments with pagination and filtering.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `method` (optional): Filter by payment method
- `userId` (optional): Filter by user ID

**Response (200):**
```json
{
  "payments": [
    {
      "id": "uuid",
      "amount": 1000,
      "payment_method": "credit_card",
      "status": "completed",
      "description": "Payment description",
      "customer_id": "customer_uuid",
      "created_at": "2025-01-01T00:00:00.000Z",
      "customer": {
        "name": "Customer Name",
        "email": "customer@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 200,
    "totalPages": 20
  }
}
```

### **POST /payments**
Create a new payment record.

**Headers:**
```
Authorization: Bearer jwt_token_here
Content-Type: application/json
```

**Request Body:**
```json
{
  "amount": 1000,
  "payment_method": "credit_card",
  "status": "completed",
  "description": "Payment for services",
  "customer_id": "customer_uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "amount": 1000,
  "payment_method": "credit_card",
  "status": "completed",
  "description": "Payment for services",
  "customer_id": "customer_uuid",
  "user_id": "user_uuid",
  "created_at": "2025-01-01T00:00:00.000Z"
}
```

---

## 👥 **Admin User Management Endpoints**

### **GET /admin/users**
Get all users (Admin only).

**Headers:**
```
Authorization: Bearer admin_jwt_token
```

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "User Name",
      "email": "user@example.com",
      "role": "user",
      "created_at": "2025-01-01T00:00:00.000Z",
      "total_customers": 10,
      "total_leads": 25
    }
  ]
}
```

### **POST /admin/users**
Create a new user (Admin only).

**Headers:**
```
Authorization: Bearer admin_jwt_token
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "role": "user"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "New User",
  "email": "newuser@example.com",
  "role": "user",
  "created_at": "2025-01-01T00:00:00.000Z"
}
```

---

## 🚨 **Error Responses**

### **400 Bad Request**
```json
{
  "error": "Validation error message",
  "errors": {
    "field_name": "Specific field error"
  }
}
```

### **401 Unauthorized**
```json
{
  "error": "Invalid or missing authentication token"
}
```

### **403 Forbidden**
```json
{
  "error": "Insufficient permissions to access this resource"
}
```

### **404 Not Found**
```json
{
  "error": "Resource not found"
}
```

### **500 Internal Server Error**
```json
{
  "error": "Internal server error occurred"
}
```

---

## 📊 **Status Codes**

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## 🔧 **Rate Limiting**

- **Rate Limit**: 100 requests per minute per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## 🧪 **Testing the API**

### **Using cURL**
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get customers
curl -X GET http://localhost:5000/api/customers \
  -H "Authorization: Bearer your_jwt_token"
```

### **Using Postman**
1. Import the API collection
2. Set up environment variables for base URL and token
3. Use the authentication endpoint to get a token
4. Test other endpoints with the token

---

## 📝 **API Versioning**

Current API version: **v1**  
Future versions will be accessible via `/api/v2/` endpoints.

---

## 🔒 **Security Considerations**

- All endpoints require HTTPS in production
- JWT tokens expire after 24 hours
- Rate limiting prevents abuse
- Input validation prevents injection attacks
- CORS configured for allowed origins only
