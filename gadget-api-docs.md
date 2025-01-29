# IMF Gadget Management API Documentation

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Authentication Endpoints](#authentication-endpoints)
  - [Sign Up](#sign-up)
  - [Sign In](#sign-in)
- [Gadget Endpoints](#gadget-endpoints)
  - [List Gadgets](#list-gadgets)
  - [Create Gadget](#create-gadget)
  - [Update Gadget](#update-gadget)
  - [Decommission Gadget](#decommission-gadget)
  - [Self-Destruct Gadget](#self-destruct-gadget)
- [Models](#models)
- [Error Handling](#error-handling)
- [Security](#security)
- [Testing Guide](#testing-guide)

## Overview
The IMF (Impossible Missions Force) Gadget Management API provides secure endpoints for managing mission gadgets. It features automatic codename generation, status tracking, and self-destruct capabilities.

## Authentication
All requests must include a valid JWT token as an HTTP-only cookie. The token is obtained through the sign-in endpoint.

## Base URL
```
http://your-api-domain.com/api
```

## Authentication Endpoints

### Sign Up
Create a new IMF agent account.

**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
    "name": "Ethan Hunt",
    "email": "ethan.hunt@imf.gov",
    "password": "password123",
    "confirmPassword": "password123",
    "role": "ADMIN"  // Optional, defaults to "USER"
}
```

**Validation Rules:**
- `name`:
  - Required, 1-20 characters
  - Alphabets only (no numbers or special characters)
- `email`:
  - Required, valid email format
  - Maximum 50 characters
- `password`:
  - Required, 8-30 characters
- `confirmPassword`:
  - Must match password field
- `role`:
  - Optional ("ADMIN" or "USER")

**Response (201):**
```json
{
    "success": true,
    "message": "User signed up successfully. Signin to continue"
}
```

### Sign In
Authenticate an agent and receive a JWT token.

**Endpoint:** `POST /auth/signin`

**Request Body:**
```json
{
    "email": "ethan.hunt@imf.gov",
    "password": "password123"
}
```

**Response (200):**
```json
{
    "success": true,
    "data": {
        "token": "jwt_token_here",
        "message": "Login successful"
    }
}
```

## Gadget Endpoints

### List Gadgets
Retrieve gadgets with their mission success probabilities.

**Endpoint:** `GET /gadgets`

**Query Parameters:**
- `status`: Filter gadgets by current status
  - Values: `AVAILABLE`, `DECOMMISSIONED`, `DEPLOYED`, `DESTROYED`
  - Example: `/gadgets?status=AVAILABLE`

**Response (200):**
```json
[
    "The Phantom - 87% success probability",
    "The Matrix - 92% success probability"
]
```

### Create Gadget
Add a new gadget to the IMF inventory. The system automatically generates a unique codename.

**Endpoint:** `POST /gadgets`

**Request Body:**
Empty body - name is automatically generated

**Response (201):**
```json
{
    "message": "Gadget added successfully",
    "data": {
        "id": "uuid",
        "name": "The Phantom",  // Automatically generated
        "status": "AVAILABLE",
        "updatedAt": "timestamp"
    },
    "success": true
}
```

### Update Gadget
Modify an existing gadget's status.

**Endpoint:** `PATCH /gadgets`

**Request Body:**
```json
{
    "id": "gadget_uuid",
    "status": "DEPLOYED"
}
```

**Response (200):**
```json
{
    "message": "Gadget updated successfully",
    "data": {
        "id": "gadget_uuid",
        "name": "The Phantom",
        "status": "DEPLOYED",
        "updatedAt": "timestamp"
    },
    "success": true
}
```

### Decommission Gadget
Mark a gadget as decommissioned (soft delete).

**Endpoint:** `DELETE /gadgets`

**Request Body:**
```json
{
    "id": "gadget_uuid"
}
```

**Response (200):**
```json
{
    "message": "Gadget decommissioned successfully",
    "data": {
        "id": "gadget_uuid",
        "status": "DECOMMISSIONED",
        "deletedAt": "timestamp"
    },
    "success": true
}
```

### Self-Destruct Gadget
Initiate gadget self-destruction sequence.

**Endpoint:** `POST /gadgets/:id/self-destruct`

**URL Parameters:**
- `id`: Gadget UUID

**Response (200):**
```json
{
    "message": "Gadget destroyed successfully",
    "data": {
        "id": "gadget_uuid",
        "status": "DESTROYED",
        "destroyedById": "admin_uuid"
    },
    "success": true,
    "confirmationCode": 123456
}
```

## Models

### User Model
```prisma
model User {
    id               String    @id @default(uuid())
    name             String
    email            String    @unique
    password         String
    createdAt        DateTime  @default(now())
    updatedAt        DateTime  @updatedAt
    role             UserRole? @default(USER)
    destroyedGadgets Gadget[]
}
```

### Gadget Model
```prisma
model Gadget {
    id            String       @id @default(uuid())
    name          String       @unique
    status        gadgetStatus @default(AVAILABLE)
    updatedAt     DateTime     @updatedAt
    deletedAt     DateTime?
    destroyedBy   User?        @relation(fields: [destroyedById], references: [id])
    destroyedById String?
}
```

### Enums
```prisma
enum gadgetStatus {
    AVAILABLE
    DECOMMISSIONED
    DEPLOYED
    DESTROYED
}

enum UserRole {
    ADMIN
    USER
}
```

## Error Handling
Standard HTTP status codes with detailed error messages:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## Security
1. JWT-based authentication with HTTP-only cookies
2. Password hashing using bcrypt
3. Role-based access control (ADMIN/USER)
4. Input validation using Joi
5. CORS protection
6. Secure cookie options:
   - HTTP-only
   - Secure flag in production
   - Strict same-site policy

## Testing Guide
1. Set up your environment:
   - Install Postman
   - Set base URL in your environment variables
   - Set Content-Type header to `application/json`

2. Authentication flow:
   - Create an agent account using the signup endpoint
   - Authenticate using the signin endpoint
   - JWT token will be automatically set as a cookie

3. Testing gadget endpoints:
   - Ensure you have ADMIN role
   - No need to provide gadget names - they're auto-generated
   - Test each status transition
   - Verify self-destruct sequence with confirmation code

4. Environment Variables:
   - Base URL
   - PORT (for local testing)
   - JWT_SECRET
   - DATABASE_URL
