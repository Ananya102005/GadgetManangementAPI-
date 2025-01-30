import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IMF Gadget Management API",
      version: "1.0.0",
      description: "API documentation for IMF Gadget Management System",
    },
    servers: [
      {
        url: "https://upraised-assignment-47gq.onrender.com",
        description: "Production server",
      },
      {
        url: `http://localhost:${4001}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Gadget: {
          type: "object",
          properties: {
            id: {
              type: "string",
            },
            name: {
              type: "string",
            },
            status: {
              type: "string",
              enum: ["AVAILABLE", "DECOMMISSIONED", "DEPLOYED", "DESTROYED"],
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
            deletedAt: {
              type: "string",
              format: "date-time",
            },
            destroyedById: {
              type: "string",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            name: {
              type: "string",
            },
            email: {
              type: "string",
              format: "email",
            },
            role: {
              type: "string",
              enum: ["ADMIN", "USER"],
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
    security: [
      {
        cookieAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/**/*.ts"], // Path to the API routes
};

export const specs = swaggerJsdoc(options);
