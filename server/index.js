import app from "./app.js";
import { config } from "./config.js";
import { connectDb } from "./db.js";
import { SERVER_MESSAGES } from "./constants/index.js";

await connectDb();

app.listen(config.port, () => {
  console.log(`${SERVER_MESSAGES.API_RUNNING} http://localhost:${config.port}`);
});
