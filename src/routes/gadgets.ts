import express, { Router } from "express";
import { getGadgets } from "../controllers/gadget/get";
import { postGadget } from "../controllers/gadget/add";
import { updateGadget } from "../controllers/gadget/update";
import { deleteGadget } from "../controllers/gadget/delete";
import { selfDestruct } from "../controllers/gadget/selfDestruct";

const router: Router = express.Router();

router.get("/", getGadgets);
router.post("/", postGadget);
router.post("/:id/self-destruct", selfDestruct);
router.patch("/", updateGadget);
router.delete("/", deleteGadget);

export default router;
