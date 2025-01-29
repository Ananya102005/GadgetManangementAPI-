import { Request, Response } from "express";
import prismaClientSingleton from "../../db";
import { gadgetStatus, Gadget } from "@prisma/client";

const client = prismaClientSingleton();

/**
 * @swagger
 * /api/gadgets:
 *   delete:
 *     summary: Decommission a gadget
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
 *     responses:
 *       200:
 *         description: Gadget decommissioned successfully
 *       400:
 *         description: Gadget already decommissioned
 *       404:
 *         description: Gadget not found
 *       500:
 *         description: Server error
 */
export const deleteGadget = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id: string = req.body.id;
  try {
    // check if the gadget exists
    const gadget: Gadget | null = await client.gadget.findUnique({
      where: {
        id: id,
      },
    });
    if (!gadget) {
      res.status(404).json({
        error: "Gadget not found",
        success: false,
      });
      return;
    }
    // check if the gadget is already decommissioned
    if (gadget.status === gadgetStatus.DECOMMISSIONED) {
      res.status(400).json({
        error: "Gadget already decommissioned",
        success: false,
      });
      return;
    }
    const updatedGadget: Gadget = await client.gadget.update({
      where: {
        id: id,
      },
      data: {
        status: gadgetStatus.DECOMMISSIONED,
        deletedAt: new Date(),
      },
    });
    res.status(200).json({
      message: "Gadget decommissioned successfully",
      data: updatedGadget,
      success: true,
    });
  } catch (error: any) {
    const prismaErrorMessage = error.meta
      ? error.meta.cause
      : error.message.split("\n").pop().trim();
    res.status(500).json({
      error: prismaErrorMessage,
      success: false,
    });
  }
};
