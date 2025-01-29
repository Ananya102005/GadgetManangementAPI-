import { Request, Response } from "express";
import prismaClientSingleton from "../../db";
import { generateGadgetName } from "../../utils/randomNameGenerator";
import { Gadget } from "@prisma/client";

const client = prismaClientSingleton();

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