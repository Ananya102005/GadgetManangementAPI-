import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prismaClientSingleton from "../../db";
import { UserRole } from "@prisma/client";
import { signupPayloadSchema } from "../../validations/auth.validation";
import { SignupRequest, AuthResponse } from "../../types/auth.types";

const client = prismaClientSingleton();

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET!;

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
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 20
 *                 pattern: ^[^!@#$%^&*(){}\[\]\\\.;'",.<>/?`~|0-9]*$
 *                 description: Only alphabets allowed
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 50
 *                 example: "john.doe@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 30
 *                 example: "Password123!"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Must match password field
 *                 example: "Password123!"
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 default: USER
 *                 example: "USER"
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User signed up successfully. Signin to continue"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Password must be at least 8 characters long"
 *                 data:
 *                   type: null
 *                   example: null
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Email already used"
 *                 data:
 *                   type: null
 *                   example: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 *                 data:
 *                   type: null
 *                   example: null
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
    const user = await client.user.create({
      data: {
        name: value.name,
        email: value.email,
        password: hashedPassword,
        role: value.role as UserRole,
      },
    });
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "1h",
        algorithm: "HS256",
      }
    );
    res.status(201).cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
      path: "/",
    }).json({
      success: true,
      message: "User signed up successfully",
      data: { token },
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
