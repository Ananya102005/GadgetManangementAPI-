import { Request, Response } from "express";
import prismaClientSingleton from "../../db";
import { gadgetStatus, Gadget } from "@prisma/client";

const client = prismaClientSingleton();

/**
 * @swagger
 * /api/gadgets:
 *   get:
 *     summary: Get all gadgets by status
 *     tags: [Gadgets]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, DECOMMISSIONED, DEPLOYED, DESTROYED]
 *         required: false
 *         description: Optional status filter for gadgets
 *     responses:
 *       200:
 *         description: List of gadgets with success probability
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Invalid status value
 *       500:
 *         description: Server error
 */
export const getGadgets = async (
  req: Request,
  res: Response
): Promise<void> => {
  const status = req.query.status as gadgetStatus | undefined;
  try {
    // Modify where clause based on whether status is provided
    const gadgets: Gadget[] = await client.gadget.findMany({
      where: status
        ? {
            status: status,
          }
        : {},
    });

    // check if no gadgets are found
    if (gadgets.length === 0) {
      const message = status
        ? `No gadgets found with status ${status}`
        : "No gadgets found";
      res.status(200).json({ message });
      return;
    }
    // return the gadgets with a random success probability
    const gadgetsWithProbability: any = gadgets.map((gadget: any) => {
      return `${gadget.name} - ${Math.floor(
        Math.random() * 100
      )}% success probability`;
    });

    res.status(200).json(gadgetsWithProbability);
  } catch (error: any) {
    // handle any errors that occur during the process
    const prismaErrorMessage = error.meta
      ? error.meta.cause
      : error.message.split("\n").pop().trim();
    if (prismaErrorMessage.includes("Expected gadgetStatus")) {
      res.status(400).json({
        error:
          "Invalid status value. Expected one of: AVAILABLE, DECOMMISSIONED, DEPLOYED, DESTROYED",
      });
    } else {
      res.status(500).json({ error: prismaErrorMessage });
    }
  }
};
