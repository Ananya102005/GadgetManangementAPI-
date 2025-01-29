import { Response } from "express";
import prismaClientSingleton from "../../db";
import { AuthRequest } from "../../middlewares/auth";
import { Gadget } from "@prisma/client";
const client = prismaClientSingleton();

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
        error: " Self destruction failed!. Gadget is already DECOMMISSIONED",
      });
    }
    // check if the gadget is already destroyed
    if (gadget.status === "DESTROYED") {
      res.status(400).json({
        error: " Self destruction failed!. Gadget is already DESTROYED",
      });
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
