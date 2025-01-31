import { Request, Response } from "express";
import prismaClientSingleton from "../../db";
import { generateGadgetName } from "../../utils/randomNameGenerator";
import { Gadget } from "@prisma/client";

const client = prismaClientSingleton();

/**
 * @swagger
 * /api/gadgets:
 *   post:
 *     summary: Create a new gadget
 *     tags: [Gadgets]
 *     responses:
 *       201:
 *         description: Gadget created successfully
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
 *                   example: "Gadget added successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Gadget'
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
export const postGadget = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Generate a unique gadget name
    const gadgetName: string = await generateGadgetName(client);

    const gadget: Gadget = await client.gadget.create({
      data: {
        name: gadgetName,
      },
    });

    res.status(201).json({
      message: "Gadget added successfully",
      data: gadget,
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
