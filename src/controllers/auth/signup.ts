import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prismaClientSingleton from "../../db";
import { UserRole } from "@prisma/client";
import { signupPayloadSchema } from "../../validations/auth.validation";

const client = prismaClientSingleton();

const saltRounds = 10;
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate the request body
    const { error, value } = signupPayloadSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    // Check if the email is already used
    const isEmailAlreadyUsed = await client.user.findUnique({
      where: { email: value.email },
    });
    if (isEmailAlreadyUsed) {
      res.status(409).json({ error: "Email already used" });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(value.password, saltRounds);

    // Create the user
    await client.user.create({
      data: {
        name: value.name,
        email: value.email,
        password: hashedPassword,
        role: value.role as UserRole,
      },
    });

    res.status(201).json({
      success: true,
      message: "User signed up successfully. Signin to continue",
    });
  } catch (error) {
    // handle any errors that occur during the process
    res.status(500).json({ error: "Internal server error" });
  }
};
