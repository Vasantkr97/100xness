import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import candlesRoutes from "./routes/candles.route"

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "https://localhost:5173"],
    credentials: true,
}))

app.use(express.json());

app.use("/api/candles", candlesRoutes)

app.listen(PORT, () => {
    console.log(`http server is running on port ${PORT}`)
} )