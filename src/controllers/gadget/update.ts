import { Request, Response } from "express";
import prismaClientSingleton from "../../db";
import { gadgetStatus, Gadget } from "@prisma/client";

const client = prismaClientSingleton();

/**
 * @swagger
 * /api/gadgets:
 *   put:
 *     summary: Update a gadget
 *     tags: [Gadgets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, DECOMMISSIONED, DEPLOYED, DESTROYED]
 *     responses:
 *       200:
 *         description: Gadget updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Gadget not found
 *       500:
 *         description: Server error
 */
export const updateGadget = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id: string = req.body.id;
    const name: string = req.body.name;
    const status: gadgetStatus = req.body.status;

    if (!id) {
      res.status(400).json({
        error: "Gadget ID is required",
        success: false,
      });
      return;
    }
    // check if any of the fields exist
    if (!name && !status) {
      res.status(400).json({
        error: "No fields to update",
        success: false,
      });
      return;
    }
    // check if the gadget exists
    const gadget: Gadget | null = await client.gadget.findUnique({
      where: { id: id },
    });
    if (!gadget) {
      res.status(404).json({
        error: "Gadget not found",
        success: false,
      });
      return;
    }
    const updatedGadget: Gadget = await client.gadget.update({
      where: { id: id },
      data: { name: name, status: status },
    });

    res.status(200).json({
      message: "Gadget updated successfully",
      data: updatedGadget,
      success: true,
    });
  } catch (error: any) {
    const prismaErrorMessage = error.meta
      ? error.meta.cause
      : error.message.split("\n").pop().trim();
    if (prismaErrorMessage.includes("Expected gadgetStatus")) {
      res.status(400).json({
        error:
          "Invalid status value. Expected one of: AVAILABLE, DECOMMISSIONED, DEPLOYED, DESTROYED",
        success: false,
      });
    } else {
      res.status(500).json({
        error: prismaErrorMessage,
        success: false,
      });
    }
  }
};
