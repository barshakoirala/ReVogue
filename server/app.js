import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { API_MESSAGES } from "./constants/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.get("/", (_, res) => {
  res.json({ message: API_MESSAGES.REVOGUE_API, status: API_MESSAGES.STATUS_OK });
});

app.use(errorHandler);

export default app;
