import { Request, Response } from "express";
import prismaClientSingleton from "../../db";
import { gadgetStatus, Gadget } from "@prisma/client";

const client = prismaClientSingleton();

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
