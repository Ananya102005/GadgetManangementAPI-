import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prismaClientSingleton from "../../db";
import { signinPayloadSchema } from "../../validations/auth.validation";
import { SigninRequest, AuthResponse } from "../../types/auth.types";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const client = prismaClientSingleton();

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: Sign in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     message:
 *                       type: string
 *                       example: "Login successful"
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
 *                   example: "Invalid email format"
 *                 data:
 *                   type: null
 *                   example: null
 *       401:
 *         description: Invalid credentials
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
 *                   example: "Invalid password"
 *                 data:
 *                   type: null
 *                   example: null
 *       404:
 *         description: User not found
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
 *                   example: "User does not exist"
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
 *                   example: "An unexpected error occurred"
 *                 data:
 *                   type: null
 *                   example: null
 */
export const signin = async (
  req: Request<SigninRequest>,
  res: Response<AuthResponse>
): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = signinPayloadSchema.validate(req.body);

    if (error) {
      res.status(400).json({
        success: false,
        data: null,
        error: error.message,
      });
    }

    // Find user with email
    const user = await client.user.findUnique({
      where: { email: value.email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        data: null,
        error: "User does not exist",
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(value.password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        data: null,
        error: "Invalid password",
      });
      return;
    }

    // Generate JWT token
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

    // Set secure cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
      path: "/",
    };

    // Set cookie and send response
    res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        data: {
          token,
        },
      });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: "Internal server error",
    });
  }
};
