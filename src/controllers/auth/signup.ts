import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prismaClientSingleton from "../../db";
import { UserRole } from "@prisma/client";
import { signupPayloadSchema } from "../../validations/auth.validation";
import { SignupRequest, AuthResponse } from "../../types/auth.types";

const client = prismaClientSingleton();

const saltRounds = 10;

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 20
 *                 pattern: ^[^!@#$%^&*(){}\[\]\\\.;'",.<>/?`~|0-9]*$
 *                 description: Only alphabets allowed
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 50
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 30
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Must match password field
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export const signup = async (
  req: Request<SignupRequest>,
  res: Response<AuthResponse>
): Promise<void> => {
  try {
    // Validate the request body
    const { error, value } = signupPayloadSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        error: error.message,
        data: null,
      });
      return;
    }
    // Check if the email is already used
    const isEmailAlreadyUsed = await client.user.findUnique({
      where: { email: value.email },
    });
    if (isEmailAlreadyUsed) {
      res.status(409).json({
        success: false,
        error: "Email already used",
        data: null,
      });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(value.password, saltRounds);

    // Create the user
    await client.user.create({
      data: {
        name: value.name,
        email: value.email,
        password: hashedPassword,
        role: value.role as UserRole,
      },
    });

    res.status(201).json({
      success: true,
      error: "User signed up successfully. Signin to continue",
      data: null,
    });
  } catch (error) {
    // handle any errors that occur during the process
    res.status(500).json({
      success: false,
      error: "Internal server error",
      data: null,
    });
  }
};
