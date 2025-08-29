import express from "express";
import { getCandles } from "../controllers/candles.controller";

const router = express.Router();

router.get('/getCandles', getCandles);

export default router;