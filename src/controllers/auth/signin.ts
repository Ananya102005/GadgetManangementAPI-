import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prismaClientSingleton from "../../db";
import { signinPayloadSchema } from "../../validations/auth.validation";

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
 *               password:
 *                 type: string
 *                 format: password
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     message:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
export const signin = async (req: Request, res: Response): Promise<void> => {
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
      res.status(401).json({
        success: false,
        data: null,
        error: "Invalid credentials",
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(value.password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        data: null,
        error: "Invalid credentials",
      });
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
        data: {
          token,
          message: "Login successful",
        },
      });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: "An unexpected error occurred",
    });
  }
};
