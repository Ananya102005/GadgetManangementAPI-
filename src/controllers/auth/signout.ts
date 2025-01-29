import { Request, Response } from "express";

/**
 * @swagger
 * /api/auth/signout:
 *   post:
 *     summary: Sign out the current user
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const signout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};
