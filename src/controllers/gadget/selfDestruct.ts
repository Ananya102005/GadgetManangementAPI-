import { Response } from "express";
import prismaClientSingleton from "../../db";
import { AuthRequest } from "../../middlewares/auth";
import { Gadget } from "@prisma/client";
const client = prismaClientSingleton();

/**
 * @swagger
 * /api/gadgets/{id}/self-destruct:
 *   post:
 *     summary: Self destruct a gadget
 *     tags: [Gadgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         description: Gadget ID
 *     responses:
 *       200:
 *         description: Gadget destroyed successfully
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
 *                   example: "Gadget destroyed successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Gadget'
 *                 confirmationCode:
 *                   type: number
 *                   example: 123456
 *       400:
 *         description: Gadget is already destroyed or decommissioned
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
 *                   example: "Self destruction failed!. Gadget is already DESTROYED"
 *                 data:
 *                   type: null
 *                   example: null
 *       404:
 *         description: Gadget not found
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
 *                   example: "Gadget not found"
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
export const selfDestruct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const gadgetId: string = req.params.id;
  try {
    // check if the gadget exists
    const gadget: Gadget | null = await client.gadget.findUnique({
      where: {
        id: gadgetId,
      },
    });
    if (!gadget) {
      res.status(404).json({
        error: "Gadget not found",
      });
      return;
    }
    // check if the gadget is already decommissioned
    if (gadget.status === "DECOMMISSIONED") {
      res.status(400).json({
        error: "Self destruction failed!. Gadget is already DECOMMISSIONED",
        success: false,
        data: null,
      });
      return;
    }
    // check if the gadget is already destroyed
    if (gadget.status === "DESTROYED") {
      res.status(400).json({
        error: "Self destruction failed!. Gadget is already DESTROYED",
        success: false,
        data: null,
      });
      return;
    }

    const destroyedGadget: Gadget = await client.gadget.update({
      where: {
        id: gadgetId,
      },
      data: {
        status: "DESTROYED",
        destroyedById: req.userId,
      },
    });
    // send the destroyed gadget to the user
    res.status(200).json({
      message: "Gadget destroyed successfully",
      data: destroyedGadget,
      success: true,
      confirmationCode: Math.floor(Math.random() * 1000000),
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
