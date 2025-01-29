import express, { Router } from "express";
import gadgetsRouter from "./gadgets";
import authRouter from "./auth";
import { authMiddleware } from "../middlewares/auth";
const router : Router = express.Router();

router.use("/gadgets", authMiddleware, gadgetsRouter);
router.use("/auth", authRouter);

export default router;