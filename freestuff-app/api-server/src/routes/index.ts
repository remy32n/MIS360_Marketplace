import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import identityRouter from "../modules/identity/identity.routes.js";
import listingsRouter from "../modules/listings/listings.routes.js";
import engagementRouter from "../modules/engagement/engagement.routes.js";
import orgsRouter from "../modules/orgs/orgs.routes.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/", identityRouter);
router.use("/listings", listingsRouter);
router.use("/engagement", engagementRouter);
router.use("/orgs", orgsRouter);

export default router;
