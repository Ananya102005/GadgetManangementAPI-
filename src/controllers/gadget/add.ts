import { Request, Response } from "express";
import prismaClientSingleton from "../../db";

const client = prismaClientSingleton();
export const postGadget = async (
  req: Request,
  res: Response
): Promise<void> => {
  const name: string = req.body.name;
  // check if name is provided
  if (!name) {
    res.status(400).json({
      error: "Name is required",
      success: false,
    });
    return;
  }
  try {
    // check if gadget already exists
    const existingGadget = await client.gadget.findFirst({
      where: { name: name },
    });
    if (existingGadget) {
      res.status(400).json({
        error: "Gadget already exists",
        success: false,
      });
      return;
    }
    const gadget = await client.gadget.create({
      data: {
        name: name,
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
