# IMF Gadget Management API Documentation
This documentation will self-destruct in 5 seconds... Just kidding! 🕶️

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Gadget Management](#gadget-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Security](#security)
- [Development Setup](#development-setup)

## Overview
The IMF (Impossible Missions Force) Gadget Management API provides secure endpoints for managing mission gadgets. Features include:
- JWT-based authentication
- Role-based access control
- Automatic gadget codename generation
- Status tracking
- Self-destruct capabilities
- Success probability calculation

## Getting Started

### Prerequisites
- Node.js 14+
- PostgreSQL 12+
- NPM or Yarn

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run migrations: `npx prisma migrate dev`
5. Start server: `npm run dev`

### Environment Variables
```env
DATABASE_URL="postgresql://user:password@localhost:5432/gadget_db"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV="development"
```

## Authentication
The API uses JWT (JSON Web Token) authentication with HTTP-only cookies. All requests must include a valid JWT token obtained through the sign-in endpoint.

### Cookie Settings
```typescript
{
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
  path: "/"
}
```

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-api-domain.com/api
```

## API Endpoints

### Authentication Endpoints

#### Sign Up
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
- `name`: Required, 1-20 characters, alphabets only
- `email`: Required, valid email format, max 50 characters
- `password`: Required, 8-30 characters
- `confirmPassword`: Must match password field
- `role`: Optional ("ADMIN" or "USER")

**Success Response (201):**
```json
{
    "success": true,
    "message": "User signed up successfully. Signin to continue"
}
```

#### Sign In
Authenticate and receive a JWT token.

**Endpoint:** `POST /auth/signin`

**Request Body:**
```json
{
    "email": "ethan.hunt@imf.gov",
    "password": "password123"
}
```

**Success Response (200):**
```json
{
    "success": true,
    "data": {
        "token": "jwt_token_here",
        "message": "Login successful"
    }
}
```

### Gadget Endpoints

#### List Gadgets
Get all gadgets with success probabilities.

**Endpoint:** `GET /gadgets`

**Query Parameters:**
- `status`: Filter by status (AVAILABLE, DECOMMISSIONED, DEPLOYED, DESTROYED)

**Success Response (200):**
```json
[
    "The Phantom - 87% success probability",
    "The Matrix - 92% success probability"
]
```

#### Create Gadget
Add a new gadget with auto-generated codename.

**Endpoint:** `POST /gadgets`

**Request Body:** Empty (name is auto-generated)

**Success Response (201):**
```json
{
    "message": "Gadget added successfully",
    "data": {
        "id": "uuid",
        "name": "The Phantom",
        "status": "AVAILABLE",
        "updatedAt": "timestamp"
    },
    "success": true
}
```

#### Update Gadget
Modify gadget status.

**Endpoint:** `PATCH /gadgets`

**Request Body:**
```json
{
    "id": "gadget_uuid",
    "status": "DEPLOYED"
}
```

**Success Response (200):**
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

#### Decommission Gadget
Soft delete a gadget.

**Endpoint:** `DELETE /gadgets`

**Request Body:**
```json
{
    "id": "gadget_uuid"
}
```

**Success Response (200):**
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

#### Self-Destruct Gadget
Trigger gadget self-destruction.

**Endpoint:** `POST /gadgets/:id/self-destruct`

**URL Parameters:**
- `id`: Gadget UUID

**Success Response (200):**
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

## Data Models

### User Model
```prisma
model User {
    id               String    @id @default(uuid())
    name             String
    email            String    @unique
    password         String
    createdAt        DateTime  @default(now())
    updatedAt        DateTime  @updatedAt
    role             UserRole  @default(USER)
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
    destroyedBy   User?       @relation(fields: [destroyedById], references: [id])
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

### Common Error Responses

#### Authentication Errors
```json
{
    "success": false,
    "error": "Invalid credentials"
}
```

```json
{
    "success": false,
    "error": "Please login to continue"
}
```

```json
{
    "success": false,
    "error": "Access denied: Admin privileges required"
}
```

#### Validation Errors
```json
{
    "success": false,
    "error": "Invalid status value. Expected one of: AVAILABLE, DECOMMISSIONED, DEPLOYED, DESTROYED"
}
```

```json
{
    "success": false,
    "error": "Email already used"
}
```

#### Resource Errors
```json
{
    "success": false,
    "error": "Gadget not found"
}
```

```json
{
    "success": false,
    "error": "Self destruction failed!. Gadget is already DESTROYED"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

## Security

### Authentication
- JWT-based authentication
- HTTP-only cookies
- Token expiration: 1 hour

### Password Security
- Bcrypt hashing (10 rounds)
- Password validation rules
- No password storage in plain text

### Request Security
- CORS protection
- Rate limiting
- Input validation using Joi
- SQL injection protection via Prisma ORM

### Role-Based Access
- Admin privileges required for gadget operations
- Role verification middleware
- Secure route protection


## Development Setup

### Local Development
1. Clone repository
```bash
git clone https://github.com/your-repo/imf-gadget-api.git
cd imf-gadget-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your values
```

4. Run migrations
```bash
npx prisma migrate dev
```

5. Start development server
```bash
npm run dev
```


### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Reset database
npx prisma reset

# View database in Prisma Studio
npx prisma studio
```

### Deployment
1. Build application
```bash
npm run build
```

2. Set production environment variables
3. Run database migrations
4. Start production server
```bash
npm start
```
