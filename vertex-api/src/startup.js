import express from "express";
import routes from "./routes/routes.js";
import dotenv from "dotenv";
import cors from "cors";
import { connectMongoDB } from "./db/mongodb.js";
import { redisConnect } from "./db/redis.js";
import bodyParser from "express";

dotenv.config();

const app = express();
app.use(express.json());

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors());

async function startWebApp() {
  try {
    const PORT = process.env.PORT || 3000;
    await connectMongoDB();
    await redisConnect();
    routes(app);
    try {
      app.listen(PORT, () => {
        console.log(`Service waiting you on room number:${PORT}`);
      });
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error(
      "Error connecting to the database or starting the server:",
      error
    );
  }
}

startWebApp()
  .then(() => {
    console.log("server started and ready to serve!!!");
  })
  .catch((error) => {
    console.error(error);
  });
