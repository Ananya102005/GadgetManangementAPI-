import express, { Router } from "express";
import gadgetsRouter from "./gadgets";
import authRouter from "./auth";
import { authMiddleware } from "../middlewares/auth";
const router: Router = express.Router();

router.use("/gadgets", authMiddleware, gadgetsRouter);
router.use("/auth", authRouter);
router.use("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Upraised Assignment API",
  }); // dummy route to check if the server is running and
    //  to keep the server alive as i am using render which has cold shutdown
});
export default router;
