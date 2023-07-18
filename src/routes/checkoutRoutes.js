import {Router} from "express";
import { justLogged } from "../middleware/justLogged.js";
import { checkoutSummary, checkout } from "../controllers/checkoutController.js";

const checkoutRoutes = Router()

checkoutRoutes.get('/:oid', justLogged, checkoutSummary)
checkoutRoutes.post('/:cid', justLogged, checkout)

export default checkoutRoutes